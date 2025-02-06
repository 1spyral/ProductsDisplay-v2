import ProductList from "@/components/Product/ProductList";
import { getProducts } from "@/db/queries";

export const revalidate = 43200;

export default async function Page() {
    const data = await getProducts();

    return (
        <ProductList products={data} />
    );
}