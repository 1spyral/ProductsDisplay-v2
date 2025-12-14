"use client";

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
