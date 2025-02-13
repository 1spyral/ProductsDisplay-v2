import { db } from '@/db/drizzle';
import { products } from '@/db/schema';
import { Product } from '@/types/Product';
import { eq } from "drizzle-orm";

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

export async function getProduct(id: string): Promise<Product | null> {
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
        .then(rows => rows[0] || null);
}