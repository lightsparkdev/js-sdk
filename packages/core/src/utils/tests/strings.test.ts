// Copyright ©, 2026-present, Lightspark Group, Inc. - All Rights Reserved

import { stripNonPrintable } from "../strings.js";

describe("stripNonPrintable", () => {
  it.each([
    ["04814270\u202c", "04814270"], // pop directional formatting
    ["\u200bRua das Flores\u200e", "Rua das Flores"], // zero width space, ltr mark
    ["S\u00e3o\u00a0Paulo", "S\u00e3o Paulo"], // non-breaking space
    ["S\u00e3o Paulo", "S\u00e3o Paulo"], // visible non-ascii survives
    ["Apt 4\nFloor 2", "Apt 4\nFloor 2"], // newlines survive
    ["94105", "94105"],
    ["", ""],
  ])("cleans %j into %j", (value, expected) => {
    expect(stripNonPrintable(value)).toBe(expected);
  });
});
