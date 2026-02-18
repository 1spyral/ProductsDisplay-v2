import {
    createProduct,
    getProductById,
    getProducts,
    searchProducts,
    updateProduct,
} from "@/db/queries/productQueries";
import { beforeEach, describe, expect, test } from "bun:test";
import { resetTestDatabase } from "./helpers";

describe("productQueries (integration)", () => {
    beforeEach(async () => {
        await resetTestDatabase();
    });

    test("getProducts excludes hidden products unless includeHidden is true", async () => {
        await createProduct({
            id: "prod-visible",
            category: null,
            name: "Visible Product",
            hidden: false,
        });
        await createProduct({
            id: "prod-hidden",
            category: null,
            name: "Hidden Product",
            hidden: true,
        });

        const visibleProducts = await getProducts();
        expect(visibleProducts.map((product) => product.id)).toEqual([
            "prod-visible",
        ]);

        const allProducts = await getProducts(true);
        expect(allProducts.map((product) => product.id)).toEqual([
            "prod-hidden",
            "prod-visible",
        ]);
    });

    test("createProduct rejects duplicate IDs", async () => {
        await createProduct({
            id: "prod-duplicate",
            category: null,
            name: "First",
        });

        await expect(
            createProduct({
                id: "prod-duplicate",
                category: null,
                name: "Second",
            })
        ).rejects.toThrow('Product with ID "prod-duplicate" already exists');
    });

    test("updateProduct supports changing product ID", async () => {
        await createProduct({
            id: "old-id",
            category: null,
            name: "Old",
        });

        await updateProduct("old-id", {
            newId: "new-id",
            name: "New",
        });

        await expect(getProductById("old-id")).resolves.toBeNull();

        const updated = await getProductById("new-id");
        expect(updated?.id).toBe("new-id");
        expect(updated?.name).toBe("New");
    });

    test("searchProducts returns matching visible products", async () => {
        await createProduct({
            id: "office-chair",
            category: null,
            name: "Office Chair",
            description: "Comfortable mesh back",
        });
        await createProduct({
            id: "outdoor-bench",
            category: null,
            name: "Outdoor Bench",
            description: "Made for patios",
        });
        await createProduct({
            id: "hidden-office-desk",
            category: null,
            name: "Hidden Office Desk",
            hidden: true,
        });

        const results = await searchProducts("office");

        expect(results.map((product) => product.id)).toContain("office-chair");
        expect(results.map((product) => product.id)).not.toContain(
            "hidden-office-desk"
        );
    });
});
