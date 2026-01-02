import getPhotos from "@/utils/photo";
import Product from "@/types/Product";
import ImageCarousel from "@/components/Image/ImageCarousel";
import { getProductById } from "@/db/queries/productQueries";
import { getCategoryName } from "@/types/Category";
import { getCategoryByCategory } from "@/db/queries/categoryQueries";

export default async function ProductPage({ id }: { id: string }) {
  const product: Product | null = await getProductById(id);

  if (product === null) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="border-3 border-gray-400 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 uppercase">
            Product not found
          </h1>
        </div>
      </div>
    );
  }

  const categoryName = product.category
    ? getCategoryName(await getCategoryByCategory(product.category))
    : "No category";
  const hasName = product.name && product.name.trim().length > 0;
  const hasDescription =
    product.description && product.description.trim().length > 0;
  const hasPrice = product.price && product.price.trim().length > 0;

  return (
    <div className="flex h-full w-full flex-col md:flex-row">
      {/* Image Section */}
      <div className="h-[50vh] w-full border-b-4 border-slate-700 bg-white md:h-full md:w-1/2 md:border-r-4 md:border-b-0">
        <ImageCarousel photos={await getPhotos(product)} zoom={true} />
      </div>

      {/* Details Section */}
      <div className="h-[50vh] w-full overflow-y-auto bg-gray-50 md:h-full md:w-1/2">
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          {/* Category Badge */}
          <div className="mt-6 mb-4 border-b-3 border-gray-400 pb-4 sm:mt-8">
            <div className="flex items-center gap-3">
              <span className="inline-block bg-slate-700 px-4 py-2 text-sm font-bold tracking-wider text-white uppercase">
                {categoryName}
              </span>
              {product.clearance && (
                <span className="inline-block bg-red-600 px-4 py-2 text-sm font-bold tracking-wider text-white uppercase">
                  Clearance
                </span>
              )}
              {product.soldOut && (
                <span className="inline-block bg-gray-500 px-4 py-2 text-sm font-bold tracking-wider text-white uppercase">
                  Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Product Price */}
          {hasPrice && (
            <h1 className="text-2xl font-bold text-orange-600">
              ${product.price}
            </h1>
          )}

          {/* Product Name */}
          {hasName && (
            <div className="mb-6">
              <h1 className="text-3xl leading-tight font-bold text-gray-900 uppercase sm:text-4xl">
                {product.name}
              </h1>
            </div>
          )}

          {/* Product Description */}
          {hasDescription && (
            <div>
              <h2 className="mb-3 text-sm font-bold tracking-wide text-gray-700 uppercase">
                Description
              </h2>
              <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-800">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
