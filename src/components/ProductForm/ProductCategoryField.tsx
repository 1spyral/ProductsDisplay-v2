"use client";

import Category from "@/types/Category";
import { useEffect, useRef, useState } from "react";

interface ProductCategoryFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
  categories: Category[];
  required?: boolean;
}

export function ProductCategoryField({
  value,
  onChange,
  categories,
  required = false,
}: ProductCategoryFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get display name for selected category
  const selectedCategory = value
    ? categories.find((cat) => cat.category === value)
    : undefined;
  const displayValue = selectedCategory
    ? selectedCategory.name || selectedCategory.category
    : value || "";

  // Filter categories based on search input
  const filteredCategories = categories.filter((cat) => {
    const searchText = filter.trim().toLowerCase();
    if (!searchText) return true;
    const label = (cat.name || cat.category).toLowerCase();
    const key = cat.category.toLowerCase();
    return label.includes(searchText) || key.includes(searchText);
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFilter("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus the search box when dropdown opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSelect = (categoryValue: string) => {
    onChange(categoryValue);
    setIsOpen(false);
    setFilter("");
  };

  const handleClear = () => {
    onChange(null);
    setFilter("");
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase">
        Category
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      <div className="relative" ref={dropdownRef}>
        <div
          className="flex w-full cursor-pointer items-center justify-between border-2 border-gray-400 px-4 py-3 transition-colors focus-within:border-slate-700 hover:border-gray-500"
          onClick={() => setIsOpen((v) => !v)}
        >
          <span className={displayValue ? "text-gray-900" : "text-gray-400"}>
            {displayValue || "Select a category..."}
          </span>
          <div className="flex items-center gap-2">
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Clear category"
              >
                ✕
              </button>
            )}
            <span className="font-bold text-gray-600">
              {isOpen ? "▲" : "▼"}
            </span>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full border-2 border-gray-400 bg-white shadow-lg">
            <div className="border-b-2 border-gray-300 p-2">
              <input
                ref={inputRef}
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Type to filter categories..."
                className="w-full border border-gray-300 px-3 py-2 focus:border-slate-700 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <div
                    key={cat.category}
                    onClick={() => handleSelect(cat.category)}
                    className={`cursor-pointer px-4 py-3 transition-colors hover:bg-gray-100 ${
                      cat.category === value ? "bg-slate-100 font-semibold" : ""
                    }`}
                  >
                    {cat.name || cat.category}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-400">
                  No categories found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
