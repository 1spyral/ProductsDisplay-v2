import fetchData from "@/utils/data";
import ProductPage from "@/components/Product/ProductPage";

export async function generateStaticParams() {    
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
        <ProductPage id={id} />
    );
}