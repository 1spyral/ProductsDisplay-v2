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
      <div className="flex flex-col bg-white border-3 border-gray-400 hover:border-slate-700 transition-colors duration-200">
        <div className="relative w-full h-64 border-b-3 border-gray-400">
          <ImageCarousel photos={photos} />
        </div>
        <div className="flex flex-col p-4">
          {hasName && (
            <h2 className="text-lg font-bold text-gray-900 text-center uppercase mb-3">
              {product.name}
            </h2>
          )}
          {hasDescription && (
            <p className="text-sm text-gray-700 text-center leading-relaxed mb-3">
              {shortenDescription(product.description || "")}
            </p>
          )}
          <p
            className={`text-xs text-gray-600 text-center uppercase tracking-wider ${hasContent ? "pt-2 border-t-2 border-gray-300" : ""}`}
          >
            {categoryName}
          </p>
        </div>
      </div>
    </Link>
  );
}
