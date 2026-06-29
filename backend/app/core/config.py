"""Application configuration, read from environment / .env.

Mirrors the env surface of the original NestJS app (see .env.example):
PORT, CORS_ORIGINS, DATABASE_URL, SUPABASE_URL, SUPABASE_JWKS_URI,
AUTH_DEV_MODE, DEV_USER_ID, NODE_ENV.
"""
from __future__ import annotations

from typing import Optional

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PORT: int = 3001
    NODE_ENV: str = "development"

    DATABASE_URL: str = ""

    # Supabase JWT verification (asymmetric, via JWKS)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_JWKS_URI: Optional[str] = None

    # Dev bypass — when AUTH_DEV_MODE=true, JWKS verification is skipped and every
    # protected request is authenticated as DEV_USER_ID.
    AUTH_DEV_MODE: str = "false"
    DEV_USER_ID: Optional[str] = None

    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def dev_mode(self) -> bool:
        return self.AUTH_DEV_MODE == "true"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def jwks_uri(self) -> str:
        if self.SUPABASE_JWKS_URI:
            return self.SUPABASE_JWKS_URI
        if not self.SUPABASE_URL:
            raise RuntimeError(
                "Either SUPABASE_JWKS_URI or SUPABASE_URL must be set for JWT verification."
            )
        base = self.SUPABASE_URL.rstrip("/")
        return f"{base}/auth/v1/.well-known/jwks.json"

    @property
    def jwt_issuer(self) -> str:
        if self.SUPABASE_URL:
            return f"{self.SUPABASE_URL.rstrip('/')}/auth/v1"
        # Derive from an explicit JWKS URI.
        return (self.SUPABASE_JWKS_URI or "").replace(
            "/.well-known/jwks.json", ""
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
