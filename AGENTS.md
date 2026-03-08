# Repository Guidelines

## Project Structure & Module Organization

- Core application code lives in `apps/web/src/` using Next.js App Router.
- Backend API code lives in `apps/api/src/` (Fastify + Drizzle).
- User-facing routes are in `apps/web/src/app/(app)/*`; admin routes are in `apps/web/src/app/(admin)/*`.
- Shared UI components are in `apps/web/src/components/*` (for example `Product/`, `ProductForm/`, `CategoryForm/`).
- Database schema and access layers are in `apps/api/src/db/schema/*`, `apps/api/src/db/queries/*`, and `apps/api/src/db/drizzle.ts`.
- SQL migrations are generated into `apps/api/drizzle/`; do not hand-write migration SQL files.
- Always generate migrations with `cd apps/api && bun run db:generate --name <name>` and commit generated files.
- If raw SQL is needed (for example extensions, functions, triggers, or non-schema operations), generate the file with `cd apps/api && bun run db:generate --custom --name <name>` and then edit that generated file.
- Static assets are in `apps/web/public/`.

## Build, Test, and Development Commands

- `bun install`: install dependencies at the workspace root (Bun `>=1.3.10`).
- `cd apps/api && bun run dev`: start backend API service (`http://localhost:3001` by default).
- `cd apps/web && bun run dev`: start local development server (`http://localhost:3000`).
- `cd apps/web && bun run build`: build standalone Next.js output and copy static assets.
- `cd apps/web && bun run start`: run the production-style standalone server.
- `cd apps/api && bun run start`: run the API service in production style.
- `cd apps/web && bun run lint`: run ESLint for web.
- `cd apps/api && bun run lint`: run ESLint for API.
- `bun run format` / `bun run format:check`: format or check formatting with Prettier for the whole repository.
- `cd apps/web && bun run test:unit`: run web unit tests.
- `cd apps/api && bun run test:unit`: run API unit tests.
- `cd apps/api && bun run test:integration`: run API integration tests against configured Postgres.
- `cd apps/api && bun run test:integration:local`: spin up local Docker Postgres, migrate, run API integration tests, and tear down.
- `cd apps/web && bun run test:e2e`: run Playwright end-to-end tests (auto-starts local Next dev server unless `PLAYWRIGHT_BASE_URL` is set).
- `cd apps/api && bun run db:generate --name <name>`: generate a named Drizzle migration from schema changes.
- `cd apps/api && bun run db:generate --custom --name <name>`: generate a custom migration scaffold for raw SQL changes (do not create migration files manually).
- `cd apps/api && bun run db:migrate` / `cd apps/api && bun run db:push`: apply schema changes to Postgres.

## Coding Style & Naming Conventions

- TypeScript is strict (`apps/web/tsconfig.json`), with `@/*` path alias to `src/*`.
- Prettier rules: semicolons on, double quotes, trailing commas (`es5`), `printWidth: 80`.
- Indentation: 4 spaces by default; 2 spaces for `*.tsx`, `*.jsx`, and YAML.
- Keep imports clean; unused imports fail lint (`unused-imports/no-unused-imports`).
- Naming: React components in PascalCase (`ProductModal.tsx`), hooks in camelCase with `use` prefix (`useProductForm.ts`), route folders in lowercase.

## Testing Guidelines

- Update or add tests when code changes affect behavior, business logic, integrations, or bug-prone paths.
- Unit tests use Bun: `cd apps/web && bun run test:unit` (web) and `cd apps/api && bun run test:unit` (API).
- Integration tests use Bun + Postgres: `cd apps/api && bun run test:integration` (run `cd apps/api && bun run db:migrate` first).
- Preferred local integration flow: `cd apps/api && bun run test:integration:local` (Docker required).
- E2E tests use Playwright: `cd apps/web && bun run test:e2e`.
- Coverage reports: `cd apps/web && bun run test:coverage`.
- Opt-in concurrency is enabled through `bunfig.toml` with `concurrentTestGlob`.
    - Name only concurrency-safe files as `*.concurrent.test.ts`.
    - Keep files as `*.test.ts` when tests mutate shared state (`process.env`, global maps, module mocks, timers, or DOM globals).
- Minimum validation for changes: `cd apps/web && bun run lint`, `cd apps/api && bun run lint`, `cd apps/web && bun run build`, and relevant test commands.
- For DB changes, generate and commit a migration with `cd apps/api && bun run db:generate --name <name>`, then verify affected admin/storefront flows.

## Commit & Pull Request Guidelines

- Follow existing commit style: short imperative summaries (for example `Add category filter in PDF editor`).
- AI agents should create commits for their own completed changes unless the user explicitly asks not to commit.
- Before committing, run formatting, linting, and relevant tests for your changes (`bun run format`, `cd apps/web && bun run lint`, `cd apps/api && bun run lint`, and applicable `cd apps/web && bun run test:*` / `cd apps/api && bun run test:*` commands).
- Before committing, AI agents must run and pass all of the following commands in order: `bun run format:check`, `cd apps/web && bun run lint`, `cd apps/api && bun run lint`, `cd apps/web && bun run test:unit`, and `cd apps/api && bun run test:unit`.
- AI agents must include the result of each required pre-commit command in their final response before any commit.
- AI agents must not bypass checks with `--no-verify` or equivalent flags.
- Commits must include a descriptive title and a body that explains what changed and why.
- Use scoped prefixes when appropriate (for example `[Migration] Add backgroundImageUrl to storeInfo`).
- PRs should include: purpose, key changes, migration/environment impacts, and screenshots for UI changes.
- Link related issues and list manual verification steps performed.

## Security & Configuration Tips

- Do not commit secrets; use `.env` locally and keep `env.example` up to date.
- Required runtime settings include DB credentials, GCS credentials, `NEXT_PUBLIC_IMAGE_PATH`, and `ADMIN_PASSWORD`.
