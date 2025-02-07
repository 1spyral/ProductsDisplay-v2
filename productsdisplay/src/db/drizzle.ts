import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import dotenv from 'dotenv';
import postgres from "postgres";

dotenv.config();

export const client = postgres({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT as string),
    max: 1
})
export const db = drizzle(client, { schema });
