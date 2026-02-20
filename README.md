# ProductsDisplay-v2

Full-stack Next.js eCommerce system with a customer storefront and admin tooling for managing products and images.

## Overview

- Storefront: category browsing, search, clearance view, and product detail pages backed by PostgreSQL via Drizzle ORM.
- Admin: password-protected `/admin` area for managing products and images (dashboard plus product tooling in `apps/web/src/components/ProductForm` and `apps/web/src/actions`).
- Images: product images stored in Google Cloud Storage, served via a configurable public path.
- Search: client-side fuzzy search using Fuse.js over the product catalog.

## Tech Stack

- Framework: Next.js (App Router) with server components and server actions.
- Runtime: Bun (see `package.json` engines) for dev/build/start scripts.
- Database: PostgreSQL with `drizzle-orm` and `drizzle-kit` migrations (`apps/web/drizzle/` and `apps/web/src/db/schema`).
- Storage: Google Cloud Storage via `@google-cloud/storage` (`apps/web/src/lib/gcs.ts`).
- UI: React and Tailwind CSS v4 (see `globals.css`, `postcss.config.mjs`).
- Auth: simple admin password stored in `ADMIN_PASSWORD`, cookie-based session in `apps/web/src/proxies/auth.ts` plus `apps/web/src/actions/admin.ts`.
- Search: Fuse.js helpers in `apps/web/src/utils/search.ts`.

## Architecture

- App routes: `apps/web/src/app` (for example `/`, `/category/[category]`, `/product/[id]`, `/search`, `/clearance`, `/admin/*`).
- Database layer: `apps/web/src/db/drizzle.ts` (connection pooling, schema + relations) and `apps/web/src/db/queries/*` (encapsulated queries).
- Images & GCS: `apps/web/src/lib/gcs.ts` for upload/delete/copy/list/signed URLs; `apps/web/src/lib/imageService.ts` and `apps/web/src/lib/imageKey.ts` for mapping product IDs to image keys.
- Server actions: `apps/web/src/actions/admin.ts` for admin login and product/image mutations.
- Middleware/proxies: `apps/web/src/proxies/auth.ts` for admin route protection; `apps/web/src/proxies/rate-limit.ts` for basic API rate limiting.
- Components: storefront and admin UI in `apps/web/src/components/**` (product list, product form, image manager, modals, navbar, etc.).

## Environment Configuration

Copy `apps/web/env.example` to `apps/web/.env` and fill in values:

    cp apps/web/env.example apps/web/.env

Key variables (see `apps/web/env.example` for the full list):

- `DATABASE_URL` – Postgres connection string used at runtime by the app.
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` – Postgres credentials for Drizzle migrations.
- `NEXT_PUBLIC_IMAGE_PATH` – Base URL from which product images are served (CDN or GCS URL).
- `GOOGLE_CLOUD_PROJECT_ID` – GCP project ID.
- `GOOGLE_CLOUD_STORAGE_BUCKET` – GCS bucket name for product images.
- `GOOGLE_APPLICATION_CREDENTIALS` – Path to a service account JSON key file (local dev), or
- `GOOGLE_CLOUD_CLIENT_EMAIL` / `GOOGLE_CLOUD_PRIVATE_KEY` – Service account credentials via env (prod-friendly).
- `ADMIN_PASSWORD` – password required to log into `/admin`.

## Installing Dependencies

This project expects Bun version 1.3.4 or newer.

    # Install bun (if needed)
    curl -fsSL https://bun.sh/install | bash

    # Install project dependencies (workspace root)
    cd ProductsDisplay-v2
    bun install

## Database Migrations

Ensure Postgres is running and `.env` DB values are correct.

    # Generate migrations from the schema (optional during dev)
    cd apps/web && bun run db:generate

    # Apply migrations
    cd apps/web && bun run db:migrate

    # Alternatively, push schema directly
    cd apps/web && bun run db:push

## Running in Development

    # Start the Next.js dev server
    cd apps/web && bun run dev

The app will be available at http://localhost:3000.

### Admin Access (Development)

1. Set `ADMIN_PASSWORD` in `apps/web/.env`.
2. Visit http://localhost:3000/admin (redirects to `/admin/login`).
3. Log in with the configured password to reach `/admin/dashboard`.

## Building and Running (Production Style)

    # Build standalone Next.js output
    cd apps/web && bun run build

    # Run the standalone server
    cd apps/web && bun run start

The build uses a standalone Next.js output and the `cp` script in `apps/web/package.json` to copy `public` and static assets into `.next/standalone` (used by `apps/web/Dockerfile`).

## Linting and Formatting

    # Lint with ESLint
    cd apps/web && bun run lint

    # Format the whole repository with Prettier
    bun run format

    # Check formatting only (whole repository)
    bun run format:check

## Testing

    # Run all tests (unit + integration)
    cd apps/web && bun run test

    # Run unit tests only
    cd apps/web && bun run test:unit

    # Run unit tests with coverage output (text + lcov)
    cd apps/web && bun run test:coverage

    # Run integration tests only
    cd apps/web && bun run test:integration

    # Standard local integration flow (starts Docker Postgres, migrates, tests, tears down)
    cd apps/web && bun run test:integration:local

    # Run end-to-end tests (Playwright)
    cd apps/web && bun run test:e2e

### Opt-in Unit Test Concurrency

Unit tests support selective concurrency via `apps/web/bunfig.toml`:

- Files named `*.concurrent.test.ts` are executed with Bun's concurrent test mode.
- Files named `*.test.ts` remain standard (non-concurrent) tests.

Use `*.concurrent.test.ts` only for stateless tests that do not mutate shared
runtime state (`process.env`, global module mocks, shared maps, timers, or DOM
globals).

Integration tests require PostgreSQL. Standard local method is Docker:

- `cd apps/web && bun run test:integration:local` uses `apps/web/docker-compose.test.yml`, waits for DB
  readiness, exports test DB env vars, runs `cd apps/web && bun run db:migrate`, runs
  integration tests, then tears down the test DB.
- To keep the DB running after tests for debugging:
  `cd apps/web && KEEP_TEST_DB_RUNNING=1 bun run test:integration:local`.
- Manual DB lifecycle commands are available:
  `cd apps/web && bun run test:integration:db:up` and `cd apps/web && bun run test:integration:db:down`.

E2E tests use Playwright (`apps/web/playwright.config.ts`) and by default start a local
Next dev server on `http://127.0.0.1:3100`. To point at an already-running
environment, set `PLAYWRIGHT_BASE_URL` before running `cd apps/web && bun run test:e2e`.

## Deployment Notes

- Ensure all required env vars (DB, GCS, `ADMIN_PASSWORD`) are set in the target environment.
- Deploy using the standalone output (`cd apps/web && bun run build` then `cd apps/web && bun run start`, or the provided `apps/web/Dockerfile`).
- Prefer service account credentials via environment variables for production.
