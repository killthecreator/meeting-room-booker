# syntax = docker/dockerfile:1

ARG NODE_VERSION=25-alpine

FROM node:${NODE_VERSION} AS base

WORKDIR /app

# Environment variables
# ......

FROM node:${NODE_VERSION} AS deps

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json /app/
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci

# Dev stage
FROM base AS dev

# Copy files from deps
COPY --from=deps /app/node_modules/ /app/node_modules/

CMD ["npm", "run", "dev:client"]


# Build stage
FROM base AS builder


# Build the React.js application (outputs to /app/dist)
RUN npm run build

# =========================================
# Stage 2: Prepare Nginx to Serve Static Files
# =========================================

FROM dhi.io/nginx:1.28.0-alpine3.21-dev AS runner

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the static build output from the build stage to Nginx's default HTML serving directory
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html

# Use a non-root user for security best practices
USER nginx

# Expose port 8080 to allow HTTP traffic
# Note: The default NGINX container now listens on port 8080 instead of 80 
EXPOSE 8080

# Start Nginx directly with custom config
ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]