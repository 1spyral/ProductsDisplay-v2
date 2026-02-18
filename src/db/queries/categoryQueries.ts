"use server";

import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";
import Category from "@/types/Category";
import { asc, eq, sql } from "drizzle-orm";

async function getOrderedCategoryIds(): Promise<string[]> {
    const rows = await db
        .select({ category: categories.category })
        .from(categories)
        .orderBy(asc(categories.displayOrder), asc(categories.category));

    return rows.map((row) => row.category);
}

async function persistCategoryOrder(
    orderedCategoryIds: string[]
): Promise<void> {
    await db.transaction(async (tx) => {
        for (const [index, categoryId] of orderedCategoryIds.entries()) {
            await tx
                .update(categories)
                .set({ displayOrder: index })
                .where(eq(categories.category, categoryId));
        }
    });
}

async function normalizeCategoryDisplayOrder(): Promise<void> {
    const orderedCategoryIds = await getOrderedCategoryIds();
    await persistCategoryOrder(orderedCategoryIds);
}

export async function reorderCategories(categoryIds: string[]): Promise<void> {
    const currentCategoryIds = await getOrderedCategoryIds();

    if (categoryIds.length !== currentCategoryIds.length) {
        throw new Error("Invalid category order payload");
    }

    const currentCategoryIdSet = new Set(currentCategoryIds);
    const seenCategoryIds = new Set<string>();

    for (const categoryId of categoryIds) {
        if (!currentCategoryIdSet.has(categoryId)) {
            throw new Error("Invalid category in order payload");
        }
        if (seenCategoryIds.has(categoryId)) {
            throw new Error("Duplicate category in order payload");
        }
        seenCategoryIds.add(categoryId);
    }

    await persistCategoryOrder(categoryIds);
}

export async function getCategories(): Promise<Category[]> {
    return db
        .select({
            category: categories.category,
            name: categories.name,
            displayOrder: categories.displayOrder,
        })
        .from(categories)
        .orderBy(asc(categories.displayOrder), asc(categories.category));
}

export async function getCategoryByCategory(
    category: string | null
): Promise<Category | null> {
    if (!category) return null;
    return db
        .select({
            category: categories.category,
            name: categories.name,
            displayOrder: categories.displayOrder,
        })
        .from(categories)
        .where(eq(categories.category, category))
        .limit(1)
        .then((rows) => rows[0] || null);
}

export async function checkCategoryIdExists(
    categoryId: string
): Promise<boolean> {
    const result = await db
        .select({ category: categories.category })
        .from(categories)
        .where(eq(categories.category, categoryId))
        .limit(1);
    return result.length > 0;
}

export async function createCategory(data: {
    category: string;
    name?: string | null;
}): Promise<void> {
    const exists = await checkCategoryIdExists(data.category);
    if (exists) {
        throw new Error("Category ID already exists");
    }

    const [maxOrderResult] = await db
        .select({
            maxDisplayOrder: sql<number>`coalesce(max(${categories.displayOrder}), -1)`,
        })
        .from(categories);

    const nextDisplayOrder = Number(maxOrderResult?.maxDisplayOrder ?? -1) + 1;

    await db.insert(categories).values({
        category: data.category,
        name: data.name || null,
        displayOrder: nextDisplayOrder,
    });
}

export async function updateCategory(
    categoryId: string,
    data: {
        newCategoryId?: string;
        name?: string | null;
    }
): Promise<void> {
    const existing = await getCategoryByCategory(categoryId);
    if (!existing) {
        throw new Error("Category not found");
    }

    if (data.newCategoryId && data.newCategoryId !== categoryId) {
        const newExists = await checkCategoryIdExists(data.newCategoryId);
        if (newExists) {
            throw new Error("New category ID already exists");
        }

        // Update the primary key directly to trigger ON UPDATE CASCADE
        await db
            .update(categories)
            .set({
                category: data.newCategoryId,
                name: data.name !== undefined ? data.name : existing.name,
            })
            .where(eq(categories.category, categoryId));
    } else {
        // Just update the name
        await db
            .update(categories)
            .set({ name: data.name !== undefined ? data.name : existing.name })
            .where(eq(categories.category, categoryId));
    }
}

export async function deleteCategory(categoryId: string): Promise<void> {
    const existing = await getCategoryByCategory(categoryId);
    if (!existing) {
        throw new Error("Category not found");
    }

    await db.delete(categories).where(eq(categories.category, categoryId));
    await normalizeCategoryDisplayOrder();
}
