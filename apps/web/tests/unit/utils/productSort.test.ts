import type Product from "@/types/Product";
import { sortProductsByOption } from "@/utils/productSort";
import { describe, expect, test } from "bun:test";

function createProduct(id: string, price: string | null): Product {
    return {
        id,
        name: null,
        description: null,
        category: null,
        price,
        clearance: false,
        soldOut: false,
        hidden: false,
        images: [],
    };
}

describe("productSort", () => {
    test("keeps default order unchanged", () => {
        const products = [
            createProduct("b-2", "$20.00"),
            createProduct("a-1", "$10.00"),
        ];

        const sorted = sortProductsByOption(products, "default");

        expect(sorted).toBe(products);
        expect(sorted.map((product) => product.id)).toEqual(["b-2", "a-1"]);
    });

    test("sorts by parsed price ascending with null/invalid last", () => {
        const products = [
            createProduct("c", "N/A"),
            createProduct("d", null),
            createProduct("b", "$10.50"),
            createProduct("a", "$10.50"),
            createProduct("e", "$1,200.00"),
            createProduct("f", "$2"),
        ];

        const sorted = sortProductsByOption(products, "price");

        expect(sorted.map((product) => product.id)).toEqual([
            "f",
            "a",
            "b",
            "e",
            "c",
            "d",
        ]);
    });

    test("returns a new array for price sort without mutating input", () => {
        const products = [createProduct("z", "$30"), createProduct("x", "$10")];

        const sorted = sortProductsByOption(products, "price");

        expect(sorted).not.toBe(products);
        expect(products.map((product) => product.id)).toEqual(["z", "x"]);
        expect(sorted.map((product) => product.id)).toEqual(["x", "z"]);
    });

    test("uses lexicographically smallest numeric token for multi-number price strings", () => {
        const products = [
            createProduct("regular", "$20.00"),
            createProduct("clearance", "100% OFF $2.99"),
            createProduct("missing", null),
        ];

        const sorted = sortProductsByOption(products, "price");

        expect(sorted.map((product) => product.id)).toEqual([
            "regular",
            "clearance",
            "missing",
        ]);
    });
});
