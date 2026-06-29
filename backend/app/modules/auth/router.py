"""Auth routes — port of auth.controller.ts (@Controller('auth'))."""
from __future__ import annotations

from fastapi import APIRouter

from app.core.deps import AuthenticatedUser, CurrentUser

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", summary="Get the currently authenticated user profile")
async def get_profile(user: AuthenticatedUser = CurrentUser) -> AuthenticatedUser:
    return user
