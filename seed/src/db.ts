import { Pool } from 'pg';
import dotenv from 'dotenv';

declare global {
    // Allow global `var` declarations
    // eslint-disable-next-line no-var
    var _pool: Pool | undefined;
}

dotenv.config();

const pool = global._pool || (() => {    
    console.log("Opening pool to database:\n");

    console.log("IN_DB_USER:", process.env.IN_DB_USER);
    console.log("IN_DB_HOST:", process.env.IN_DB_HOST);
    console.log("IN_DB_DATABASE:", process.env.IN_DB_DATABASE);
    console.log("IN_DB_PASSWORD:", process.env.IN_DB_PASSWORD ? '*'.repeat(process.env.IN_DB_PASSWORD.length) : '');
    console.log("IN_DB_PORT:", process.env.IN_DB_PORT);
    
    return new Pool({
        user: process.env.IN_DB_USER,
        host: process.env.IN_DB_HOST,
        database: process.env.IN_DB_DATABASE,
        password: process.env.IN_DB_PASSWORD,
        port: parseInt(process.env.IN_DB_PORT as string),
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
})();

// Close the pool when the process ends
const closePool = async () => {
    try {
        await pool.end();
        console.log("Database pool closed.");
    } catch (error) {
        console.error("Error closing database pool:", error);
    }
};

process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);
process.on('exit', closePool);

export default pool;