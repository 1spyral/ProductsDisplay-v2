import CategoryButton from "@/components/CategoryButton";
import { fetchData } from "@/utils/data";

export const revalidate = 43200;

export default async function Home() {
	const data = await fetchData();
    const categories = Array.from(new Set(data.map(product => product.category)));

	return (
		<div className="px-8">
			<h1 className="text-2xl font-bold mb-4">Categories</h1>
			<div className="flex flex-wrap gap-4">
				{categories.map(category => (
					<CategoryButton key={category} category={category} />
				))}
				<CategoryButton category="" />
			</div>
		</div>
	);
}
