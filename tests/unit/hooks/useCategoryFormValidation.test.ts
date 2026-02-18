import type { CategoryValidationState } from "@/hooks/useCategoryFormValidation";
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

const checkAdminCategoryIdExists = mock(async (_id: string) => false);
const checkAdminProductIdExists = mock(async (_id: string) => false);

mock.module("@/actions/admin", () => ({
    checkAdminCategoryIdExists,
    checkAdminProductIdExists,
}));

const { useCategoryFormValidation, useCategoryIdValidation } =
    await import("@/hooks/useCategoryFormValidation");

type CategoryValidationWithCheck = CategoryValidationState & {
    checkForDuplicate: (id: string) => Promise<void>;
};

describe("useCategoryFormValidation", () => {
    beforeAll(() => {
        registerHappyDom();
    });

    afterAll(() => {
        unregisterHappyDom();
    });

    afterEach(() => {
        checkAdminCategoryIdExists.mockReset();
        checkAdminCategoryIdExists.mockResolvedValue(false);
        checkAdminProductIdExists.mockReset();
        checkAdminProductIdExists.mockResolvedValue(false);
    });

    test("validates category ID format and messages", () => {
        const { result } = renderHook(() => useCategoryFormValidation());

        expect(result.current.isValidIdFormat("chairs_2026")).toBe(true);
        expect(result.current.isValidIdFormat("chairs 2026")).toBe(false);
        expect(result.current.getIdValidationMessage("")).toBe(
            "ID cannot be empty"
        );
        expect(result.current.getIdValidationMessage("bad value")).toBe(
            "Only letters, numbers, hyphens, and underscores allowed"
        );
    });

    test("marks category ID as duplicate when server check returns true", async () => {
        checkAdminCategoryIdExists.mockResolvedValueOnce(true);
        const { result } = renderHook(() => useCategoryFormValidation());

        await act(async () => {
            await (
                result.current as CategoryValidationWithCheck
            ).checkForDuplicate("chairs");
        });

        expect(checkAdminCategoryIdExists).toHaveBeenCalledWith("chairs");
        expect(result.current.isDuplicate).toBe(true);
        expect(result.current.getIdValidationMessage("chairs")).toBe(
            "This ID is already taken"
        );
        expect(result.current.isCheckingDuplicate).toBe(false);
    });

    test("skips duplicate checks when ID matches initial value", async () => {
        const { result } = renderHook(() =>
            useCategoryFormValidation({
                initialId: "chairs",
            })
        );

        await act(async () => {
            await (
                result.current as CategoryValidationWithCheck
            ).checkForDuplicate("chairs");
        });

        expect(checkAdminCategoryIdExists).not.toHaveBeenCalled();
        expect(result.current.isDuplicate).toBe(false);
    });

    test("useCategoryIdValidation performs debounced duplicate checks", async () => {
        checkAdminCategoryIdExists.mockResolvedValueOnce(true);

        const { result } = renderHook(() =>
            useCategoryIdValidation("chairs", { debounceMs: 10 })
        );

        await waitFor(
            () => {
                expect(checkAdminCategoryIdExists).toHaveBeenCalledWith(
                    "chairs"
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
