import { ProductCategoryField } from "@/components/ProductForm/ProductCategoryField";
import type Category from "@/types/Category";
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

const categories: Category[] = [
  { category: "fruit", name: "Fruit", displayOrder: 1 },
  { category: "vegetable", name: "Vegetable", displayOrder: 2 },
];

describe("ProductCategoryField", () => {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;

  beforeAll(() => {
    registerHappyDom();
    if (!globalThis.requestAnimationFrame) {
      globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
        callback(0);
        return 0;
      };
    }
  });

  afterAll(() => {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    unregisterHappyDom();
  });

  afterEach(() => {
    cleanup();
  });

  test("opens with keyboard and selects an option", () => {
    const onChange = mock((_value: string | null) => undefined);

    const { container, getByPlaceholderText, getByRole, queryByRole } = render(
      <ProductCategoryField
        value={null}
        onChange={onChange}
        categories={categories}
      />
    );

    const trigger = container.querySelector(
      '[aria-haspopup="listbox"]'
    ) as HTMLElement;

    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(getByPlaceholderText("Type to filter categories...")).toBeDefined();

    fireEvent.click(getByRole("button", { name: "Vegetable" }));

    expect(onChange).toHaveBeenCalledWith("vegetable");
    expect(queryByRole("button", { name: "Vegetable" })).toBeNull();
  });

  test("clears selected value without toggling dropdown", () => {
    const onChange = mock((_value: string | null) => undefined);

    const { queryByPlaceholderText, getByLabelText } = render(
      <ProductCategoryField
        value={"fruit"}
        onChange={onChange}
        categories={categories}
      />
    );

    fireEvent.click(getByLabelText("Clear category"));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(queryByPlaceholderText("Type to filter categories...")).toBeNull();
  });

  test("closes on outside click and resets filter text", () => {
    const onChange = mock((_value: string | null) => undefined);

    const { container, getByPlaceholderText } = render(
      <ProductCategoryField
        value={null}
        onChange={onChange}
        categories={categories}
      />
    );

    const trigger = container.querySelector(
      '[aria-haspopup="listbox"]'
    ) as HTMLElement;

    fireEvent.click(trigger);
    const searchInput = getByPlaceholderText(
      "Type to filter categories..."
    ) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "veg" } });
    expect(searchInput.value).toBe("veg");

    fireEvent.mouseDown(document.body);

    fireEvent.click(trigger);
    const reopenedSearchInput = getByPlaceholderText(
      "Type to filter categories..."
    ) as HTMLInputElement;

    expect(reopenedSearchInput.value).toBe("");
  });
});
