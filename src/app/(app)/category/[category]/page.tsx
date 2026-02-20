import ProductListingPage from "@/components/Product/ProductListingPage";
import { getCategoryByCategory } from "@/db/queries/categoryQueries";
import { getProductsByCategory } from "@/db/queries/productQueries";
import { getCategoryName } from "@/types/Category";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categoryData = await getCategoryByCategory(category);
  const displayName = getCategoryName(categoryData);

  return {
    title: displayName,
  };
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

  return (
    <ProductListingPage
      title={displayName}
      subtitle={`${filteredData.length} ${
        filteredData.length === 1 ? "product" : "products"
      } available`}
      products={filteredData}
      emptyTitle={`No products found in category ${displayName}`}
    />
  );
}
