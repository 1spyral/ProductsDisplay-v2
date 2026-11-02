"use client";

import Icon from "@/components/Icon";
import CheckBoxFillIcon from "@material-symbols/svg-400/rounded/check_box-fill.svg";
import CheckBoxOutlineBlankIcon from "@material-symbols/svg-400/rounded/check_box_outline_blank.svg";

type Props = {
  checked: boolean;
  onToggle: () => void | Promise<void>;
  disabled?: boolean;
  // optional size classes for button and icon
  buttonSizeClass?: string; // e.g. 'w-9 h-9'
  iconSizeClass?: string; // e.g. 'w-5 h-5'
  title?: string;
};

export default function ToggleableCheckbox({
  checked,
  onToggle,
  disabled = false,
  buttonSizeClass = "w-9 h-9",
  iconSizeClass = "w-5 h-5",
  title,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        void onToggle();
      }}
      disabled={disabled}
      className={`inline-flex items-center justify-center ${buttonSizeClass} rounded-full text-xs font-bold transition-transform focus:outline-none ${
        disabled ? "cursor-wait opacity-50" : "hover:scale-105"
      }`}
      title={title}
      aria-pressed={checked}
    >
      {checked ? (
        <Icon
          component={CheckBoxFillIcon}
          size={20}
          className={iconSizeClass + " text-green-600"}
        />
      ) : (
        <Icon
          component={CheckBoxOutlineBlankIcon}
          size={20}
          className={iconSizeClass + " text-gray-400"}
        />
      )}
    </button>
  );
}
