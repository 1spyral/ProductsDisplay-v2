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

- No dedicated automated test suite is configured yet (`package.json` has no `test` script).
- Minimum validation for changes: `bun run lint`, `bun run build`, and manual verification of affected routes.
- For DB changes, generate and commit a migration with `bun run db:generate --name <name>`, then verify affected admin/storefront flows.

## Commit & Pull Request Guidelines

- Follow existing commit style: short imperative summaries (for example `Add category filter in PDF editor`).
- Use scoped prefixes when appropriate (for example `[Migration] Add backgroundImageUrl to storeInfo`).
- PRs should include: purpose, key changes, migration/environment impacts, and screenshots for UI changes.
- Link related issues and list manual verification steps performed.

## Security & Configuration Tips

- Do not commit secrets; use `.env` locally and keep `env.example` up to date.
- Required runtime settings include DB credentials, GCS credentials, `NEXT_PUBLIC_IMAGE_PATH`, and `ADMIN_PASSWORD`.
