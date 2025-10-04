import ProductList from "@/components/Product/ProductList";
import { getProductsByCategory } from "@/db/queries/productQueries";
import {
  getCategories,
  getCategoryByCategory,
} from "@/db/queries/categoryQueries";
import { getCategoryName } from "@/types/Category";

export const revalidate = 43200;

export async function generateStaticParams() {
  return await getCategories();
}

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
      <div className="bg-gray-50 min-h-full p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border-3 border-gray-400 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 uppercase">
              No products found in category {displayName}
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b-4 border-slate-700 py-6 px-4 mb-2">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide mb-2">
          {displayName}
        </h1>
        <p className="text-gray-700">
          {filteredData.length}{" "}
          {filteredData.length === 1 ? "product" : "products"} available
        </p>
      </div>
      <div className="py-2">
        <ProductList products={filteredData} />
      </div>
    </div>
  );
}
