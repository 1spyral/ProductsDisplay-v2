import ProductModal from "@/components/Product/ProductModal";
import ProductPage from "@/components/Product/ProductPage";

export default async function Page({ params }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <ProductModal>
            <ProductPage id={id}></ProductPage>
        </ProductModal>
    );
}