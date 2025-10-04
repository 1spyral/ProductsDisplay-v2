import ProductList from "@/components/Product/ProductList";
import Product from "@/types/Product";
import search from "@/utils/search";

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
      <div className="bg-gray-50 min-h-full p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border-3 border-gray-400 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 uppercase mb-2">
              No Results Found
            </h1>
            <p className="text-gray-700">No products found for "{query}"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b-4 border-slate-700 py-6 px-4 mb-2">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
          Search Results
        </h1>
        <p className="text-gray-700 mt-2">
          Found {products.length}{" "}
          {products.length === 1 ? "product" : "products"} for "{query}"
        </p>
      </div>
      <div className="py-2">
        <ProductList products={products} />
      </div>
    </div>
  );
}
