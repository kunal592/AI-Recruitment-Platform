"""
app/middleware/error_handler.py
─────────────────────────────────────────────────────────────────────────────
Centralised exception handling for the FastAPI application.
Converts unhandled exceptions into consistent JSON error responses.
"""

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from loguru import logger
from pydantic import ValidationError


def _error_response(status_code: int, message: str, details=None) -> JSONResponse:
    """Build a consistent error JSON body."""
    body = {"success": False, "message": message}
    if details:
        body["details"] = details
    return JSONResponse(status_code=status_code, content=body)


def register_exception_handlers(app: FastAPI) -> None:
    """Attach all global exception handlers to the FastAPI app instance."""

    # ── Pydantic / FastAPI validation errors → 422 ──────────────────────────
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errors = [
            {"field": " → ".join(str(loc) for loc in e["loc"]), "message": e["msg"]}
            for e in exc.errors()
        ]
        logger.warning("Validation error on {} {}: {}", request.method, request.url.path, errors)
        response = _error_response(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "Request validation failed.",
            details=errors,
        )
        origin = request.headers.get("origin")
        if origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    # ── HTTPException (raised intentionally in services) ─────────────────────
    @app.exception_handler(HTTPException)
    async def http_exception_handler(
        request: Request, exc: HTTPException
    ) -> JSONResponse:
        logger.warning(
            "HTTPException {} on {} {}: {}",
            exc.status_code, request.method, request.url.path, exc.detail,
        )
        response = _error_response(exc.status_code, str(exc.detail))
        origin = request.headers.get("origin")
        if origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    # ── Catch-all for unexpected errors → 500 ─────────────────────────────────
    @app.exception_handler(Exception)
    async def generic_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.exception(
            "Unhandled exception on {} {}: {}",
            request.method, request.url.path, exc,
        )
        response = _error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "An unexpected internal error occurred. Please try again later.",
        )
        
        # Manually add CORS headers if the request has an Origin header.
        # This is a fallback because Starlette's CORSMiddleware sometimes 
        # skips error responses from exception handlers.
        origin = request.headers.get("origin")
        if origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
            
        return response
