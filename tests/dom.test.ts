import { test, expect } from "vitest";

import { isPointerWithinRect } from "../src/util/dom";

function createElWithRect(rect: {
  top: number;
  bottom: number;
  left: number;
  right: number;
}) {
  const el = document.createElement("div");

  el.getBoundingClientRect = () => ({
    ...rect,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
    x: rect.left,
    y: rect.top,
    toJSON: () => ({}),
  });

  return el;
}

test("Pointer inside the element's bounds counts as within the rect", () => {
  const el = createElWithRect({ top: 0, bottom: 100, left: 0, right: 100 });
  const event = new MouseEvent("pointermove", { clientX: 50, clientY: 50 });

  expect(isPointerWithinRect(event, el)).toBe(true);
});

test("Pointer over a portaled overlay that visually overlaps the element still counts as within the rect", () => {
  const el = createElWithRect({ top: 0, bottom: 100, left: 0, right: 100 });
  // Simulates hovering a floating/portaled control rendered on top of `el`
  // but not nested inside it in the DOM.
  const overlay = document.body;
  const event = new MouseEvent("pointermove", { clientX: 90, clientY: 10 });

  overlay.dispatchEvent(event);

  expect(isPointerWithinRect(event, el)).toBe(true);
});

test("Pointer outside the element's bounds does not count as within the rect", () => {
  const el = createElWithRect({ top: 0, bottom: 100, left: 0, right: 100 });
  const event = new MouseEvent("pointermove", {
    clientX: 200,
    clientY: 200,
  });

  expect(isPointerWithinRect(event, el)).toBe(false);
});
