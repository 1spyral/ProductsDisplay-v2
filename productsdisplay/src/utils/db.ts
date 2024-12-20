"use server";

import { Pool } from "pg";

export default async function getPool() {
    console.log("Opening pool to database:\n");

    console.log("DB_USER:", process.env.DB_USER);
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_DATABASE:", process.env.DB_DATABASE);
    console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? '*'.repeat(process.env.DB_PASSWORD.length) : '');
    console.log("DB_PORT:", process.env.DB_PORT);

    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT as string),
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    return pool;
}
