import Modal from "@/components/Modal";
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

describe("Modal", () => {
  beforeAll(() => {
    registerHappyDom();
  });

  afterAll(() => {
    unregisterHappyDom();
  });

  afterEach(() => {
    cleanup();
  });

  test("renders nothing when closed", () => {
    const onClose = mock(() => undefined);

    const { container } = render(
      <Modal isOpen={false} onClose={onClose} title="Title">
        <div>Content</div>
      </Modal>
    );

    expect(container.innerHTML).toBe("");
  });

  test("closes when backdrop is clicked", () => {
    const onClose = mock(() => undefined);

    const { container } = render(
      <Modal isOpen={true} onClose={onClose} title="Title">
        <div>Content</div>
      </Modal>
    );

    const backdrop = container.firstElementChild as HTMLElement;
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("does not close when modal content is clicked", () => {
    const onClose = mock(() => undefined);

    const { getByText } = render(
      <Modal isOpen={true} onClose={onClose} title="Title">
        <div>Content</div>
      </Modal>
    );

    fireEvent.click(getByText("Content"));

    expect(onClose).not.toHaveBeenCalled();
  });

  test("renders header and floating close controls when enabled", () => {
    const onClose = mock(() => undefined);

    const { getAllByLabelText, getByText } = render(
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Delete Product"
        showHeaderCloseButton={true}
        showFloatingCloseButton={true}
        autoHeight={true}
        size="lg"
      >
        <div>Body</div>
      </Modal>
    );

    expect(getByText("Delete Product")).toBeDefined();

    const closeButtons = getAllByLabelText("Close Modal");
    expect(closeButtons).toHaveLength(2);

    const modalRoot = getByText("Body").parentElement
      ?.parentElement as HTMLElement;
    expect(modalRoot.className).toContain("max-h-[60vh]");
  });
});
