import "dotenv/config";
import { defineConfig } from "drizzle-kit";
export default defineConfig({
    out: "./drizzle",
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        host: process.env.DB_HOST as string,
        port: parseInt(process.env.DB_PORT as string),
        database: process.env.DB_DATABASE as string,
        user: process.env.DB_USER as string,
        password: process.env.DB_PASSWORD as string,
        ssl: false,
    },
});
