# Copilot Instructions

## Project Overview

ProductsDisplay-v2 is a full-stack Next.js eCommerce system with a customer storefront and admin tooling for managing products and images. It uses a Bun monorepo with the main app in `apps/web/`.

### Tech Stack

- **Framework:** Next.js (App Router) with server components and server actions.
- **Runtime:** Bun (>=1.3.9) for dev, build, and start scripts.
- **Database:** PostgreSQL with `drizzle-orm` and `drizzle-kit` for migrations.
- **Storage:** Google Cloud Storage via `@google-cloud/storage`.
- **UI:** React and Tailwind CSS v4.
- **Auth:** Simple admin password with cookie-based sessions.
- **Search:** Fuse.js for client-side fuzzy search.

## Project Structure

- Core application code lives in `apps/web/src/` using Next.js App Router.
- User-facing routes are in `apps/web/src/app/(app)/*`; admin routes are in `apps/web/src/app/(admin)/*`.
- Shared UI components are in `apps/web/src/components/*` (for example `Product/`, `ProductForm/`, `CategoryForm/`).
- Database schema and access layers are in `apps/web/src/db/schema/*`, `apps/web/src/db/queries/*`, and `apps/web/src/db/drizzle.ts`.
- Server actions live in `apps/web/src/actions/`.
- Image handling utilities are in `apps/web/src/lib/gcs.ts`, `apps/web/src/lib/imageService.ts`, and `apps/web/src/lib/imageKey.ts`.
- SQL migrations are generated into `apps/web/drizzle/`; do not hand-write migration SQL files.
- Static assets are in `apps/web/public/`.

## Coding Style & Conventions

- TypeScript is strict (`apps/web/tsconfig.json`), with `@/*` path alias to `src/*`.
- Prettier rules: semicolons on, double quotes, trailing commas (`es5`), `printWidth: 80`.
- Indentation: 4 spaces by default; 2 spaces for `*.tsx`, `*.jsx`, and YAML.
- Keep imports clean; unused imports fail lint (`unused-imports/no-unused-imports`).
- React components use PascalCase filenames (`ProductModal.tsx`).
- Hooks use camelCase with `use` prefix (`useProductForm.ts`).
- Route folders use lowercase naming.

## Common Commands

- `bun install` — install dependencies at the workspace root.
- `cd apps/web && bun run dev` — start local development server.
- `cd apps/web && bun run build` — build standalone Next.js output.
- `cd apps/web && bun run lint` — run ESLint.
- `bun run format` / `bun run format:check` — format or check formatting with Prettier.
- `cd apps/web && bun run test:unit` — run unit tests.
- `cd apps/web && bun run test:integration` — run integration tests against Postgres.
- `cd apps/web && bun run test:e2e` — run Playwright end-to-end tests.
- `cd apps/web && bun run db:generate --name <name>` — generate a named Drizzle migration.
- `cd apps/web && bun run db:migrate` — apply migrations to Postgres.

## Testing

- Unit tests use Bun's test runner: `cd apps/web && bun run test:unit`.
- Integration tests use Bun + Postgres: `cd apps/web && bun run test:integration`.
- E2E tests use Playwright: `cd apps/web && bun run test:e2e`.
- Files named `*.concurrent.test.ts` run with Bun's concurrent test mode (use only for stateless tests).
- Files named `*.test.ts` remain standard non-concurrent tests (use when tests mutate shared state).
- Update or add tests when changes affect behavior, business logic, or bug-prone paths.

## Database Migrations

- Always generate migrations with `cd apps/web && bun run db:generate --name <name>` and commit generated files.
- For raw SQL (extensions, functions, triggers), use `cd apps/web && bun run db:generate --custom --name <name>` and edit the generated file.
- Never hand-write migration SQL files directly.

## Security

- Do not commit secrets; use `.env` locally and keep `env.example` up to date.
- Required runtime settings include DB credentials, GCS credentials, `NEXT_PUBLIC_IMAGE_PATH`, and `ADMIN_PASSWORD`.
