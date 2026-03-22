# `@meeting-calendar/server`

**Express 5** API: Google sign-in (exchange `code` for tokens, session in an httpOnly cookie), meeting CRUD behind authenticated routes. Types and Zod schemas come from **`@meeting-calendar/shared`**.

## Environment variables

Use `.env` in this directory. Validated in `src/env.ts`:

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | yes | OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | yes | Client secret |
| `FRONTEND_ORIGIN` | yes | SPA origin for CORS (e.g. `http://localhost:5173`) |
| `PORT` | no | HTTP port, default `3001` |
| `NODE_ENV` | no | `dev` or `production` (affects cookie `secure` and SIGTERM handling) |
| `ALLOWED_NETWORK` | no | See root README: comma-separated IPv4 CIDRs; empty disables IP filtering |

`OAuth2Client` uses redirect URI **`postmessage`**, matching the client’s `@react-oauth/google` auth-code flow.

## Routes (summary)

- `GET /health` — liveness
- `POST /auth/google/callback` — body `{ code }`, sets session cookie
- `GET /auth/google/logout` — clears cookie
- `GET /auth/google/verify-token` — user payload or empty body if no session
- `/meetings/*` — behind `authMiddleware`, requires a valid token in the cookie

## Scripts

```bash
bun run dev        # tsx watch src/index.ts
bun run typecheck  # tsc --noEmit
bun run build      # typecheck + esbuild bundle → dist/index.js
bun run start      # bun dist/index.js (loads `.env` from this directory when present)
```

From the **monorepo root**: `bun run dev:server`, `bun run build:server`, `bun run start:server`.

## Build

Production output is a single **esbuild** ESM bundle: dependencies stay external (`--packages=external`), and `@meeting-calendar/shared` is aliased to the shared package sources. After `bun run build`, run **`dist/index.js`** (e.g. via `bun run start`).

## Proxy and networking

**`trust proxy`** is set for one proxy hop so IP checks work correctly behind a reverse proxy.
