import {
    createCategory,
    deleteCategory,
    getCategories,
    reorderCategories,
} from "@/db/queries/categoryQueries";
import { beforeEach, describe, expect, test } from "bun:test";
import { resetTestDatabase } from "./helpers";

describe("categoryQueries (integration)", () => {
    beforeEach(async () => {
        await resetTestDatabase();
    });

    test("createCategory appends categories with sequential display order", async () => {
        await createCategory({ category: "chairs", name: "Chairs" });
        await createCategory({ category: "tables", name: "Tables" });

        const categories = await getCategories();
        expect(
            categories.map(({ category, displayOrder }) => ({
                category,
                displayOrder,
            }))
        ).toEqual([
            { category: "chairs", displayOrder: 0 },
            { category: "tables", displayOrder: 1 },
        ]);
    });

    test("reorderCategories validates payload and persists valid ordering", async () => {
        await createCategory({ category: "chairs", name: "Chairs" });
        await createCategory({ category: "lamps", name: "Lamps" });
        await createCategory({ category: "tables", name: "Tables" });

        await expect(reorderCategories(["chairs", "lamps"])).rejects.toThrow(
            "Invalid category order payload"
        );
        await expect(
            reorderCategories(["chairs", "chairs", "tables"])
        ).rejects.toThrow("Duplicate category in order payload");

        await reorderCategories(["tables", "chairs", "lamps"]);

        const categories = await getCategories();
        expect(categories.map((category) => category.category)).toEqual([
            "tables",
            "chairs",
            "lamps",
        ]);
        expect(categories.map((category) => category.displayOrder)).toEqual([
            0, 1, 2,
        ]);
    });

    test("deleteCategory normalizes display order for remaining rows", async () => {
        await createCategory({ category: "chairs", name: "Chairs" });
        await createCategory({ category: "lamps", name: "Lamps" });
        await createCategory({ category: "tables", name: "Tables" });

        await deleteCategory("lamps");

        const categories = await getCategories();
        expect(categories.map((category) => category.category)).toEqual([
            "chairs",
            "tables",
        ]);
        expect(categories.map((category) => category.displayOrder)).toEqual([
            0, 1,
        ]);
    });
});
