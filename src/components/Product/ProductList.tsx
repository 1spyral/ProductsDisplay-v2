import getPhotos from "@/utils/photo";
import ProductBox from "./ProductBox";
import Product from "@/types/Product";

export default async function ProductList({
  products,
}: {
  products: Product[];
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map(async (product) => (
        <ProductBox
          key={product.id}
          product={product}
          photos={await getPhotos(product)}
        />
      ))}
    </div>
  );
}
