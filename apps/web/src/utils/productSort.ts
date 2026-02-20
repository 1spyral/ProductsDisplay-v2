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

    const parsedPrice = Number.parseFloat(price.replace(/[^\d.-]/g, ""));

    if (!Number.isFinite(parsedPrice)) {
        return Number.POSITIVE_INFINITY;
    }

    return parsedPrice;
}
