import ProductListingPage from "@/components/Product/ProductListingPage";
import { getProducts } from "@/db/queries/productQueries";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Products",
};

export default async function AllCategoryPage() {
  const data = await getProducts();

  return (
    <ProductListingPage
      title="All Products"
      subtitle={`${data.length} ${
        data.length === 1 ? "product" : "products"
      } available`}
      products={data}
    />
  );
}
