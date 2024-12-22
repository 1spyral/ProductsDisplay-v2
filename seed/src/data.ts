import pool from "./db";

type Product = {
    id: string;
    name: string;
    description: string;
    category: string;
}

const TABLE_NAME = "products";

export const fetchData = async () => {
    try {
        const client = await pool.connect();
        const { rows } = await client.query(`SELECT * FROM ${TABLE_NAME}`);
        client.release();

        return rows.map((row: Product) => {
            return {
                id: row.id,
                name: row.name,
                description: row.description,
                category: row.category,
            };
        });
    } catch (error) {
        console.error("Error fetching data", error);
        return [];
    }
}
