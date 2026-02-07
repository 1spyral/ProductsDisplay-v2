import ProductList from "@/components/Product/ProductList";
import { getProducts } from "@/db/queries/productQueries";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Products",
};

export default async function AllCategoryPage() {
  const data = await getProducts();

  return <ProductList products={data} />;
}
