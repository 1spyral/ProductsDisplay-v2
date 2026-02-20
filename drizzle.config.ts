import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./drizzle",
    schema: "./apps/web/src/db/schema",
    dialect: "postgresql",
    casing: "snake_case",
    dbCredentials: {
        url: process.env.DATABASE_URL as string,
    },
});
