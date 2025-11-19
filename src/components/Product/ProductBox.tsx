import Link from "next/link";

import ImageCarousel from "@/components/Image/ImageCarousel";
import Product from "@/types/Product";
import Photo from "@/types/Photo";
import { getCategoryName } from "@/types/Category";
import { getCategoryByCategory } from "@/db/queries/categoryQueries";

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
  const categoryName = getCategoryName(
    await getCategoryByCategory(product.category)
  );
  const hasDescription =
    product.description && product.description.trim().length > 0;
  const hasName = product.name && product.name.trim().length > 0;
  const hasContent = hasName || hasDescription;

  return (
    <Link href={`/product/${product.id}`} scroll={false}>
      <div className="flex flex-col border-3 border-gray-400 bg-white transition-colors duration-200 hover:border-slate-700">
        <div className="relative h-64 w-full border-b-3 border-gray-400">
          <ImageCarousel photos={photos} />
          {product.clearance && (
            <span className="absolute top-2 right-2 bg-red-600 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
              Clearance
            </span>
          )}
        </div>
        <div className="flex flex-col p-4">
          {hasName && (
            <h2 className="mb-3 text-center text-lg font-bold text-gray-900 uppercase">
              {product.name}
            </h2>
          )}
          {hasDescription && (
            <p className="mb-3 text-center text-sm leading-relaxed text-gray-700">
              {shortenDescription(product.description || "")}
            </p>
          )}
          <p
            className={`text-center text-xs tracking-wider text-gray-600 uppercase ${hasContent ? "border-t-2 border-gray-300 pt-2" : ""}`}
          >
            {categoryName}
          </p>
          {/* clearance badge for ProductBox is overlaid on the image */}
        </div>
      </div>
    </Link>
  );
}
