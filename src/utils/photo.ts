import Photo from "@/types/Photo";
import Product, { ProductImage } from "@/types/Product";

function getImageBasePath(): string {
    return process.env.NEXT_PUBLIC_IMAGE_PATH || "";
}

// Build image URL - can be used in both server and client components
export function buildImageUrl(objectKey: string): string {
    const cdnBase = getImageBasePath();
    return `${cdnBase}${objectKey}`;
}

function buildPhotoFromImage(
    image: ProductImage,
    productId: string,
    productName: string,
    index: number
): Photo {
    return {
        id: image.id,
        path: buildImageUrl(image.objectKey),
        alt: `${productName} ${index + 1}`,
    };
}

export default async function getPhotos(product: Product): Promise<Photo[]> {
    const photos: Photo[] = [];

    if (product.images && product.images.length > 0) {
        for (let i = 0; i < product.images.length; i++) {
            photos.push(
                buildPhotoFromImage(
                    product.images[i],
                    product.id,
                    product.name || "",
                    i
                )
            );
        }
    }

    return photos;
}
