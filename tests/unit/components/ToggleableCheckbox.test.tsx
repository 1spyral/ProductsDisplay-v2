import ToggleableCheckbox from "@/components/ToggleableCheckbox";
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

describe("ToggleableCheckbox", () => {
  beforeAll(() => {
    registerHappyDom();
  });

  afterAll(() => {
    unregisterHappyDom();
  });

  afterEach(() => {
    cleanup();
  });

  test("calls onToggle when clicked and not disabled", () => {
    const onToggle = mock(() => undefined);

    const { getByRole } = render(
      <ToggleableCheckbox
        checked={false}
        onToggle={onToggle}
        title="toggle-hidden"
      />
    );

    const button = getByRole("button", { name: "toggle-hidden" });
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  test("does not call onToggle when disabled", () => {
    const onToggle = mock(() => undefined);

    const { getByRole } = render(
      <ToggleableCheckbox
        checked={true}
        onToggle={onToggle}
        disabled={true}
        title="toggle-clearance"
      />
    );

    const button = getByRole("button", {
      name: "toggle-clearance",
    });
    fireEvent.click(button);

    expect(onToggle).not.toHaveBeenCalled();
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  test("applies custom size classes", () => {
    const onToggle = mock(() => undefined);

    const { getByRole } = render(
      <ToggleableCheckbox
        checked={true}
        onToggle={onToggle}
        title="toggle-size"
        buttonSizeClass="w-12 h-12"
        iconSizeClass="w-8 h-8"
      />
    );

    const button = getByRole("button", { name: "toggle-size" });
    expect(button.className).toContain("w-12");
    expect(button.className).toContain("h-12");

    const icon = button.querySelector("svg");
    expect(icon?.getAttribute("class")).toContain("w-8");
    expect(icon?.getAttribute("class")).toContain("h-8");
  });
});
