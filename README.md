# Meeting Room Booker

Monorepo: meeting room booking calendar with **React + TypeScript + Vite**, **Express** backend, shared types and schemas in **`@meeting-calendar/shared`**. Sign-in via **Google** (OAuth authorization code flow).

## Layout

| Path | Package | Description |
|------|---------|-------------|
| `apps/client` | `@meeting-calendar/client` | SPA (Vite, Tailwind) |
| `apps/server` | `@meeting-calendar/server` | HTTP API |
| `packages/shared` | `@meeting-calendar/shared` | Zod schemas and DTO types shared by client and server |

## Requirements

- **[Bun](https://bun.sh)** (workspaces; lockfile: `bun.lock`).

## Install

From the repository root:

```bash
bun install
```

## Environment variables

See the [server README](apps/server/README.md) and [client README](apps/client/README.md) for details.

**Server** (`apps/server/.env`): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_ORIGIN`, optional `PORT` (default `3001`), `NODE_ENV` (`dev` | `production`), optional `ALLOWED_NETWORK`.

**Client** (`apps/client/.env`): `VITE_GOOGLE_CLIENT_ID` (same Google client ID as on the server—it is public). **`VITE_API_URL`**: leave **empty** or unset so the app calls same-origin **`/api/...`** (Vite dev server and production nginx proxy that to the backend). Set a full URL (e.g. `http://localhost:3001`) only if you want the browser to talk to the API directly (then CORS must allow the SPA origin).

## Google OAuth

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID** (Web application).
2. Under **Authorized JavaScript origins**, add the frontend origin, e.g. `http://localhost:3000`.
3. Under **Authorized redirect URIs**, for `@react-oauth/google` with `flow: "auth-code"`, you typically add **`postmessage`** (see the [library docs](https://www.npmjs.com/package/@react-oauth/google)).
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the server `.env` and `VITE_GOOGLE_CLIENT_ID` in the client `.env`.

## Restricting access by network (e.g. office Wi‑Fi)

The browser cannot tell the app which Wi‑Fi you are on. The server can allow requests only from IPs in configured subnets.

1. In `apps/server/.env`, set **`ALLOWED_NETWORK`**: comma-separated IPv4 CIDRs, e.g. `192.168.1.0/24` or `192.168.1.0/24,10.0.0.0/8`. Empty means no restriction.
2. Behind a reverse proxy, **`trust proxy`** is enabled; configure `X-Forwarded-For` correctly.

Requests from other addresses get **403**.

## Development

From the **repository root**:

```bash
bun run dev          # client (3000) and server (3001) in parallel
bun run dev:client
bun run dev:server
```

With **`bun run dev`**, the client on **port 3000** proxies **`/api/*`** to the server on **3001** (see `apps/client/vite.config.ts`). Keep **`VITE_API_URL`** empty: axios uses base URL `/api`, so requests hit `/api/meetings/...`, `/api/auth/...`, and Vite forwards them to the backend as `/meetings/...`, `/auth/...`.

The server still exposes routes at **`/auth/...`**, **`/meetings/...`**, **`/health`** (no `/api` prefix on the app itself). Production Docker serves the SPA with **nginx**, which strips the `/api/` prefix the same way.

## Build and run (production)

```bash
bun run build        # server first, then client
bun run start        # client preview + server
```

Also: `bun run build:client`, `bun run build:server`, `bun run start:client`, `bun run start:server`.

## Other

- **Lint / format:** `bun run lint`, `bun run prettier`.
- **Docker:** Images use the **repository root** as build context and **`bun.lock`**. From the repo root:
  - `docker compose up` — **frontend** image **`runner`**: nginx on **3000** serves the built SPA and reverse-proxies **`/api/`** to the **`backend`** service (internal Docker network only). The backend **is not published** on the host by default (no `3001:3001`); add that mapping in `compose.yml` temporarily if you need to call the API directly while debugging.
  - Rebuild the frontend image after changing **`VITE_*`** build args (see `compose.yml` `build.args`).
  - Backend image: `docker build -f infra/docker/backend.Dockerfile --target production .`
  - Frontend **static build only** (no nginx): `docker build -f infra/docker/frontend.Dockerfile --target build --build-arg VITE_API_URL=... --build-arg VITE_GOOGLE_CLIENT_ID=... .` — artifact at image path `/dist` for GCS / Firebase Hosting / CDN (see comments in the Dockerfile for `docker cp` / BuildKit `-o`).
  - `Makefile` still runs `docker-compose up -d` / `down` against this `compose.yml`.

## Package documentation

- [Client (`apps/client`)](apps/client/README.md)
- [Server (`apps/server`)](apps/server/README.md)
- [Shared (`packages/shared`)](packages/shared/README.md)
