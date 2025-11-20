import ProductList from "@/components/Product/ProductList";
import { getClearanceProducts } from "@/db/queries/productQueries";

export const revalidate = 43200;

export default async function ClearancePage() {
  const products = await getClearanceProducts();

  if (!products.length) {
    return (
      <div className="min-h-full bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="border-3 border-gray-400 bg-white p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 uppercase">
              No clearance items available
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
          Clearance
        </h1>
        <p className="text-gray-700">
          {products.length} {products.length === 1 ? "product" : "products"} on
          clearance
        </p>
      </div>
      <div className="px-4 py-2 sm:px-8">
        <ProductList products={products} />
      </div>
    </div>
  );
}
