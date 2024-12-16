import ProductModal from "@/components/ProductModal";
import ProductPage from "@/components/ProductPage";

export default function Page({params}: {
    params: Promise<{ id: string }>;
}) {
    return (
        <ProductModal>
            <ProductPage></ProductPage>
        </ProductModal>
    );
}