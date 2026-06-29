"""Single shared Prisma client.

Equivalent to the NestJS global PrismaModule / PrismaService. The client is
connected on application startup and disconnected on shutdown (see app.main).
Import `db` anywhere a query is needed.
"""
from __future__ import annotations

from prisma import Prisma

db = Prisma()


async def connect_db() -> None:
    if not db.is_connected():
        await db.connect()


async def disconnect_db() -> None:
    if db.is_connected():
        await db.disconnect()
