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

**Server** (`apps/server/.env`): `GOOGLE_CLIENT_SECRET`, `FRONTEND_ORIGIN`, optional `PORT` (default `3001`), `NODE_ENV` (`dev` | `production`), optional `ALLOWED_NETWORK`. The Google OAuth **Web client ID** (public) lives in [`apps/server/src/config.ts`](apps/server/src/config.ts).

**Client:** the same **Web client ID** is in [`apps/client/src/config.ts`](apps/client/src/config.ts). The HTTP client uses base URL **`/api`** in [`apps/client/src/api.ts`](apps/client/src/api.ts); Vite and production nginx proxy **`/api/*`** to the backend (see [`apps/client/vite.config.ts`](apps/client/vite.config.ts) and [`apps/client/nginx.conf`](apps/client/nginx.conf)). To call the API from another origin, change `API_URL` in code (and set server **`FRONTEND_ORIGIN`** for CORS).

## Google OAuth

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID** (Web application).
2. Under **Authorized JavaScript origins**, add the frontend origin, e.g. `http://localhost:3000`.
3. Under **Authorized redirect URIs**, for `@react-oauth/google` with `flow: "auth-code"`, you typically add **`postmessage`** (see the [library docs](https://www.npmjs.com/package/@react-oauth/google)).
4. Set **`GOOGLE_CLIENT_SECRET`** in **`apps/server/.env`**. Copy the OAuth **Web client ID** into **`apps/server/src/config.ts`** and **`apps/client/src/config.ts`** (`GOOGLE_CLIENT_ID`) so both match the Google Cloud client (the ID is public in the browser bundle).

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

With **`bun run dev`** or **`bun run start:client`** (Vite preview), the client on **port 3000** proxies **`/api/*`** to **`http://localhost:3001`** and strips the **`/api`** prefix (shared options in `apps/client/vite.config.ts`). Requests from the app go to **`/api/meetings/...`**, **`/api/auth/...`**; the backend receives **`/meetings/...`**, **`/auth/...`**. Ensure the proxy **`target`** URL is valid (`http://` with **two** slashes after the scheme—`http:/host` breaks DNS).

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
  - Rebuild the frontend image after changing client **`src/config.ts`**, **`src/api.ts`**, or other bundled sources.
  - Backend image: `docker build -f infra/docker/backend.Dockerfile --target production .`
  - Frontend **static build only** (no nginx): `docker build -f infra/docker/frontend.Dockerfile --target build .` — artifact at image path `/dist` for GCS / Firebase Hosting / CDN (see comments in the Dockerfile for `docker cp` / BuildKit `-o`).
  - `Makefile` still runs `docker-compose up -d` / `down` against this `compose.yml`.

## Package documentation

- [Client (`apps/client`)](apps/client/README.md)
- [Server (`apps/server`)](apps/server/README.md)
- [Shared (`packages/shared`)](packages/shared/README.md)
