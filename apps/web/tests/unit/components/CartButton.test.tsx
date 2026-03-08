import CartButton from "@/components/Cart/CartButton";
import { CartProvider, useCart, type CartItem } from "@/contexts/CartContext";
import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { registerHappyDom, unregisterHappyDom } from "../../setup/happy-dom";

function item(qty: number): CartItem[] {
  return [
    {
      productId: "p1",
      productName: "Chair",
      imageUrl: null,
      price: null,
      quantity: qty,
    },
  ];
}

function setup(initialItems?: CartItem[]) {
  if (initialItems) {
    localStorage.setItem("cart", JSON.stringify(initialItems));
  }
  const utils = render(
    <CartProvider>
      <CartButton />
    </CartProvider>
  );
  return {
    ...utils,
    user: userEvent.setup({ document: globalThis.document }),
  };
}

describe("CartButton", () => {
  beforeAll(() => registerHappyDom());
  afterAll(() => unregisterHappyDom());
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  test("renders the cart icon button", () => {
    const { getByRole } = setup();
    expect(getByRole("button")).toBeTruthy();
  });

  test("does not render a badge when cart is empty", () => {
    const { container } = setup();
    expect(container.querySelector("span")).toBeNull();
  });

  test("renders a badge showing the total item count", () => {
    const { container } = setup(item(4));
    expect(container.querySelector("span")?.textContent).toBe("4");
  });

  test("badge sums quantities across multiple items", () => {
    const items: CartItem[] = [
      {
        productId: "p1",
        productName: "A",
        imageUrl: null,
        price: null,
        quantity: 2,
      },
      {
        productId: "p2",
        productName: "B",
        imageUrl: null,
        price: null,
        quantity: 3,
      },
    ];
    const { container } = setup(items);
    expect(container.querySelector("span")?.textContent).toBe("5");
  });

  test("caps badge at 99+ when total items exceed 99", () => {
    const { container } = setup(item(100));
    expect(container.querySelector("span")?.textContent).toBe("99+");
  });

  test("aria-label includes item count when cart has items", () => {
    const { getByRole } = setup(item(2));
    expect(getByRole("button").getAttribute("aria-label")).toContain("2 items");
  });

  test("aria-label is just 'Cart' when cart is empty", () => {
    const { getByRole } = setup();
    expect(getByRole("button").getAttribute("aria-label")).toBe("Cart");
  });

  test("aria-label uses singular 'item' for exactly 1 item", () => {
    const { getByRole } = setup(item(1));
    const label = getByRole("button").getAttribute("aria-label");
    expect(label).toContain("1 item");
    expect(label).not.toContain("1 items");
  });

  test("clicking the button sets isCartOpen to true", async () => {
    let capturedIsCartOpen = false;
    function Observer() {
      // eslint-disable-next-line react-hooks/globals
      capturedIsCartOpen = useCart().isCartOpen;
      return null;
    }
    const user = userEvent.setup({ document: globalThis.document });
    const { getByRole } = render(
      <CartProvider>
        <CartButton />
        <Observer />
      </CartProvider>
    );

    expect(capturedIsCartOpen).toBe(false);
    await user.click(getByRole("button"));
    expect(capturedIsCartOpen).toBe(true);
  });
});
