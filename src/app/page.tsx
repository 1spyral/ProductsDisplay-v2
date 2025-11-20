import CategoryButton from "@/components/CategoryButton";
import Searchbar from "@/components/Searchbar";
import { getCategories } from "@/db/queries/categoryQueries";

// #temporary - Disable static generation to avoid CDN rate limits during build
export const dynamic = "force-dynamic";
export const revalidate = 43200;

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header Section */}
      <section className="border-b-4 border-slate-700 bg-white px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-4 text-center text-4xl font-bold text-gray-900 sm:text-5xl">
            Welcome to Our Store
          </h1>
          <p className="mb-8 text-center text-xl text-gray-700">
            Browse products by category or search for what you need
          </p>

          {/* Search Section */}
          <div className="mx-auto max-w-3xl">
            <Searchbar />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 border-b-2 border-gray-300 pb-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Product Categories
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <CategoryButton category={null} isClearance={true} />
            {categories.map((category) => (
              <CategoryButton key={category.category} category={category} />
            ))}
            <CategoryButton category={null} />
          </div>
        </div>
      </section>
    </div>
  );
}
