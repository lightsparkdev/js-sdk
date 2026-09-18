import { describe, expect, it } from "vitest";
import { resolveDatePickerPreset } from "./resolvePreset";
import type { DatePickerPreset } from "./types";

describe("resolveDatePickerPreset", () => {
  it.each([
    {
      label: "throws",
      resolve: () => {
        throw new Error("resolver failed");
      },
    },
    { label: "returns null", resolve: () => null },
    {
      label: "omits the required value",
      resolve: () => ({ mode: "single", granularity: "date" }),
    },
    {
      label: "returns an invalid Date",
      resolve: () => ({
        mode: "single",
        granularity: "date",
        value: new Date(Number.NaN),
      }),
    },
    {
      label: "returns a reversed range",
      resolve: () => ({
        mode: "range",
        granularity: "date",
        value: {
          start: new Date("2026-08-02T00:00:00.000Z"),
          end: new Date("2026-08-01T00:00:00.000Z"),
        },
      }),
    },
  ])("fails closed when a resolver $label", ({ resolve }) => {
    const preset = {
      resolve,
    } as unknown as Pick<DatePickerPreset, "resolve">;

    expect(
      resolveDatePickerPreset(preset, new Date("2026-08-01T00:00:00.000Z")),
    ).toBeNull();
  });

  it.each([
    {
      expectedShape: { mode: "range", granularity: "date" } as const,
      result: {
        mode: "single",
        granularity: "date",
        value: new Date("2026-08-01T00:00:00.000Z"),
      },
    },
    {
      expectedShape: { mode: "single", granularity: "date-time" } as const,
      result: {
        mode: "single",
        granularity: "date",
        value: new Date("2026-08-01T00:00:00.000Z"),
      },
    },
  ])(
    "rejects $result.mode/$result.granularity against the expected shape",
    ({ expectedShape, result }) => {
      const preset = {
        resolve: () => result,
      } as Pick<DatePickerPreset, "resolve">;

      expect(
        resolveDatePickerPreset(
          preset,
          new Date("2026-08-01T00:00:00.000Z"),
          expectedShape,
        ),
      ).toBeNull();
    },
  );
});
