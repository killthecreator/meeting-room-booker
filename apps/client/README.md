# `@meeting-calendar/client`

Frontend: **React 19**, **Vite 8**, **Tailwind CSS 4**. Request payloads and types align with **`@meeting-calendar/shared`**.

## UI behavior

| Area | Notes |
|------|--------|
| **Meeting blocks** | [`MeetingBlock`](src/components/MeetingBlock/index.tsx): draggable for owners; resize handles on the sides; delete control. |
| **Tooltip** | [`MeetingTooltip`](src/components/MeetingBlock/MeetingTooltip.tsx): opens on hover; **fixed** position computed from the block (`anchorRef`) and the day’s **table cell** (`boundaryRef`) so the panel tries to stay inside the column. |
| **Placement** | [`floatingTooltipPosition`](src/lib/floatingTooltipPosition.ts): tries bottom/top/left/right placements in order, then **clamps** into the cell if none fit. Repositions on scroll, resize, and `ResizeObserver` (e.g. while editing). |
| **Edit meeting** | Owners: pencil in the tooltip → [`MeetingEditor`](src/components/MeetingBlock/MeetingEditor.tsx); saves via `PATCH` with name + description. |
| **Create meeting** | Slot click → confirm dialog from [`ConfirmMeetingCreationContext`](src/context/ConfirmMeetingCreationContext/index.tsx). |

## Configuration

- **Google OAuth Web client ID** — [`src/config.ts`](src/config.ts) (`GOOGLE_CLIENT_ID`), used by `GoogleOAuthProvider` in `App.tsx`. Must match the same OAuth client as on the server (`apps/server/src/config.ts`) and the value in Google Cloud Console.

**API base URL** is **`/api`**, set in **`src/api.ts`** (`API_URL`). It is not read from env in the current code.

Optional **`.env`** only if you introduce other **`VITE_*`** variables later.

**Development / preview:** `vite.config.ts` shares the same **`server`** and **`preview`** options: proxy **`/api`** → **`http://localhost:3001`**, **`rewrite`** removes the **`/api`** prefix so the backend paths stay **`/meetings/...`**, **`/auth/...`**. The proxy **`target`** must be a full URL with **`http://`** (two slashes)—a typo like **`http:/`** causes proxy DNS errors (e.g. `ENOTFOUND base.invalid`).

**Production (Docker `runner`):** nginx proxies **`/api/`** the same way (see `nginx.conf`).

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

With base URL **`/api`**, the browser talks to the **same origin** as the SPA (Vite or nginx), so those requests are **not** cross-origin to the backend and **CORS is not involved** for the hop the browser makes. **`FRONTEND_ORIGIN`** on the server matters when the browser calls the API **directly** on another origin (e.g. if you change **`API_URL`** to `http://localhost:3001`).

## Shared package alias

`vite.config.ts` and tsconfig resolve `@meeting-calendar/shared` to `packages/shared/src/index.ts`.
