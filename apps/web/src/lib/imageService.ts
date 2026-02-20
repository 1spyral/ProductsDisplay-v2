import { apiJsonRequest } from "@/lib/api/client";

export interface ImageUploadData {
    file: File;
    productId: string;
    position?: number;
}

export interface ProcessedImageResult {
    success: boolean;
    imageId?: string;
    publicUrl?: string;
    error?: string;
}

export async function uploadProductImage(
    data: ImageUploadData
): Promise<ProcessedImageResult> {
    const formData = new FormData();
    formData.set("file", data.file);
    formData.set("productId", data.productId);
    formData.set("position", String(data.position ?? 0));

    return apiJsonRequest<ProcessedImageResult>(
        "/admin/product-images/upload",
        {
            method: "POST",
            body: formData,
            forwardCookies: true,
        }
    );
}

export async function deleteProductImage(
    imageId: string
): Promise<{ success: boolean; error?: string }> {
    return apiJsonRequest<{ success: boolean; error?: string }>(
        `/admin/product-images/${encodeURIComponent(imageId)}`,
        {
            method: "DELETE",
            forwardCookies: true,
        }
    );
}

export async function updateImagePosition(
    imageId: string,
    newPosition: number
): Promise<{ success: boolean; error?: string }> {
    return apiJsonRequest<{ success: boolean; error?: string }>(
        `/admin/product-images/${encodeURIComponent(imageId)}/position`,
        {
            method: "PATCH",
            body: JSON.stringify({ position: newPosition }),
            forwardCookies: true,
        }
    );
}

export async function reorderProductImages(
    productId: string,
    imageIds: string[]
): Promise<{ success: boolean; error?: string }> {
    return apiJsonRequest<{ success: boolean; error?: string }>(
        "/admin/product-images/reorder",
        {
            method: "POST",
            body: JSON.stringify({ productId, imageIds }),
            forwardCookies: true,
        }
    );
}
