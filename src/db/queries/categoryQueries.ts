"use server";

import Category from "@/types/Category";
import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCategories(): Promise<Category[]> {
    return db
        .select({
            category: categories.category,
            name: categories.name,
        })
        .from(categories);
}

export async function getCategoryByCategory(
    category: string | null
): Promise<Category | null> {
    if (!category) return null;
    return db
        .select({
            category: categories.category,
            name: categories.name,
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

    await db.insert(categories).values({
        category: data.category,
        name: data.name || null,
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

        // Delete old and insert new since category is primary key
        await db.delete(categories).where(eq(categories.category, categoryId));
        await db.insert(categories).values({
            category: data.newCategoryId,
            name: data.name !== undefined ? data.name : existing.name,
        });
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
}
