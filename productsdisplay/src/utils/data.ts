import { Product } from "@/types/Product";
import pool from "./db";

import { unstable_cache as cache } from "next/cache";

const TABLE_NAME = "products";

export const fetchData = cache(async () => {
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
}, ["data"], { revalidate: 60, tags: ["data"] });
