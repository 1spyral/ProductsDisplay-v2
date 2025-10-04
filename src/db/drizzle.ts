import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL as string;

declare global {
    var postgresClient: ReturnType<typeof postgres> | undefined;
}

let client: ReturnType<typeof postgres>;

if (process.env.NODE_ENV === "production") {
    client = postgres(connectionString, {
        prepare: false,
        max: 5,
        idle_timeout: 10,
        max_lifetime: 60 * 30,
    });
} else {
    if (!global.postgresClient) {
        global.postgresClient = postgres(connectionString, {
            prepare: false,
            max: 1,
            idle_timeout: 10,
            max_lifetime: 60 * 30,
        });
    }
    client = global.postgresClient;
}

export const db = drizzle(client);
