# Meeting Room Booker

Monorepo: meeting room booking calendar with **React + TypeScript + Vite**, **Express** backend, shared types and schemas in **`@meeting-calendar/shared`**. Sign-in via **Google** (OAuth authorization code flow).

## Features

- **Week calendar** with a per-day timeline; create meetings by clicking a slot (name, description, time).
- **Drag** your meetings to another day/slot; **resize** start/end by dragging block edges (with overlap checks).
- **Meeting tooltip** on hover: details, organizer; owners can **edit title and description** inline (see [`MeetingEditor`](apps/client/src/components/MeetingBlock/MeetingEditor.tsx)).
- **Smart tooltip placement**: the popover picks a side (below/above/left/right) so it stays inside the day’s timeline cell when possible ([`floatingTooltipPosition`](apps/client/src/lib/floatingTooltipPosition.ts)).
- **Live updates**: meeting list syncs over **SSE** (`GET /meetings/events`) after creates/updates/deletes.
- **Data store**: **PostgreSQL** via **[`pg`](https://node-postgres.com/)** on the server ([`apps/server/src/db.ts`](apps/server/src/db.ts)). A **weekly job** (Sunday 23:59 UTC) deletes only meetings whose `start_time` falls in the **current ISO week (UTC)**.

## Layout

| Path | Package | Description |
|------|---------|-------------|
| `apps/client` | `@meeting-calendar/client` | SPA (Vite, Tailwind) |
| `apps/server` | `@meeting-calendar/server` | HTTP API |
| `packages/shared` | `@meeting-calendar/shared` | Zod schemas and DTO types shared by client and server |

## Requirements

- **[Bun](https://bun.sh)** (workspaces; lockfile: `bun.lock`).
- **PostgreSQL** for the API (local install, Docker, or Cloud SQL — see [server README](apps/server/README.md)).

## Install

From the repository root:

```bash
bun install
```

## Environment variables

See the [server README](apps/server/README.md) and [client README](apps/client/README.md) for details.

**Server** (`apps/server/.env`): `GOOGLE_CLIENT_SECRET`, `FRONTEND_ORIGIN`, **`DB_HOST`**, **`DB_PORT`**, **`DB_USER`**, **`DB_PASSWORD`**, **`DB_DATABASE`**, optional `PORT` (default `3001`), `NODE_ENV` (`dev` \| `production`). The Google OAuth **Web client ID** (public) lives in [`apps/server/src/config.ts`](apps/server/src/config.ts).

**Client:** the same **Web client ID** is in [`apps/client/src/config.ts`](apps/client/src/config.ts). The HTTP client uses base URL **`/api`** in [`apps/client/src/api.ts`](apps/client/src/api.ts); Vite and production nginx proxy **`/api/*`** to the backend (see [`apps/client/vite.config.ts`](apps/client/vite.config.ts) and [`apps/client/nginx.conf.template`](apps/client/nginx.conf.template)). To call the API from another origin, change `API_URL` in code (and set server **`FRONTEND_ORIGIN`** for CORS).

## Google OAuth

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID** (Web application).
2. Under **Authorized JavaScript origins**, add the frontend origin, e.g. `http://localhost:3000` (and your production URL when you deploy).
3. Under **Authorized redirect URIs**, for `@react-oauth/google` with `flow: "auth-code"`, you typically add **`postmessage`** (see the [library docs](https://www.npmjs.com/package/@react-oauth/google)).
4. Set **`GOOGLE_CLIENT_SECRET`** in **`apps/server/.env`**. Copy the OAuth **Web client ID** into **`apps/server/src/config.ts`** and **`apps/client/src/config.ts`** (`GOOGLE_CLIENT_ID`) so both match the Google Cloud client (the ID is public in the browser bundle).

## Development

From the **repository root**:

```bash
bun run dev          # client (3000) and server (3001) in parallel
bun run dev:client
bun run dev:server
```

Ensure PostgreSQL is running and **`apps/server/.env`** has **`DB_HOST=127.0.0.1`** (or `localhost`) and matching **`DB_*`** credentials.

With **`bun run dev`** or **`bun run start:client`** (Vite preview), the client on **port 3000** proxies **`/api/*`** to **`http://127.0.0.1:3001`** by default and strips the **`/api`** prefix (see [`apps/client/vite.config.ts`](apps/client/vite.config.ts)). Requests from the app go to **`/api/meetings/...`**, **`/api/auth/...`**; the backend receives **`/meetings/...`**, **`/auth/...`**. Ensure the proxy **`target`** URL is valid (`http://` with **two** slashes after the scheme—`http:/host` breaks DNS).

The server exposes routes at **`/auth/...`**, **`/meetings/...`**, **`/health`** (no `/api` prefix on Express). Production nginx strips the `/api/` prefix the same way.

## Build and run (production)

```bash
bun run build        # server first, then client
bun run start        # client preview + server
```

Also: `bun run build:client`, `bun run build:server`, `bun run start:client`, `bun run start:server`.

## Docker (local stack)

[`compose.yml`](compose.yml) runs **Postgres**, **backend** (dev image), and **frontend** (Vite dev). From the repo root:

```bash
docker compose --env-file ./apps/server/.env up --build
```

- **Postgres** credentials are driven by the same **`DB_USER`**, **`DB_PASSWORD`**, **`DB_DATABASE`** as in `apps/server/.env` (Compose substitutes `${DB_*:-defaults}`). The backend overrides **`DB_HOST=postgres`** (the Compose service name).
- **Frontend** sets **`BACKEND_PROXY_URL=http://backend:3001/`**; Vite uses that as the **`/api`** proxy target so the browser does not hit `localhost:3001` inside the FE container.

Changing the database name or password **after** the volume was first initialized may require `docker compose down -v` (destructive) or manual DB changes — see comments in `compose.yml`.

**Production images** (e.g. Cloud Run): see [`Makefile`](Makefile) (`make build-be-prod`, `make build-fe-prod`) and [server README](apps/server/README.md) (Cloud SQL / env).

## Other

- **Lint / format:** `bun run lint`, `bun run prettier`.
- **Docker build context** is the **repository root** with **`bun.lock`**:
  - Backend: `docker build --platform linux/amd64 -f infra/docker/backend.Dockerfile --target production -t TAG .`
  - Frontend (nginx + SPA): `docker build --platform linux/amd64 -f infra/docker/frontend.Dockerfile --target runner -t TAG .` — set **`BACKEND_PROXY_URL`** and **`PORT`** at deploy time (see [`apps/client/docker-entrypoint-nginx.sh`](apps/client/docker-entrypoint-nginx.sh)).
  - Frontend **static files only**: `docker build -f infra/docker/frontend.Dockerfile --target build .` — artifact at `/dist` in the build stage (see Dockerfile comments).
- **Makefile:** `make start` / `make stop` use **`docker-compose`** against `compose.yml`; `make build-prod` builds linux/amd64 images for Cloud Run.

## Package documentation

- [Client (`apps/client`)](apps/client/README.md)
- [Server (`apps/server`)](apps/server/README.md)
- [Shared (`packages/shared`)](packages/shared/README.md)
