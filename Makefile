# Dev stack (compose.yml)
start:
	docker-compose up -d

stop:
	docker-compose down

# Run from repo root. Override tags: make build-be-prod BE_TAG=myregistry/backend:1.0
BE_TAG ?= meeting-room-booker-backend:prod
FE_TAG ?= meeting-room-booker-frontend:prod

# Backend production image (Bun, port 3001 inside container)
build-be-prod:
	docker build -f infra/docker/backend.Dockerfile --target production -t $(BE_TAG) .

# Frontend production image (nginx + static SPA; set BACKEND_PROXY_URL and PORT at run/deploy)
build-fe-prod:
	docker build -f infra/docker/frontend.Dockerfile --target runner -t $(FE_TAG) .

build-prod: build-be-prod build-fe-prod

# --- Run production images locally (from monorepo root; needs apps/server/.env) ---
NET ?= meeting-room-booker-prod
BE_CONTAINER ?= mrb-prod-be
FE_CONTAINER ?= mrb-prod-fe

# Build first if needed: make build-prod
run-prod-local:
	docker network inspect $(NET) >/dev/null 2>&1 || docker network create $(NET)
	-docker rm -f $(BE_CONTAINER) $(FE_CONTAINER) 2>/dev/null
	docker run -d --name $(BE_CONTAINER) --network $(NET) --network-alias backend \
		-p 3001:3001 \
		--env-file ./apps/server/.env \
		-e NODE_ENV=production \
		-e PORT=3001 \
		$(BE_TAG)
	docker run -d --name $(FE_CONTAINER) --network $(NET) \
		-p 3000:3000 \
		-e PORT=3000 \
		-e BACKEND_PROXY_URL=http://backend:3001/ \
		$(FE_TAG)
	@echo "Open http://localhost:3000 (SPA + /api proxy). Backend direct: http://localhost:3001"

stop-prod-local:
	-docker rm -f $(FE_CONTAINER) $(BE_CONTAINER)
	-docker network rm $(NET)
