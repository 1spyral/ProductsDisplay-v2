import CategoryButton from "@/components/CategoryButton";
import Searchbar from "@/components/Searchbar";
import { getCategories } from "@/db/queries/categoryQueries";
import { hasClearanceProducts } from "@/db/queries/productQueries";
import { getStoreInfo } from "@/db/queries/storeInfoQueries";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, showClearance, store] = await Promise.all([
    getCategories(),
    hasClearanceProducts(),
    getStoreInfo(),
  ]);

  const headline = store.headline || store.name || "Welcome to Our Store";
  const description =
    store.description ||
    "Browse products by category or search for what you need";

  return (
    <div
      className="min-h-full bg-gray-50"
      style={
        store.backgroundImageUrl
          ? {
              backgroundImage: `url(${store.backgroundImageUrl})`,
              backgroundAttachment: "fixed",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : {
              backgroundImage:
                "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              backgroundAttachment: "fixed",
            }
      }
    >
      {/* Header Section */}
      <section className="border-b-4 border-slate-700 bg-white/90 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-4 text-center text-4xl font-bold text-gray-900 sm:text-5xl">
            {headline}
          </h1>
          <p className="mb-8 text-center text-xl text-gray-700">
            {description}
          </p>

          {/* Search Section */}
          <div className="mx-auto max-w-3xl">
            <Searchbar />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white/70 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 border-b-2 border-gray-300 pb-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Product Categories
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((category) => (
              <CategoryButton key={category.category} category={category} />
            ))}
            {showClearance && (
              <CategoryButton category={null} isClearance={true} />
            )}
            <CategoryButton category={null} />
          </div>
        </div>
      </section>
    </div>
  );
}
