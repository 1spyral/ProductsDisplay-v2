"use client";

import Icon from "@/components/Icon";
import { useCart } from "@/contexts/CartContext";
import ShoppingCartIcon from "@material-symbols/svg-400/rounded/shopping_cart.svg";
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
      <Icon component={ShoppingCartIcon} size={28} />
      {visibleTotalItems > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
          {visibleTotalItems > 99 ? "99+" : visibleTotalItems}
        </span>
      )}
    </button>
  );
}
