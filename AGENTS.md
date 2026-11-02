# Repository Guidelines

## Architecture & Project Structure

- `apps/web/src/`: Next.js App Router application. Storefront routes live in `app/(app)/`, admin routes in `app/(admin)/`, and shared UI in `components/`. Static assets live in `apps/web/public/`.
- `apps/api/src/`: Fastify backend. Database access belongs here, with Drizzle schemas in `db/schema/`, queries in `db/queries/`, and the connection in `db/drizzle.ts`.
- Web query helpers in `apps/web/src/db/queries/` call the backend through `apps/web/src/lib/api/client.ts`; preserve this API boundary when adding data access.
- Shared API DTOs live in `packages/contracts/`. When changing API payloads, update shared contracts and affected consumers together.
- See `README.md` for setup and development workflows, and workspace `package.json` files for available scripts and runtime requirements.

## Database Migrations

- Generate schema migrations with `cd apps/api && bun run db:generate --name <name>`.
- For raw SQL such as extensions, functions, or triggers, generate a scaffold with `cd apps/api && bun run db:generate --custom --name <name>`, then edit the generated file.
- Do not create migration SQL files manually. Commit generated migration files and metadata in `apps/api/drizzle/` with the corresponding changes.
- Verify affected admin and storefront flows when changing database behavior.

## Coding & Tests

- Follow existing local conventions. Prettier, ESLint, and TypeScript configuration define formatting and static checks.
- Update or add tests when changes affect behavior, business logic, integrations, or bug-prone paths.
- Bun test concurrency is opt-in through `concurrentTestGlob` in each application's `bunfig.toml`. Use `*.concurrent.test.ts` only for concurrency-safe tests. Keep tests that mutate shared state (`process.env`, global maps, module mocks, timers, or DOM globals) in `*.test.ts` files.

## Validation

- Format changed files with `bunx prettier --write <files>`; avoid unrelated formatting changes. Run `bun run format:check` from the repository root before committing.
- Documentation-only changes require formatting checks.
- Application changes additionally require both linters and both unit suites:
    - `cd apps/web && bun run lint`
    - `cd apps/api && bun run lint`
    - `cd apps/web && bun run test:unit`
    - `cd apps/api && bun run test:unit`
- Web application changes also require `cd apps/web && bun run build`.
- Database or API integration changes require relevant integration tests. Prefer `cd apps/api && bun run test:integration:local`, which manages a local Docker Postgres instance and migrations. To use a configured test database, apply migrations with `cd apps/api && bun run db:migrate`, then run `cd apps/api && bun run test:integration`.
- User-flow changes require relevant Playwright E2E tests with `cd apps/web && bun run test:e2e`. The default configuration starts the API and web servers and seeds the test database; use a dedicated test database. See `README.md` for local setup.
- Independent checks may run concurrently. Required checks must pass before committing; report failures or unavailable prerequisites instead of bypassing checks.

## Commits & Pull Requests

- Commit your completed changes unless the user asks otherwise. Include only task-related changes and preserve unrelated work.
- Use a short imperative commit title and a body explaining what changed and why. Use scoped prefixes when appropriate, such as `[Migration]`.
- Run the applicable validation above before committing. Do not bypass checks with `--no-verify` or equivalent flags.
- In the final response, report the commit and validation results, including any failures or checks that could not run.
- PRs should explain the purpose and key changes, note migration or environment impacts, link related issues, and include validation results and manual verification steps. Include screenshots for UI changes.

## Security & Configuration

- Do not commit secrets. Use local environment files and keep `apps/web/env.example` and `apps/api/env.example` up to date when configuration changes.
- Consult those examples and each application's `src/env.ts` for configuration names and defaults; requirements vary by service and feature.
- The web app uses `API_BASE_URL` to reach the backend. Configure the same `ADMIN_TOKEN_SECRET` in both services so admin authentication works across the API boundary.
