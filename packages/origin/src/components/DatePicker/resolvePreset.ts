import type {
  DatePickerGranularity,
  DatePickerMode,
  DatePickerPreset,
  DatePickerPresetResult,
} from "./types";

export interface DatePickerPresetShape {
  mode: DatePickerMode;
  granularity: DatePickerGranularity;
}

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

export function resolveDatePickerPreset(
  preset: Pick<DatePickerPreset, "resolve">,
  now: Date,
  expectedShape?: DatePickerPresetShape,
): DatePickerPresetResult | null {
  try {
    // Resolvers get a private copy so one that mutates its argument cannot
    // move the caller's `now` (used as the validation ceiling downstream).
    const result: unknown = preset.resolve(new Date(now.getTime()));
    if (!isRecord(result)) {
      return null;
    }

    const { mode, granularity } = result;
    if (
      (mode !== "single" && mode !== "range") ||
      (granularity !== "date" && granularity !== "date-time") ||
      (expectedShape !== undefined &&
        (mode !== expectedShape.mode ||
          granularity !== expectedShape.granularity))
    ) {
      return null;
    }

    if (mode === "single") {
      return isValidDate(result.value)
        ? { mode, granularity, value: result.value }
        : null;
    }

    const value = result.value;
    if (
      !isRecord(value) ||
      !isValidDate(value.start) ||
      !isValidDate(value.end) ||
      value.start.getTime() > value.end.getTime()
    ) {
      return null;
    }
    return {
      mode,
      granularity,
      value: { start: value.start, end: value.end },
    };
  } catch {
    return null;
  }
}
