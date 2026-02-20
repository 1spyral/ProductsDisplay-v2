"use server";

import { apiJsonRequest } from "@/lib/api/client";
import type { ProductImage } from "@/types/Product";

export async function getProductImages(
    productId: string
): Promise<ProductImage[]> {
    return apiJsonRequest<ProductImage[]>(
        `/admin/product-images?productId=${encodeURIComponent(productId)}`,
        {
            forwardCookies: true,
        }
    );
}

export async function getProductImageById(
    id: string
): Promise<ProductImage | null> {
    return apiJsonRequest<ProductImage | null>(
        `/admin/product-images/${encodeURIComponent(id)}`,
        {
            forwardCookies: true,
        }
    );
}

export async function getProductImagesByIds(
    ids: string[]
): Promise<ProductImage[]> {
    if (ids.length === 0) return [];

    const query = ids.map((id) => encodeURIComponent(id)).join(",");
    return apiJsonRequest<ProductImage[]>(
        `/admin/product-images/by-ids?ids=${query}`,
        {
            forwardCookies: true,
        }
    );
}
