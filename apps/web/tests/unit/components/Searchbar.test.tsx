import { cleanup, fireEvent, render } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  mock,
  test,
} from "bun:test";
import { registerHappyDom, unregisterHappyDom } from "../../setup/happy-dom";

const routerPush = mock((_href: string) => undefined);

mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}));

const { default: Searchbar } = await import("@/components/Searchbar");

describe("Searchbar", () => {
  beforeAll(() => {
    registerHappyDom();
  });

  afterAll(() => {
    mock.restore();
    unregisterHappyDom();
  });

  afterEach(() => {
    routerPush.mockReset();
    cleanup();
  });

  test("navigates to encoded search URL on form submit", () => {
    const { getByPlaceholderText } = render(<Searchbar />);

    const input = getByPlaceholderText(
      "Search for products..."
    ) as HTMLInputElement;
    const form = input.closest("form") as HTMLFormElement;

    input.value = "chairs & tables";
    fireEvent.submit(form);

    expect(routerPush).toHaveBeenCalledWith(
      "/search?query=chairs%20%26%20tables"
    );
  });

  test("does not navigate when query is empty or whitespace", () => {
    const { getByPlaceholderText } = render(<Searchbar />);

    const input = getByPlaceholderText(
      "Search for products..."
    ) as HTMLInputElement;
    const form = input.closest("form") as HTMLFormElement;

    input.value = "   ";
    fireEvent.submit(form);

    expect(routerPush).not.toHaveBeenCalled();
  });

  test("uses a submit button so click and Enter follow the same path", () => {
    const { getByRole } = render(<Searchbar />);

    const button = getByRole("button", { name: "Search" }) as HTMLButtonElement;
    expect(button.type).toBe("submit");
  });
});
