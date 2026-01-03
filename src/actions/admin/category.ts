"use server";

import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    checkCategoryIdExists,
} from "@/db/queries/categoryQueries";
import { requireAdminAuth } from "./auth";
import { checkRateLimit } from "./rateLimit";

export async function getAdminCategoriesForManagement() {
    await requireAdminAuth();
    await checkRateLimit(
        "getAdminCategoriesForManagement",
        100,
        15 * 60 * 1000
    );

    try {
        return await getCategories();
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        throw new Error("Failed to fetch categories");
    }
}

export async function createAdminCategory(data: {
    category: string;
    name?: string | null;
}) {
    await requireAdminAuth();
    await checkRateLimit("createAdminCategory", 30, 15 * 60 * 1000);

    try {
        if (!data.category.trim()) {
            throw new Error("Category ID cannot be empty");
        }
        if (data.category.length > 255) {
            throw new Error("Category ID too long (max 255 characters)");
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(data.category)) {
            throw new Error(
                "Category ID can only contain letters, numbers, hyphens, and underscores"
            );
        }

        await createCategory(data);

        return { success: true, categoryId: data.category };
    } catch (error) {
        console.error("Failed to create category:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Failed to create category");
    }
}

export async function updateAdminCategory(
    categoryId: string,
    data: {
        newCategoryId?: string;
        name?: string | null;
    }
) {
    await requireAdminAuth();
    await checkRateLimit("updateAdminCategory", 50, 15 * 60 * 1000);

    try {
        if (data.newCategoryId && data.newCategoryId !== categoryId) {
            if (!data.newCategoryId.trim()) {
                throw new Error("Category ID cannot be empty");
            }
            if (data.newCategoryId.length > 255) {
                throw new Error("Category ID too long (max 255 characters)");
            }
            if (!/^[a-zA-Z0-9-_]+$/.test(data.newCategoryId)) {
                throw new Error(
                    "Category ID can only contain letters, numbers, hyphens, and underscores"
                );
            }
        }

        await updateCategory(categoryId, data);
        return { success: true };
    } catch (error) {
        console.error("Failed to update category:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Failed to update category");
    }
}

export async function deleteAdminCategory(categoryId: string) {
    await requireAdminAuth();
    await checkRateLimit("deleteAdminCategory", 20, 15 * 60 * 1000);

    try {
        await deleteCategory(categoryId);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete category:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Failed to delete category");
    }
}

export async function checkAdminCategoryIdExists(categoryId: string) {
    await requireAdminAuth();

    try {
        return await checkCategoryIdExists(categoryId);
    } catch (error) {
        console.error("Failed to check category ID:", error);
        throw new Error("Failed to check category ID");
    }
}
