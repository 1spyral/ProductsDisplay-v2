import ProductList from "@/components/Product/ProductList";
import { fetchData } from "@/utils/data";

export const revalidate = 60;

export default async function Page() {
    const data = await fetchData();

    return (
        <ProductList products={data} />
    );
}