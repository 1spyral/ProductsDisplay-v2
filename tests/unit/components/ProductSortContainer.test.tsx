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
    const { container, getByText } = render(
      <ProductSortContainer title="Chairs" subtitle="3 products available">
        <div>Body</div>
      </ProductSortContainer>
    );

    expect(getByText("Chairs")).toBeDefined();
    expect(getByText("3 products available")).toBeDefined();
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
