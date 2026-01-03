"use client";

interface CategoryNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CategoryNameField({
  value,
  onChange,
  placeholder = "Enter category name...",
}: CategoryNameFieldProps) {
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
