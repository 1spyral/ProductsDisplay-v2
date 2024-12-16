import ProductPage from "@/components/ProductPage";

export default function Page({ params }: {
    params: Promise<{ id: string }>;
}) {
    return (
        <ProductPage></ProductPage>
    );
}