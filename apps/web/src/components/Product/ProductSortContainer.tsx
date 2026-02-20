"use client";

import type { ReactNode } from "react";
import { useState } from "react";

type ProductSortOption = "default" | "price";

export default function ProductSortContainer({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const [sortOption, setSortOption] = useState<ProductSortOption>("default");

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mb-2 border-b-4 border-slate-700 bg-white px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-wide text-gray-900 uppercase">
              {title}
            </h1>
            <p className="mt-2 text-gray-700">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 text-sm sm:justify-end">
            <span className="font-semibold tracking-wide text-gray-700 uppercase">
              Sort:
            </span>
            <div className="inline-flex overflow-hidden border-2 border-slate-700">
              <button
                type="button"
                onClick={() => setSortOption("default")}
                className={`cursor-pointer px-3 py-1 font-semibold uppercase transition-colors ${
                  sortOption === "default"
                    ? "bg-slate-700 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Default
              </button>
              <button
                type="button"
                onClick={() => setSortOption("price")}
                className={`cursor-pointer border-l-2 border-slate-700 px-3 py-1 font-semibold uppercase transition-colors ${
                  sortOption === "price"
                    ? "bg-slate-700 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Price
              </button>
            </div>
          </div>
        </div>
      </div>
      <div data-product-sort={sortOption}>{children}</div>
    </div>
  );
}
