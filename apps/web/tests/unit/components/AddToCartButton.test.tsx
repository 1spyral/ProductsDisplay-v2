import AddToCartButton from "@/components/Cart/AddToCartButton";
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

const base = {
  productId: "p1",
  productName: "Blue Chair",
  imageUrl: null as string | null,
  price: "$29.99" as string | null,
};

function item(overrides: Partial<CartItem> = {}): CartItem[] {
  return [{ ...base, quantity: 1, ...overrides }];
}

function setup(
  props: Partial<typeof base> & { soldOut?: boolean } = {},
  initialItems?: CartItem[]
) {
  if (initialItems) {
    localStorage.setItem("cart", JSON.stringify(initialItems));
  }
  let cart: ReturnType<typeof useCart> | null = null;
  function Observer() {
    // eslint-disable-next-line react-hooks/globals
    cart = useCart();
    return null;
  }
  const merged = { ...base, ...props };
  const utils = render(
    <CartProvider>
      <Observer />
      <AddToCartButton
        productId={merged.productId}
        productName={merged.productName}
        imageUrl={merged.imageUrl}
        price={merged.price}
        soldOut={props.soldOut}
      />
    </CartProvider>
  );
  const user = userEvent.setup({ document: globalThis.document });
  return { ...utils, user, getCart: () => cart! };
}

describe("AddToCartButton", () => {
  beforeAll(() => registerHappyDom());
  afterAll(() => unregisterHappyDom());
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  test("renders a disabled 'Sold Out' button when soldOut is true", () => {
    const { getByRole } = setup({ soldOut: true });
    const btn = getByRole("button", { name: /sold out/i });
    expect(btn).toBeTruthy();
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  test("renders 'Add to Cart' button when item is not in the cart", () => {
    const { getByRole } = setup();
    expect(getByRole("button", { name: /add to cart/i })).toBeTruthy();
  });

  test("clicking 'Add to Cart' adds the item to the cart", async () => {
    const { getByRole, user, getCart } = setup();
    await user.click(getByRole("button", { name: /add to cart/i }));

    expect(getCart().items).toHaveLength(1);
    expect(getCart().items[0].productId).toBe("p1");
    expect(getCart().items[0].quantity).toBe(1);
  });

  test("shows quantity controls after adding to cart", async () => {
    const { getByRole, getByLabelText, user } = setup();
    await user.click(getByRole("button", { name: /add to cart/i }));

    expect(getByLabelText("Increase quantity")).toBeTruthy();
    expect(getByLabelText("Decrease quantity")).toBeTruthy();
    expect(getByLabelText("Quantity")).toBeTruthy();
  });

  test("shows quantity controls when item is already in the cart", () => {
    const { getByLabelText } = setup({}, item({ quantity: 2 }));
    expect(getByLabelText("Increase quantity")).toBeTruthy();
    expect(getByLabelText("Decrease quantity")).toBeTruthy();
  });

  test("quantity input shows current cart quantity", () => {
    const { getByLabelText } = setup({}, item({ quantity: 4 }));
    expect((getByLabelText("Quantity") as HTMLInputElement).value).toBe("4");
  });

  test("clicking Increase increments quantity", async () => {
    const { getByLabelText, user, getCart } = setup({}, item({ quantity: 2 }));
    await user.click(getByLabelText("Increase quantity"));
    expect(getCart().items[0].quantity).toBe(3);
  });

  test("clicking Decrease decrements quantity", async () => {
    const { getByLabelText, user, getCart } = setup({}, item({ quantity: 3 }));
    await user.click(getByLabelText("Decrease quantity"));
    expect(getCart().items[0].quantity).toBe(2);
  });

  test("clicking Decrease at quantity 1 removes the item", async () => {
    const { getByLabelText, user, getCart } = setup({}, item({ quantity: 1 }));
    await user.click(getByLabelText("Decrease quantity"));
    expect(getCart().items).toHaveLength(0);
  });

  test("clicking Remove removes the item", async () => {
    const { getByText, user, getCart } = setup({}, item({ quantity: 2 }));
    await user.click(getByText("Remove"));
    expect(getCart().items).toHaveLength(0);
  });

  test("shows 'in cart' label when item is in the cart", () => {
    const { getByText } = setup({}, item());
    expect(getByText("in cart")).toBeTruthy();
  });

  test("typing a valid number updates cart quantity", async () => {
    const { getByLabelText, user, getCart } = setup({}, item({ quantity: 1 }));
    const input = getByLabelText("Quantity");
    await user.tripleClick(input);
    await user.keyboard("7");
    expect(getCart().items[0].quantity).toBe(7);
  });

  test("typing non-numeric characters is ignored", async () => {
    const { getByLabelText, user, getCart } = setup({}, item({ quantity: 3 }));
    await user.type(getByLabelText("Quantity"), "abc");
    expect(getCart().items[0].quantity).toBe(3);
  });

  test("clearing input and blurring removes the item", async () => {
    const { getByLabelText, user, getCart } = setup({}, item({ quantity: 2 }));
    const input = getByLabelText("Quantity");
    await user.clear(input);
    await user.tab();
    expect(getCart().items).toHaveLength(0);
  });

  test("removing the last item re-shows the Add to Cart button", async () => {
    const { getByText, getByRole, user } = setup({}, item());
    expect(getByText("in cart")).toBeTruthy();
    await user.click(getByText("Remove"));
    expect(getByRole("button", { name: /add to cart/i })).toBeTruthy();
  });
});
