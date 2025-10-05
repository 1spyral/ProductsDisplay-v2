"use server";

import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import Product from "@/types/Product";
import { eq, inArray } from "drizzle-orm";

export async function getProducts(): Promise<Product[]> {
    return db.query.products.findMany({
        with: {
            images: {
                orderBy: (images, { asc }) => [asc(images.position)],
            },
        },
    });
}

export async function getProductsByCategory(
    category: string
): Promise<Product[]> {
    return db.query.products.findMany({
        where: eq(products.category, category),
        with: {
            images: {
                orderBy: (images, { asc }) => [asc(images.position)],
            },
        },
    });
}

export async function getProductById(id: string): Promise<Product | null> {
    return (
        (await db.query.products.findFirst({
            where: eq(products.id, id),
            with: {
                images: {
                    orderBy: (images, { asc }) => [asc(images.position)],
                },
            },
        })) || null
    );
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    return db.query.products.findMany({
        where: inArray(products.id, ids),
        with: {
            images: {
                orderBy: (images, { asc }) => [asc(images.position)],
            },
        },
    });
}

export async function updateProduct(
    id: string,
    data: {
        name?: string | null;
        description?: string | null;
        category?: string;
    }
): Promise<void> {
    await db.update(products).set(data).where(eq(products.id, id));
}
