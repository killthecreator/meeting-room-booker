# `@meeting-calendar/shared`

Shared package for **client** and **server**: Zod schemas and derived **TypeScript types** for the authenticated Google user and for meetings (DTOs).

## Exports

| Export | Purpose |
|--------|---------|
| `googleAuthSchema` | Parse Google ID token payload → object with `id` (from `sub`) |
| `authUserSchema` | User shape in API/UI: `id`, `name`, `email`, `picture` |
| `meetingSchema`, `createMeetingDTOSchema`, `updateMeetingDTOSchema` | Meeting entity and create / partial-update payloads |
| Types `AuthUser`, `MeetingDTO`, `CreateMeetingDTO`, `UpdateMeetingDTO` | `z.infer<…>` of the schemas above |

Sources: `src/schemas/authUser.ts`, `src/schemas/meeting.ts`, re-exported from `src/index.ts`.

## Dependencies

Only **`zod`**. There is no separate build step: the workspace links it as **`"*"`**, and Vite (client) plus esbuild (server) resolve the entry to **`src/index.ts`** via `package.json` `exports` and app-level aliases.

## Usage in the monorepo

```ts
import type { AuthUser, MeetingDTO } from "@meeting-calendar/shared";
import { createMeetingDTOSchema } from "@meeting-calendar/shared";
```

After changing schemas, restart or rebuild the client and server so types and runtime validation stay in sync.
