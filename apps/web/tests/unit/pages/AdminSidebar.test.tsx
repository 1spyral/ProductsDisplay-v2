import {
  act,
  cleanup,
  fireEvent,
  render,
  within,
} from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  mock,
  test,
} from "bun:test";
import type { AnchorHTMLAttributes } from "react";
import { registerHappyDom, unregisterHappyDom } from "../../setup/happy-dom";

let pathname = "/admin/dashboard/products";
const logoutAdmin = mock(async () => undefined);

mock.module("@/actions/admin/auth", () => ({ logoutAdmin }));
const navigation = { ...(await import("next/navigation")) };

mock.module("next/navigation", () => ({
  ...navigation,
  usePathname: () => pathname,
}));
mock.module("next/link", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      onClick={(event) => {
        event.preventDefault();
        props.onClick?.(event);
      }}
    />
  ),
}));

const { default: AdminSidebar } =
  await import("@/app/(admin)/admin/dashboard/AdminSidebar");

describe("AdminSidebar", () => {
  beforeAll(() => registerHappyDom());
  afterEach(async () => {
    await act(async () => cleanup());
    pathname = "/admin/dashboard/products";
  });
  afterAll(() => {
    mock.restore();
    unregisterHappyDom();
  });

  test("lists the four sections in order and marks the active page", () => {
    const { container } = render(<AdminSidebar />);
    const sidebar = within(container.querySelector("aside")!);
    const title = sidebar.getByText("Admin");
    expect(
      within(title.parentElement!).getByRole("button", { name: "Collapse" })
    ).toBeTruthy();
    const links = sidebar.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Products",
      "Categories",
      "PDFs",
      "Orders",
    ]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/admin/dashboard/products",
      "/admin/dashboard/categories",
      "/admin/dashboard/pdf",
      "/admin/dashboard/orders",
    ]);
    expect(links[0].getAttribute("aria-current")).toBe("page");
    expect(
      links.slice(1).every((link) => !link.hasAttribute("aria-current"))
    ).toBe(true);
    const logout = sidebar.getByRole("button", { name: "Logout" });
    expect(logout.getAttribute("type")).toBe("submit");
    expect(logout.closest("form")).toBeTruthy();
  });

  test.each(["editor", "saved"])(
    "keeps PDFs active on the %s route",
    (route) => {
      pathname = `/admin/dashboard/pdf/${route}`;
      const { container } = render(<AdminSidebar />);
      const sidebar = within(container.querySelector("aside")!);
      expect(
        sidebar.getByRole("link", { name: "PDFs" }).getAttribute("aria-current")
      ).toBe("page");
      expect(
        container.querySelectorAll('aside [aria-current="page"]').length
      ).toBe(1);
    }
  );

  test("collapses and expands the desktop sidebar without a navbar", async () => {
    const { container } = render(<AdminSidebar />);
    const sidebar = container.querySelector("aside")!;
    const expand = container.querySelector<HTMLButtonElement>(
      '[aria-controls="admin-sidebar"]'
    )!;
    expect(sidebar.className).toContain("lg:flex");
    await act(async () =>
      fireEvent.click(within(sidebar).getByRole("button", { name: "Collapse" }))
    );
    expect(sidebar.className).not.toContain("lg:flex");
    expect(expand.className).toContain("lg:block");
    expect(expand.getAttribute("aria-label")).toBe("Expand");
    expect(expand.querySelector('svg[aria-hidden="true"]')).toBeTruthy();
    expect(
      sidebar.querySelector('[aria-label="Collapse"] svg[aria-hidden="true"]')
    ).toBeTruthy();
    expect(expand.className).toContain("top-4 left-4");
    await act(async () => fireEvent.click(expand));
    expect(sidebar.className).toContain("lg:flex");
    expect(container.querySelector("header")).toBeNull();
  });

  test("opens the drawer and closes it through its controls, backdrop, and navigation", async () => {
    const { container } = render(<AdminSidebar />);
    const dialog = container.querySelector("dialog")!;
    // Happy DOM does not implement the native dialog lifecycle.
    dialog.showModal = () => {
      dialog.open = true;
    };
    dialog.close = () => {
      dialog.open = false;
      fireEvent(dialog, new Event("close"));
    };
    const menu = container.querySelector<HTMLButtonElement>(
      '[aria-controls="admin-sidebar-drawer"]'
    )!;
    const open = async () => {
      await act(async () => fireEvent.click(menu));
      expect(dialog.open).toBe(true);
      expect(menu.getAttribute("aria-expanded")).toBe("true");
    };
    const closed = () => {
      expect(dialog.open).toBe(false);
      expect(menu.getAttribute("aria-expanded")).toBe("false");
    };
    await open();
    const first = within(dialog).getByRole("button", { name: "Collapse" });
    const last = within(dialog).getByRole("button", { name: "Logout" });
    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
    await act(async () => {
      fireEvent.click(within(dialog).getByRole("button", { name: "Collapse" }));
    });
    closed();
    await open();
    await act(async () => fireEvent.click(dialog));
    closed();
    await open();
    await act(async () => {
      fireEvent.click(within(dialog).getByRole("link", { name: "Categories" }));
    });
    closed();
    await open();
    await act(async () => fireEvent(dialog, new Event("close")));
    closed();
  });

  test("closes the drawer when the route changes", async () => {
    const { container, rerender } = render(<AdminSidebar />);
    const dialog = container.querySelector("dialog")!;
    dialog.showModal = () => {
      dialog.open = true;
    };
    dialog.close = () => {
      dialog.open = false;
      fireEvent(dialog, new Event("close"));
    };
    await act(async () => {
      fireEvent.click(
        container.querySelector('[aria-controls="admin-sidebar-drawer"]')!
      );
    });
    pathname = "/admin/dashboard/orders";
    await act(async () => rerender(<AdminSidebar />));
    expect(dialog.open).toBe(false);
    expect(
      container
        .querySelector('[aria-controls="admin-sidebar-drawer"]')!
        .getAttribute("aria-expanded")
    ).toBe("false");
  });
});
