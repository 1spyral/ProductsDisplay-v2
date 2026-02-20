# syntax=docker.io/docker/dockerfile:1

FROM oven/bun:1.3.9-slim AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN bun install --frozen-lockfile

FROM oven/bun:1.3.9-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

COPY --from=deps /app/node_modules ./node_modules
COPY apps/api ./apps/api
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3001

WORKDIR /app/apps/api

CMD ["bun", "run", "start"]
