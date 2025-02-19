import ProductList from "@/components/Product/ProductList";
import { getProducts, getProductsByCategory } from "@/db/queries";

export const revalidate = 43200;

export async function generateStaticParams() {
    const data = await getProducts()
    const categories = Array.from(new Set(data.map(product => product.category)))

    return categories.map(category => ({ 
        category
    }))
}

export default async function CategoryPage({ params }: {
    params: Promise<{ category: string }>
}) {
    const { category } = await params

    const filteredData = await getProductsByCategory(category)

    if (!filteredData.length) {
        return (
            <h1>No products found in category {category}</h1>
        )
    }

    return (
        <ProductList products={filteredData}></ProductList>
    );
}