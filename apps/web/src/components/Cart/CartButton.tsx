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
      <span
        className="material-symbols-rounded block h-7 w-7 text-[28px]!"
        aria-hidden="true"
      >
        shopping_cart
      </span>
      {visibleTotalItems > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
          {visibleTotalItems > 99 ? "99+" : visibleTotalItems}
        </span>
      )}
    </button>
  );
}
