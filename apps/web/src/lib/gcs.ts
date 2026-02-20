import { env } from "@/env";
import logger from "@/lib/logger";
import { GetFilesOptions, Storage } from "@google-cloud/storage";

// Initialize Google Cloud Storage
let storage: Storage;

try {
    if (env.GOOGLE_CLOUD_PROJECT_ID && env.GOOGLE_CLOUD_PRIVATE_KEY) {
        // Production: Use service account key from environment variables
        storage = new Storage({
            projectId: env.GOOGLE_CLOUD_PROJECT_ID,
            credentials: {
                client_email: env.GOOGLE_CLOUD_CLIENT_EMAIL,
                private_key: env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, "\n"),
            },
        });
    } else if (env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Development: Use service account key file
        storage = new Storage({
            projectId: env.GOOGLE_CLOUD_PROJECT_ID,
            keyFilename: env.GOOGLE_APPLICATION_CREDENTIALS,
        });
    } else {
        // Fallback for local development or cloud environments with default credentials
        storage = new Storage({
            projectId: env.GOOGLE_CLOUD_PROJECT_ID,
        });
    }
} catch (error) {
    logger.error({ error }, "Failed to initialize Google Cloud Storage");
    throw new Error("Google Cloud Storage initialization failed");
}

const bucketName = env.GOOGLE_CLOUD_STORAGE_BUCKET;

if (!bucketName) {
    throw new Error(
        "GOOGLE_CLOUD_STORAGE_BUCKET environment variable is required"
    );
}

const bucket = storage.bucket(bucketName);

export interface UploadImageOptions {
    buffer: Buffer;
    filename: string;
    contentType: string;
    metadata?: Record<string, string>;
}

export interface ImageUploadResult {
    success: boolean;
    publicUrl?: string;
    filename?: string;
    error?: string;
}

/**
 * Upload an image to Google Cloud Storage
 * @param options.filename - The full GCS path (e.g., "productId/filename.jpg")
 */
export async function uploadImage(
    options: UploadImageOptions
): Promise<ImageUploadResult> {
    try {
        const { buffer, filename, contentType, metadata = {} } = options;

        // Use the filename as provided (should include the full path)
        const file = bucket.file(filename);

        // Upload the file
        await file.save(buffer, {
            metadata: {
                contentType,
                metadata: {
                    ...metadata,
                    uploadedAt: new Date().toISOString(),
                },
            },
        });

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

        return {
            success: true,
            publicUrl,
            filename: filename,
        };
    } catch (error) {
        logger.error({ error }, "Error uploading image");
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
 * Delete an image from Google Cloud Storage
 * @param filename - The full GCS path (e.g., "productId/filename.jpg")
 */
export async function deleteImage(
    filename: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const file = bucket.file(filename);

        // Check if file exists
        const [exists] = await file.exists();
        if (!exists) {
            return {
                success: false,
                error: "File not found",
            };
        }

        // Delete the file
        await file.delete();

        return { success: true };
    } catch (error) {
        logger.error({ error }, "Error deleting image");
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
 * Get a signed URL for temporary access to a private image
 * @param filename - The full GCS path (e.g., "productId/filename.jpg")
 */
export async function getSignedUrl(
    filename: string,
    expiresInMinutes: number = 60
): Promise<string | null> {
    try {
        const file = bucket.file(filename);

        const [signedUrl] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + expiresInMinutes * 60 * 1000,
        });

        return signedUrl;
    } catch (error) {
        logger.error({ error }, "Error getting signed URL");
        return null;
    }
}

/**
 * List all images in the bucket (with optional prefix filter)
 */
export async function listImages(prefix?: string): Promise<string[]> {
    try {
        const options: GetFilesOptions = {};
        if (prefix) {
            options.prefix = prefix;
        }

        const [files] = await bucket.getFiles(options);
        return files.map((file) => file.name);
    } catch (error) {
        logger.error({ error }, "Error listing images");
        return [];
    }
}

/**
 * Get image metadata
 * @param filename - The full GCS path (e.g., "productId/filename.jpg")
 */
export async function getImageMetadata(filename: string) {
    try {
        const file = bucket.file(filename);
        const [metadata] = await file.getMetadata();

        return {
            success: true,
            metadata: {
                name: metadata.name,
                size: metadata.size,
                contentType: metadata.contentType,
                created: metadata.timeCreated,
                updated: metadata.updated,
                customMetadata: metadata.metadata,
            },
        };
    } catch (error) {
        logger.error({ error }, "Error getting image metadata");
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
 * Copy/move an image within the bucket
 * @param sourceFilename - The source GCS path (e.g., "productId/filename.jpg")
 * @param destinationFilename - The destination GCS path (e.g., "newProductId/filename.jpg")
 */
export async function copyImage(
    sourceFilename: string,
    destinationFilename: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const sourceFile = bucket.file(sourceFilename);
        const destinationFile = bucket.file(destinationFilename);

        // Check if source file exists
        const [sourceExists] = await sourceFile.exists();
        if (!sourceExists) {
            return {
                success: false,
                error: `Source file not found: ${sourceFilename}`,
            };
        }

        // Perform the copy operation and wait for it to complete
        const [destinationFileResponse] =
            await sourceFile.copy(destinationFile);

        // Verify the destination file was created successfully
        const [destExists] = await destinationFileResponse.exists();
        if (!destExists) {
            return {
                success: false,
                error: `Failed to create destination file: ${destinationFilename}`,
            };
        }

        return { success: true };
    } catch (error) {
        logger.error({ error }, "Error copying image");
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}

export { bucket, storage };
