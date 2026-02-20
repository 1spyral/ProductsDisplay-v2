"use client";

import { useId } from "react";

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
  const inputId = useId();

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase"
      >
        Name
      </label>
      <input
        id={inputId}
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
  const inputId = useId();

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase"
      >
        Description
      </label>
      <textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-none border-2 border-gray-400 px-4 py-3 transition-colors focus:border-slate-700 focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}

interface ProductPriceFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ProductPriceField({
  value,
  onChange,
  placeholder = "Enter product price...",
}: ProductPriceFieldProps) {
  const inputId = useId();

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase"
      >
        Price
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-2 border-gray-400 px-4 py-3 transition-colors focus:border-slate-700 focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}
