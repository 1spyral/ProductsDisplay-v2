import Category, { getCategoryName } from "@/types/Category";
import Link from "next/link";

export default function CategoryButton({
  category,
  isClearance = false,
}: {
  category: Category | null;
  isClearance?: boolean;
}) {
  const href = isClearance
    ? "/clearance"
    : `/category/${category?.category || ""}`;
  const label = isClearance
    ? "Clearance Items"
    : category
      ? getCategoryName(category)
      : "All Products";

  const baseClasses = "block border-3 p-6 transition-colors duration-200";
  const colorClasses = isClearance
    ? "border-red-500 bg-red-50/70 hover:border-red-700 hover:bg-red-100/80 backdrop-blur-sm"
    : "border-gray-400 bg-white/70 hover:border-slate-700 hover:bg-white/90 backdrop-blur-sm";
  const textColorClass = isClearance ? "text-red-700" : "text-gray-900";

  return (
    <Link href={href} className={`${baseClasses} ${colorClasses}`}>
      <div className="flex h-full min-h-[100px] flex-col items-center justify-center text-center">
        <h3
          className={`text-xl font-bold tracking-wide uppercase ${textColorClass}`}
        >
          {label}
        </h3>
      </div>
    </Link>
  );
}
