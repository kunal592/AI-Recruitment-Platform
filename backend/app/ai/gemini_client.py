"""
app/ai/gemini_client.py
─────────────────────────────────────────────────────────────────────────────
Singleton wrapper around the google-generativeai SDK.
Configure once; call generate() everywhere.
"""

from functools import lru_cache
from typing import Optional

import google.generativeai as genai
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config.settings import settings


class GeminiClient:
    """Lightweight wrapper that exposes a single async generate method."""

    def __init__(self) -> None:
        self._configure()

    def _configure(self):
        try:
            genai.configure(api_key=settings.gemini_api_key)
            self._primary_model = settings.gemini_model
            logger.info("Gemini client configured with primary model: {}", self._primary_model)
        except Exception as e:
            logger.error("Failed to configure Gemini client: {}", e)

    async def generate(
        self,
        prompt: str,
        temperature: float = 0.4,
        max_tokens: int = 8192,
        response_mime_type: Optional[str] = None,
    ) -> str:
        """
        Send a prompt to Gemini with multi-model fallback.
        """
        # List of models to try in order (based on 2026 availability)
        models_to_try = [
            self._primary_model,
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "gemini-2.0-flash-001",
            "gemini-2.0-flash-lite-001",
            "gemini-flash-latest"
        ]
        
        # Deduplicate while preserving order
        models_to_try = list(dict.fromkeys(models_to_try))
        
        for model_name in models_to_try:
            try:
                logger.debug("Attempting Gemini generation with model: {}...", model_name)
                model = genai.GenerativeModel(model_name)
                config_params = {
                    "temperature": temperature,
                    "max_output_tokens": max_tokens,
                }
                if response_mime_type:
                    config_params["response_mime_type"] = response_mime_type

                response = await model.generate_content_async(
                    prompt,
                    generation_config=genai.types.GenerationConfig(**config_params),
                )
                
                if not response or not response.text:
                    continue
                    
                text = response.text.strip()
                logger.success("Gemini generation successful with {} ({} chars).", model_name, len(text))
                return text
            except Exception as exc:
                logger.warning("Gemini model {} failed: {}", model_name, exc)
                continue

        # If all Gemini models fail, try Qwen fallback
        logger.warning("All Gemini models failed. Attempting Qwen fallback...")
        return await self._generate_qwen(prompt, temperature, max_tokens)

    async def _generate_qwen(
        self,
        prompt: str,
        temperature: float,
        max_tokens: int,
    ) -> str:
        """Call the custom Qwen API via HTTP (OpenAI-compatible format)."""
        import httpx
        
        base_url = settings.qwen_api_url.rstrip("/")
        url = f"{base_url}/chat/completions"
        
        headers = {"Authorization": f"Bearer {settings.qwen_api_key}"}
        payload = {
            "model": settings.qwen_model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        
        logger.debug("Requesting Qwen fallback: {}", url)
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code != 200:
                    logger.error("Qwen API returned {}: {}", resp.status_code, resp.text)
                    resp.raise_for_status()
                
                data = resp.json()
                text = data["choices"][0]["message"]["content"].strip()
                logger.success("Qwen fallback successful ({} chars).", len(text))
                return text
            except Exception as q_exc:
                logger.error("Qwen fallback also failed: {}", q_exc)
                return "Error: AI analysis failed. Please try again later."

    async def generate_json(
        self,
        prompt: str,
        temperature: float = 0.2,
    ) -> str:
        """
        Wrapper that appends a JSON-only instruction to the prompt.
        Uses response_mime_type='application/json' to ensure valid output.
        """
        json_prompt = (
            prompt
            + "\n\nIMPORTANT: Respond ONLY with valid JSON. "
            "No markdown fences, no explanation text. "
            "If you cannot provide valid JSON, return {}."
        )
        return await self.generate(
            json_prompt, 
            temperature=temperature, 
            max_tokens=8192,
            response_mime_type="application/json"
        )


@lru_cache()
def get_gemini_client() -> GeminiClient:
    """Return the cached singleton instance."""
    return GeminiClient()


