import Icon from "@/components/Icon";
import ShoppingCartIcon from "@material-symbols/svg-400/rounded/shopping_cart.svg";
import { cleanup, render } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from "bun:test";
import { registerHappyDom, unregisterHappyDom } from "../../setup/happy-dom";

describe("Icon", () => {
  beforeAll(() => registerHappyDom());
  afterAll(() => unregisterHappyDom());
  afterEach(() => cleanup());

  test("defaults to a decorative, non-focusable icon with inherited color", () => {
    const { container, queryByRole } = render(
      <Icon component={ShoppingCartIcon} />
    );
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("24");
    expect(svg?.getAttribute("height")).toBe("24");
    expect(svg?.getAttribute("fill")).toBe("currentColor");
    expect(svg?.getAttribute("focusable")).toBe("false");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(queryByRole("img")).toBeNull();
  });

  test("exposes a labeled icon as an image and supports custom sizing and styling", () => {
    const { getByRole } = render(
      <Icon
        component={ShoppingCartIcon}
        size={28}
        label="Shopping cart"
        className="text-white"
      />
    );
    const svg = getByRole("img", { name: "Shopping cart" });
    expect(svg.getAttribute("aria-hidden")).toBeNull();
    expect(svg.getAttribute("width")).toBe("28");
    expect(svg.getAttribute("height")).toBe("28");
    expect(svg.getAttribute("class")).toBe("text-white");
  });
});
