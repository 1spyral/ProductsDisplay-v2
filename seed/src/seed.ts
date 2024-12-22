import { Client } from "pg";
import fetchData from "./data";
import dotenv from "dotenv";

dotenv.config();

const TABLE_NAME = "products";

// Debugging: Log environment variables
console.log("USER:", process.env.USER);
console.log("HOST:", process.env.HOST);
console.log("DATABASE:", process.env.DATABASE);
console.log("PASSWORD:", process.env.PASSWORD ? '*'.repeat(process.env.PASSWORD.length) : '');
console.log("PORT:", process.env.PORT);

const client = new Client({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: parseInt(process.env.PORT as string),
});

const seedDatabase = async () => {
    try {
        await client.connect();

        await client.query(`DELETE FROM ${TABLE_NAME}`);

        const data = await fetchData();

        for (const product of data) {
            if (!product.id) {
                continue;
            }
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