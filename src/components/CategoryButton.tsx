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
      className="block bg-white border-3 border-gray-400 hover:border-slate-700 hover:bg-gray-50 transition-colors duration-200 p-6"
    >
      <div className="flex flex-col items-center justify-center text-center h-full min-h-[100px]">
        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
          {category ? getCategoryName(category) : "All Products"}
        </h3>
      </div>
    </Link>
  );
}
