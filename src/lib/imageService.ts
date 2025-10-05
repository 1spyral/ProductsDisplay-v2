import { uploadImage, deleteImage, ImageUploadResult } from '@/lib/gcs';
import { db } from '@/db/drizzle';
import { productImages } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
export async function uploadProductImage(data: ImageUploadData): Promise<ProcessedImageResult> {
  try {
    const { file, productId, position = 0 } = data;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image',
      };
    }

    // Validate file size (e.g., 10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size must be less than 10MB',
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate a clean filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanFileName = `${productId}-${Date.now()}.${fileExtension}`;

    // Upload to Google Cloud Storage
    const uploadResult: ImageUploadResult = await uploadImage({
      buffer,
      filename: cleanFileName,
      contentType: file.type,
      metadata: {
        productId,
        originalName: file.name,
        uploadedBy: 'admin', // You can extend this with user info
      },
    });

    if (!uploadResult.success || !uploadResult.publicUrl || !uploadResult.filename) {
      return {
        success: false,
        error: uploadResult.error || 'Failed to upload image',
      };
    }

    // Get image dimensions (you might want to add a library like 'sharp' for better image processing)
    let width = 800; // Default width
    let height = 600; // Default height

    // Try to get actual dimensions if possible
    if (typeof window !== 'undefined') {
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
        console.warn('Could not get image dimensions:', error);
      }
    }

    // Save to database
    const [newImage] = await db.insert(productImages).values({
      productId,
      objectKey: uploadResult.filename,
      mimeType: file.type,
      width,
      height,
      position,
    }).returning();

    return {
      success: true,
      imageId: newImage.id,
      publicUrl: uploadResult.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading product image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete a product image
 */
export async function deleteProductImage(imageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get image data from database
    const image = await db.query.productImages.findFirst({
      where: eq(productImages.id, imageId),
    });

    if (!image) {
      return {
        success: false,
        error: 'Image not found',
      };
    }

    // Delete from Google Cloud Storage
    const deleteResult = await deleteImage(image.objectKey);
    
    if (!deleteResult.success) {
      console.warn('Failed to delete from GCS:', deleteResult.error);
      // Continue with database deletion even if GCS deletion fails
    }

    // Delete from database
    await db.delete(productImages).where(eq(productImages.id, imageId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting product image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Update image position/order
 */
export async function updateImagePosition(imageId: string, newPosition: number): Promise<{ success: boolean; error?: string }> {
  try {
    await db.update(productImages)
      .set({ position: newPosition })
      .where(eq(productImages.id, imageId));

    return { success: true };
  } catch (error) {
    console.error('Error updating image position:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
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
      db.update(productImages)
        .set({ position: index })
        .where(eq(productImages.id, imageId))
    );

    await Promise.all(updates);

    return { success: true };
  } catch (error) {
    console.error('Error reordering images:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
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
    console.error('Error getting product images:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      images: [],
    };
  }
}
