# Tauke / kas-applikasi — Backend (Python / FastAPI)

Python port of the original NestJS API. Same database, same public contract:

- Base URL + prefix unchanged: **`http://localhost:3001/api/v1`** (the frontend's
  `NEXT_PUBLIC_API_URL` keeps working as-is).
- Same Supabase Postgres database, accessed via **Prisma Client Python** using the
  exact same schema (`prisma/schema.prisma`).
- Same auth: Supabase JWT verified via JWKS (RS256/ES256), with the
  `AUTH_DEV_MODE` / `DEV_USER_ID` dev bypass.
- Interactive API docs at **`/api/docs`** (Swagger UI) — was `/api/docs` before too.

## Layout

```
backend/
  prisma/schema.prisma        # Prisma schema (generator = prisma-client-py)
  requirements.txt
  app/
    main.py                   # FastAPI app: CORS, /api/v1 prefix, routers, lifespan
    core/
      config.py               # env settings (PORT, DATABASE_URL, SUPABASE_URL, ...)
      database.py             # shared Prisma client + connect/disconnect
      security.py             # JWKS verification + authenticated-user assembly
      deps.py                 # get_current_user dependency + AuthenticatedUser model
      org_scope.py            # resolve_org_id / assert_org_admin / ... (multi-tenant)
      exceptions.py           # NestJS-style error envelope + HTTP error types
      utils.py                # parse_dt / clean helpers
    modules/<resource>/       # one folder per original NestJS module
      router.py               # APIRouter (endpoints)  ← was *.controller.ts
      service.py              # business logic          ← was *.service.ts
      schemas.py              # pydantic request models ← was dto/*.ts
  dist/                       # LEGACY compiled NestJS output (kept for reference;
                              # safe to delete once the Python port is confirmed)
```

## Setup & run

Requires Python 3.9+ and a reachable `DATABASE_URL`.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Generate the Prisma Python client from the schema (downloads engines once):
python -m prisma generate --schema prisma/schema.prisma

# Run the API (reads .env):
uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload
```

Then open http://localhost:3001/api/docs.

## Environment (.env)

Same variables as the NestJS version (see `.env.example`):

| Var | Purpose |
|-----|---------|
| `PORT` | HTTP port (default 3001) |
| `DATABASE_URL` | Supabase Postgres connection string |
| `SUPABASE_URL` | Used to derive JWKS URI + token issuer |
| `SUPABASE_JWKS_URI` | (optional) overrides the derived JWKS URI |
| `CORS_ORIGINS` | comma-separated allowed origins |
| `AUTH_DEV_MODE` | `true` → skip JWKS, authenticate every request as `DEV_USER_ID` |
| `DEV_USER_ID` | the user UUID used when `AUTH_DEV_MODE=true` |

## Notes on the port

- Each NestJS controller → an `APIRouter`; each service method → a service function;
  each DTO → a pydantic model with `extra="forbid"` (≈ `ValidationPipe` whitelist).
- The global `JwtAuthGuard` + `@CurrentUser()` is replaced by the `get_current_user`
  dependency (`user: AuthenticatedUser = CurrentUser`). `@Public()` endpoints (e.g.
  `GET /invoices/public/{invoiceNumber}`) simply omit that dependency.
- Money columns are Prisma `Decimal` (the generator's
  `enable_experimental_decimal` flag is on); they serialize to JSON numbers.
- `analytics` uses `group_by` / `query_raw` because Prisma Client Python doesn't
  expose `aggregate`; results are numerically identical to the NestJS version.
