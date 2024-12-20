"use cache";

import { Product } from "@/types/Product";
import pool from "./db";

import { unstable_cacheLife as cacheLife } from "next/cache";

const TABLE_NAME = "products";

export default async function fetchData(): Promise<Product[]> {
    cacheLife("seconds");
    //cacheLife("minutes");
    //cacheLife("default");
    console.log("Revalidating fetchData()");
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
};
