"use server";

import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import Product from "@/types/Product";
import { eq, inArray } from "drizzle-orm";

export async function getProducts(): Promise<Product[]> {
    return db
        .select({
            id: products.id,
            name: products.name,
            description: products.description,
            category: products.category,
        })
        .from(products);
}

export async function getProductsByCategory(
    category: string
): Promise<Product[]> {
    return db
        .select({
            id: products.id,
            name: products.name,
            description: products.description,
            category: products.category,
        })
        .from(products)
        .where(eq(products.category, category));
}

export async function getProductById(id: string): Promise<Product | null> {
    return db
        .select({
            id: products.id,
            name: products.name,
            description: products.description,
            category: products.category,
        })
        .from(products)
        .where(eq(products.id, id))
        .limit(1)
        .then((rows) => rows[0] || null);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    return db
        .select({
            id: products.id,
            name: products.name,
            description: products.description,
            category: products.category,
        })
        .from(products)
        .where(inArray(products.id, ids));
}
