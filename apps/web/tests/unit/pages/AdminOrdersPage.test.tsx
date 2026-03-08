import type { OrderOverview } from "@/db/queries/orderQueries";
import { cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  mock,
  test,
} from "bun:test";
import type { ReactNode } from "react";
import { registerHappyDom, unregisterHappyDom } from "../../setup/happy-dom";

const getAdminOrders = mock(async () => [] as OrderOverview[]);

mock.module("@/actions/admin/order", () => ({
  getAdminOrders,
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
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const { default: AdminOrdersPage } =
  await import("@/app/(admin)/admin/dashboard/orders/page");

describe("AdminOrdersPage", () => {
  beforeAll(() => registerHappyDom());

  afterAll(() => {
    mock.restore();
    unregisterHappyDom();
  });

  afterEach(() => {
    getAdminOrders.mockReset();
    cleanup();
  });

  test("loads and expands orders", async () => {
    getAdminOrders.mockResolvedValue([
      {
        id: "order-2",
        name: "Alex Smith",
        email: "alex@example.com",
        phone: null,
        additionalComments: "Leave at front desk",
        createdAt: new Date("2026-03-08T12:00:00.000Z"),
        items: [
          {
            quantity: 2,
            product: {
              id: "chair-1",
              name: "Chair",
              imageObjectKey: "chair-primary.jpg",
            },
          },
        ],
      },
    ]);

    const { findByText, getByRole, getByText, queryByText } = render(
      <AdminOrdersPage />
    );
    const user = userEvent.setup({ document: globalThis.document });

    expect(await findByText("Alex Smith")).toBeTruthy();
    expect(queryByText("Leave at front desk")).toBeNull();

    await user.click(getByRole("button", { name: /Alex Smith/i }));

    await waitFor(() => {
      expect(getByRole("heading", { name: "Ordered Products" })).toBeTruthy();
      expect(getByText("Leave at front desk")).toBeTruthy();
      expect(getByText("Product ID: chair-1")).toBeTruthy();
      expect(getByText("Qty 2")).toBeTruthy();
      expect(getByRole("img", { name: "Chair" })).toBeTruthy();
    });
  });

  test("shows an empty state when there are no orders", async () => {
    getAdminOrders.mockResolvedValue([]);

    const { findByText } = render(<AdminOrdersPage />);

    expect(await findByText("No Orders Yet")).toBeTruthy();
  });
});
