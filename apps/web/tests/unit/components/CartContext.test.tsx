import { CartProvider, useCart, type CartItem } from "@/contexts/CartContext";
import { act, cleanup, renderHook } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import type { ReactNode } from "react";
import { registerHappyDom, unregisterHappyDom } from "../../setup/happy-dom";

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

/** Shorthand for an addToCart-compatible item (no quantity). */
function newItem(id = "p1", name = "A") {
  return {
    productId: id,
    productName: name,
    imageUrl: null,
    price: null,
  } as const;
}

function useCartHook() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return renderHook(() => useCart(), { wrapper });
}

function storedCart(): CartItem[] {
  return JSON.parse(localStorage.getItem("cart") ?? "[]");
}

describe("CartContext", () => {
  beforeAll(() => registerHappyDom());
  afterAll(() => unregisterHappyDom());
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  test("useCart throws when used outside CartProvider", () => {
    const originalError = console.error;
    console.error = () => {};
    try {
      expect(() => renderHook(() => useCart())).toThrow(
        "useCart must be used within a CartProvider"
      );
    } finally {
      console.error = originalError;
    }
  });

  test("starts with an empty cart", () => {
    const { result } = useCartHook();
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.isCartOpen).toBe(false);
  });

  test("loads initial cart from localStorage", () => {
    localStorage.setItem(
      "cart",
      JSON.stringify([{ ...newItem("s1", "Stored"), quantity: 3 }])
    );
    const { result } = useCartHook();

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe("s1");
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
  });

  test("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("cart", "not-valid-json{{{");
    const { result } = useCartHook();
    expect(result.current.items).toEqual([]);
  });

  test("handles non-array localStorage value gracefully", () => {
    localStorage.setItem("cart", JSON.stringify({ notAnArray: true }));
    const { result } = useCartHook();
    expect(result.current.items).toEqual([]);
  });

  test("addToCart adds a new item with default quantity 1", () => {
    const { result } = useCartHook();
    act(() => result.current.addToCart({ ...newItem(), price: "$5.00" }));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.items[0].price).toBe("$5.00");
    expect(result.current.totalItems).toBe(1);
  });

  test("addToCart adds a new item with a specified quantity", () => {
    const { result } = useCartHook();
    act(() => result.current.addToCart(newItem(), 3));

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
  });

  test("addToCart increments quantity for an existing item", () => {
    const { result } = useCartHook();
    act(() => result.current.addToCart(newItem()));
    act(() => result.current.addToCart(newItem(), 2));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
  });

  test("addToCart keeps multiple distinct items separate", () => {
    const { result } = useCartHook();
    act(() => {
      result.current.addToCart(newItem("p1"));
      result.current.addToCart(newItem("p2", "B"));
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalItems).toBe(2);
  });

  test("removeFromCart removes the matching item", () => {
    const { result } = useCartHook();
    act(() => {
      result.current.addToCart(newItem("p1"));
      result.current.addToCart(newItem("p2", "B"));
    });
    act(() => result.current.removeFromCart("p1"));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe("p2");
  });

  test("removeFromCart is a no-op for an unknown productId", () => {
    const { result } = useCartHook();
    act(() => result.current.addToCart(newItem()));
    act(() => result.current.removeFromCart("unknown"));

    expect(result.current.items).toHaveLength(1);
  });

  test("updateQuantity updates the quantity of the item", () => {
    const { result } = useCartHook();
    act(() => result.current.addToCart(newItem()));
    act(() => result.current.updateQuantity("p1", 5));

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalItems).toBe(5);
  });

  test("updateQuantity with 0 removes the item", () => {
    const { result } = useCartHook();
    act(() => result.current.addToCart(newItem()));
    act(() => result.current.updateQuantity("p1", 0));

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  test("updateQuantity with a negative quantity removes the item", () => {
    const { result } = useCartHook();
    act(() => result.current.addToCart(newItem()));
    act(() => result.current.updateQuantity("p1", -1));

    expect(result.current.items).toHaveLength(0);
  });

  test("clearCart removes all items", () => {
    const { result } = useCartHook();
    act(() => {
      result.current.addToCart(newItem("p1"));
      result.current.addToCart(newItem("p2", "B"));
    });
    act(() => result.current.clearCart());

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  test("totalItems sums quantities across all items", () => {
    const { result } = useCartHook();
    act(() => {
      result.current.addToCart(newItem("p1"), 2);
      result.current.addToCart(newItem("p2", "B"), 3);
    });
    expect(result.current.totalItems).toBe(5);
  });

  test("setCartOpen updates isCartOpen", () => {
    const { result } = useCartHook();
    expect(result.current.isCartOpen).toBe(false);

    act(() => result.current.setCartOpen(true));
    expect(result.current.isCartOpen).toBe(true);

    act(() => result.current.setCartOpen(false));
    expect(result.current.isCartOpen).toBe(false);
  });

  test("persists cart to localStorage when items change", () => {
    const { result } = useCartHook();
    act(() => result.current.addToCart({ ...newItem(), price: "$5.00" }, 2));

    expect(storedCart()).toHaveLength(1);
    expect(storedCart()[0].productId).toBe("p1");
    expect(storedCart()[0].quantity).toBe(2);
  });

  test("updates localStorage when an item is removed", () => {
    const { result } = useCartHook();
    act(() => {
      result.current.addToCart(newItem("p1"));
      result.current.addToCart(newItem("p2", "B"));
    });
    act(() => result.current.removeFromCart("p1"));

    expect(storedCart()).toHaveLength(1);
    expect(storedCart()[0].productId).toBe("p2");
  });

  test("writes empty array to localStorage when cart is cleared", () => {
    const { result } = useCartHook();
    act(() => result.current.addToCart(newItem()));
    act(() => result.current.clearCart());

    expect(storedCart()).toEqual([]);
  });
});
