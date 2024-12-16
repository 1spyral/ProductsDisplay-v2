import ProductPage from "@/components/Product/ProductPage";

export default function Page({ params }: {
    params: Promise<{ id: string }>;
}) {
    return (
        <ProductPage></ProductPage>
    );
}