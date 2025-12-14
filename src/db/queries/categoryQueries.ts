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
