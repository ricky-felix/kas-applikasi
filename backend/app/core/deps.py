"""FastAPI auth dependencies.

`get_current_user` replaces NestJS's global JwtAuthGuard + @CurrentUser combo:
inject it into any endpoint that needs the authenticated user. Public endpoints
(e.g. the public invoice lookup) simply omit it.
"""
from __future__ import annotations

from typing import Optional

import logging

import jwt
from fastapi import Depends, Request
from pydantic import BaseModel

from app.core.config import settings
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import build_authenticated_user, verify_token

logger = logging.getLogger("auth")


class OrgMembership(BaseModel):
    organizationId: str
    role: str


class AuthenticatedUser(BaseModel):
    id: str
    globalRole: Optional[str] = None
    organizations: list[OrgMembership] = []


async def get_current_user(request: Request) -> AuthenticatedUser:
    # ── Dev bypass ────────────────────────────────────────────────────────────
    if settings.dev_mode:
        if not settings.DEV_USER_ID:
            logger.error("AUTH_DEV_MODE is true but DEV_USER_ID is not set — denied.")
            raise ForbiddenError("DEV_USER_ID not configured")
        payload = await build_authenticated_user(settings.DEV_USER_ID)
        if payload["globalRole"] is None and not payload["organizations"]:
            # build_authenticated_user returns a minimal record for unknown ids;
            # in dev mode that means DEV_USER_ID isn't a real user → deny.
            existing = await _user_exists(settings.DEV_USER_ID)
            if not existing:
                logger.error("DEV_USER_ID %s not found in public.users — denied.", settings.DEV_USER_ID)
                raise ForbiddenError("DEV_USER_ID not found")
        return AuthenticatedUser(**payload)

    # ── Real JWKS verification ────────────────────────────────────────────────
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise UnauthorizedError("Missing or malformed Authorization header")
    token = auth_header[7:]
    try:
        claims = verify_token(token)
    except jwt.PyJWTError as err:  # invalid/expired/wrong-issuer/etc.
        logger.debug("JWT verification failed: %s", err)
        raise UnauthorizedError("Invalid or expired token") from err

    user_id = claims.get("sub")
    if not user_id:
        raise UnauthorizedError("Invalid token: missing sub")
    return AuthenticatedUser(**await build_authenticated_user(user_id))


async def _user_exists(user_id: str) -> bool:
    from app.core.database import db

    return (await db.user.count(where={"id": user_id})) > 0


# Convenience alias for endpoints: `user: CurrentUser`
CurrentUser = Depends(get_current_user)
