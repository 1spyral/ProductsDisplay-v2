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
      className="block border-3 border-gray-400 bg-white p-6 transition-colors duration-200 hover:border-slate-700 hover:bg-gray-50"
    >
      <div className="flex h-full min-h-[100px] flex-col items-center justify-center text-center">
        <h3 className="text-xl font-bold tracking-wide text-gray-900 uppercase">
          {category ? getCategoryName(category) : "All Products"}
        </h3>
      </div>
    </Link>
  );
}
