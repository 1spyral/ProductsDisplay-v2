import ProductList from "@/components/ProductList";

import fetchData from "@/utils/data";


export default async function Page() {
    const data = await fetchData();

    return (
        <div>
            <ProductList products={data}></ProductList>
        </div>
    );
}