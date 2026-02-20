# Repository Guidelines

## Project Structure & Module Organization

- Core application code lives in `src/` using Next.js App Router.
- User-facing routes are in `src/app/(app)/*`; admin routes are in `src/app/(admin)/*`.
- Shared UI components are in `src/components/*` (for example `Product/`, `ProductForm/`, `CategoryForm/`).
- Database schema and access layers are in `src/db/schema/*`, `src/db/queries/*`, and `src/db/drizzle.ts`.
- SQL migrations are generated into `drizzle/`; do not hand-write migration SQL files.
- Always generate migrations with `bun run db:generate --name <name>` and commit generated files.
- If raw SQL is needed (for example extensions, functions, triggers, or non-schema operations), generate the file with `bun run db:generate --custom --name <name>` and then edit that generated file.
- Static assets are in `public/`.

## Build, Test, and Development Commands

- `bun install`: install dependencies (Bun `>=1.3.9`).
- `bun run dev`: start local development server (`http://localhost:3000`).
- `bun run build`: build standalone Next.js output and copy static assets.
- `bun run start`: run the production-style standalone server.
- `bun run lint`: run ESLint.
- `bun run format` / `bun run format:check`: format or check formatting with Prettier.
- `bun run test:unit`: run unit tests.
- `bun run test:integration`: run integration tests against configured Postgres.
- `bun run test:integration:local`: spin up local Docker Postgres, migrate, run integration tests, and tear down.
- `bun run test:e2e`: run Playwright end-to-end tests (auto-starts local Next dev server unless `PLAYWRIGHT_BASE_URL` is set).
- `bun run db:generate --name <name>`: generate a named Drizzle migration from schema changes.
- `bun run db:generate --custom --name <name>`: generate a custom migration scaffold for raw SQL changes (do not create migration files manually).
- `bun run db:migrate` / `bun run db:push`: apply schema changes to Postgres.

## Coding Style & Naming Conventions

- TypeScript is strict (`tsconfig.json`), with `@/*` path alias to `src/*`.
- Prettier rules: semicolons on, double quotes, trailing commas (`es5`), `printWidth: 80`.
- Indentation: 4 spaces by default; 2 spaces for `*.tsx`, `*.jsx`, and YAML.
- Keep imports clean; unused imports fail lint (`unused-imports/no-unused-imports`).
- Naming: React components in PascalCase (`ProductModal.tsx`), hooks in camelCase with `use` prefix (`useProductForm.ts`), route folders in lowercase.

## Testing Guidelines

- Update or add tests when code changes affect behavior, business logic, integrations, or bug-prone paths.
- Unit tests use Bun: `bun run test:unit`.
- Integration tests use Bun + Postgres: `bun run test:integration` (run `bun run db:migrate` first).
- Preferred local integration flow: `bun run test:integration:local` (Docker required).
- E2E tests use Playwright: `bun run test:e2e`.
- Coverage reports: `bun run test:coverage`.
- Opt-in concurrency is enabled through `bunfig.toml` with `concurrentTestGlob`.
    - Name only concurrency-safe files as `*.concurrent.test.ts`.
    - Keep files as `*.test.ts` when tests mutate shared state (`process.env`, global maps, module mocks, timers, or DOM globals).
- Minimum validation for changes: `bun run lint`, `bun run build`, and relevant test commands.
- For DB changes, generate and commit a migration with `bun run db:generate --name <name>`, then verify affected admin/storefront flows.

## Commit & Pull Request Guidelines

- Follow existing commit style: short imperative summaries (for example `Add category filter in PDF editor`).
- AI agents should create commits for their own completed changes unless the user explicitly asks not to commit.
- Before committing, run formatting, linting, and relevant tests for your changes (`bun run format`, `bun run lint`, and applicable `bun run test:*` commands).
- Commits must include a descriptive title and a body that explains what changed and why.
- Use scoped prefixes when appropriate (for example `[Migration] Add backgroundImageUrl to storeInfo`).
- PRs should include: purpose, key changes, migration/environment impacts, and screenshots for UI changes.
- Link related issues and list manual verification steps performed.

## Security & Configuration Tips

- Do not commit secrets; use `.env` locally and keep `env.example` up to date.
- Required runtime settings include DB credentials, GCS credentials, `NEXT_PUBLIC_IMAGE_PATH`, and `ADMIN_PASSWORD`.
