# `@meeting-calendar/server`

**Express 5** API: Google sign-in (exchange `code` for tokens, session in an httpOnly cookie), meeting CRUD behind authenticated routes. Types and Zod schemas come from **`@meeting-calendar/shared`**.

## Environment variables

Use `.env` in this directory. Validated in `src/env.ts`:

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_SECRET` | yes | OAuth 2.0 client secret (never commit; keep in `.env` or a secret manager) |
| `FRONTEND_ORIGIN` | yes | Allowed SPA **Origin** for **CORS** (e.g. `http://localhost:3000` or `https://your-app.run.app`). For same-origin **`/api`** via Vite or nginx, the browser still sends this origin; set it to your real frontend URL. |
| `DB_HOST` | yes | PostgreSQL host. **Local:** `127.0.0.1` or `localhost`. **Docker Compose (backend service):** `postgres`. **Cloud Run + Cloud SQL (Unix socket):** `/cloudsql/PROJECT_ID:REGION:INSTANCE_ID` — only exists in the Cloud Run container when the service is attached to that instance (not on your laptop). |
| `DB_PORT` | no | Default `5432`. |
| `DB_USER` | yes | Database user. |
| `DB_PASSWORD` | yes | Database password. |
| `PORT` | no | HTTP port, default `3001`. On **Cloud Run**, use the platform-provided **`PORT`** (often `8080`). |
| `NODE_ENV` | no | `dev` or `production` (e.g. cookie `secure` in production). |

The Google OAuth **Web client ID** (public) is **`GOOGLE_CLIENT_ID`** in [`src/config.ts`](src/config.ts)—same value as the client app’s `apps/client/src/config.ts`.

`OAuth2Client` uses redirect URI **`postmessage`**, matching the client’s `@react-oauth/google` auth-code flow.

### PostgreSQL connection notes

- **Local development:** run Postgres (or `docker compose` — see root [README](../../README.md)) and set **`DB_HOST=127.0.0.1`** with your **`DB_*`** values.
- **Cloud SQL from your machine:** use the [Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/postgres/connect-auth-proxy) and connect to **`127.0.0.1:5432`**. Do **not** set **`DB_HOST=/cloudsql/...`** locally — that path is missing on macOS/Linux unless the proxy or Cloud Run mounts it (**`ENOENT`** if the socket does not exist).
- **Cloud Run:** attach the Cloud SQL instance to the service, set **`DB_HOST=/cloudsql/PROJECT:REGION:INSTANCE`**, and grant the Cloud Run service account **Cloud SQL Client**.

Connection options are passed to **[`pg`](https://node-postgres.com/)** `Pool` in [`src/db.ts`](src/db.ts) (`host`, `port`, `user`, `password`, `database`).

## Routes (summary)

- `GET /health` — liveness
- `POST /auth/google/callback` — body `{ code }`, sets session cookie
- `GET /auth/google/logout` — clears cookie
- `GET /auth/google/verify-token` — user payload or empty body if no session
- `/meetings/*` — behind `authMiddleware`, requires a valid token in the cookie
  - `GET /meetings`, `POST /meetings`, `GET /meetings/events` (SSE)
  - `PATCH /meetings/:id` — partial update (`start`, `end`, `name`, `description` per shared schema); owner-only
  - `DELETE /meetings/:id` — owner-only

## Data and housekeeping

- **`meetings`** table: ISO datetimes in `start_time` / `end_time`; queries use parameterized SQL only.
- **Weekly cleanup** (cron **Sunday 23:59 UTC**): deletes only rows where `start_time` falls in the **current ISO week (UTC)**.
- **Shutdown**: `SIGTERM` / `SIGINT` close the HTTP server first, then drain the DB pool (`pool.end()`).

## Scripts

```bash
bun run dev        # bun --watch src/index.ts
bun run typecheck  # tsc --noEmit
bun run build      # typecheck + esbuild bundle → dist/index.js
bun run start      # bun dist/index.js (loads `.env` from this directory when present)
```

From the **monorepo root**: `bun run dev:server`, `bun run build:server`, `bun run start:server`.

## Build

Production output is a single **esbuild** ESM bundle: dependencies stay external (`--packages=external`), and `@meeting-calendar/shared` is aliased to the shared package sources. After `bun run build`, run **`dist/index.js`** (e.g. via `bun run start`).

## Proxy and networking

**`trust proxy`** is set for one proxy hop so **`req.ip`** (and similar) reflect the client when behind a reverse proxy (e.g. `X-Forwarded-For`).

In **Docker / nginx**, the browser calls the API under **`/api/...`**; nginx forwards to this process with the **`/api/`** prefix removed, so this app keeps mounting **`/auth`**, **`/meetings`**, and **`/health`** at the URL root (no `/api` in Express).

## Docker / Cloud Run

Production image: `infra/docker/backend.Dockerfile` (`production` target). From the repo root, **`Makefile`** includes `make build-be-prod` (defaults to **`linux/amd64`** for Cloud Run).

Deploying to **Cloud Run** typically involves: pushing the image, setting **`NODE_ENV=production`**, injecting secrets (**`GOOGLE_CLIENT_SECRET`**, **`DB_PASSWORD`**), and setting **`FRONTEND_ORIGIN`** to your frontend URL. Database **`DB_*`** must match your **Cloud SQL** user, database name, and socket host as above.
