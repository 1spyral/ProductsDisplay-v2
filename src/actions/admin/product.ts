"use server";

import { getCategories } from "@/db/queries/categoryQueries";
import {
    checkProductIdExists,
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct,
} from "@/db/queries/productQueries";
import {
    deleteProductImage,
    reorderProductImages,
    updateImagePosition,
    uploadProductImage,
} from "@/lib/imageService";
import logger from "@/lib/logger";
import { requireAdminAuth } from "./auth";
import { checkRateLimit } from "./rateLimit";

export async function getAdminProducts() {
    await requireAdminAuth();
    await checkRateLimit("getAdminProducts", 100, 15 * 60 * 1000);

    try {
        return await getProducts(true);
    } catch (error) {
        logger.error({ error }, "Failed to fetch products");
        throw new Error("Failed to fetch products");
    }
}

export async function getAdminCategories() {
    await requireAdminAuth();
    await checkRateLimit("getAdminCategories", 100, 15 * 60 * 1000);

    try {
        return await getCategories();
    } catch (error) {
        logger.error({ error }, "Failed to fetch categories");
        throw new Error("Failed to fetch categories");
    }
}

export async function createAdminProduct(data: {
    id: string;
    name?: string | null;
    description?: string | null;
    category: string | null;
    clearance?: boolean;
    price?: string | null;
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

        await createProduct(data);

        return { success: true, productId: data.id };
    } catch (error) {
        logger.error({ error }, "Failed to create product");
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
        logger.error({ error }, "Failed to delete product");
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
        price?: string | null;
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
        logger.error({ error }, "Failed to update product");
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
        logger.error({ error }, "Failed to check product ID");
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
        logger.error({ error }, "Failed to toggle clearance");
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
        logger.error({ error }, "Failed to toggle hidden");
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
        logger.error({ error }, "Failed to upload image");
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
        logger.error({ error }, "Failed to delete image");
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
        logger.error({ error }, "Failed to update image position");
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
        logger.error({ error }, "Failed to reorder images");
        throw new Error(
            error instanceof Error ? error.message : "Failed to reorder images"
        );
    }
}
