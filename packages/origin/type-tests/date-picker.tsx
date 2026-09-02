import { createRef } from "react";
import {
  DatePicker,
  type DatePickerPreset,
  type DatePickerPresetResult,
  type DatePickerTimeZone,
} from "../src";

const utcTimeZone: DatePickerTimeZone = "UTC";

<DatePicker.Root timeZone={utcTimeZone} />;
<DatePicker.Root timeZone="local" />;
const actionsRef = createRef<DatePicker.DatePickerActions>();
<DatePicker.Root actionsRef={actionsRef} />;
// @ts-expect-error Shape toggle controls are not part of the public API.
<DatePicker.EndDateControl />;
// @ts-expect-error Shape toggle controls are not part of the public API.
<DatePicker.IncludeTimeControl />;
<DatePicker.Root>
  <DatePicker.Grid
    onKeyDown={(event) => event.preventBaseUIHandler()}
    onMouseLeave={(event) => event.preventBaseUIHandler()}
  />
</DatePicker.Root>;
// @ts-expect-error Arbitrary IANA zones are not supported.
<DatePicker.Root timeZone="America/New_York" />;

const invalidSinglePresetResult: DatePickerPresetResult = {
  mode: "single",
  // @ts-expect-error Single presets resolve one Date, not a range.
  value: { start: new Date(), end: new Date() },
  granularity: "date",
};
void invalidSinglePresetResult;

const accessiblePreset: DatePickerPreset = {
  id: "today",
  label: <strong>Today</strong>,
  textValue: "Today",
  resolve: (now) => ({
    mode: "single",
    value: now,
    granularity: "date",
  }),
};
void accessiblePreset;

// @ts-expect-error Presets require an isolated string for typeahead.
const missingTextValue: DatePickerPreset = {
  id: "today",
  label: "Today",
  resolve: (now) => ({
    mode: "single",
    value: now,
    granularity: "date",
  }),
};
void missingTextValue;
