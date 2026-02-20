"use client";

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
        <svg
          className={iconSizeClass + " text-green-600"}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" />
          <path
            d="M7 12l3 3 7-7"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      ) : (
        <svg
          className={iconSizeClass + " text-gray-400"}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3.5"
            y="3.5"
            width="17"
            height="17"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      )}
    </button>
  );
}
