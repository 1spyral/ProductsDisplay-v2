"use server";

import { apiJsonRequest } from "@/lib/api/client";
import type Product from "@/types/Product";

function encodeIds(ids: string[]): string {
    return ids.map((id) => encodeURIComponent(id)).join(",");
}

export async function getProducts(
    includeHidden: boolean = false
): Promise<Product[]> {
    return apiJsonRequest<Product[]>(
        `/products?includeHidden=${includeHidden ? "true" : "false"}`,
        {
            forwardCookies: includeHidden,
        }
    );
}

export async function getProductsByCategory(
    category: string,
    includeHidden: boolean = false
): Promise<Product[]> {
    return apiJsonRequest<Product[]>(
        `/products?category=${encodeURIComponent(
            category
        )}&includeHidden=${includeHidden ? "true" : "false"}`,
        {
            forwardCookies: includeHidden,
        }
    );
}

export async function getClearanceProducts(
    includeHidden: boolean = false
): Promise<Product[]> {
    return apiJsonRequest<Product[]>(
        `/products?clearance=true&includeHidden=${includeHidden ? "true" : "false"}`,
        {
            forwardCookies: includeHidden,
        }
    );
}

export async function hasClearanceProducts(
    includeHidden: boolean = false
): Promise<boolean> {
    const result = await apiJsonRequest<{ hasClearance: boolean }>(
        `/products/has-clearance?includeHidden=${includeHidden ? "true" : "false"}`,
        {
            forwardCookies: includeHidden,
        }
    );
    return result.hasClearance;
}

export async function getProductById(id: string): Promise<Product | null> {
    return apiJsonRequest<Product | null>(
        `/products/${encodeURIComponent(id)}`
    );
}

export async function getProductsByIds(
    ids: string[],
    includeHidden: boolean = false
): Promise<Product[]> {
    if (ids.length === 0) return [];

    return apiJsonRequest<Product[]>(
        `/products?ids=${encodeIds(ids)}&includeHidden=${includeHidden ? "true" : "false"}`,
        {
            forwardCookies: includeHidden,
        }
    );
}

export async function searchProducts(query: string): Promise<Product[]> {
    const searchQuery = query.trim();
    if (!searchQuery) return getProducts();

    return apiJsonRequest<Product[]>(
        `/products?q=${encodeURIComponent(searchQuery)}`
    );
}

export async function updateProduct(
    id: string,
    data: {
        newId?: string;
        name?: string | null;
        description?: string | null;
        category?: string | null;
        clearance?: boolean;
        price?: string | null;
        soldOut?: boolean;
        hidden?: boolean;
    }
): Promise<void> {
    await apiJsonRequest<{ success: boolean }>(
        `/admin/products/${encodeURIComponent(id)}`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
            forwardCookies: true,
        }
    );
}

export async function checkProductIdExists(id: string): Promise<boolean> {
    const result = await apiJsonRequest<{ exists: boolean }>(
        `/admin/products/${encodeURIComponent(id)}/exists`,
        {
            forwardCookies: true,
        }
    );
    return result.exists;
}

export async function createProduct(data: {
    id: string;
    name?: string | null;
    description?: string | null;
    category: string | null;
    clearance?: boolean;
    price?: string | null;
    soldOut?: boolean;
    hidden?: boolean;
}): Promise<void> {
    await apiJsonRequest<{ success: boolean; productId: string }>(
        "/admin/products",
        {
            method: "POST",
            body: JSON.stringify(data),
            forwardCookies: true,
        }
    );
}

export async function deleteProduct(id: string): Promise<void> {
    await apiJsonRequest<{ success: boolean }>(
        `/admin/products/${encodeURIComponent(id)}`,
        {
            method: "DELETE",
            forwardCookies: true,
        }
    );
}
