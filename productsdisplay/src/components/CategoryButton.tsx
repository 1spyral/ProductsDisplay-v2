import Link from "next/link";

export default function CategoryButton({ category }:
    { category: string }
) {
    return (
        <Link href={`/category/${category}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm">
            {category ? category : "All"}
        </Link>
    )
}