import { describe, expect, it } from "vitest";
import { formatDateTime, humanizeIdentifier } from "./formatters";

describe("humanizeIdentifier", () => {
  it.each([
    ["QUOTE_EXECUTION_FAILED", "Quote execution failed"],
    ["already_readable", "Already readable"],
    ["SINGLE", "Single"],
    ["", ""],
  ])("humanizes %j as %j", (value, expected) => {
    expect(humanizeIdentifier(value)).toBe(expected);
  });

  it("supports title capitalization when the consumer requires it", () => {
    expect(
      humanizeIdentifier("QUOTE_EXECUTION_FAILED", {
        capitalization: "title",
      }),
    ).toBe("Quote Execution Failed");
  });
});

describe("formatDateTime", () => {
  it("formats a UTC instant with caller-owned locale and options", () => {
    expect(
      formatDateTime("2026-01-05T14:03:00Z", "en-US", {
        month: "short",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
        timeZoneName: "short",
      }),
    ).toBe("Jan 05, 2:03 PM UTC");
  });
});
