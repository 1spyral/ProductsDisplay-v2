import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const db = drizzle({
    connection: {
        connectionString: process.env.DATABASE_URL!,
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT as string),
    }
});