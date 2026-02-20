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
          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
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
