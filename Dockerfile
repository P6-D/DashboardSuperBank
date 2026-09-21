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
ENV BACKEND_URL=http://host.docker.internal:8081

# Remove default nginx site
RUN rm /etc/nginx/conf.d/default.conf

# Add nginx config template — the built-in entrypoint script (20-envsubst-on-templates.sh)
# processes /etc/nginx/templates/*.template → /etc/nginx/conf.d/* at container startup
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Restrict envsubst to BACKEND_URL only so nginx variables ($host, $remote_addr, etc.) survive
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

