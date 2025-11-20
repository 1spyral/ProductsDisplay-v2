import ProductPage from "@/components/Product/ProductPage";

export const revalidate = 60;

export const dynamicParams = true;

export default async function ProductItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProductPage id={id} />;
}
