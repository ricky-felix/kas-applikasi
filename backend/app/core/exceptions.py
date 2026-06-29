"""HTTP error types + handlers.

Reproduces the response envelope of the original NestJS HttpExceptionFilter:

    {
      "error": { "code": <status>, "message": <str>, "details": <any|null> },
      "path": "<request path>",
      "timestamp": "<ISO-8601>"
    }
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("http")


# ── Convenience exceptions (mirror Nest's *Exception classes) ──────────────────
class BadRequestError(HTTPException):
    def __init__(self, detail: str = "Bad request") -> None:
        super().__init__(status_code=400, detail=detail)


class UnauthorizedError(HTTPException):
    def __init__(self, detail: str = "Unauthorized") -> None:
        super().__init__(status_code=401, detail=detail)


class ForbiddenError(HTTPException):
    def __init__(self, detail: str = "Forbidden") -> None:
        super().__init__(status_code=403, detail=detail)


class NotFoundError(HTTPException):
    def __init__(self, detail: str = "Not found") -> None:
        super().__init__(status_code=404, detail=detail)


class ConflictError(HTTPException):
    def __init__(self, detail: str = "Conflict") -> None:
        super().__init__(status_code=409, detail=detail)


def _envelope(status: int, message: str, details, path: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={
            "error": {"code": status, "message": message, "details": details},
            "path": path,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def _http(request: Request, exc: HTTPException):  # noqa: ANN202
        detail = exc.detail
        message = detail if isinstance(detail, str) else "Error"
        details = None if isinstance(detail, str) else detail
        return _envelope(exc.status_code, message, details, request.url.path)

    @app.exception_handler(RequestValidationError)
    async def _validation(request: Request, exc: RequestValidationError):  # noqa: ANN202
        return _envelope(400, "Validation failed", exc.errors(), request.url.path)

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception):  # noqa: ANN202
        logger.error("Unhandled exception", exc_info=exc)
        return _envelope(500, "Internal server error", None, request.url.path)
