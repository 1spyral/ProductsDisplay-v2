"use client";

import ToggleableCheckbox from "@/components/ToggleableCheckbox";

interface ProductClearanceFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ProductClearanceField({
  value,
  onChange,
}: ProductClearanceFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">
        Clearance
      </label>
      <ToggleableCheckbox
        checked={value}
        onToggle={() => onChange(!value)}
        title={value ? "Clearance: On" : "Clearance: Off"}
      />
    </div>
  );
}
