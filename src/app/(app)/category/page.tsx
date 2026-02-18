import ProductList from "@/components/Product/ProductList";
import { getProducts } from "@/db/queries/productQueries";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Products",
};

export default async function AllCategoryPage() {
  const data = await getProducts();

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mb-2 border-b-4 border-slate-700 bg-white px-4 py-6">
        <h1 className="mb-2 text-3xl font-bold tracking-wide text-gray-900 uppercase">
          All Products
        </h1>
        <p className="text-gray-700">
          {data.length} {data.length === 1 ? "product" : "products"} available
        </p>
      </div>
      <div className="px-4 py-2 sm:px-8">
        <ProductList products={data} />
      </div>
    </div>
  );
}
