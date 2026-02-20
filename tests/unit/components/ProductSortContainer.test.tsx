import ProductSortContainer from "@/components/Product/ProductSortContainer";
import { cleanup, fireEvent, render } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from "bun:test";
import { registerHappyDom, unregisterHappyDom } from "../../setup/happy-dom";

describe("ProductSortContainer", () => {
  beforeAll(() => {
    registerHappyDom();
  });

  afterAll(() => {
    unregisterHappyDom();
  });

  afterEach(() => {
    cleanup();
  });

  test("renders title/subtitle and defaults to default sort mode", () => {
    const { container, getByRole, getByText } = render(
      <ProductSortContainer title="Chairs" subtitle="3 products available">
        <div>Body</div>
      </ProductSortContainer>
    );

    expect(getByRole("heading", { name: "Chairs" })).toBeTruthy();
    expect(getByText("3 products available")).toBeTruthy();
    expect(
      container.querySelector("[data-product-sort='default']")
    ).toBeTruthy();
  });

  test("switches sort mode to price when price button is clicked", () => {
    const { container, getByRole } = render(
      <ProductSortContainer title="Chairs" subtitle="3 products available">
        <div>Body</div>
      </ProductSortContainer>
    );

    const priceButton = getByRole("button", { name: "Price" });
    fireEvent.click(priceButton);

    expect(container.querySelector("[data-product-sort='price']")).toBeTruthy();
  });
});
