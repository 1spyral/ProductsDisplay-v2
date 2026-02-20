import ProductListingPage from "@/components/Product/ProductListingPage";
import { getProducts, searchProducts } from "@/db/queries/productQueries";
import Product from "@/types/Product";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { query } = await searchParams;
  const searchQuery = Array.isArray(query) ? query.join(" ") : query;

  return {
    title: searchQuery ?? "Search Results",
  };
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { query } = await searchParams;

  const searchQuery = Array.isArray(query) ? query.join(" ") : query || "";
  const normalizedSearchQuery = searchQuery.trim();

  const products: Product[] = normalizedSearchQuery
    ? await searchProducts(normalizedSearchQuery)
    : await getProducts();

  return (
    <ProductListingPage
      title="Search Results"
      subtitle={`Found ${products.length} ${
        products.length === 1 ? "product" : "products"
      } for "${query}"`}
      products={products}
      emptyTitle="No Results Found"
      emptySubtitle={
        <>
          No products found for &quot;{query}&quot;
        </>
      }
    />
  );
}
