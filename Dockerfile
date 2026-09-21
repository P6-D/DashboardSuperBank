# ── Stage 1: Build ──────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Copy package manifests first for layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve with nginx ──────────────────────────────────────
FROM nginx:stable-alpine

# Default backend URL — override at runtime with -e BACKEND_URL=http://host:port
ENV BACKEND_URL=http://backend:8081

# Remove default nginx site
RUN rm /etc/nginx/conf.d/default.conf

# Add nginx config template
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

# Custom entrypoint: runs envsubst on BACKEND_URL only (preserves $host, $remote_addr, etc.)
RUN printf '#!/bin/sh\nenvsubst "$$BACKEND_URL" < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf\nexec nginx -g "daemon off;"\n' > /docker-entrypoint-custom.sh \
    && chmod +x /docker-entrypoint-custom.sh

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint-custom.sh"]

