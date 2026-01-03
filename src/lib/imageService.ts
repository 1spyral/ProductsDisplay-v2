import { uploadImage, deleteImage, ImageUploadResult } from "@/lib/gcs";
import { buildGlobalGcsPath } from "@/utils/imageKey";
import { db } from "@/db/drizzle";
import { productImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import logger from "@/lib/logger";

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

/**
 * Upload and process an image for a product
 */
export async function uploadProductImage(
    data: ImageUploadData
): Promise<ProcessedImageResult> {
    try {
        const { file, productId, position = 0 } = data;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return {
                success: false,
                error: "File must be an image",
            };
        }

        // Validate file size (e.g., 4MB limit)
        const maxSize = 4 * 1024 * 1024; // 4MB
        if (file.size > maxSize) {
            return {
                success: false,
                error: "File size must be less than 4MB",
            };
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Store image with UUID filename
        const fileExtension =
            file.name.split(".").pop()?.toLowerCase() || "jpg";
        const objectKey = `${randomUUID()}.${fileExtension}`;

        // Upload to Google Cloud Storage under the global prefix
        const gcsPath = buildGlobalGcsPath(objectKey);
        const uploadResult: ImageUploadResult = await uploadImage({
            buffer,
            filename: gcsPath,
            contentType: file.type,
            metadata: {
                productId,
                originalName: file.name,
                uploadedBy: "admin", // You can extend this with user info
            },
        });

        if (
            !uploadResult.success ||
            !uploadResult.publicUrl ||
            !uploadResult.filename
        ) {
            return {
                success: false,
                error: uploadResult.error || "Failed to upload image",
            };
        }

        // Get image dimensions (you might want to add a library like 'sharp' for better image processing)
        let width = 800; // Default width
        let height = 600; // Default height

        // Try to get actual dimensions if possible
        if (typeof window !== "undefined") {
            // Client-side: use Image object
            try {
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        width = img.width;
                        height = img.height;
                        resolve(true);
                    };
                    img.onerror = reject;
                    img.src = URL.createObjectURL(file);
                });
            } catch (error) {
                logger.warn({ error }, "Could not get image dimensions");
            }
        }

        // Save to database (store only the objectKey, not the full GCS path)
        const [newImage] = await db
            .insert(productImages)
            .values({
                productId,
                objectKey,
                mimeType: file.type,
                width,
                height,
                position,
            })
            .returning();

        logger.info(
            {
                imageId: newImage.id,
                productId,
                objectKey,
                publicUrl: uploadResult.publicUrl,
            },
            "Image uploaded successfully"
        );

        return {
            success: true,
            imageId: newImage.id,
            publicUrl: uploadResult.publicUrl,
        };
    } catch (error) {
        logger.error({ error }, "Error uploading product image");
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}

/**
 * Delete a product image
 */
export async function deleteProductImage(
    imageId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get image data from database
        const image = await db.query.productImages.findFirst({
            where: eq(productImages.id, imageId),
        });

        if (!image) {
            return {
                success: false,
                error: "Image not found",
            };
        }

        // Delete from Google Cloud Storage
        const gcsPath = buildGlobalGcsPath(image.objectKey);
        const deleteResult = await deleteImage(gcsPath);

        if (!deleteResult.success) {
            logger.warn(
                { error: deleteResult.error },
                "Failed to delete from GCS"
            );
            // Continue with database deletion even if GCS deletion fails
        }

        // Delete from database
        await db.delete(productImages).where(eq(productImages.id, imageId));

        logger.info(
            {
                imageId,
                productId: image.productId,
                objectKey: image.objectKey,
                gcsPath,
            },
            "Image deleted successfully"
        );

        return { success: true };
    } catch (error) {
        logger.error({ error }, "Error deleting product image");
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}

/**
 * Update image position/order
 */
export async function updateImagePosition(
    imageId: string,
    newPosition: number
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(productImages)
            .set({ position: newPosition })
            .where(eq(productImages.id, imageId));

        return { success: true };
    } catch (error) {
        logger.error({ error }, "Error updating image position");
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}

/**
 * Reorder all images for a product
 */
export async function reorderProductImages(
    productId: string,
    imageIds: string[]
): Promise<{ success: boolean; error?: string }> {
    try {
        // Update positions for all images
        const updates = imageIds.map((imageId, index) =>
            db
                .update(productImages)
                .set({ position: index })
                .where(eq(productImages.id, imageId))
        );

        await Promise.all(updates);

        return { success: true };
    } catch (error) {
        logger.error({ error }, "Error reordering images");
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}

/**
 * Get all images for a product
 */
export async function getProductImages(productId: string) {
    try {
        const images = await db.query.productImages.findMany({
            where: eq(productImages.productId, productId),
            orderBy: (images, { asc }) => [asc(images.position)],
        });

        return {
            success: true,
            images,
        };
    } catch (error) {
        logger.error({ error }, "Error getting product images");
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
            images: [],
        };
    }
}
