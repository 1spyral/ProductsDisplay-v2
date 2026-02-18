import type { ProductValidationState } from "@/hooks/useProductFormValidation";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
    afterAll,
    afterEach,
    beforeAll,
    describe,
    expect,
    mock,
    test,
} from "bun:test";
import { registerHappyDom, unregisterHappyDom } from "../../setup/happy-dom";

const checkAdminProductIdExists = mock(async (_id: string) => false);
const checkAdminCategoryIdExists = mock(async (_id: string) => false);
const getAdminProducts = mock(async () => []);
const getAdminCategories = mock(async () => []);
const deleteAdminProduct = mock(async (_id: string) => undefined);
const toggleAdminProductClearance = mock(
    async (_id: string, _next: boolean) => undefined
);
const toggleAdminProductHidden = mock(
    async (_id: string, _next: boolean) => undefined
);
const getAdminCategoriesForManagement = mock(async () => []);
const deleteAdminCategory = mock(async (_id: string) => undefined);
const reorderAdminCategories = mock(async (_ids: string[]) => undefined);
const createAdminSavedSelection = mock(
    async (_name: string, _productIds: string[]) => undefined
);
const getAdminSavedSelectionProductIds = mock(async (_id: string) => []);

mock.module("@/actions/admin", () => ({
    checkAdminCategoryIdExists,
    checkAdminProductIdExists,
    getAdminProducts,
    getAdminCategories,
    deleteAdminProduct,
    toggleAdminProductClearance,
    toggleAdminProductHidden,
    getAdminCategoriesForManagement,
    deleteAdminCategory,
    reorderAdminCategories,
    createAdminSavedSelection,
    getAdminSavedSelectionProductIds,
}));

const { useProductFormValidation, useProductIdValidation } =
    await import("@/hooks/useProductFormValidation");

type ProductValidationWithCheck = ProductValidationState & {
    checkForDuplicate: (id: string) => Promise<void>;
};

describe("useProductFormValidation", () => {
    beforeAll(() => {
        registerHappyDom();
    });

    afterAll(() => {
        unregisterHappyDom();
    });

    afterEach(() => {
        checkAdminProductIdExists.mockReset();
        checkAdminProductIdExists.mockResolvedValue(false);
        checkAdminCategoryIdExists.mockReset();
        checkAdminCategoryIdExists.mockResolvedValue(false);
    });

    test("validates product ID format and messages", () => {
        const { result } = renderHook(() => useProductFormValidation());

        expect(result.current.isValidIdFormat("abc-123_DEF")).toBe(true);
        expect(result.current.isValidIdFormat("abc 123")).toBe(false);
        expect(result.current.getIdValidationMessage("")).toBe(
            "ID cannot be empty"
        );
        expect(result.current.getIdValidationMessage("bad value")).toBe(
            "Only letters, numbers, hyphens, and underscores allowed"
        );
    });

    test("marks ID as duplicate when server check returns true", async () => {
        checkAdminProductIdExists.mockResolvedValueOnce(true);
        const { result } = renderHook(() => useProductFormValidation());

        await act(async () => {
            await (
                result.current as ProductValidationWithCheck
            ).checkForDuplicate("prod-1");
        });

        expect(checkAdminProductIdExists).toHaveBeenCalledWith("prod-1");
        expect(result.current.isDuplicate).toBe(true);
        expect(result.current.getIdValidationMessage("prod-1")).toBe(
            "This ID is already taken"
        );
        expect(result.current.isCheckingDuplicate).toBe(false);
    });

    test("skips duplicate checks when configured", async () => {
        const { result } = renderHook(() =>
            useProductFormValidation({
                skipDuplicateCheck: true,
                initialId: "prod-2",
            })
        );

        await act(async () => {
            await (
                result.current as ProductValidationWithCheck
            ).checkForDuplicate("prod-2");
        });

        expect(checkAdminProductIdExists).not.toHaveBeenCalled();
        expect(result.current.isDuplicate).toBe(false);
    });

    test("useProductIdValidation performs debounced duplicate checks", async () => {
        checkAdminProductIdExists.mockResolvedValueOnce(true);

        const { result } = renderHook(() =>
            useProductIdValidation("prod-3", { debounceMs: 10 })
        );

        await waitFor(
            () => {
                expect(checkAdminProductIdExists).toHaveBeenCalledWith(
                    "prod-3"
                );
            },
            { timeout: 500 }
        );
        await waitFor(
            () => {
                expect(result.current.isDuplicate).toBe(true);
            },
            { timeout: 500 }
        );
    });
});
