import Product from "@/types/Product";
import getPhotos, { buildImageUrl } from "@/utils/photo";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";

const originalImagePath = process.env.NEXT_PUBLIC_IMAGE_PATH;

describe("photo utilities", () => {
    beforeAll(() => {
        process.env.NEXT_PUBLIC_IMAGE_PATH =
            "https://cdn.example.com/products/";
    });

    afterAll(() => {
        if (originalImagePath === undefined) {
            delete process.env.NEXT_PUBLIC_IMAGE_PATH;
            return;
        }

        process.env.NEXT_PUBLIC_IMAGE_PATH = originalImagePath;
    });

    test("buildImageUrl prepends configured image base path", () => {
        expect(buildImageUrl("image-1.jpg")).toBe(
            "https://cdn.example.com/products/image-1.jpg"
        );
    });

    test("maps product images to photos with stable alt text", async () => {
        const product: Product = {
            id: "chair-1",
            name: "Office Chair",
            description: null,
            category: "chairs",
            price: "$99",
            clearance: false,
            soldOut: false,
            hidden: false,
            images: [
                {
                    id: "img-1",
                    productId: "chair-1",
                    createdAt: new Date(),
                    objectKey: "chair-1-main.jpg",
                    mimeType: "image/jpeg",
                    width: 100,
                    height: 100,
                    position: 0,
                },
                {
                    id: "img-2",
                    productId: "chair-1",
                    createdAt: new Date(),
                    objectKey: "chair-1-side.jpg",
                    mimeType: "image/jpeg",
                    width: 100,
                    height: 100,
                    position: 1,
                },
            ],
        };

        await expect(getPhotos(product)).resolves.toEqual([
            {
                id: "img-1",
                path: "https://cdn.example.com/products/chair-1-main.jpg",
                alt: "Office Chair 1",
            },
            {
                id: "img-2",
                path: "https://cdn.example.com/products/chair-1-side.jpg",
                alt: "Office Chair 2",
            },
        ]);
    });

    test("returns an empty array when product has no images", async () => {
        const product: Product = {
            id: "chair-2",
            name: "Desk Chair",
            description: null,
            category: null,
            price: null,
            clearance: false,
            soldOut: false,
            hidden: false,
        };

        await expect(getPhotos(product)).resolves.toEqual([]);
    });
});
