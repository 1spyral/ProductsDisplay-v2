import { Client } from "pg";
import { fetchData } from "./data";
import dotenv from "dotenv";

dotenv.config();

const TABLE_NAME = "products";

// Debugging: Log environment variables
console.log("OUT_DB_USER:", process.env.OUT_DB_USER);
console.log("OUT_DB_HOST:", process.env.OUT_DB_HOST);
console.log("OUT_DB_DATABASE:", process.env.OUT_DB_DATABASE);
console.log("OUT_DB_PASSWORD:", process.env.OUT_DB_PASSWORD ? '*'.repeat(process.env.OUT_DB_PASSWORD.length) : '');
console.log("OUT_DB_PORT:", process.env.OUT_DB_PORT);

const client = new Client({
    user: process.env.OUT_DB_USER,
    host: process.env.OUT_DB_HOST,
    database: process.env.OUT_DB_DATABASE,
    password: process.env.OUT_DB_PASSWORD,
    port: parseInt(process.env.OUT_DB_PORT as string),
});

const seedDatabase = async () => {
    try {
        await client.connect();

        await client.query(`DELETE FROM ${TABLE_NAME}`);

        const data = await fetchData();

        for (const product of data) {
            const query = "INSERT INTO products (id, name, description, category) VALUES ($1, $2, $3, $4)";
            await client.query(query, [product.id, product.name, product.description, product.category]);
        }

        console.log("Database seeded successfully");
    } catch (err) {
        console.error("Error seeding database", err);
    } finally {
        await client.end();
    }
};

seedDatabase();