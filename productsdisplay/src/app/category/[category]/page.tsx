import ProductList from "@/components/Product/ProductList";
import { fetchData } from "@/utils/data";
import search from "@/utils/search";

export const revalidate = 60;

export const dynamicParams = true;

export async function generateStaticParams() {
    const data = await fetchData();
    const categories = Array.from(new Set(data.map(product => product.category)));

    return categories.map(category => ({ 
        params: { category } 
    }));
}

export default async function Page({ params }: {
    params: Promise<{ category: string }>;
}) {
    const { category } = await params;

    const data = await fetchData();
    const filteredData = await search(data, "", [category]);

    if (!filteredData.length) {
        return (
            <h1>No products found in category {category}</h1>
        );
    }

    return (
        <ProductList products={filteredData}></ProductList>
    );
}