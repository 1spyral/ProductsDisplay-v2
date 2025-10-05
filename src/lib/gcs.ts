import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage
let storage: Storage;

try {
  if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
    // Production: Use service account key from environment variables
    storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Development: Use service account key file
    storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  } else {
    // Fallback for local development or cloud environments with default credentials
    storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
  }
} catch (error) {
  console.error('Failed to initialize Google Cloud Storage:', error);
  throw new Error('Google Cloud Storage initialization failed');
}

const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;

if (!bucketName) {
  throw new Error('GOOGLE_CLOUD_STORAGE_BUCKET environment variable is required');
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
export async function uploadImage(options: UploadImageOptions): Promise<ImageUploadResult> {
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
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete an image from Google Cloud Storage
 * @param filename - The full GCS path (e.g., "productId/filename.jpg")
 */
export async function deleteImage(filename: string): Promise<{ success: boolean; error?: string }> {
  try {
    const file = bucket.file(filename);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return {
        success: false,
        error: 'File not found',
      };
    }

    // Delete the file
    await file.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get a signed URL for temporary access to a private image
 * @param filename - The full GCS path (e.g., "productId/filename.jpg")
 */
export async function getSignedUrl(filename: string, expiresInMinutes: number = 60): Promise<string | null> {
  try {
    const file = bucket.file(filename);
    
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });

    return signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
}

/**
 * List all images in the bucket (with optional prefix filter)
 */
export async function listImages(prefix?: string): Promise<string[]> {
  try {
    const options: any = {};
    if (prefix) {
      options.prefix = prefix;
    }

    const [files] = await bucket.getFiles(options);
    return files.map(file => file.name);
  } catch (error) {
    console.error('Error listing images:', error);
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
    console.error('Error getting image metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
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
    
    await sourceFile.copy(destinationFile);
    
    return { success: true };
  } catch (error) {
    console.error('Error copying image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export { storage, bucket };
