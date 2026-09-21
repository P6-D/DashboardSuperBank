# ── Stage 1: Build ──────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Copy package manifests first for layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build
# Set VITE_API_BASE_URL at build time so axios hits the backend directly
ARG VITE_API_BASE_URL=http://localhost:8081/api/v1
ARG VITE_ACTUATOR_BASE_URL=http://localhost:8081
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ACTUATOR_BASE_URL=$VITE_ACTUATOR_BASE_URL

COPY . .
RUN npm run build

# ── Stage 2: Serve static files with a lightweight Node server ─────
FROM node:22-alpine

RUN npm install -g serve

WORKDIR /app
COPY --from=build /app/dist .

EXPOSE 3001

CMD ["serve", "-s", ".", "-l", "3001"]

