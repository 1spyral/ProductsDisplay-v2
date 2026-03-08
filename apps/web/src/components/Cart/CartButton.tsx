"use client";

import { useCart } from "@/contexts/CartContext";
import { useSyncExternalStore } from "react";

export default function CartButton() {
  const { totalItems, setCartOpen } = useCart();
  const hasHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const visibleTotalItems = hasHydrated ? totalItems : 0;

  return (
    <button
      type="button"
      onClick={() => setCartOpen(true)}
      className="relative text-white transition-colors duration-200 hover:text-gray-300"
      aria-label={`Cart${visibleTotalItems > 0 ? `, ${visibleTotalItems} item${visibleTotalItems !== 1 ? "s" : ""}` : ""}`}
    >
      <svg
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3.75h1.386c.51 0 .955.343 1.084.837L5.53 7.5m0 0h13.22a.75.75 0 0 1 .73.923l-1.5 6A.75.75 0 0 1 17.25 15H6.128a.75.75 0 0 1-.73-.577L3.62 5.999M5.53 7.5 3.62 5.999m2.508 12.751a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Zm10.5 0a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
        />
      </svg>
      {visibleTotalItems > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
          {visibleTotalItems > 99 ? "99+" : visibleTotalItems}
        </span>
      )}
    </button>
  );
}
