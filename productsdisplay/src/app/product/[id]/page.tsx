import ProductPage from "@/components/Product/ProductPage";
import { fetchData } from "@/utils/data";

export const revalidate = 60;

export const dynamicParams = true;

export async function generateStaticParams() {
    const data = await fetchData();

    return data.map(product => ({ 
        params: { id: product.id } 
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