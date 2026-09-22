import { describe, expect, it } from "vitest";
import { stripNonPrintable } from "./text";

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
