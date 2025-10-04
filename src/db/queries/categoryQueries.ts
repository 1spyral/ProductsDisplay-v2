"use server";

import Category from "@/types/Category";
import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache as cache } from "next/cache";

async function fetchCategories(): Promise<Category[]> {
    return db
        .select({
            category: categories.category,
            name: categories.name,
        })
        .from(categories);
}

async function fetchCategoryByCategory(
    category: string
): Promise<Category | null> {
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

export const getCategories = cache(fetchCategories, ["categories"], {
    revalidate: 43200,
    tags: ["categories"],
});

export const getCategoryByCategory = cache(
    fetchCategoryByCategory,
    ["category"],
    { revalidate: 43200, tags: ["category"] }
);
