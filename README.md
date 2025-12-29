# ProductsDisplay-v2

Full-stack Next.js eCommerce system with a customer storefront and admin tooling for managing products and images.

## Overview

- Storefront: category browsing, search, clearance view, and product detail pages backed by PostgreSQL via Drizzle ORM.
- Admin: password-protected `/admin` area for managing products and images (dashboard plus product tooling in `src/components/ProductForm` and `src/actions`).
- Images: product images stored in Google Cloud Storage, served via a configurable public path.
- Search: client-side fuzzy search using Fuse.js over the product catalog.

## Tech Stack

- Framework: Next.js (App Router) with server components and server actions.
- Runtime: Bun (see `package.json` engines) for dev/build/start scripts.
- Database: PostgreSQL with `drizzle-orm` and `drizzle-kit` migrations (`drizzle/` and `src/db/schema`).
- Storage: Google Cloud Storage via `@google-cloud/storage` (`src/lib/gcs.ts`).
- UI: React and Tailwind CSS v4 (see `globals.css`, `postcss.config.mjs`).
- Auth: simple admin password stored in `ADMIN_PASSWORD`, cookie-based session in `src/proxies/auth.ts` plus `src/actions/admin.ts`.
- Search: Fuse.js helpers in `src/utils/search.ts`.

## Architecture

- App routes: `src/app` (for example `/`, `/category/[category]`, `/product/[id]`, `/search`, `/clearance`, `/admin/*`).
- Database layer: `src/db/drizzle.ts` (connection pooling, schema + relations) and `src/db/queries/*` (encapsulated queries).
- Images & GCS: `src/lib/gcs.ts` for upload/delete/copy/list/signed URLs; `src/lib/imageService.ts` and `src/lib/imageKey.ts` for mapping product IDs to image keys.
- Server actions: `src/actions/admin.ts` for admin login and product/image mutations.
- Middleware/proxies: `src/proxies/auth.ts` for admin route protection; `src/proxies/rate-limit.ts` for basic API rate limiting.
- Components: storefront and admin UI in `src/components/**` (product list, product form, image manager, modals, navbar, etc.).

## Environment Configuration

Copy `env.example` to `.env` and fill in values:

    cp env.example .env

Key variables (see `env.example` for the full list):

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

    # Install project dependencies
    cd ProductsDisplay-v2
    bun install

## Database Migrations

Ensure Postgres is running and `.env` DB values are correct.

    # Generate migrations from the schema (optional during dev)
    bun run db:generate

    # Apply migrations
    bun run db:migrate

    # Alternatively, push schema directly
    bun run db:push

## Running in Development

    # Start the Next.js dev server
    bun run dev

The app will be available at http://localhost:3000.

### Admin Access (Development)

1. Set `ADMIN_PASSWORD` in `.env`.
2. Visit http://localhost:3000/admin (redirects to `/admin/login`).
3. Log in with the configured password to reach `/admin/dashboard`.

## Building and Running (Production Style)

    # Build standalone Next.js output
    bun run build

    # Run the standalone server
    bun run start

The build uses a standalone Next.js output and the `cp` script in `package.json` to copy `public` and static assets into `.next/standalone` (used by the `Dockerfile`).

## Linting and Formatting

    # Lint with ESLint
    bun run lint

    # Format with Prettier
    bun run format

    # Check formatting only
    bun run format:check

## Deployment Notes

- Ensure all required env vars (DB, GCS, `ADMIN_PASSWORD`) are set in the target environment.
- Deploy using the standalone output (`bun run build` then `bun run start`, or the provided `Dockerfile`).
- Prefer service account credentials via environment variables for production.
