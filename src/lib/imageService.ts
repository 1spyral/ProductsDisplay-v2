import { uploadImage, deleteImage, copyImage, ImageUploadResult } from '@/lib/gcs';
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

    // Validate file size (e.g., 4MB limit)
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size must be less than 4MB',
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate a random unique filename to prevent conflicts
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const cleanFileName = `${timestamp}-${randomId}.${fileExtension}`;

    // Upload to Google Cloud Storage with product folder structure
    const gcsPath = `${productId}/${cleanFileName}`;
    const uploadResult: ImageUploadResult = await uploadImage({
      buffer,
      filename: gcsPath,
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

    // Save to database (store only the filename as objectKey, not the full path)
    const [newImage] = await db.insert(productImages).values({
      productId,
      objectKey: cleanFileName, // Just the filename, not the full GCS path
      mimeType: file.type,
      width,
      height,
      position,
    }).returning();

    console.log('Image uploaded successfully:', {
      imageId: newImage.id,
      productId,
      objectKey: cleanFileName,
      publicUrl: uploadResult.publicUrl
    });

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
    const gcsPath = `${image.productId}/${image.objectKey}`;
    const deleteResult = await deleteImage(gcsPath);
    
    if (!deleteResult.success) {
      console.warn('Failed to delete from GCS:', deleteResult.error);
      // Continue with database deletion even if GCS deletion fails
    }

    // Delete from database
    await db.delete(productImages).where(eq(productImages.id, imageId));

    console.log('Image deleted successfully:', {
      imageId,
      productId: image.productId,
      objectKey: image.objectKey,
      gcsPath
    });

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

/**
 * Migrate product images when product ID changes
 */
export async function migrateProductImages(
  oldProductId: string, 
  newProductId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get all images for the old product ID
    const imagesResult = await getProductImages(oldProductId);
    
    if (!imagesResult.success || !imagesResult.images.length) {
      // No images to migrate
      return { success: true };
    }

    const images = imagesResult.images;
    const migrationPromises = images.map(async (image) => {
      try {
        // objectKey is just the filename (e.g., "1640995200000-camera.jpg")
        const filename = image.objectKey;
        
        // Build the old and new GCS paths
        const oldGCSPath = `${oldProductId}/${filename}`;
        const newGCSPath = `${newProductId}/${filename}`;
        
        // Copy image to new location in GCS
        const copyResult = await copyImage(oldGCSPath, newGCSPath);
        
        if (!copyResult.success) {
          console.error(`Failed to copy image from ${oldGCSPath} to ${newGCSPath}:`, copyResult.error);
          return { success: false, imageId: image.id, error: copyResult.error };
        }

        // Update database record with new productId (objectKey stays the same)
        await db.update(productImages)
          .set({ 
            productId: newProductId 
          })
          .where(eq(productImages.id, image.id));

        // Delete old image from GCS
        const deleteResult = await deleteImage(oldGCSPath);
        if (!deleteResult.success) {
          console.warn(`Failed to delete old image ${oldGCSPath}:`, deleteResult.error);
          // Continue even if deletion fails - the image is copied and DB is updated
        }

        return { success: true, imageId: image.id };
      } catch (error) {
        console.error(`Error migrating image ${image.id}:`, error);
        return { 
          success: false, 
          imageId: image.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    // Wait for all migrations to complete
    const results = await Promise.all(migrationPromises);
    
    // Check if any migrations failed
    const failedMigrations = results.filter(result => !result.success);
    
    if (failedMigrations.length > 0) {
      console.error(`Failed to migrate ${failedMigrations.length} images:`, failedMigrations);
      return {
        success: false,
        error: `Failed to migrate ${failedMigrations.length} out of ${results.length} images`
      };
    }

    console.log(`Successfully migrated ${results.length} images from ${oldProductId} to ${newProductId}`);
    return { success: true };
  } catch (error) {
    console.error('Error during image migration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
