import { DatePicker, type DatePickerTimeZone } from "../src";

const utcTimeZone: DatePickerTimeZone = "UTC";

<DatePicker.Root timeZone={utcTimeZone} />;
<DatePicker.Root timeZone="local" />;
// @ts-expect-error Arbitrary IANA zones are not supported.
<DatePicker.Root timeZone="America/New_York" />;
