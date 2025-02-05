import { db } from '@/db/drizzle';
import { products } from '@/db/schema';
import { InferSelectModel } from 'drizzle-orm';

export type Product = InferSelectModel<typeof products>;

export async function getProducts() {
    return db
        .select({
            id: products.id,
            name: products.name,
            description: products.description,
            category: products.category,
        })
        .from(products);
}
