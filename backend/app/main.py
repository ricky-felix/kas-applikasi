"""FastAPI application entrypoint — Python port of the NestJS Tauke API.

Equivalent to main.ts + app.module.ts:
  • global prefix  /api/v1
  • CORS from CORS_ORIGINS
  • Swagger/OpenAPI at /api/docs
  • Prisma connect/disconnect on startup/shutdown
  • NestJS-style error envelope (see core.exceptions)
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import connect_db, disconnect_db
from app.core.exceptions import register_exception_handlers

# Feature routers (one per NestJS module)
from app.modules.analytics.router import router as analytics_router
from app.modules.auth.router import router as auth_router
from app.modules.cash_advances.router import router as cash_advances_router
from app.modules.cash_flows.router import router as cash_flows_router
from app.modules.change_orders.router import router as change_orders_router
from app.modules.daily_allowances.router import router as daily_allowances_router
from app.modules.daily_attendance.router import router as daily_attendance_router
from app.modules.field_reports.router import router as field_reports_router
from app.modules.field_workers.router import router as field_workers_router
from app.modules.invoices.router import router as invoices_router
from app.modules.material_requests.router import router as material_requests_router
from app.modules.materials.router import router as materials_router
from app.modules.project_assignments.router import router as project_assignments_router
from app.modules.project_materials.router import router as project_materials_router
from app.modules.projects.router import router as projects_router
from app.modules.proof_submissions.router import router as proof_submissions_router
from app.modules.requests.router import router as requests_router
from app.modules.teams.router import router as teams_router
from app.modules.worker_registrations.router import router as worker_registrations_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bootstrap")

API_PREFIX = "/api/v1"

ROUTERS = [
    auth_router,
    projects_router,
    materials_router,
    teams_router,
    field_workers_router,
    project_assignments_router,
    project_materials_router,
    field_reports_router,
    requests_router,
    invoices_router,
    cash_flows_router,
    daily_attendance_router,
    analytics_router,
    change_orders_router,
    material_requests_router,
    proof_submissions_router,
    cash_advances_router,
    daily_allowances_router,
    worker_registrations_router,
]


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ANN201
    await connect_db()
    logger.info("Prisma connected to database")
    if settings.dev_mode:
        logger.warning("=" * 64)
        logger.warning("  AUTH DEV MODE IS ACTIVE — JWKS verification is DISABLED.")
        logger.warning("  All protected requests authenticate as DEV_USER_ID=%s", settings.DEV_USER_ID)
        logger.warning("  Set AUTH_DEV_MODE=false (or remove it) before deploying.")
        logger.warning("=" * 64)
    yield
    await disconnect_db()
    logger.info("Prisma disconnected from database")


app = FastAPI(
    title="Tauke API",
    description="Tauke / kas-applikasi — construction cash-management SaaS",
    version="1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

register_exception_handlers(app)

for r in ROUTERS:
    app.include_router(r, prefix=API_PREFIX)


@app.get("/", include_in_schema=False)
async def root() -> dict:
    return {"name": "Tauke API", "docs": "/api/docs"}
