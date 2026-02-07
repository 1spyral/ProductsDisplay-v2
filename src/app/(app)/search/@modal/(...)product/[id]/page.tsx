import ProductModal from "@/components/Product/ProductModal";
import ProductPage from "@/components/Product/ProductPage";

export const revalidate = 60;

export const dynamicParams = true;

export default async function SearchResultsProductModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProductModal>
      <ProductPage id={id}></ProductPage>
    </ProductModal>
  );
}
