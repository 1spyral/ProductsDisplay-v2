import { db } from "@/db/drizzle";
import { productImages } from "@/db/schema";
import type { ProductImageDto } from "@productsdisplay/contracts";
import { asc, eq, inArray } from "drizzle-orm";

export async function getProductImages(
    productId: string
): Promise<ProductImageDto[]> {
    return db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.position));
}

export async function getProductImageById(
    id: string
): Promise<ProductImageDto | null> {
    return db
        .select()
        .from(productImages)
        .where(eq(productImages.id, id))
        .limit(1)
        .then((rows) => rows[0] || null);
}

export async function getProductImagesByIds(
    ids: string[]
): Promise<ProductImageDto[]> {
    if (ids.length === 0) return [];

    return db
        .select()
        .from(productImages)
        .where(inArray(productImages.id, ids));
}
