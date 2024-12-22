import ProductList from "@/components/Product/ProductList";
import { fetchData } from "@/utils/data";

export const revalidate = 43200;

export default async function Page() {
    const data = await fetchData();

    return (
        <ProductList products={data} />
    );
}