"use client";

import Category from "@/types/Category";

interface ProductNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ProductNameField({
  value,
  onChange,
  placeholder = "Enter product name...",
}: ProductNameFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase">
        Name
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-2 border-gray-400 px-4 py-3 transition-colors focus:border-slate-700 focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}

interface ProductDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function ProductDescriptionField({
  value,
  onChange,
  placeholder = "Enter product description...",
  rows = 4,
}: ProductDescriptionFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase">
        Description
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-none border-2 border-gray-400 px-4 py-3 transition-colors focus:border-slate-700 focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}

interface ProductCategoryFieldProps {
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
  required?: boolean;
}

export function ProductCategoryField({
  value,
  onChange,
  categories,
  required = true,
}: ProductCategoryFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase">
        Category
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border-2 border-gray-400 px-4 py-3 transition-colors focus:border-slate-700 focus:outline-none"
          required={required}
        >
          {categories.map((cat) => (
            <option key={cat.category} value={cat.category}>
              {cat.name || cat.category}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-bold text-gray-600">
          ▼
        </div>
      </div>
    </div>
  );
}
