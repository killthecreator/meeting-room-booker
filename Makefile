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
