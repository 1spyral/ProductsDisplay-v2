import ProductModal from "@/components/Product/ProductModal";
import ProductPage from "@/components/Product/ProductPage";
import fetchData from "@/utils/data";

export async function generateStaticParams() {
    "use cache";

    const data = await fetchData();
    const ids = data.map(product => product.id);

    return ids.map(id => ({
        params: { id },
    }));
}

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