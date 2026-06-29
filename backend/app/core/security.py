"""Supabase JWT verification (asymmetric / JWKS) + authenticated-user assembly.

Ports auth/strategies/supabase-jwt.strategy.ts and the dev-mode branch of
auth/guards/jwt-auth.guard.ts from the original NestJS backend.
"""
from __future__ import annotations

import logging
from functools import lru_cache

import jwt
from jwt import PyJWKClient

from app.core.config import settings
from app.core.database import db

logger = logging.getLogger("auth")

JWT_AUDIENCE = "authenticated"
JWT_ALGORITHMS = ["RS256", "ES256"]


@lru_cache
def _jwks_client() -> PyJWKClient:
    # cache_keys keeps fetched signing keys in-memory (≈ jose's createRemoteJWKSet cache).
    return PyJWKClient(settings.jwks_uri, cache_keys=True)


def verify_token(token: str) -> dict:
    """Verify a Supabase access token via JWKS. Raises on any failure."""
    signing_key = _jwks_client().get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=JWT_ALGORITHMS,
        audience=JWT_AUDIENCE,
        issuer=settings.jwt_issuer,
    )


async def build_authenticated_user(user_id: str) -> dict:
    """Load the user + org memberships and shape the AuthenticatedUser payload.

    Mirrors SupabaseJwtPassportStrategy.buildAuthenticatedUser: an unknown user
    yields a minimal record rather than an error.
    """
    db_user = await db.user.find_unique(
        where={"id": user_id},
        include={"organizationMemberships": True},
    )
    if not db_user:
        logger.warning("User %s not found in public.users — minimal auth", user_id)
        return {"id": user_id, "globalRole": None, "organizations": []}

    memberships = db_user.organizationMemberships or []
    return {
        "id": db_user.id,
        "globalRole": db_user.role,
        "organizations": [
            {"organizationId": m.organizationId, "role": m.role} for m in memberships
        ],
    }
