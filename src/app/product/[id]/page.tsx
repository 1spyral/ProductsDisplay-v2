import ProductPage from "@/components/Product/ProductPage";
import { getProductById } from "@/db/queries/productQueries";
import type { Metadata } from "next";

export const revalidate = 60;

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  return {
    title: product?.name || "Product Details",
  };
}

export default async function ProductItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProductPage id={id} />;
}
