"use server";

import Product, { ProductImage } from "@/types/Product";
import Photo from "@/types/Photo";

function buildPhotoFromImage(
    image: ProductImage,
    productId: string,
    productName: string,
    index: number
): Photo {
    const cdnBase = process.env.IMAGE_PATH || "";
    const fullPath = `${cdnBase}${productId}/${image.objectKey}`;

    return {
        id: image.id,
        path: fullPath,
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
