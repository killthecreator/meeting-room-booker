# `@meeting-calendar/client`

Frontend: **React 19**, **Vite 8**, **Tailwind CSS 4**. Request payloads and types align with **`@meeting-calendar/shared`**.

## UI behavior

| Area | Notes |
|------|-------|
| **Meeting blocks** | [`MeetingBlock`](src/components/MeetingBlock/index.tsx): draggable for owners; resize handles on the sides; delete control. |
| **Tooltip** | [`MeetingTooltip`](src/components/MeetingBlock/MeetingTooltip.tsx): opens on hover; **fixed** position computed from the block (`anchorRef`) and the day’s **table cell** (`boundaryRef`) so the panel tries to stay inside the column. |
| **Placement** | [`floatingTooltipPosition`](src/lib/floatingTooltipPosition.ts): tries bottom/top/left/right placements in order, then **clamps** into the cell if none fit. Repositions on scroll, resize, and `ResizeObserver` (e.g. while editing). |
| **Edit meeting** | Owners: pencil in the tooltip → [`MeetingEditor`](src/components/MeetingBlock/MeetingEditor.tsx); saves via `PATCH` with name + description. |
| **Create meeting** | Slot click → confirm dialog from [`ConfirmMeetingCreationContext`](src/context/ConfirmMeetingCreationContext/index.tsx). |

## Configuration

- **Google OAuth Web client ID** — [`src/config.ts`](src/config.ts) (`GOOGLE_CLIENT_ID`), used by `GoogleOAuthProvider` in `App.tsx`. Must match the same OAuth client as on the server (`apps/server/src/config.ts`) and the value in Google Cloud Console.

**API base URL** is **`/api`**, set in **`src/api.ts`** (`API_URL`). It is not read from env in the current code.

Optional **`.env`** with **`VITE_*`** variables if you add client-side env usage later.

### Development / preview proxy (`vite.config.ts`)

The dev and preview servers proxy **`/api`** to a backend **origin**:

- **Default:** `http://127.0.0.1:3001` — use when the API runs on the same machine (`bun run dev` from the monorepo root).
- **Docker Compose:** set **`BACKEND_PROXY_URL`** (e.g. `http://backend:3001/`) in the environment. Inside the frontend container, **`localhost:3001`** would point at the frontend container itself, so the proxy **must** target the backend service hostname. The config uses **`process.env.BACKEND_PROXY_URL`**, with the trailing slash stripped, falling back to **`http://127.0.0.1:3001`**.

The **`rewrite`** removes the **`/api`** prefix so the backend receives **`/meetings/...`**, **`/auth/...`**. The proxy **`target`** must be a full URL with **`http://`** (two slashes)—a typo like **`http:/`** causes proxy errors (e.g. `ENOTFOUND`).

**Production (Docker `runner` / Cloud Run):** nginx proxies **`/api/`** the same way; the container **requires** **`BACKEND_PROXY_URL`** (see [`docker-entrypoint-nginx.sh`](docker-entrypoint-nginx.sh)) — typically your backend’s public **`https://…run.app/`** URL.

API requests use **`withCredentials: true`** so httpOnly session cookies are sent.

### Production nginx (`nginx.conf.template`)

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

With base URL **`/api`**, the browser talks to the **same origin** as the SPA (Vite or nginx), so those requests are **not** cross-origin to the backend and **CORS is not involved** for that hop. **`FRONTEND_ORIGIN`** on the server matters when the browser calls the API **directly** on another origin (e.g. if you change **`API_URL`** to point at a different host).

## Shared package alias

`vite.config.ts` and tsconfig resolve `@meeting-calendar/shared` to `packages/shared/src/index.ts`.
