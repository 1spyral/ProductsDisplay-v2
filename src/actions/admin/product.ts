"use server";

import {
    getProducts,
    updateProduct,
    checkProductIdExists,
    createProduct,
    deleteProduct,
} from "@/db/queries/productQueries";
import { getCategories } from "@/db/queries/categoryQueries";
import {
    uploadProductImage,
    deleteProductImage,
    updateImagePosition,
    reorderProductImages,
} from "@/lib/imageService";
import { requireAdminAuth } from "./auth";
import { checkRateLimit } from "./rateLimit";

export async function getAdminProducts() {
    await requireAdminAuth();
    await checkRateLimit("getAdminProducts", 100, 15 * 60 * 1000);

    try {
        return await getProducts(true);
    } catch (error) {
        console.error("Failed to fetch products:", error);
        throw new Error("Failed to fetch products");
    }
}

export async function getAdminCategories() {
    await requireAdminAuth();
    await checkRateLimit("getAdminCategories", 100, 15 * 60 * 1000);

    try {
        return await getCategories();
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        throw new Error("Failed to fetch categories");
    }
}

export async function createAdminProduct(data: {
    id: string;
    name?: string | null;
    description?: string | null;
    category: string | null;
    clearance?: boolean;
    soldOut?: boolean;
    hidden?: boolean;
}) {
    await requireAdminAuth();
    await checkRateLimit("createAdminProduct", 30, 15 * 60 * 1000);

    try {
        if (!data.id.trim()) {
            throw new Error("Product ID cannot be empty");
        }
        if (data.id.length > 255) {
            throw new Error("Product ID too long (max 255 characters)");
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(data.id)) {
            throw new Error(
                "Product ID can only contain letters, numbers, hyphens, and underscores"
            );
        }

        await createProduct({
            id: data.id.trim(),
            name: data.name?.trim() || null,
            description: data.description?.trim() || null,
            category: data.category,
            clearance: data.clearance,
            soldOut: data.soldOut,
            hidden: data.hidden,
        });

        return { success: true, productId: data.id };
    } catch (error) {
        console.error("Failed to create product:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Failed to create product");
    }
}

export async function deleteAdminProduct(id: string) {
    await requireAdminAuth();
    await checkRateLimit("deleteAdminProduct", 20, 15 * 60 * 1000);

    try {
        await deleteProduct(id);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete product:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Failed to delete product");
    }
}

export async function updateAdminProduct(
    id: string,
    data: {
        newId?: string;
        name?: string | null;
        description?: string | null;
        category?: string | null;
        clearance?: boolean;
        soldOut?: boolean;
        hidden?: boolean;
    }
) {
    await requireAdminAuth();
    await checkRateLimit("updateAdminProduct", 50, 15 * 60 * 1000);

    try {
        if (data.newId && data.newId !== id) {
            if (!data.newId.trim()) {
                throw new Error("Product ID cannot be empty");
            }
            if (data.newId.length > 255) {
                throw new Error("Product ID too long (max 255 characters)");
            }
            if (!/^[a-zA-Z0-9-_]+$/.test(data.newId)) {
                throw new Error(
                    "Product ID can only contain letters, numbers, hyphens, and underscores"
                );
            }
        }

        await updateProduct(id, data);
        return { success: true };
    } catch (error) {
        console.error("Failed to update product:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Failed to update product");
    }
}

export async function checkAdminProductIdExists(id: string) {
    await requireAdminAuth();

    try {
        return await checkProductIdExists(id);
    } catch (error) {
        console.error("Failed to check product ID:", error);
        throw new Error("Failed to check product ID");
    }
}

export async function toggleAdminProductClearance(
    id: string,
    clearance: boolean
) {
    await requireAdminAuth();
    await checkRateLimit("toggleAdminProductClearance", 100, 15 * 60 * 1000);

    try {
        await updateProduct(id, { clearance });
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle clearance:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Failed to toggle clearance");
    }
}

export async function toggleAdminProductHidden(id: string, hidden: boolean) {
    await requireAdminAuth();
    await checkRateLimit("toggleAdminProductHidden", 100, 15 * 60 * 1000);

    try {
        await updateProduct(id, { hidden });
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle hidden:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Failed to toggle hidden");
    }
}

export async function uploadAdminProductImage(formData: FormData) {
    await requireAdminAuth();
    await checkRateLimit("uploadAdminProductImage", 20, 15 * 60 * 1000);

    try {
        const file = formData.get("file") as File;
        const productId = formData.get("productId") as string;
        const position = formData.get("position")
            ? parseInt(formData.get("position") as string)
            : 0;

        if (!file || !productId) {
            throw new Error("File and product ID are required");
        }

        const result = await uploadProductImage({
            file,
            productId,
            position,
        });

        if (!result.success) {
            throw new Error(result.error || "Failed to upload image");
        }

        return result;
    } catch (error) {
        console.error("Failed to upload image:", error);
        throw new Error(
            error instanceof Error ? error.message : "Failed to upload image"
        );
    }
}

export async function deleteAdminProductImage(imageId: string) {
    await requireAdminAuth();
    await checkRateLimit("deleteAdminProductImage", 50, 15 * 60 * 1000);

    try {
        const result = await deleteProductImage(imageId);

        if (!result.success) {
            throw new Error(result.error || "Failed to delete image");
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to delete image:", error);
        throw new Error(
            error instanceof Error ? error.message : "Failed to delete image"
        );
    }
}

export async function updateAdminImagePosition(
    imageId: string,
    position: number
) {
    await requireAdminAuth();
    await checkRateLimit("updateAdminImagePosition", 100, 15 * 60 * 1000);

    try {
        const result = await updateImagePosition(imageId, position);

        if (!result.success) {
            throw new Error(result.error || "Failed to update image position");
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to update image position:", error);
        throw new Error(
            error instanceof Error
                ? error.message
                : "Failed to update image position"
        );
    }
}

export async function reorderAdminProductImages(
    productId: string,
    imageIds: string[]
) {
    await requireAdminAuth();
    await checkRateLimit("reorderAdminProductImages", 50, 15 * 60 * 1000);

    try {
        const result = await reorderProductImages(productId, imageIds);

        if (!result.success) {
            throw new Error(result.error || "Failed to reorder images");
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to reorder images:", error);
        throw new Error(
            error instanceof Error ? error.message : "Failed to reorder images"
        );
    }
}
