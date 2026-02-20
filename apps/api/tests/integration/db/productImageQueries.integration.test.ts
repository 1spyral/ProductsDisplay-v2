import { db } from "@/db/drizzle";
import {
    getProductImageById,
    getProductImages,
    getProductImagesByIds,
} from "@/db/queries/productImageQueries";
import { createProduct } from "@/db/queries/productQueries";
import { productImages } from "@/db/schema";
import { beforeEach, describe, expect, test } from "bun:test";
import { resetTestDatabase } from "./helpers";

async function seedProductWithImages() {
    await createProduct({
        id: "product-1",
        category: null,
        name: "Product 1",
    });

    const inserted = await db
        .insert(productImages)
        .values([
            {
                productId: "product-1",
                objectKey: "image-2.jpg",
                mimeType: "image/jpeg",
                width: 800,
                height: 600,
                position: 2,
            },
            {
                productId: "product-1",
                objectKey: "image-0.jpg",
                mimeType: "image/jpeg",
                width: 800,
                height: 600,
                position: 0,
            },
            {
                productId: "product-1",
                objectKey: "image-1.jpg",
                mimeType: "image/jpeg",
                width: 800,
                height: 600,
                position: 1,
            },
        ])
        .returning();

    return inserted;
}

describe("productImageQueries (integration)", () => {
    beforeEach(async () => {
        await resetTestDatabase();
    });

    test("getProductImages returns images ordered by position", async () => {
        await seedProductWithImages();

        const images = await getProductImages("product-1");

        expect(images.map((image) => image.position)).toEqual([0, 1, 2]);
        expect(images.map((image) => image.objectKey)).toEqual([
            "image-0.jpg",
            "image-1.jpg",
            "image-2.jpg",
        ]);
    });

    test("getProductImageById returns image for valid id and null for missing id", async () => {
        const [image] = await seedProductWithImages();

        const found = await getProductImageById(image.id);
        expect(found?.id).toBe(image.id);

        await expect(
            getProductImageById("00000000-0000-0000-0000-000000000000")
        ).resolves.toBeNull();
    });

    test("getProductImagesByIds returns all matching images and handles empty input", async () => {
        const inserted = await seedProductWithImages();

        const subset = await getProductImagesByIds([
            inserted[0].id,
            inserted[2].id,
        ]);

        expect(subset).toHaveLength(2);
        expect(subset.map((image) => image.id).sort()).toEqual(
            [inserted[0].id, inserted[2].id].sort()
        );

        await expect(getProductImagesByIds([])).resolves.toEqual([]);
    });
});
