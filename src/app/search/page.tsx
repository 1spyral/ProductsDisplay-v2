import ProductList from "@/components/Product/ProductList";
import Product from "@/types/Product";
import search from "@/utils/search";

export const dynamic = "force-dynamic";

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { query } = await searchParams;

  const searchQuery = Array.isArray(query) ? query.join(" ") : query || "";

  const products: Product[] = await search(searchQuery);

  if (!products.length) {
    return (
      <div className="min-h-full bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="border-3 border-gray-400 bg-white p-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 uppercase">
              No Results Found
            </h1>
            <p className="text-gray-700">
              No products found for &quot;{query}&quot;
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mb-2 border-b-4 border-slate-700 bg-white px-4 py-6">
        <h1 className="text-3xl font-bold tracking-wide text-gray-900 uppercase">
          Search Results
        </h1>
        <p className="mt-2 text-gray-700">
          Found {products.length}{" "}
          {products.length === 1 ? "product" : "products"} for &quot;{query}
          &quot;
        </p>
      </div>
      <div className="px-4 py-2 sm:px-8">
        <ProductList products={products} />
      </div>
    </div>
  );
}
