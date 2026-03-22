# Meeting Room Booker

Monorepo: meeting room booking calendar with **React + TypeScript + Vite**, **Express** backend, shared types and schemas in **`@meeting-calendar/shared`**. Sign-in via **Google** (OAuth authorization code flow).

## Layout

| Path | Package | Description |
|------|---------|-------------|
| `apps/client` | `@meeting-calendar/client` | SPA (Vite, Tailwind) |
| `apps/server` | `@meeting-calendar/server` | HTTP API |
| `packages/shared` | `@meeting-calendar/shared` | Zod schemas and DTO types shared by client and server |

## Requirements

- **Node.js** and **npm** (workspaces).

## Install

From the repository root:

```bash
npm install
```

## Environment variables

See the [server README](apps/server/README.md) and [client README](apps/client/README.md) for details.

**Server** (`apps/server/.env`): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_ORIGIN`, optional `PORT` (default `3001`), `NODE_ENV` (`dev` | `production`), optional `ALLOWED_NETWORK`.

**Client** (`apps/client/.env`): `VITE_API_URL` (API base URL, e.g. `http://localhost:3001`), `VITE_GOOGLE_CLIENT_ID` (same Google client ID as on the server—it is public).

## Google OAuth

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID** (Web application).
2. Under **Authorized JavaScript origins**, add the frontend origin, e.g. `http://localhost:5173`.
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
npm run dev          # client (5173) and server (3001) in parallel
npm run dev:client
npm run dev:server
```

API: `http://localhost:3001` (routes `/auth/...`, `/meetings`, `/health`). Set `VITE_API_URL` to that origin **without** an `/api` suffix.

## Build and run (production)

```bash
npm run build        # server first, then client
npm run start        # client preview + Node server
```

Also: `npm run build:client`, `npm run build:server`, `npm run start:client`, `npm run start:server`.

## Other

- **Lint / format:** `npm run lint`, `npm run prettier`.
- **Docker:** Images use the **repository root** as build context (single root `package-lock.json`). From the repo root:
  - `docker compose build` — build backend + frontend (`target: dev`).
  - `docker compose up` — run API on `3001` and Vite on `5173`. Backend loads `apps/server/.env`; set `VITE_GOOGLE_CLIENT_ID` in the environment or a `.env` next to `compose.yml` for the frontend service.
  - One-off: `docker build -f apps/server/Dockerfile .` or `docker build -f apps/client/Dockerfile .`
  - Production-style images: `docker build -f apps/server/Dockerfile --target production .` and `docker build -f apps/client/Dockerfile --target runner .` (pass `VITE_*` as `--build-arg` for the client build stage).
  - `Makefile` still runs `docker-compose up -d` / `down` against this `compose.yml`.

## Package documentation

- [Client (`apps/client`)](apps/client/README.md)
- [Server (`apps/server`)](apps/server/README.md)
- [Shared (`packages/shared`)](packages/shared/README.md)
