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
        newId?: string;
        name?: string | null;
        description?: string | null;
        category?: string;
    }
): Promise<void> {
    // If ID is being changed, we need to handle it specially
    if (data.newId && data.newId !== id) {
        // First, check if the new ID already exists
        const existingProduct = await getProductById(data.newId);
        if (existingProduct) {
            throw new Error(`Product with ID "${data.newId}" already exists`);
        }
        
        // Import the migration function here to avoid circular dependency
        const { migrateProductImages } = await import("@/lib/imageService");
        
        // Migrate images first
        const migrationResult = await migrateProductImages(id, data.newId);
        if (!migrationResult.success) {
            throw new Error(`Failed to migrate images: ${migrationResult.error}`);
        }
        
        // Update all fields including the ID
        await db.update(products).set({
            id: data.newId,
            name: data.name,
            description: data.description,
            category: data.category,
        }).where(eq(products.id, id));
    } else {
        // Regular update without ID change
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.category !== undefined) updateData.category = data.category;
        
        await db.update(products).set(updateData).where(eq(products.id, id));
    }
}

export async function checkProductIdExists(id: string): Promise<boolean> {
    const product = await getProductById(id);
    return product !== null;
}

export async function createProduct(data: {
    id: string;
    name?: string | null;
    description?: string | null;
    category: string;
}): Promise<void> {
    // Check if ID already exists
    const existingProduct = await getProductById(data.id);
    if (existingProduct) {
        throw new Error(`Product with ID "${data.id}" already exists`);
    }
    
    await db.insert(products).values(data);
}
