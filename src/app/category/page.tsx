import ProductList from "@/components/Product/ProductList";
import { getProducts } from "@/db/queries/productQueries";

export const revalidate = 60;

export default async function AllCategoryPage() {
  const data = await getProducts();

  return <ProductList products={data} />;
}
