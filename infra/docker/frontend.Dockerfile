# syntax=docker/dockerfile:1
# Build from repository root: docker build -f infra/docker/frontend.Dockerfile .

ARG BUN_VERSION=1

FROM oven/bun:${BUN_VERSION}-slim AS deps

WORKDIR /app

# Copy only package files first
# All workspace manifests required for a valid root install; TypeScript lives at the root
COPY package.json bun.lock tsconfig.json ./
COPY apps/client/package.json ./apps/client/
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN bun install --frozen-lockfile

FROM deps AS dev

# Copy source files
COPY apps/client ./apps/client
COPY packages/shared ./packages/shared

CMD ["bun", "run", "-F", "@meeting-calendar/client", "dev"]

FROM deps AS builder

# Builder
COPY apps/client ./apps/client
COPY packages/shared ./packages/shared

WORKDIR /app

RUN bun run build:client

# Export /dist only (e.g. object storage) — `docker build --target build`
FROM scratch AS build
COPY --from=builder /app/apps/client/dist /dist

# Production — nginx serves SPA and proxies API (BACKEND_PROXY_URL at runtime; Compose default backend:3001)
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

COPY apps/client/nginx.conf.template /etc/nginx/nginx.conf.template
COPY apps/client/docker-entrypoint-nginx.sh /docker-entrypoint-nginx.sh
RUN chmod +x /docker-entrypoint-nginx.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint-nginx.sh"]
