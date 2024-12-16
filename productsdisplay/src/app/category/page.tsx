import ProductList from "@/components/ProductList";

import fetchData from "@/utils/data";


export default async function Page() {
    const data = await fetchData();

    return (
        <div className="w-full flex justify-center">
            <ProductList products={data}></ProductList>
        </div>
    );
}