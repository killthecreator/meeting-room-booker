# syntax=docker/dockerfile:1
# Build from repository root: docker build -f infra/dockerfiles/backend.Dockerfile .

ARG BUN_VERSION=1

FROM oven/bun:${BUN_VERSION}-slim AS deps

WORKDIR /app

# Copy only package files first
COPY package.json bun.lock tsconfig.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN bun install --filter @meeting-calendar/server

FROM deps AS dev

# Copy source files
COPY apps/server ./apps/server
COPY packages/shared ./packages/shared

EXPOSE 3001
CMD ["bun", "run", "-F", "@meeting-calendar/server", "dev"]

FROM deps AS build
COPY apps/server ./apps/server
COPY packages/shared ./packages/shared
RUN bun run build:server

FROM oven/bun:${BUN_VERSION}-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lock ./
COPY apps/client/package.json ./apps/client/
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/
RUN bun install --frozen-lockfile --production
COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/packages/shared ./packages/shared
WORKDIR /app/apps/server
EXPOSE 3001
CMD ["bun", "run", "start"]
