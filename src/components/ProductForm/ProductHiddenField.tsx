"use client";

import ToggleableCheckbox from "@/components/ToggleableCheckbox";

interface ProductHiddenFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ProductHiddenField({
  value,
  onChange,
}: ProductHiddenFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-bold tracking-wide text-gray-900 uppercase">
        Hidden
      </label>
      <ToggleableCheckbox
        checked={value}
        onToggle={() => onChange(!value)}
        title={value ? "Hidden: On" : "Hidden: Off"}
      />
    </div>
  );
}
