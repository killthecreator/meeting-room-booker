#!/bin/sh
set -e

# Cloud Run sets PORT to match the service/container port (default 8080). Do not set PORT in the
# console to a different value than "Container port" — the probe targets that port.
# Local: pass -e PORT=3000 (see Makefile / compose).
LISTEN_PORT="${PORT:-8080}"

# No default hostname "backend" here: it only exists on Docker Compose networks. Cloud Run must set
# BACKEND_PROXY_URL (e.g. https://your-api-xxxxx.run.app/).
if [ -z "${BACKEND_PROXY_URL:-}" ]; then
  echo "BACKEND_PROXY_URL is required. Examples:" >&2
  echo "  Cloud Run:  https://YOUR-BACKEND-XXXXX.run.app/" >&2
  echo "  Compose:    http://backend:3001/" >&2
  exit 1
fi
BACKEND_URL="$BACKEND_PROXY_URL"
case "$BACKEND_URL" in
  */) ;;
  *) BACKEND_URL="${BACKEND_URL}/" ;;
esac

sed -e "s|__NGINX_LISTEN_PORT__|${LISTEN_PORT}|g" \
    -e "s|__BACKEND_PROXY_URL__|${BACKEND_URL}|g" \
    /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo "nginx listening on 0.0.0.0:${LISTEN_PORT}" >&2
nginx -t -c /etc/nginx/nginx.conf >&2

exec nginx -g "daemon off;"
