import ProductList from "@/components/Product/ProductList";

import fetchData from "@/utils/data";


export default async function Page() {
    const data = await fetchData();

    return (
        <ProductList products={data} />
    );
}