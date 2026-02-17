"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";

export default function CartDrawer() {
  const {
    items,
    totalItems,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative flex w-full max-w-md flex-col border-l-4 border-slate-700 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-300 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-bold tracking-wide text-gray-900 uppercase">
            Cart ({totalItems})
          </h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="text-2xl font-bold text-gray-500 hover:text-gray-700"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              Your cart is empty.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 border-b border-gray-200 pb-4"
                >
                  {/* Image */}
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      width={64}
                      height={64}
                      className="h-16 w-16 shrink-0 rounded border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-100 text-[10px] text-gray-500 uppercase">
                      No img
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-gray-900">
                      {item.productName}
                    </span>
                    {item.price && (
                      <span className="text-sm font-medium text-orange-600">
                        {item.price}
                      </span>
                    )}

                    {/* Quantity controls */}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-sm font-bold text-gray-600 hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-sm font-bold text-gray-600 hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="ml-auto text-xs font-medium text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t-2 border-gray-300 px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={clearCart}
              className="w-full border-2 border-gray-300 py-2.5 text-sm font-bold tracking-wide text-gray-700 uppercase hover:bg-gray-50"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
