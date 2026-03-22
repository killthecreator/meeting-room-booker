# syntax=docker/dockerfile:1
# Build from repository root: docker build -f infra/docker/frontend.Dockerfile .

ARG BUN_VERSION=1

FROM oven/bun:${BUN_VERSION}-slim AS deps

WORKDIR /app

# All workspace manifests required for a valid root install; TypeScript lives at the root
COPY package.json bun.lock tsconfig.json ./
COPY apps/client/package.json ./apps/client/
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/

RUN bun install --frozen-lockfile

FROM deps AS dev

# Copy source files
COPY apps/client ./apps/client
COPY packages/shared ./packages/shared

EXPOSE 5173
CMD ["bun", "run", "-F", "@meeting-calendar/client", "dev"]

# Builder
FROM deps AS builder

COPY apps/client ./apps/client
COPY packages/shared ./packages/shared

WORKDIR /app

ARG VITE_API_URL=http://localhost:3001
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

RUN bun run build:client

# Production
FROM nginx:1.28-alpine AS runner
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
EXPOSE 80
