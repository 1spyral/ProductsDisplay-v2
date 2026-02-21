import Product from "@/types/Product";

export type ProductSortOption = "default" | "price";

export function sortProductsByOption(
    products: Product[],
    sortOption: ProductSortOption
): Product[] {
    if (sortOption === "default") {
        return products;
    }

    return [...products].sort((a, b) => {
        const priceDifference =
            parseProductPrice(a.price) - parseProductPrice(b.price);

        if (priceDifference !== 0) {
            return priceDifference;
        }

        return a.id.localeCompare(b.id);
    });
}

function parseProductPrice(price: string | null): number {
    if (!price) {
        return Number.POSITIVE_INFINITY;
    }

    const numericMatches = price.replaceAll(",", "").match(/-?\d*\.?\d+/g);

    if (!numericMatches || numericMatches.length === 0) {
        return Number.POSITIVE_INFINITY;
    }

    const validNumericTokens = numericMatches.filter((value) => {
        const parsedValue = Number.parseFloat(value);
        return Number.isFinite(parsedValue) && parsedValue >= 0;
    });

    if (validNumericTokens.length === 0) {
        return Number.POSITIVE_INFINITY;
    }

    const lexicographicallySmallestToken = validNumericTokens.reduce(
        (smallest, current) =>
            current.localeCompare(smallest) < 0 ? current : smallest
    );
    const parsedPrice = Number.parseFloat(lexicographicallySmallestToken);

    return Number.isFinite(parsedPrice)
        ? parsedPrice
        : Number.POSITIVE_INFINITY;
}
