import type Product from "@/types/Product";
import type { ReactNode } from "react";
import ProductList from "./ProductList";
import ProductSortContainer from "./ProductSortContainer";

interface ProductListingPageProps {
  title: string;
  subtitle: string;
  products: Product[];
  emptyTitle?: string;
  emptySubtitle?: ReactNode;
}

export default function ProductListingPage({
  title,
  subtitle,
  products,
  emptyTitle,
  emptySubtitle,
}: ProductListingPageProps) {
  if (!products.length) {
    return (
      <div className="min-h-full bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="border-3 border-gray-400 bg-white p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 uppercase">
              {emptyTitle ?? "No products found"}
            </h1>
            {emptySubtitle && (
              <p className="mt-2 text-gray-700">{emptySubtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProductSortContainer title={title} subtitle={subtitle}>
      <div className="px-4 py-2 sm:px-8">
        <ProductList products={products} />
      </div>
    </ProductSortContainer>
  );
}
