import Product from "@/types/Product";
import { sortProductsByOption } from "@/utils/productSort";
import getPhotos from "@/utils/photo";
import type { CSSProperties } from "react";
import styles from "./ProductList.module.css";
import ProductBox from "./ProductBox";

export default async function ProductList({
  products,
}: {
  products: Product[];
}) {
  const priceSortedProducts = sortProductsByOption(products, "price");
  const priceOrderById = new Map(
    priceSortedProducts.map((product, index) => [product.id, index])
  );

  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map(async (product, defaultIndex) => (
        <div
          key={product.id}
          className={styles.item}
          style={
            {
              "--product-order-default": defaultIndex,
              "--product-order-price":
                priceOrderById.get(product.id) ?? defaultIndex,
            } as CSSProperties
          }
        >
          <ProductBox product={product} photos={await getPhotos(product)} />
        </div>
      ))}
    </div>
  );
}
