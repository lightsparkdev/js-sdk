import { describe, expect, it, vi } from "vitest";
import { sanitizeOnValueChange, stripNonPrintable } from "./text";

describe("stripNonPrintable", () => {
  it.each([
    ["04814270\u202c", "04814270"], // pop directional formatting
    ["\u200bRua das Flores\u200e", "Rua das Flores"], // zero width space, ltr mark
    ["São\u00a0Paulo", "São Paulo"], // non-breaking space
    ["São Paulo", "São Paulo"], // visible non-ascii survives
    ["Apt 4\nFloor 2", "Apt 4\nFloor 2"], // newlines survive
    ["94105", "94105"],
    ["", ""],
  ])("cleans %j into %j", (value, expected) => {
    expect(stripNonPrintable(value)).toBe(expected);
  });
});

describe("sanitizeOnValueChange", () => {
  it("strips the value before it reaches the handler", () => {
    const handler = vi.fn();
    const eventDetails = { reason: "input" };

    sanitizeOnValueChange(handler)?.("04814270\u202c", eventDetails);

    expect(handler).toHaveBeenCalledExactlyOnceWith("04814270", eventDetails);
  });

  it("passes undefined through when no handler is given", () => {
    expect(sanitizeOnValueChange(undefined)).toBeUndefined();
  });
});
