"use client";

import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  imageUrl: string | null;
  price: string | null;
  soldOut?: boolean;
}

export default function AddToCartButton({
  productId,
  productName,
  imageUrl,
  price,
  soldOut = false,
}: AddToCartButtonProps) {
  const { addToCart, updateQuantity, removeFromCart, items } = useCart();

  const existingItem = items.find((item) => item.productId === productId);
  const [inputValue, setInputValue] = useState(
    existingItem ? String(existingItem.quantity) : ""
  );

  // Use existingItem.quantity directly in the input so it stays synced
  const displayValue = existingItem
    ? String(existingItem.quantity)
    : inputValue;

  if (soldOut) {
    return (
      <button
        type="button"
        disabled
        className="w-full bg-gray-400 py-3 text-sm font-bold tracking-wide text-white uppercase"
      >
        Sold Out
      </button>
    );
  }

  if (existingItem) {
    return (
      <div className="flex w-full items-center gap-3">
        <div className="flex items-center border-2 border-slate-700">
          <button
            type="button"
            onClick={() => {
              if (existingItem.quantity <= 1) {
                removeFromCart(productId);
              } else {
                updateQuantity(productId, existingItem.quantity - 1);
              }
            }}
            className="flex h-11 w-11 items-center justify-center text-lg font-bold text-slate-700 transition-colors hover:bg-slate-100"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setInputValue(val);
              const num = parseInt(val, 10);
              if (!isNaN(num) && num > 0) {
                updateQuantity(productId, num);
              }
            }}
            onBlur={() => {
              const num = parseInt(inputValue, 10);
              if (isNaN(num) || num <= 0) {
                removeFromCart(productId);
              }
            }}
            className="h-11 w-12 border-x-2 border-slate-700 text-center text-sm font-bold text-slate-900 outline-none"
            aria-label="Quantity"
          />
          <button
            type="button"
            onClick={() => updateQuantity(productId, existingItem.quantity + 1)}
            className="flex h-11 w-11 items-center justify-center text-lg font-bold text-slate-700 transition-colors hover:bg-slate-100"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <span className="text-sm font-semibold text-slate-600">in cart</span>
        <button
          type="button"
          onClick={() => removeFromCart(productId)}
          className="ml-auto text-sm font-medium text-red-600 hover:text-red-800"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addToCart({ productId, productName, imageUrl, price })}
      className="h-[calc(2.75rem+4px)] w-[calc(2.75rem*2+3rem+4px)] border-2 border-slate-700 text-sm font-bold tracking-wide text-slate-700 uppercase transition-colors duration-200 hover:bg-slate-700 hover:text-white"
    >
      Add to Cart
    </button>
  );
}
