import ProductList from "@/components/Product/ProductList";

import fetchData from "@/utils/data";
import search from "@/utils/search";

export default async function Page({ params }: {
    params: Promise<{ category: string }>;
}) {
    const data = await fetchData();
    const filteredData = await search(data, "", [(await params).category]);

    return (
        <ProductList products={filteredData}></ProductList>
    );
}