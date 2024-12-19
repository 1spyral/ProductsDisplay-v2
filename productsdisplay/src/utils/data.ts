"use cache";

import { Product } from "@/types/Product";
import getPool from "./db";

const TABLE_NAME = "products";

export default async function fetchData(): Promise<Product[]> {
    try {
        const client = await (await getPool()).connect();
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
};
