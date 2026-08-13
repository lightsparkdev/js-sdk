import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("DatePicker preset controls client boundary", () => {
  it('starts the preset controls module with "use client"', () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/DatePicker/presetControls.tsx"),
      "utf8",
    );

    expect(source).toMatch(/^"use client";/);
  });
});
