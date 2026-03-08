import { CartProvider, type CartItem } from "@/contexts/CartContext";
import { cleanup, render, waitFor } from "@testing-library/react";
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

const submitOrder = mock(
  async (_payload: {
    name: string;
    email: string | null;
    phone: string | null;
    additionalComments: string | null;
    items: { productId: string; quantity: number }[];
  }) => ({
    success: true,
    id: "order-123",
  })
);

const routerPush = mock((_href: string) => undefined);

mock.module("@/actions/order", () => ({
  submitOrder,
}));

mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}));

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

const { default: CheckoutPage } =
  await import("@/components/Cart/CheckoutPage");

function renderWithCart(initialItems: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(initialItems));
  const utils = render(
    <CartProvider>
      <CheckoutPage />
    </CartProvider>
  );
  const user = userEvent.setup({ document: globalThis.document });
  return { ...utils, user };
}

describe("CheckoutPage", () => {
  beforeAll(() => registerHappyDom());
  afterAll(() => {
    mock.restore();
    unregisterHappyDom();
  });
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    submitOrder.mockClear();
    routerPush.mockClear();
    cleanup();
  });

  test("requires either an email address or phone number", async () => {
    const { getByLabelText, getByRole, findByText, user } = renderWithCart([
      {
        productId: "p1",
        productName: "Chair",
        imageUrl: null,
        price: "$12.00",
        quantity: 2,
      },
    ]);

    await user.type(getByLabelText("Name"), "Alex Smith");
    await user.click(getByRole("button", { name: "Submit Quote" }));

    expect(
      await findByText("Please provide an email address or phone number.")
    ).toBeTruthy();
    expect(submitOrder).not.toHaveBeenCalled();
  });

  test("submits the cart, clears storage, and routes to success page", async () => {
    const { getByLabelText, getByRole, user } = renderWithCart([
      {
        productId: "p1",
        productName: "Chair",
        imageUrl: null,
        price: "$12.00",
        quantity: 2,
      },
      {
        productId: "p2",
        productName: "Table",
        imageUrl: null,
        price: "$40.00",
        quantity: 1,
      },
    ]);

    await user.type(getByLabelText("Name"), " Alex Smith ");
    await user.type(getByLabelText("Email Address"), " alex@example.com ");
    await user.type(
      getByLabelText("Additional Comments"),
      " Leave at front desk. "
    );
    await user.click(getByRole("button", { name: "Submit Quote" }));

    await waitFor(() => {
      expect(submitOrder).toHaveBeenCalledWith({
        name: "Alex Smith",
        email: "alex@example.com",
        phone: null,
        additionalComments: "Leave at front desk.",
        items: [
          { productId: "p1", quantity: 2 },
          { productId: "p2", quantity: 1 },
        ],
      });
    });

    await waitFor(() => {
      expect(localStorage.getItem("cart")).toBe("[]");
      expect(routerPush).toHaveBeenCalledWith(
        "/checkout/success?reference=order-123"
      );
    });
  });

  test("rejects an invalid phone number", async () => {
    const { getByLabelText, getByRole, findByText, user } = renderWithCart([
      {
        productId: "p1",
        productName: "Chair",
        imageUrl: null,
        price: "$12.00",
        quantity: 1,
      },
    ]);

    await user.type(getByLabelText("Name"), "Alex Smith");
    await user.type(getByLabelText("Phone Number"), "123");
    await user.click(getByRole("button", { name: "Submit Quote" }));

    expect(await findByText("Please enter a valid phone number.")).toBeTruthy();
    expect(submitOrder).not.toHaveBeenCalled();
  });

  test("normalizes a valid phone number before submit", async () => {
    const { getByLabelText, getByRole, user } = renderWithCart([
      {
        productId: "p1",
        productName: "Chair",
        imageUrl: null,
        price: "$12.00",
        quantity: 1,
      },
    ]);

    await user.type(getByLabelText("Name"), "Alex Smith");
    await user.type(getByLabelText("Phone Number"), "5551234567");
    await user.click(getByRole("button", { name: "Submit Quote" }));

    await waitFor(() => {
      expect(submitOrder).toHaveBeenCalledWith({
        name: "Alex Smith",
        email: null,
        phone: "(555) 123-4567",
        additionalComments: null,
        items: [{ productId: "p1", quantity: 1 }],
      });
    });
  });

  test("shows an empty-cart state when there are no cart items", () => {
    const { getByText, getByRole } = render(
      <CartProvider>
        <CheckoutPage />
      </CartProvider>
    );

    expect(
      getByText("Your cart is empty. Add products before requesting a quote.")
    ).toBeTruthy();
    expect(
      getByRole("link", { name: "Return to Shopping" }).getAttribute("href")
    ).toBe("/");
  });
});
