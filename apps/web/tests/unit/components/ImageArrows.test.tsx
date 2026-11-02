import Arrows from "@/components/Image/Arrows";
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

describe("Image arrows", () => {
  beforeAll(() => registerHappyDom());
  afterAll(() => unregisterHappyDom());
  afterEach(() => cleanup());

  test.each([
    { name: "Previous image", index: 0, expected: 2 },
    { name: "Next image", index: 2, expected: 0 },
  ])(
    "$name keeps its accessible label and wraps at the boundary",
    ({ name, index, expected }) => {
      const setIndex = mock(() => undefined);
      const { getByRole } = render(
        <Arrows index={index} setIndex={setIndex} length={3} />
      );
      fireEvent.click(getByRole("button", { name }));
      expect(setIndex).toHaveBeenCalledWith(expected);
    }
  );
});
