import { createProduct } from "@/db/queries/productQueries";
import {
    createSavedSelection,
    getSavedSelectionProductIds,
    getSavedSelections,
} from "@/db/queries/savedSelectionQueries";
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { resetTestDatabase } from "../db/helpers";

const requireAdminAuth = mock(async () => undefined);
const checkRateLimit = mock(async () => undefined);
const loggerError = mock(() => undefined);

const authPath = new URL("../../../src/actions/admin/auth.ts", import.meta.url)
    .pathname;
const rateLimitPath = new URL(
    "../../../src/actions/admin/rateLimit.ts",
    import.meta.url
).pathname;

mock.module(authPath, () => ({
    requireAdminAuth,
}));

mock.module(rateLimitPath, () => ({
    checkRateLimit,
}));

mock.module("@/lib/logger", () => ({
    default: {
        error: loggerError,
    },
}));

const {
    createAdminSavedSelection,
    deleteAdminSavedSelection,
    getAdminSavedSelectionProductIds,
    getAdminSavedSelections,
    updateAdminSavedSelection,
} = await import("@/actions/admin/savedSelection");

async function seedProducts() {
    await createProduct({ id: "product-a", category: null, name: "Product A" });
    await createProduct({ id: "product-b", category: null, name: "Product B" });
    await createProduct({ id: "product-c", category: null, name: "Product C" });
}

describe("savedSelection admin actions (integration)", () => {
    beforeEach(async () => {
        await resetTestDatabase();
        await seedProducts();

        requireAdminAuth.mockReset();
        requireAdminAuth.mockResolvedValue(undefined);
        checkRateLimit.mockReset();
        checkRateLimit.mockResolvedValue(undefined);
        loggerError.mockReset();
    });

    test("getAdminSavedSelections returns DB-backed saved selections", async () => {
        const selectionId = await createSavedSelection("Featured", [
            "product-a",
            "product-b",
        ]);

        const selections = await getAdminSavedSelections();

        const target = selections.find(
            (selection) => selection.id === selectionId
        );
        expect(target).toBeDefined();
        expect(target?.name).toBe("Featured");
        expect(target?.products.map((product) => product.product.id)).toEqual([
            "product-a",
            "product-b",
        ]);
        expect(requireAdminAuth).toHaveBeenCalledTimes(1);
        expect(checkRateLimit).toHaveBeenCalledWith(
            "getAdminSavedSelections",
            100,
            15 * 60 * 1000
        );
    });

    test("getAdminSavedSelectionProductIds returns ordered IDs", async () => {
        const selectionId = await createSavedSelection("Featured", [
            "product-b",
            "product-a",
        ]);

        await expect(
            getAdminSavedSelectionProductIds(selectionId)
        ).resolves.toEqual(["product-b", "product-a"]);
        expect(requireAdminAuth).toHaveBeenCalledTimes(1);
        expect(checkRateLimit).toHaveBeenCalledWith(
            "getAdminSavedSelectionProductIds",
            100,
            15 * 60 * 1000
        );
    });

    test("createAdminSavedSelection trims and persists a new selection", async () => {
        const result = await createAdminSavedSelection("  Weekly Picks  ", [
            "product-c",
            "product-a",
        ]);

        expect(result.success).toBe(true);
        expect(result.id).toBeString();

        await expect(getSavedSelectionProductIds(result.id)).resolves.toEqual([
            "product-c",
            "product-a",
        ]);

        const selections = await getSavedSelections();
        const created = selections.find(
            (selection) => selection.id === result.id
        );
        expect(created?.name).toBe("Weekly Picks");
        expect(checkRateLimit).toHaveBeenCalledWith(
            "createAdminSavedSelection",
            30,
            15 * 60 * 1000
        );
    });

    test("createAdminSavedSelection rejects empty names", async () => {
        await expect(
            createAdminSavedSelection("   ", ["product-a"])
        ).rejects.toThrow("Selection name cannot be empty");
        expect(checkRateLimit).toHaveBeenCalledWith(
            "createAdminSavedSelection",
            30,
            15 * 60 * 1000
        );
    });

    test("updateAdminSavedSelection updates name and product ordering", async () => {
        const selectionId = await createSavedSelection("Original", [
            "product-a",
            "product-b",
        ]);

        await expect(
            updateAdminSavedSelection(selectionId, "Updated", [
                "product-c",
                "product-a",
            ])
        ).resolves.toEqual({ success: true });

        await expect(getSavedSelectionProductIds(selectionId)).resolves.toEqual(
            ["product-c", "product-a"]
        );

        const selections = await getSavedSelections();
        expect(
            selections.find((selection) => selection.id === selectionId)?.name
        ).toBe("Updated");
        expect(checkRateLimit).toHaveBeenCalledWith(
            "updateAdminSavedSelection",
            30,
            15 * 60 * 1000
        );
    });

    test("deleteAdminSavedSelection removes saved selection", async () => {
        const selectionId = await createSavedSelection("Delete Me", [
            "product-b",
        ]);

        await expect(deleteAdminSavedSelection(selectionId)).resolves.toEqual({
            success: true,
        });

        const selections = await getSavedSelections();
        expect(
            selections.find((selection) => selection.id === selectionId)
        ).toBeUndefined();
        await expect(getSavedSelectionProductIds(selectionId)).resolves.toEqual(
            []
        );
        expect(checkRateLimit).toHaveBeenCalledWith(
            "deleteAdminSavedSelection",
            30,
            15 * 60 * 1000
        );
    });
});
