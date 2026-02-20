import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from "bun:test";
import { registerHappyDom, unregisterHappyDom } from "../../setup/happy-dom";

function createDeferredPromise() {
  let resolve: () => void;
  let reject: (error: unknown) => void;

  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
}

describe("ConfirmDeleteModal", () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    registerHappyDom();
  });

  afterAll(() => {
    unregisterHappyDom();
  });

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = mock(() => undefined) as typeof console.error;
  });

  afterEach(() => {
    console.error = originalConsoleError;
    cleanup();
  });

  test("calls onConfirm and onCancel when delete succeeds", async () => {
    const onCancel = mock(() => undefined);
    const deferred = createDeferredPromise();
    const onConfirm = mock(async () => {
      await deferred.promise;
    });

    const { getByRole } = render(
      <ConfirmDeleteModal
        isOpen={true}
        title="Delete"
        message="Delete this product?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(getByRole("button", { name: "Delete" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(getByRole("button", { name: "Deleting..." })).toBeDefined();

    deferred.resolve();

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  test("keeps modal open when delete fails", async () => {
    const onCancel = mock(() => undefined);
    const onConfirm = mock(async () => {
      throw new Error("boom");
    });

    const { getByRole } = render(
      <ConfirmDeleteModal
        isOpen={true}
        title="Delete"
        message="Delete this product?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    expect(onCancel).not.toHaveBeenCalled();
    expect(getByRole("button", { name: "Delete" })).toBeDefined();
  });

  test("disables action buttons while deleting", async () => {
    const onCancel = mock(() => undefined);
    const deferred = createDeferredPromise();
    const onConfirm = mock(async () => {
      await deferred.promise;
    });

    const { getByRole } = render(
      <ConfirmDeleteModal
        isOpen={true}
        title="Delete"
        message="Delete this product?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const cancelButton = getByRole("button", { name: "Cancel" });
    fireEvent.click(getByRole("button", { name: "Delete" }));

    const deletingButton = getByRole("button", { name: "Deleting..." });

    expect(cancelButton.getAttribute("disabled")).not.toBeNull();
    expect(deletingButton.getAttribute("disabled")).not.toBeNull();

    deferred.resolve();

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
