import CategoryButton from "@/components/CategoryButton";
import Searchbar from "@/components/Searchbar";
import { getCategories } from "@/db/queries/categoryQueries";

export const revalidate = 43200;

export default async function HomePage() {
    const categories = await getCategories();

	return (
		<div className="px-4 sm:px-8">
			<h1 className="text-2xl font-bold mb-4">Categories</h1>
			<div className="flex flex-wrap gap-4">
				{categories.map(category => <CategoryButton key={category.category} category={category} />)}
				<CategoryButton category={null} />
			</div>
			<h1 className="text-2xl font-bold mt-4 mb-4">Search</h1>
			<Searchbar />
		</div>
	);
}
