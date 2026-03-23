#!/bin/sh
set -e

# Cloud Run sets PORT (often 8080). Compose can map 3000:3000 and omit PORT.
LISTEN_PORT="${PORT:-3000}"
BACKEND_URL="${BACKEND_PROXY_URL:-http://backend:3001/}"
case "$BACKEND_URL" in
  */) ;;
  *) BACKEND_URL="${BACKEND_URL}/" ;;
esac

sed -e "s|__NGINX_LISTEN_PORT__|${LISTEN_PORT}|g" \
    -e "s|__BACKEND_PROXY_URL__|${BACKEND_URL}|g" \
    /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

exec nginx -g "daemon off;"
