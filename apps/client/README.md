# `@meeting-calendar/client`

Frontend: **React 19**, **Vite 8**, **Tailwind CSS 4**. Request payloads and types align with **`@meeting-calendar/shared`**.

## Environment variables

Create `.env` in this directory (the `VITE_` prefix is required for Vite):

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend base URL, e.g. `http://localhost:3001`. Axios calls paths such as `/meetings/` and `/auth/google/...` relative to this URL. |
| `VITE_GOOGLE_CLIENT_ID` | Client ID from Google Cloud (same OAuth client as the server). Used by `GoogleOAuthProvider`. |

API requests use **`withCredentials: true`** so httpOnly session cookies are sent.

## Scripts

```bash
npm run dev         # Vite dev server (port 5173, host: true)
npm run typecheck   # tsc -b --noEmit
npm run build       # tsc -b && vite build → dist/
npm run start       # vite preview --host (serve built dist)
```

From the **monorepo root**: `npm run dev:client`, `npm run build:client`, `npm run start:client`.

## API / CORS

Ensure the server `FRONTEND_ORIGIN` matches this app’s origin (e.g. `http://localhost:5173`), or the browser will block requests with CORS errors.

## Shared package alias

`vite.config.ts` and tsconfig resolve `@meeting-calendar/shared` to `packages/shared/src/index.ts`.
