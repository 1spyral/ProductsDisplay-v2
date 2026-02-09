import Link from "next/link";

import ImageCarousel from "@/components/Image/ImageCarousel";
import { getCategoryByCategory } from "@/db/queries/categoryQueries";
import { getCategoryName } from "@/types/Category";
import Photo from "@/types/Photo";
import Product from "@/types/Product";

function shortenDescription(description: string): string {
  if (description.length > 100) {
    return description.substring(0, 99) + "...";
  }
  return description;
}

export default async function ProductBox({
  product,
  photos,
}: {
  product: Product;
  photos: Photo[];
}) {
  const categoryName = product.category
    ? getCategoryName(await getCategoryByCategory(product.category))
    : "No category";
  const hasDescription =
    product.description && product.description.trim().length > 0;
  const hasName = product.name && product.name.trim().length > 0;
  const hasPrice = product.price && product.price.trim().length > 0;
  const hasContent = hasName || hasDescription || hasPrice;

  return (
    <Link href={`/product/${product.id}`} scroll={false}>
      <div
        className={`flex flex-col border-3 border-gray-400 bg-white transition-colors duration-200 hover:border-slate-700 ${product.soldOut ? "opacity-60" : ""}`}
      >
        <div className="relative h-64 w-full border-b-3 border-gray-400">
          <ImageCarousel photos={photos} />
          <div className="absolute top-2 right-2 flex gap-2">
            {product.clearance && (
              <span className="bg-red-600 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
                Clearance
              </span>
            )}
            {product.soldOut && (
              <span className="bg-gray-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
                Sold Out
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col p-4">
          {hasPrice && (
            <h3 className="text-lg font-bold text-orange-600 italic">
              ${product.price}
            </h3>
          )}
          {hasName && (
            <h2 className="mb-2 text-lg font-bold text-gray-900 uppercase">
              {product.name}
            </h2>
          )}
          {hasDescription && (
            <p className="mb-3 text-sm leading-relaxed text-gray-700 italic">
              {shortenDescription(product.description || "")}
            </p>
          )}
          <p
            className={`text-center text-xs tracking-wider text-gray-600 uppercase ${hasContent ? "border-t-2 border-gray-300 pt-2" : ""}`}
          >
            {categoryName}
          </p>
        </div>
      </div>
    </Link>
  );
}
