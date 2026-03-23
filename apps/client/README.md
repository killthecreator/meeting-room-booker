# `@meeting-calendar/client`

Frontend: **React 19**, **Vite 8**, **Tailwind CSS 4**. Request payloads and types align with **`@meeting-calendar/shared`**.

## Environment variables

Create `.env` in this directory (the `VITE_` prefix is required for Vite):

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | **Recommended:** leave **empty** or omit. The client then uses base URL **`/api`**, so requests go to **`/api/meetings/...`**, **`/api/auth/...`** on the same origin. **Development:** Vite (`vite.config.ts`) proxies **`/api`** to `http://127.0.0.1:3001` and strips the prefix so the backend still sees **`/meetings/...`**, **`/auth/...`**. **Production (Docker `runner`):** nginx does the same. **Optional:** set a full backend URL (e.g. `http://localhost:3001`) to bypass the proxy; you must allow the SPA origin in server CORS (`FRONTEND_ORIGIN`). |
| `VITE_GOOGLE_CLIENT_ID` | Client ID from Google Cloud (same OAuth client as the server). Used by `GoogleOAuthProvider`. |

API requests use **`withCredentials: true`** so httpOnly session cookies are sent.

### Production nginx (`apps/client/nginx.conf`)

The static image proxies **`/api/`** → backend and strips that prefix. Top-level browser navigation to **`/api/...`** (address bar) is answered with **404** using **`Sec-Fetch-Dest: document`** so normal **`fetch`/XHR** from the SPA keep working.

## Scripts

```bash
bun run dev         # Vite dev server (port 3000, host: true)
bun run typecheck   # tsc -b --noEmit
bun run build       # tsc -b && vite build → dist/
bun run start       # vite preview --host (serve built dist)
```

From the **monorepo root**: `bun run dev:client`, `bun run build:client`, `bun run start:client`.

## API / CORS

If you use **same-origin `/api`** (empty `VITE_API_URL`), the browser does not apply CORS for those calls. If you set **`VITE_API_URL`** to another origin, ensure the server **`FRONTEND_ORIGIN`** matches this app’s origin (e.g. `http://localhost:3000`).

## Shared package alias

`vite.config.ts` and tsconfig resolve `@meeting-calendar/shared` to `packages/shared/src/index.ts`.
