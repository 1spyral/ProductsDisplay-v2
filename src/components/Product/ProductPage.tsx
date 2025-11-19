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
      <div className="flex items-center justify-center h-full p-8">
        <div className="bg-white border-3 border-gray-400 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 uppercase">
            Product not found
          </h1>
        </div>
      </div>
    );
  }

  const categoryName = getCategoryName(
    await getCategoryByCategory(product.category)
  );
  const hasName = product.name && product.name.trim().length > 0;
  const hasDescription =
    product.description && product.description.trim().length > 0;

  return (
    <div className="flex flex-col md:flex-row w-full h-full">
      {/* Image Section */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-full border-b-4 md:border-b-0 md:border-r-4 border-slate-700 bg-white">
        <ImageCarousel photos={await getPhotos(product)} zoom={true} />
      </div>

      {/* Details Section */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-full bg-gray-50 overflow-y-auto">
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          {/* Category Badge */}
          <div className="mt-6 mb-6 pb-4 sm:mt-8 border-b-3 border-gray-400">
            <div className="flex items-center gap-3">
              <span className="inline-block bg-slate-700 text-white px-4 py-2 font-bold uppercase tracking-wider text-sm">
                {categoryName}
              </span>
              {product.clearance && (
                <span className="inline-block bg-red-600 text-white px-4 py-2 font-bold uppercase tracking-wider text-sm">
                  Clearance
                </span>
              )}
            </div>
          </div>

          {/* Product Name */}
          {hasName && (
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 uppercase leading-tight">
                {product.name}
              </h1>
            </div>
          )}

          {/* Product Description */}
          {hasDescription && (
            <div>
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                Description
              </h2>
              <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
