import Link from "next/link";
import Category, { getCategoryName } from "@/types/Category";

export default function CategoryButton({
  category,
}: {
  category: Category | null;
}) {
  return (
    <Link
      href={`/category/${category?.category || ""}`}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm"
    >
      {category ? getCategoryName(category) : "All"}
    </Link>
  );
}
