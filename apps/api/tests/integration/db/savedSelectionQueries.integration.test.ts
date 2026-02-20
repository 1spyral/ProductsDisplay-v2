import { db } from "@/db/drizzle";
import { createProduct } from "@/db/queries/productQueries";
import {
    createSavedSelection,
    deleteSavedSelection,
    getSavedSelectionProductIds,
    getSavedSelections,
    updateSavedSelection,
} from "@/db/queries/savedSelectionQueries";
import { productImages, savedSelectionProducts } from "@/db/schema";
import { beforeEach, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { resetTestDatabase } from "./helpers";

async function seedProducts() {
    await createProduct({ id: "product-a", category: null, name: "Product A" });
    await createProduct({ id: "product-b", category: null, name: "Product B" });
    await createProduct({ id: "product-c", category: null, name: "Product C" });
}

describe("savedSelectionQueries (integration)", () => {
    beforeEach(async () => {
        await resetTestDatabase();
        await seedProducts();
    });

    test("createSavedSelection persists ordered product IDs", async () => {
        const selectionId = await createSavedSelection("Featured", [
            "product-a",
            "product-b",
        ]);

        expect(selectionId).toBeString();
        await expect(getSavedSelectionProductIds(selectionId)).resolves.toEqual(
            ["product-a", "product-b"]
        );
    });

    test("getSavedSelections returns products in saved order with first product image", async () => {
        await db.insert(productImages).values([
            {
                productId: "product-a",
                objectKey: "a-position-1.jpg",
                mimeType: "image/jpeg",
                width: 800,
                height: 600,
                position: 1,
            },
            {
                productId: "product-a",
                objectKey: "a-position-0.jpg",
                mimeType: "image/jpeg",
                width: 800,
                height: 600,
                position: 0,
            },
            {
                productId: "product-b",
                objectKey: "b-position-0.jpg",
                mimeType: "image/jpeg",
                width: 800,
                height: 600,
                position: 0,
            },
        ]);

        const selectionId = await createSavedSelection("Catalog", [
            "product-b",
            "product-a",
        ]);

        const selections = await getSavedSelections();
        const selection = selections.find((row) => row.id === selectionId);

        expect(selection).toBeDefined();
        expect(
            selection?.products.map((product) => product.product.id)
        ).toEqual(["product-b", "product-a"]);
        expect(selection?.products[0].product.images).toEqual([
            {
                objectKey: "b-position-0.jpg",
                position: 0,
            },
        ]);
        expect(selection?.products[1].product.images).toEqual([
            {
                objectKey: "a-position-0.jpg",
                position: 0,
            },
        ]);
    });

    test("updateSavedSelection replaces product mapping and updates name", async () => {
        const selectionId = await createSavedSelection("Original", [
            "product-a",
            "product-b",
        ]);

        await updateSavedSelection(selectionId, "Updated", [
            "product-c",
            "product-a",
        ]);

        await expect(getSavedSelectionProductIds(selectionId)).resolves.toEqual(
            ["product-c", "product-a"]
        );

        const selections = await getSavedSelections();
        const selection = selections.find((row) => row.id === selectionId);
        expect(selection?.name).toBe("Updated");
    });

    test("deleteSavedSelection removes the selection and related mapping rows", async () => {
        const selectionId = await createSavedSelection("To Delete", [
            "product-a",
        ]);

        await deleteSavedSelection(selectionId);

        const mappings = await db
            .select()
            .from(savedSelectionProducts)
            .where(eq(savedSelectionProducts.selectionId, selectionId));

        expect(mappings).toHaveLength(0);

        const selections = await getSavedSelections();
        expect(
            selections.find((row) => row.id === selectionId)
        ).toBeUndefined();
    });
});
