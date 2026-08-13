import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const timestamps = [
  "2026-01-15T12:34:00.000Z",
  "2026-08-15T12:34:00.000Z",
  "2026-03-08T02:30:00.000Z",
  "2026-11-01T01:30:00.000Z",
];

function getLosAngelesConversionResults() {
  const dateUtilsURL = pathToFileURL(
    fileURLToPath(
      new URL(
        "../../../../../packages/ui/dist/components/DataManagerTable/date_utils.js",
        import.meta.url,
      ),
    ),
  ).href;
  const script = `
    import {
      toLocalDateTimeFromUTC,
      toUTCDateTimeFromLocal,
    } from ${JSON.stringify(dateUtilsURL)};

    const timestamps = ${JSON.stringify(timestamps)};
    const roundTrips = timestamps.map((timestamp) => {
      const utcDate = new Date(timestamp);
      const pickerDate = toLocalDateTimeFromUTC(utcDate);
      return {
        timestamp,
        offset: pickerDate.getTimezoneOffset(),
        result: toUTCDateTimeFromLocal(pickerDate, utcDate).toISOString(),
      };
    });

    const originalUTCDate = new Date("2026-03-08T02:30:00.000Z");
    const editedPickerDate = toLocalDateTimeFromUTC(originalUTCDate);
    editedPickerDate.setMinutes(editedPickerDate.getMinutes() + 30);

    process.stdout.write(JSON.stringify({
      roundTrips,
      editedResult: toUTCDateTimeFromLocal(
        editedPickerDate,
        originalUTCDate,
      ).toISOString(),
    }));
  `;

  return JSON.parse(
    execFileSync(process.execPath, ["--input-type=module", "--eval", script], {
      encoding: "utf8",
      env: { ...process.env, TZ: "America/Los_Angeles" },
    }),
  ) as {
    roundTrips: { timestamp: string; offset: number; result: string }[];
    editedResult: string;
  };
}

describe("DataManagerTable date conversions", () => {
  const results = getLosAngelesConversionResults();

  test.each([
    ["2026-01-15T12:34:00.000Z", 480],
    ["2026-08-15T12:34:00.000Z", 420],
    ["2026-03-08T02:30:00.000Z", 420],
    ["2026-11-01T01:30:00.000Z", 420],
  ])(
    "round-trips %s through the local date picker",
    (timestamp, expectedOffset) => {
      const result = results.roundTrips.find(
        (entry) => entry.timestamp === timestamp,
      );

      expect(result).toEqual({
        timestamp,
        offset: expectedOffset,
        result: timestamp,
      });
    },
  );

  test("converts an edited picker value from its local wall-clock fields", () => {
    expect(results.editedResult).toBe("2026-03-08T04:00:00.000Z");
  });
});
