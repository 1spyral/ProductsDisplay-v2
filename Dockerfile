# syntax=docker.io/docker/dockerfile:1

FROM oven/bun:1.3.9-slim AS base

# Install dependencies only when needed
FROM base AS deps

WORKDIR /app

# Install dependencies with Bun
COPY package.json bun.lock* .npmrc* ./
RUN bun install --frozen-lockfile

# Install Chromium for Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN bunx playwright install chromium

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs --create-home nextjs

COPY --from=builder /app/.next/standalone ./

# Install OS-level Playwright dependencies
RUN bunx playwright install-deps chromium

# Copy Playwright browsers into the runtime image.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
COPY --from=deps /ms-playwright /ms-playwright
RUN chown -R nextjs:nodejs /ms-playwright

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Ensure the runtime user can write Next.js prerender cache and related files.
RUN chown -R nextjs:nodejs /app/.next

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["bun", "server.js"]
