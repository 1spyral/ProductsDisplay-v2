import { db } from '@/db/drizzle';
import { products } from '@/db/schema';
import { Product } from '@/types/Product';

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
