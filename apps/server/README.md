# `@meeting-calendar/server`

**Express 5** API: Google sign-in (exchange `code` for tokens, session in an httpOnly cookie), meeting CRUD behind authenticated routes. Types and Zod schemas come from **`@meeting-calendar/shared`**.

## Environment variables

Use `.env` in this directory. Validated in `src/env.ts`:

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_SECRET` | yes | OAuth 2.0 client secret (never commit; keep in `.env` only) |
| `FRONTEND_ORIGIN` | yes | Allowed SPA **Origin** for **CORS** when the browser calls this API on a **different** host/port than the page (e.g. `http://localhost:3000`). Not used for same-origin **`/api`** proxying through Vite or nginx. |
| `PORT` | no | HTTP port, default `3001` |
| `NODE_ENV` | no | `dev` or `production` (affects cookie `secure` and SIGTERM handling) |
| `ALLOWED_NETWORK` | no | See root README: comma-separated IPv4 CIDRs; empty disables IP filtering |

The Google OAuth **Web client ID** (public) is **`GOOGLE_CLIENT_ID`** in [`src/config.ts`](src/config.ts)—same value as the client app’s `apps/client/src/config.ts`.

`OAuth2Client` uses redirect URI **`postmessage`**, matching the client’s `@react-oauth/google` auth-code flow.

## Routes (summary)

- `GET /health` — liveness
- `POST /auth/google/callback` — body `{ code }`, sets session cookie
- `GET /auth/google/logout` — clears cookie
- `GET /auth/google/verify-token` — user payload or empty body if no session
- `/meetings/*` — behind `authMiddleware`, requires a valid token in the cookie

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

**`trust proxy`** is set for one proxy hop so IP checks work correctly behind a reverse proxy.

In **Docker / nginx**, the browser calls the API under **`/api/...`**; nginx forwards to this process with the **`/api/`** prefix removed, so this app keeps mounting **`/auth`**, **`/meetings`**, and **`/health`** at the URL root (no `/api` in Express).

The **`compose.yml`** frontend **`runner`** service does not publish the backend port on the host by default; only the SPA port (**3000**) is exposed, and API traffic goes through nginx on that port.
