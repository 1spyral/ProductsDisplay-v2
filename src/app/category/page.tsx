import ProductList from "@/components/Product/ProductList";
import { getProducts } from "@/db/queries/productQueries";

// #temporary - Disable static generation to avoid CDN rate limits during build
export const dynamic = "force-dynamic";
export const revalidate = 43200;

export default async function AllCategoryPage() {
  const data = await getProducts();

  return <ProductList products={data} />;
}
