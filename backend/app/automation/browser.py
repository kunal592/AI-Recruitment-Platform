"""
app/automation/browser.py
─────────────────────────────────────────────────────────────────────────────
Manages a shared Playwright Chromium browser instance.
Provides an async context manager for page sessions.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

from loguru import logger
from playwright.async_api import (
    Browser,
    BrowserContext,
    Page,
    Playwright,
    async_playwright,
)


class BrowserManager:
    """
    Singleton that owns a single Chromium browser process.
    Use `page_session()` to get a fresh isolated BrowserContext + Page.
    """

    _playwright: Optional[Playwright] = None
    _browser: Optional[Browser] = None

    @classmethod
    async def start(cls, headless: bool = True) -> None:
        """Launch Chromium. Call once at app startup."""
        if cls._browser:
            return
        cls._playwright = await async_playwright().start()
        cls._browser = await cls._playwright.chromium.launch(
            headless=headless,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        logger.info("Playwright Chromium browser launched (headless={})", headless)

    @classmethod
    async def stop(cls) -> None:
        """Gracefully close the browser. Call at app shutdown."""
        if cls._browser:
            await cls._browser.close()
            cls._browser = None
        if cls._playwright:
            await cls._playwright.stop()
            cls._playwright = None
        logger.info("Playwright browser stopped.")

    @classmethod
    @asynccontextmanager
    async def page_session(cls) -> AsyncGenerator[Page, None]:
        """
        Async context manager that yields a fresh Page in its own Context.
        The context (and all its cookies/state) is discarded after the block.
        """
        if not cls._browser:
            raise RuntimeError("Browser not started. Call BrowserManager.start() first.")

        context: BrowserContext = await cls._browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
        )
        page: Page = await context.new_page()
        try:
            yield page
        finally:
            await context.close()
