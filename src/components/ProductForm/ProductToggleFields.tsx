"use client";

import ToggleableCheckbox from "@/components/ToggleableCheckbox";

interface ProductToggleFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ProductToggleField({
  label,
  value,
  onChange,
}: ProductToggleFieldProps) {
  const titleOn = `${label}: On`;
  const titleOff = `${label}: Off`;

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-bold tracking-wide text-gray-900 uppercase">
        {label}
      </label>
      <ToggleableCheckbox
        checked={value}
        onToggle={() => onChange(!value)}
        title={value ? titleOn : titleOff}
      />
    </div>
  );
}

interface ProductClearanceFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ProductClearanceField({
  value,
  onChange,
}: ProductClearanceFieldProps) {
  return (
    <ProductToggleField label="Clearance" value={value} onChange={onChange} />
  );
}

interface ProductHiddenFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ProductHiddenField({
  value,
  onChange,
}: ProductHiddenFieldProps) {
  return (
    <ProductToggleField label="Hidden" value={value} onChange={onChange} />
  );
}

