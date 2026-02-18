import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockFindFirst = mock(async () => undefined as unknown);
const mockUpdateWhere = mock(async () => undefined as unknown);
const mockUpdateSet = mock((_values: unknown) => ({
    where: mockUpdateWhere,
}));
const mockUpdate = mock((_table: unknown) => ({
    set: mockUpdateSet,
}));
const mockDeleteWhere = mock(async () => undefined as unknown);
const mockDelete = mock((_table: unknown) => ({
    where: mockDeleteWhere,
}));
const mockDeleteProductImage = mock(async (_id: string) => ({
    success: true,
}));

const loggerWarn = mock(() => undefined);
const loggerInfo = mock(() => undefined);
const loggerError = mock(() => undefined);

mock.module("@/db/drizzle", () => ({
    db: {
        query: {
            products: {
                findFirst: mockFindFirst,
            },
        },
        update: mockUpdate,
        delete: mockDelete,
    },
}));

mock.module("@/lib/imageService", () => ({
    deleteProductImage: mockDeleteProductImage,
}));

mock.module("@/lib/logger", () => ({
    default: {
        warn: loggerWarn,
        info: loggerInfo,
        error: loggerError,
    },
}));

const { deleteProduct, updateProduct } =
    await import("@/db/queries/productQueries");

describe("productQueries (unit, mocked db)", () => {
    beforeEach(() => {
        mockFindFirst.mockClear();
        mockUpdateWhere.mockClear();
        mockUpdateSet.mockClear();
        mockUpdate.mockClear();
        mockDeleteWhere.mockClear();
        mockDelete.mockClear();
        mockDeleteProductImage.mockClear();
        loggerWarn.mockClear();
        loggerInfo.mockClear();
        loggerError.mockClear();
    });

    test("updateProduct rejects when new ID already exists", async () => {
        mockFindFirst.mockResolvedValueOnce({ id: "new-id" });

        await expect(
            updateProduct("old-id", {
                newId: "new-id",
            })
        ).rejects.toThrow('Product with ID "new-id" already exists');

        expect(mockUpdate).not.toHaveBeenCalled();
    });

    test("updateProduct persists regular field updates", async () => {
        await updateProduct("product-1", {
            name: "Updated Name",
            hidden: true,
        });

        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(mockUpdateSet).toHaveBeenCalledWith({
            name: "Updated Name",
            hidden: true,
        });
        expect(mockUpdateWhere).toHaveBeenCalledTimes(1);
    });

    test("deleteProduct throws when target product does not exist", async () => {
        mockFindFirst.mockResolvedValueOnce(undefined);

        await expect(deleteProduct("missing")).rejects.toThrow(
            'Product with ID "missing" not found'
        );

        expect(mockDelete).not.toHaveBeenCalled();
    });

    test("deleteProduct continues deleting product even when image cleanup fails", async () => {
        mockFindFirst.mockResolvedValueOnce({
            id: "product-1",
            images: [{ id: "img-1" }, { id: "img-2" }],
        });
        mockDeleteProductImage
            .mockRejectedValueOnce(new Error("delete failed"))
            .mockResolvedValueOnce({ success: true });

        await expect(deleteProduct("product-1")).resolves.toBeUndefined();

        expect(mockDeleteProductImage).toHaveBeenCalledTimes(2);
        expect(mockDelete).toHaveBeenCalledTimes(1);
        expect(loggerWarn).toHaveBeenCalled();
    });
});
