import ProductIdField from "@/components/ProductForm/ProductIdField";
import type { ProductValidationState } from "@/hooks/useProductFormValidation";
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

function createValidationState(
  message: string | null,
  isCheckingDuplicate = false
): ProductValidationState {
  return {
    isDuplicate: false,
    isCheckingDuplicate,
    getIdValidationMessage: () => message,
    isValidIdFormat: () => true,
  };
}

describe("ProductIdField", () => {
  beforeAll(() => {
    registerHappyDom();
  });

  afterAll(() => {
    unregisterHappyDom();
  });

  afterEach(() => {
    cleanup();
  });

  test("shows required indicator when field is editable and required", () => {
    const onChange = mock((_value: string) => undefined);

    const { getByText } = render(
      <ProductIdField
        value=""
        onChange={onChange}
        validation={createValidationState(null)}
        required={true}
        isLocked={false}
      />
    );

    expect(getByText("*")).toBeDefined();
  });

  test("renders and wires lock toggle button when provided", () => {
    const onChange = mock((_value: string) => undefined);
    const onToggleLock = mock(() => undefined);

    const { getByTitle } = render(
      <ProductIdField
        value="prod-1"
        onChange={onChange}
        validation={createValidationState(null)}
        isLocked={false}
        onToggleLock={onToggleLock}
      />
    );

    fireEvent.click(getByTitle("Click to lock ID"));
    expect(onToggleLock).toHaveBeenCalledTimes(1);
  });

  test("renders read-only locked state and hides validation message", () => {
    const onChange = mock((_value: string) => undefined);
    const { getByPlaceholderText, queryByText } = render(
      <ProductIdField
        value="prod-1"
        onChange={onChange}
        validation={createValidationState("Invalid ID")}
        isLocked={true}
      />
    );

    const input = getByPlaceholderText(
      "Click lock to edit ID"
    ) as HTMLInputElement;

    expect(input.hasAttribute("readonly")).toBe(true);
    expect(input.hasAttribute("required")).toBe(false);
    expect(queryByText("Invalid ID")).toBeNull();
  });

  test("renders validation error message when unlocked", () => {
    const onChange = mock((_value: string) => undefined);
    const { getByText } = render(
      <ProductIdField
        value="bad id"
        onChange={onChange}
        validation={createValidationState(
          "Only letters, numbers, hyphens, and underscores allowed"
        )}
        isLocked={false}
      />
    );

    expect(
      getByText("Only letters, numbers, hyphens, and underscores allowed")
    ).toBeDefined();
  });

  test("shows duplicate-check spinner when duplicate check is in progress", () => {
    const onChange = mock((_value: string) => undefined);
    const { container } = render(
      <ProductIdField
        value="prod-2"
        onChange={onChange}
        validation={createValidationState(null, true)}
        isLocked={false}
      />
    );

    const spinner = container.querySelector(".animate-spin");
    expect(spinner).not.toBeNull();
  });
});
