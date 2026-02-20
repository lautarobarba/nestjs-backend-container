# syntax=docker/dockerfile:1.6

FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=development

# Minimal OS deps used by healthchecks/tools in dev containers
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g @nestjs/cli

# Leverage layer caching for deps
COPY backend/package*.json ./
RUN npm ci

# Dev image (used by docker-compose target: base)
COPY backend ./

FROM base AS build
ENV NODE_ENV=production
RUN npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g @nestjs/cli

COPY --from=build --chown=node:node /app/package*.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
