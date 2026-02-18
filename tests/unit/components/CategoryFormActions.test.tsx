import {
  CategoryFormActions,
  CategoryFormError,
} from "@/components/CategoryForm/CategoryFormActions";
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

describe("CategoryFormError", () => {
  beforeAll(() => {
    registerHappyDom();
  });

  afterAll(() => {
    unregisterHappyDom();
  });

  afterEach(() => {
    cleanup();
  });

  test("renders nothing when error is empty", () => {
    const { container } = render(<CategoryFormError error="" />);

    expect(container.innerHTML).toBe("");
  });

  test("renders an error message when provided", () => {
    const { getByText } = render(<CategoryFormError error="Save failed" />);

    expect(getByText("Save failed")).toBeDefined();
  });
});

describe("CategoryFormActions", () => {
  beforeAll(() => {
    registerHappyDom();
  });

  afterAll(() => {
    unregisterHappyDom();
  });

  afterEach(() => {
    cleanup();
  });

  test("calls cancel and submit handlers", () => {
    const onCancel = mock(() => undefined);
    const onSubmit = mock((e: React.FormEvent) => {
      e.preventDefault();
    });

    const { getByRole } = render(
      <CategoryFormActions
        onCancel={onCancel}
        onSubmit={onSubmit}
        isLoading={false}
        isValid={true}
        submitText="Save"
        loadingText="Saving..."
      />
    );

    fireEvent.click(getByRole("button", { name: "Cancel" }));
    fireEvent.click(getByRole("button", { name: "Save" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test("disables buttons and shows loading text while loading", () => {
    const onCancel = mock(() => undefined);
    const onSubmit = mock((e: React.FormEvent) => {
      e.preventDefault();
    });

    const { getByRole } = render(
      <CategoryFormActions
        onCancel={onCancel}
        onSubmit={onSubmit}
        isLoading={true}
        isValid={true}
        submitText="Save"
        loadingText="Saving..."
      />
    );

    const cancelButton = getByRole("button", { name: "Cancel" });
    const submitButton = getByRole("button", { name: "Saving..." });

    expect(cancelButton.hasAttribute("disabled")).toBe(true);
    expect(submitButton.hasAttribute("disabled")).toBe(true);
  });

  test("disables submit button when form is invalid", () => {
    const onCancel = mock(() => undefined);
    const onSubmit = mock((e: React.FormEvent) => {
      e.preventDefault();
    });

    const { getByRole } = render(
      <CategoryFormActions
        onCancel={onCancel}
        onSubmit={onSubmit}
        isLoading={false}
        isValid={false}
        submitText="Save"
        loadingText="Saving..."
      />
    );

    const submitButton = getByRole("button", { name: "Save" });
    expect(submitButton.hasAttribute("disabled")).toBe(true);
  });
});
