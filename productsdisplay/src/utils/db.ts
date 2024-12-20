import { Pool } from 'pg';

declare global {
    // Allow global `var` declarations
    // eslint-disable-next-line no-var
    var _pool: Pool | undefined;
}

const pool = global._pool || (() => {    
    console.log("Opening pool to database:\n");

    console.log("DB_USER:", process.env.DB_USER);
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_DATABASE:", process.env.DB_DATABASE);
    console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? '*'.repeat(process.env.DB_PASSWORD.length) : '');
    console.log("DB_PORT:", process.env.DB_PORT);
    
    return new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT as string),
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
})();

if (process.env.NODE_ENV !== 'production') {
    global._pool = pool;
}

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
