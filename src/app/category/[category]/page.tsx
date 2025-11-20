import ProductList from "@/components/Product/ProductList";
import { getProductsByCategory } from "@/db/queries/productQueries";
import {
  getCategoryByCategory,
} from "@/db/queries/categoryQueries";
import { getCategoryName } from "@/types/Category";

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const categoryData = await getCategoryByCategory(category);
  const displayName = getCategoryName(categoryData);

  const filteredData = await getProductsByCategory(category);

  if (!filteredData.length) {
    return (
      <div className="min-h-full bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="border-3 border-gray-400 bg-white p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 uppercase">
              No products found in category {displayName}
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mb-2 border-b-4 border-slate-700 bg-white px-4 py-6">
        <h1 className="mb-2 text-3xl font-bold tracking-wide text-gray-900 uppercase">
          {displayName}
        </h1>
        <p className="text-gray-700">
          {filteredData.length}{" "}
          {filteredData.length === 1 ? "product" : "products"} available
        </p>
      </div>
      <div className="px-4 py-2 sm:px-8">
        <ProductList products={filteredData} />
      </div>
    </div>
  );
}
