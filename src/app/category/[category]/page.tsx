import ProductList from "@/components/Product/ProductList";
import { getProductsByCategory } from "@/db/queries/productQueries";
import { getCategories } from "@/db/queries/categoryQueries";
import Category from "@/types/Category";

export const revalidate = 43200;

export async function generateStaticParams() {
  return await getCategories();
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Category>;
}) {
  const { category, name } = await params;

  const filteredData = await getProductsByCategory(category);

  if (!filteredData.length) {
    return <h1>No products found in category {name}</h1>;
  }

  return <ProductList products={filteredData}></ProductList>;
}
