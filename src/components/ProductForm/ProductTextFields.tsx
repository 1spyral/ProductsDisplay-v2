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
  placeholder = "Enter product name..."
}: ProductNameFieldProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
        Name
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 border-gray-400 focus:outline-none focus:border-slate-700 transition-colors"
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
  rows = 4
}: ProductDescriptionFieldProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
        Description
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-3 border-2 border-gray-400 focus:outline-none focus:border-slate-700 transition-colors resize-none"
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
  required = true
}: ProductCategoryFieldProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
        Category
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-400 focus:outline-none focus:border-slate-700 transition-colors appearance-none"
          required={required}
        >
          {categories.map((cat) => (
            <option key={cat.category} value={cat.category}>
              {cat.name || cat.category}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 font-bold">
          ▼
        </div>
      </div>
    </div>
  );
}
