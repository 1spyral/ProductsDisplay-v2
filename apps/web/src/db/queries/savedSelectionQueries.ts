"use server";

import { db } from "@/db/drizzle";
import { savedSelectionProducts, savedSelections } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface SavedSelectionOverview {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    products: {
        position: number;
        product: {
            id: string;
            name: string | null;
            images?: { objectKey: string; position: number }[];
        };
    }[];
}

export async function getSavedSelections(): Promise<SavedSelectionOverview[]> {
    const rows = await db.query.savedSelections.findMany({
        orderBy: (s, { desc }) => [desc(s.updatedAt)],
        with: {
            products: {
                orderBy: (sp, { asc }) => [asc(sp.position)],
                with: {
                    product: {
                        columns: { id: true, name: true },
                        with: {
                            images: {
                                orderBy: (images, { asc }) => [
                                    asc(images.position),
                                ],
                                columns: {
                                    objectKey: true,
                                    position: true,
                                },
                                limit: 1,
                            },
                        },
                    },
                },
            },
        },
    });

    return rows;
}

export async function getSavedSelectionProductIds(
    selectionId: string
): Promise<string[]> {
    const rows = await db.query.savedSelectionProducts.findMany({
        where: eq(savedSelectionProducts.selectionId, selectionId),
        orderBy: (sp, { asc }) => [asc(sp.position)],
        columns: { productId: true },
    });

    return rows.map((row) => row.productId);
}

export async function createSavedSelection(
    name: string,
    productIds: string[]
): Promise<string> {
    const [selection] = await db
        .insert(savedSelections)
        .values({ name })
        .returning({ id: savedSelections.id });

    if (productIds.length > 0) {
        await db.insert(savedSelectionProducts).values(
            productIds.map((productId, index) => ({
                selectionId: selection.id,
                productId,
                position: index,
            }))
        );
    }

    return selection.id;
}

export async function updateSavedSelection(
    selectionId: string,
    name: string,
    productIds: string[]
): Promise<void> {
    await db
        .update(savedSelections)
        .set({ name, updatedAt: new Date() })
        .where(eq(savedSelections.id, selectionId));

    // Delete existing products and re-insert
    await db
        .delete(savedSelectionProducts)
        .where(eq(savedSelectionProducts.selectionId, selectionId));

    if (productIds.length > 0) {
        await db.insert(savedSelectionProducts).values(
            productIds.map((productId, index) => ({
                selectionId,
                productId,
                position: index,
            }))
        );
    }
}

export async function deleteSavedSelection(selectionId: string): Promise<void> {
    await db.delete(savedSelections).where(eq(savedSelections.id, selectionId));
}
