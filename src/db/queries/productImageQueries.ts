"use server";

import { db } from "@/db/drizzle";
import { productImages } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export interface ProductImage {
    id: string;
    productId: string;
    createdAt: Date;
    objectKey: string;
    mimeType: string;
    width: number;
    height: number;
    position: number;
}

export async function getProductImages(
    productId: string
): Promise<ProductImage[]> {
    return db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.position));
}

export async function getProductImageById(
    id: string
): Promise<ProductImage | null> {
    return db
        .select()
        .from(productImages)
        .where(eq(productImages.id, id))
        .limit(1)
        .then((rows) => rows[0] || null);
}

export async function getProductImagesByIds(
    ids: string[]
): Promise<ProductImage[]> {
    if (ids.length === 0) return [];

    return db.select().from(productImages).where(eq(productImages.id, ids[0])); // Use proper array handling if needed
}
