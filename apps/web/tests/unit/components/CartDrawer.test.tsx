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
  mock,
  test,
} from "bun:test";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { registerHappyDom, unregisterHappyDom } from "../../setup/happy-dom";

mock.module("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  ),
}));

mock.module("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const { default: CartDrawer } = await import("@/components/Cart/CartDrawer");

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: "p1",
    productName: "Chair",
    imageUrl: null,
    price: null,
    quantity: 1,
    ...overrides,
  };
}

function DrawerWrapper({ initialItems }: { initialItems?: CartItem[] }) {
  if (initialItems) {
    localStorage.setItem("cart", JSON.stringify(initialItems));
  }
  return (
    <CartProvider>
      <DrawerOpener />
      <CartDrawer />
    </CartProvider>
  );
}

function DrawerOpener() {
  const { setCartOpen } = useCart();
  return (
    <button data-testid="open-drawer" onClick={() => setCartOpen(true)}>
      Open
    </button>
  );
}

function setup(initialItems?: CartItem[]) {
  const utils = render(<DrawerWrapper initialItems={initialItems} />);
  const user = userEvent.setup({ document: globalThis.document });
  return { ...utils, user };
}

async function setupOpen(initialItems?: CartItem[]) {
  const result = setup(initialItems);
  await result.user.click(result.getByTestId("open-drawer"));
  return result;
}

describe("CartDrawer", () => {
  beforeAll(() => registerHappyDom());
  afterAll(() => unregisterHappyDom());
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  test("renders nothing when the cart is closed", () => {
    const { queryByRole } = render(
      <CartProvider>
        <CartDrawer />
      </CartProvider>
    );
    expect(queryByRole("heading")).toBeNull();
  });

  test("renders the drawer header when open", async () => {
    const { getByRole } = await setupOpen();
    expect(getByRole("heading")).toBeTruthy();
  });

  test("shows empty state message when cart has no items", async () => {
    const { getByText } = await setupOpen();
    expect(getByText("Your cart is empty.")).toBeTruthy();
  });

  test("does not render clear cart button when cart is empty", async () => {
    const { queryByText } = await setupOpen();
    expect(queryByText("Clear Cart")).toBeNull();
  });

  test("renders item name and price", async () => {
    const { getByText } = await setupOpen([
      item({ productName: "Blue Chair", price: "$49.99" }),
    ]);
    expect(getByText("Blue Chair")).toBeTruthy();
    expect(getByText("$49.99")).toBeTruthy();
  });

  test("renders quantity for each item", async () => {
    const { getByText } = await setupOpen([item({ quantity: 3 })]);
    expect(getByText("3")).toBeTruthy();
  });

  test("renders an image when imageUrl is provided", async () => {
    const { getByAltText } = await setupOpen([
      item({ imageUrl: "https://example.com/chair.jpg" }),
    ]);
    expect(getByAltText("Chair")).toBeTruthy();
  });

  test("renders a placeholder when imageUrl is null", async () => {
    const { getByText } = await setupOpen([item()]);
    expect(getByText("No img")).toBeTruthy();
  });

  test("closes the drawer when the backdrop is clicked", async () => {
    const { container, user, queryByText } = await setupOpen();
    const backdrop = container.querySelector(
      "div.absolute.inset-0"
    ) as HTMLElement;
    await user.click(backdrop);
    expect(queryByText("Your cart is empty.")).toBeNull();
  });

  test("closes the drawer when the close button is clicked", async () => {
    const { getByLabelText, user, queryByText } = await setupOpen();
    await user.click(getByLabelText("Close cart"));
    expect(queryByText("Your cart is empty.")).toBeNull();
  });

  test("increases item quantity when + is clicked", async () => {
    const { getByLabelText, getByText, user } = await setupOpen([
      item({ quantity: 2 }),
    ]);
    await user.click(getByLabelText("Increase quantity"));
    expect(getByText("3")).toBeTruthy();
  });

  test("decreases item quantity when − is clicked", async () => {
    const { getByLabelText, getByText, user } = await setupOpen([
      item({ quantity: 3 }),
    ]);
    await user.click(getByLabelText("Decrease quantity"));
    expect(getByText("2")).toBeTruthy();
  });

  test("removes item when quantity is decremented to 0", async () => {
    const { getByLabelText, queryByText, user } = await setupOpen([
      item({ quantity: 1 }),
    ]);
    await user.click(getByLabelText("Decrease quantity"));
    expect(queryByText("Chair")).toBeNull();
    expect(queryByText("Your cart is empty.")).toBeTruthy();
  });

  test("removes item when Remove is clicked", async () => {
    const { getByText, queryByText, user } = await setupOpen([
      item({ quantity: 2 }),
    ]);
    await user.click(getByText("Remove"));
    expect(queryByText("Chair")).toBeNull();
  });

  test("clears all items when Clear Cart is clicked", async () => {
    const { getByText, queryByText, user } = await setupOpen([
      item({ productId: "p1", productName: "Chair" }),
      item({ productId: "p2", productName: "Table" }),
    ]);
    await user.click(getByText("Clear Cart"));
    expect(queryByText("Chair")).toBeNull();
    expect(queryByText("Table")).toBeNull();
    expect(queryByText("Your cart is empty.")).toBeTruthy();
  });

  test("renders a checkout link when cart has items", async () => {
    const { getByRole } = await setupOpen([item()]);
    const link = getByRole("link", { name: "Checkout Cart" });
    expect(link.getAttribute("href")).toBe("/checkout");
  });

  test("shows total item count in the header", async () => {
    const { getByRole } = await setupOpen([item({ quantity: 3 })]);
    expect(getByRole("heading").textContent).toContain("3");
  });
});
