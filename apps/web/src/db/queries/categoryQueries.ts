"use server";

import { apiJsonRequest } from "@/lib/api/client";
import type Category from "@/types/Category";

export async function reorderCategories(categoryIds: string[]): Promise<void> {
    await apiJsonRequest<{ success: boolean }>("/admin/categories/reorder", {
        method: "POST",
        body: JSON.stringify({ categoryIds }),
        forwardCookies: true,
    });
}

export async function getCategories(): Promise<Category[]> {
    return apiJsonRequest<Category[]>("/categories");
}

export async function getCategoryByCategory(
    category: string | null
): Promise<Category | null> {
    if (!category) return null;
    return apiJsonRequest<Category | null>(
        `/categories/${encodeURIComponent(category)}`
    );
}

export async function checkCategoryIdExists(
    categoryId: string
): Promise<boolean> {
    const result = await apiJsonRequest<{ exists: boolean }>(
        `/admin/categories/${encodeURIComponent(categoryId)}/exists`,
        {
            forwardCookies: true,
        }
    );
    return result.exists;
}

export async function createCategory(data: {
    category: string;
    name?: string | null;
}): Promise<void> {
    await apiJsonRequest<{ success: boolean; categoryId: string }>(
        "/admin/categories",
        {
            method: "POST",
            body: JSON.stringify(data),
            forwardCookies: true,
        }
    );
}

export async function updateCategory(
    categoryId: string,
    data: {
        newCategoryId?: string;
        name?: string | null;
    }
): Promise<void> {
    await apiJsonRequest<{ success: boolean }>(
        `/admin/categories/${encodeURIComponent(categoryId)}`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
            forwardCookies: true,
        }
    );
}

export async function deleteCategory(categoryId: string): Promise<void> {
    await apiJsonRequest<{ success: boolean }>(
        `/admin/categories/${encodeURIComponent(categoryId)}`,
        {
            method: "DELETE",
            forwardCookies: true,
        }
    );
}
