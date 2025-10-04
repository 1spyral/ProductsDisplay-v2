import CategoryButton from "@/components/CategoryButton";
import Searchbar from "@/components/Searchbar";
import { getCategories } from "@/db/queries/categoryQueries";

export const revalidate = 43200;

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header Section */}
      <section className="bg-white border-b-4 border-slate-700 py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 text-center">
            Welcome to Our Store
          </h1>
          <p className="text-xl text-gray-700 mb-8 text-center">
            Browse products by category or search for what you need
          </p>

          {/* Search Section */}
          <div className="max-w-3xl mx-auto">
            <Searchbar />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 border-b-2 border-gray-300 pb-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Product Categories
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
