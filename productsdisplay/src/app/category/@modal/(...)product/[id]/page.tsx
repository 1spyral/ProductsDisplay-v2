import ProductModal from "@/components/Product/ProductModal";
import ProductPage from "@/components/Product/ProductPage";

export default function Page({params}: {
    params: Promise<{ id: string }>;
}) {
    return (
        <ProductModal>
            <ProductPage></ProductPage>
        </ProductModal>
    );
}