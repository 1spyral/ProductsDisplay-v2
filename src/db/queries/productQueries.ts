import { db } from '@/db/drizzle';
import { products } from '@/db/schema';
import Product from '@/types/Product';
import { eq } from "drizzle-orm";
import { unstable_cache as cache } from "next/cache";

async function fetchProducts(): Promise<Product[]> {
    return db
        .select({
            id: products.id,
            name: products.name,
            description: products.description,
            category: products.category,
        })
        .from(products)
}

async function fetchProductsByCategory(category: string): Promise<Product[]> {
    return db
        .select({
            id: products.id,
            name: products.name,
            description: products.description,
            category: products.category,
        })
        .from(products)
        .where(eq(products.category, category))
}

async function fetchProductById(id: string): Promise<Product | null> {
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

export const getProducts = cache(
    fetchProducts,
    ["products"],
    { revalidate: 43200, tags: ["products"] }
)

export const getProductsByCategory = cache(
    fetchProductsByCategory,
    ["products_by_category"],
    { revalidate: 43200, tags: ["products_by_category"] }
)

export const getProductById = cache(
    fetchProductById,
    ["product"],
    { revalidate: 43200, tags: ["product"] }
)
