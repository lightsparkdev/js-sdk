import { test, expect } from "@playwright/experimental-ct-react";
import {
  TestDefault,
  TestWithValue,
  TestRange,
  TestRangeWithValue,
  TestDisabled,
  TestMinMax,
  TestFullFeatured,
  TestWithTime,
  TestModeSwitch,
  TestReverseRange,
  TestSameDayRange,
  TestDateInput,
  TestRangeWithTime,
  TestYearBoundary,
  TestLeapYear,
  TestMondayStart,
  TestMinEqualsMax,
  TestLocaleDE,
  TestLocaleJA,
  TestControlledMonth,
  TestOnMonthChange,
  TestCustomLabels,
  TestRenderDay,
  TestLocaleWithTime,
  TestDateInputMinMax,
} from "./DatePicker.test-stories";

test.describe("DatePicker", () => {
  test("renders current month with weekday headers and day grid", async ({
    mount,
    page,
  }) => {
    await mount(<TestDefault />);

    await expect(page.getByText("February 2026")).toBeVisible();

    const grid = page.getByRole("grid", { name: "February 2026" });
    await expect(grid).toBeVisible();

    for (const abbr of [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]) {
      await expect(
        page.getByRole("columnheader", { name: abbr }),
      ).toBeVisible();
    }

    await expect(
      page.getByRole("button", { name: /Sunday, February 1, 2026/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Saturday, February 28, 2026/ }),
    ).toBeVisible();
  });

  test("navigates months with previous/next buttons", async ({
    mount,
    page,
  }) => {
    await mount(<TestDefault />);

    await expect(page.getByText("February 2026")).toBeVisible();

    await page.getByRole("button", { name: "Next month" }).click();
    await expect(page.getByText("March 2026")).toBeVisible();

    await page.getByRole("button", { name: "Previous month" }).click();
    await expect(page.getByText("February 2026")).toBeVisible();
  });

  test("selects a date in single mode", async ({ mount, page }) => {
    await mount(<TestDefault />);

    const selected = page.getByTestId("selected");
    await expect(selected).toHaveText("none");

    await page
      .getByRole("button", { name: /Wednesday, February 11, 2026/ })
      .click();
    await expect(selected).toHaveText("2026-02-11");

    const btn = page.getByRole("button", {
      name: /Wednesday, February 11, 2026/,
    });
    await expect(btn).toHaveAttribute("data-selected");
  });

  test("renders with initial value", async ({ mount, page }) => {
    await mount(<TestWithValue />);

    const selected = page.getByTestId("selected");
    await expect(selected).toHaveText("2026-02-15");

    const btn = page.getByRole("button", {
      name: /Sunday, February 15, 2026/,
    });
    await expect(btn).toHaveAttribute("data-selected");
  });

  test("selects a range with two clicks", async ({ mount, page }) => {
    await mount(<TestRange />);

    const rangeStart = page.getByTestId("range-start");
    const rangeEnd = page.getByTestId("range-end");
    await expect(rangeStart).toHaveText("none");

    await page
      .getByRole("button", { name: /Wednesday, February 11, 2026/ })
      .click();

    await page
      .getByRole("button", { name: /Sunday, February 15, 2026/ })
      .click();

    await expect(rangeStart).toHaveText("2026-02-11");
    await expect(rangeEnd).toHaveText("2026-02-15");
  });

  test("renders existing range with data attributes", async ({
    mount,
    page,
  }) => {
    await mount(<TestRangeWithValue />);

    const startBtn = page.getByRole("button", {
      name: /Wednesday, February 11, 2026/,
    });
    const endBtn = page.getByRole("button", {
      name: /Sunday, February 15, 2026/,
    });
    const midBtn = page.getByRole("button", {
      name: /Thursday, February 12, 2026/,
    });

    await expect(startBtn).toHaveAttribute("data-range-start");
    await expect(endBtn).toHaveAttribute("data-range-end");
    await expect(midBtn).toHaveAttribute("data-in-range");
  });

  test("prevents selection of disabled dates", async ({ mount, page }) => {
    await mount(<TestDisabled />);

    const selected = page.getByTestId("selected");

    const sundayBtn = page.getByRole("button", {
      name: /Sunday, February 1, 2026/,
    });
    await expect(sundayBtn).toHaveAttribute("data-disabled");
    await sundayBtn.click({ force: true });
    await expect(selected).toHaveText("none");

    await page
      .getByRole("button", { name: /Monday, February 2, 2026/ })
      .click();
    await expect(selected).toHaveText("2026-02-02");
  });

  test("respects min/max constraints", async ({ mount, page }) => {
    await mount(<TestMinMax />);

    const selected = page.getByTestId("selected");

    const beforeMin = page.getByRole("button", {
      name: /Wednesday, February 4, 2026/,
    });
    await expect(beforeMin).toHaveAttribute("data-disabled");

    const afterMax = page.getByRole("button", {
      name: /Thursday, February 26, 2026/,
    });
    await expect(afterMax).toHaveAttribute("data-disabled");

    await page
      .getByRole("button", { name: /Tuesday, February 10, 2026/ })
      .click();
    await expect(selected).toHaveText("2026-02-10");
  });

  test("outside-month days are faded but clickable", async ({
    mount,
    page,
  }) => {
    await mount(<TestDefault />);

    const marchDay = page.getByRole("button", {
      name: /Sunday, March 1, 2026/,
    });
    await expect(marchDay).toHaveAttribute("data-outside-month");

    // Clicking navigates to that month and selects the day
    await marchDay.click();
    await expect(page.getByText("March 2026")).toBeVisible();
    await expect(page.getByTestId("selected")).toHaveText("2026-03-01");
  });

  test("keyboard navigation with arrow keys", async ({ mount, page }) => {
    await mount(<TestDefault />);

    await page
      .getByRole("button", { name: /Sunday, February 15, 2026/ })
      .click();

    await page.keyboard.press("ArrowRight");
    const feb16 = page.getByRole("button", {
      name: /Monday, February 16, 2026/,
    });
    await expect(feb16).toBeFocused();

    await page.keyboard.press("ArrowDown");
    const feb23 = page.getByRole("button", {
      name: /Monday, February 23, 2026/,
    });
    await expect(feb23).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.getByTestId("selected")).toHaveText("2026-02-23");
  });

  test("renders full-featured calendar with auto-rendered header inputs", async ({
    mount,
    page,
  }) => {
    await mount(<TestFullFeatured />);

    // Auto-rendered header shows Start date / End date inputs
    await expect(page.getByLabel("Start date")).toBeVisible();
    await expect(page.getByLabel("End date")).toBeVisible();

    await expect(page.getByText("February 2026")).toBeVisible();

    // Controls section
    await expect(page.getByTestId("end-date-toggle")).toBeVisible();

    const applyBtn = page.getByTestId("apply-btn");
    await expect(applyBtn).toBeVisible();

    // Select a range
    await page
      .getByRole("button", { name: /Wednesday, February 11, 2026/ })
      .click();
    await page
      .getByRole("button", { name: /Sunday, February 15, 2026/ })
      .click();

    // Auto-rendered inputs should reflect values
    await expect(page.getByLabel("Start date")).toHaveValue("02/11/2026");
    await expect(page.getByLabel("End date")).toHaveValue("02/15/2026");

    await applyBtn.click();
    await expect(page.getByTestId("applied")).toHaveText("yes");
  });

  test("time input is visible when includeTime is true", async ({
    mount,
    page,
  }) => {
    await mount(<TestWithTime />);

    const dateInput = page.getByRole("textbox", { name: "Date" });
    const timeInput = page.getByRole("textbox", { name: "Time" });

    await expect(dateInput).toBeVisible();
    await expect(timeInput).toBeVisible();

    await expect(timeInput).toHaveValue("2:30 PM");
  });

  test("changing time input updates the value hours/minutes", async ({
    mount,
    page,
  }) => {
    await mount(<TestWithTime />);

    const timeInput = page.getByRole("textbox", { name: "Time" });
    await timeInput.fill("9:15 AM");
    await timeInput.blur();

    await expect(page.getByTestId("selected-hours")).toHaveText("9");
    await expect(page.getByTestId("selected-minutes")).toHaveText("15");
  });

  test("selecting a new date preserves existing time", async ({
    mount,
    page,
  }) => {
    await mount(<TestWithTime />);

    // Initial: Feb 11 at 14:30
    await expect(page.getByTestId("selected-hours")).toHaveText("14");
    await expect(page.getByTestId("selected-minutes")).toHaveText("30");

    // Click a different day
    await page
      .getByRole("button", { name: /Friday, February 20, 2026/ })
      .click();

    // Time should be preserved
    await expect(page.getByTestId("selected-hours")).toHaveText("14");
    await expect(page.getByTestId("selected-minutes")).toHaveText("30");
  });

  test("switching modes clears pending range state", async ({
    mount,
    page,
  }) => {
    await mount(<TestModeSwitch />);

    // Start a range: click first day (pendingStart is set)
    await page
      .getByRole("button", { name: /Wednesday, February 11, 2026/ })
      .click();

    // Switch to single, then back to range
    await page.getByTestId("toggle-mode").click();
    await page.getByTestId("toggle-mode").click();
    await expect(page.getByTestId("mode")).toHaveText("range");

    // Now click two fresh dates for a clean range
    await page
      .getByRole("button", { name: /Friday, February 20, 2026/ })
      .click();
    await page
      .getByRole("button", { name: /Monday, February 23, 2026/ })
      .click();

    await expect(page.getByTestId("selected")).toHaveText(
      "2026-02-20|2026-02-23",
    );
  });

  test("reverse range reorders start and end", async ({ mount, page }) => {
    await mount(<TestReverseRange />);

    // Click later date first, then earlier date
    await page
      .getByRole("button", { name: /Sunday, February 22, 2026/ })
      .click();
    await page
      .getByRole("button", { name: /Wednesday, February 11, 2026/ })
      .click();

    await expect(page.getByTestId("range-start")).toHaveText("2026-02-11");
    await expect(page.getByTestId("range-end")).toHaveText("2026-02-22");
  });

  test("same-day range (click same date twice)", async ({ mount, page }) => {
    await mount(<TestSameDayRange />);

    await page
      .getByRole("button", { name: /Sunday, February 15, 2026/ })
      .click();
    await page
      .getByRole("button", { name: /Sunday, February 15, 2026/ })
      .click();

    await expect(page.getByTestId("range-start")).toHaveText("2026-02-15");
    await expect(page.getByTestId("range-end")).toHaveText("2026-02-15");
  });

  test("typing a date in the input updates calendar view and selection", async ({
    mount,
    page,
  }) => {
    await mount(<TestDateInput />);

    const dateInput = page.getByRole("textbox", { name: "Date" });
    await expect(dateInput).toHaveValue("02/11/2026");

    // Type a date in a different month
    await dateInput.fill("06/20/2026");
    await dateInput.blur();

    await expect(page.getByTestId("selected")).toHaveText("2026-06-20");
    await expect(page.getByText("June 2026")).toBeVisible();
  });

  test("invalid date input reverts to previous value", async ({
    mount,
    page,
  }) => {
    await mount(<TestDateInput />);

    const dateInput = page.getByRole("textbox", { name: "Date" });
    await expect(dateInput).toHaveValue("02/11/2026");

    await dateInput.fill("99/99/9999");
    await dateInput.blur();

    // Should revert to the previous valid value
    await expect(dateInput).toHaveValue("02/11/2026");
    await expect(page.getByTestId("selected")).toHaveText("2026-02-11");
  });

  test("range with time shows all four inputs", async ({ mount, page }) => {
    await mount(<TestRangeWithTime />);

    const startDate = page.getByRole("textbox", { name: "Start date" });
    const startTime = page.getByRole("textbox", { name: "Start time" });
    const endDate = page.getByRole("textbox", { name: "End date" });
    const endTime = page.getByRole("textbox", { name: "End time" });

    await expect(startDate).toBeVisible();
    await expect(startTime).toBeVisible();
    await expect(endDate).toBeVisible();
    await expect(endTime).toBeVisible();

    await expect(startTime).toHaveValue("9:00 AM");
    await expect(endTime).toHaveValue("5:30 PM");
  });

  test("changing end time in range mode updates correctly", async ({
    mount,
    page,
  }) => {
    await mount(<TestRangeWithTime />);

    const endTime = page.getByRole("textbox", { name: "End time" });
    await endTime.fill("11:45 PM");
    await endTime.blur();

    await expect(page.getByTestId("end-hours")).toHaveText("23");
    await expect(page.getByTestId("end-minutes")).toHaveText("45");
  });

  test("navigates from December to January across year boundary", async ({
    mount,
    page,
  }) => {
    await mount(<TestYearBoundary />);

    await expect(page.getByText("December 2026")).toBeVisible();

    await page.getByRole("button", { name: "Next month" }).click();
    await expect(page.getByText("January 2027")).toBeVisible();

    await page.getByRole("button", { name: "Previous month" }).click();
    await expect(page.getByText("December 2026")).toBeVisible();
  });

  test("Feb 29 is selectable in a leap year", async ({ mount, page }) => {
    await mount(<TestLeapYear />);

    await expect(page.getByText("February 2028")).toBeVisible();

    const feb29 = page.getByRole("button", {
      name: /Tuesday, February 29, 2028/,
    });
    await expect(feb29).toBeVisible();
    await feb29.click();
    await expect(page.getByTestId("selected")).toHaveText("2028-02-29");
  });

  test("weekStartsOn=1 renders Monday as first column", async ({
    mount,
    page,
  }) => {
    await mount(<TestMondayStart />);

    const headers = page.getByRole("columnheader");
    const first = headers.first();
    await expect(first).toHaveAttribute("abbr", "Monday");
  });

  test("min equals max allows only one selectable day", async ({
    mount,
    page,
  }) => {
    await mount(<TestMinEqualsMax />);

    const feb14 = page.getByRole("button", {
      name: /Saturday, February 14, 2026/,
    });
    await expect(feb14).toHaveAttribute("data-disabled");

    const feb16 = page.getByRole("button", {
      name: /Monday, February 16, 2026/,
    });
    await expect(feb16).toHaveAttribute("data-disabled");

    const feb15 = page.getByRole("button", {
      name: /Sunday, February 15, 2026/,
    });
    await feb15.click();
    await expect(page.getByTestId("selected")).toHaveText("2026-02-15");
  });

  test("Enter key does not select a disabled date", async ({ mount, page }) => {
    await mount(<TestDisabled />);

    // Focus a weekday first
    await page
      .getByRole("button", { name: /Monday, February 2, 2026/ })
      .click();

    // Arrow left to Sunday (disabled)
    await page.keyboard.press("ArrowLeft");
    const sunday = page.getByRole("button", {
      name: /Sunday, February 1, 2026/,
    });
    await expect(sunday).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.getByTestId("selected")).toHaveText("2026-02-02");
  });

  test("time input parses 24-hour format", async ({ mount, page }) => {
    await mount(<TestWithTime />);

    const timeInput = page.getByRole("textbox", { name: "Time" });
    await timeInput.fill("23:45");
    await timeInput.blur();

    await expect(page.getByTestId("selected-hours")).toHaveText("23");
    await expect(page.getByTestId("selected-minutes")).toHaveText("45");
  });

  test("time input parses shorthand meridiem", async ({ mount, page }) => {
    await mount(<TestWithTime />);

    const timeInput = page.getByRole("textbox", { name: "Time" });
    await timeInput.fill("3:00p");
    await timeInput.blur();

    await expect(page.getByTestId("selected-hours")).toHaveText("15");
    await expect(page.getByTestId("selected-minutes")).toHaveText("0");
  });

  test("aria-selected is set on in-range dates", async ({ mount, page }) => {
    await mount(<TestRangeWithValue />);

    const midBtn = page.getByRole("button", {
      name: /Thursday, February 12, 2026/,
    });
    await expect(midBtn).toHaveAttribute("aria-selected", "true");

    const midBtn2 = page.getByRole("button", {
      name: /Friday, February 13, 2026/,
    });
    await expect(midBtn2).toHaveAttribute("aria-selected", "true");
  });

  test("nav buttons are disabled when adjacent month is out of min/max", async ({
    mount,
    page,
  }) => {
    await mount(<TestMinMax />);

    const prevBtn = page.getByRole("button", { name: "Previous month" });
    const nextBtn = page.getByRole("button", { name: "Next month" });

    await expect(prevBtn).toBeDisabled();
    await expect(nextBtn).toBeDisabled();
  });

  test("reverse range with time preserves correct start/end times", async ({
    mount,
    page,
  }) => {
    await mount(<TestRangeWithTime />);

    // Existing: start=Feb 11 9:00 AM, end=Feb 15 5:30 PM
    // Click later date first, then earlier date (reverse order)
    await page
      .getByRole("button", { name: /Friday, February 20, 2026/ })
      .click();
    await page
      .getByRole("button", { name: /Thursday, February 12, 2026/ })
      .click();

    // Verify dates via data attributes (timezone-safe)
    const startBtn = page.getByRole("button", {
      name: /Thursday, February 12, 2026/,
    });
    const endBtn = page.getByRole("button", {
      name: /Friday, February 20, 2026/,
    });
    await expect(startBtn).toHaveAttribute("data-range-start");
    await expect(endBtn).toHaveAttribute("data-range-end");

    // After reverse ordering, start keeps start time (9:00), end keeps end time (17:30)
    await expect(page.getByTestId("start-hours")).toHaveText("9");
    await expect(page.getByTestId("start-minutes")).toHaveText("0");
    await expect(page.getByTestId("end-hours")).toHaveText("17");
    await expect(page.getByTestId("end-minutes")).toHaveText("30");
  });

  test("time input commits on Enter via blur", async ({ mount, page }) => {
    await mount(<TestWithTime />);

    const timeInput = page.getByRole("textbox", { name: "Time" });
    await timeInput.fill("4:00 PM");
    await timeInput.press("Enter");

    await expect(page.getByTestId("selected-hours")).toHaveText("16");
    await expect(page.getByTestId("selected-minutes")).toHaveText("0");
  });

  test("locale=de-DE renders German month and weekday names", async ({
    mount,
    page,
  }) => {
    await mount(<TestLocaleDE />);

    await expect(page.getByText("Februar 2026")).toBeVisible();

    const headers = page.getByRole("columnheader");
    const first = headers.first();
    await expect(first).toHaveAttribute("abbr", "Sonntag");
  });

  test("locale=de-DE date input uses DD.MM.YYYY format", async ({
    mount,
    page,
  }) => {
    await mount(<TestLocaleDE />);

    const dateInput = page.getByRole("textbox", { name: "Datum" });
    await expect(dateInput).toBeVisible();

    // Type a German-format date
    await dateInput.fill("20.06.2026");
    await dateInput.blur();

    await expect(page.getByTestId("selected")).toHaveText("2026-06-20");
  });

  test("locale=ja-JP renders Japanese month names", async ({ mount, page }) => {
    await mount(<TestLocaleJA />);

    await expect(page.getByText("2026年2月")).toBeVisible();
  });

  test("controlled month prop drives the visible month", async ({
    mount,
    page,
  }) => {
    await mount(<TestControlledMonth />);

    await expect(page.getByText("February 2026")).toBeVisible();

    await page.getByTestId("jump-to-june").click();
    await expect(page.getByText("June 2026")).toBeVisible();
    await expect(page.getByTestId("view-month")).toHaveText("5");
  });

  test("controlled month updates via navigation buttons", async ({
    mount,
    page,
  }) => {
    await mount(<TestControlledMonth />);

    await page.getByRole("button", { name: "Next month" }).click();
    await expect(page.getByText("March 2026")).toBeVisible();
    await expect(page.getByTestId("view-month")).toHaveText("2");
  });

  test("onMonthChange fires when navigating", async ({ mount, page }) => {
    await mount(<TestOnMonthChange />);

    const log = page.getByTestId("month-log");
    await expect(log).toHaveText("");

    await page.getByRole("button", { name: "Next month" }).click();
    await expect(log).toHaveText("2026-2");

    await page.getByRole("button", { name: "Previous month" }).click();
    await expect(log).toHaveText("2026-2,2026-1");
  });

  test("custom labels override navigation aria-labels", async ({
    mount,
    page,
  }) => {
    await mount(<TestCustomLabels />);

    await expect(
      page.getByRole("button", { name: "Vorheriger Monat" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Nächster Monat" }),
    ).toBeVisible();
  });

  test("renderDay customizes day cell content", async ({ mount, page }) => {
    await mount(<TestRenderDay />);

    await expect(page.getByTestId("dot-5")).toBeVisible();
    await expect(page.getByTestId("dot-14")).toBeVisible();
    await expect(page.getByTestId("dot-20")).toBeVisible();

    // Clicking a rendered day still selects it
    await page
      .getByRole("button", { name: /Thursday, February 5, 2026/ })
      .click();
    await expect(page.getByTestId("selected")).toHaveText("2026-02-05");
  });

  test("locale=de-DE with time shows 24-hour format", async ({
    mount,
    page,
  }) => {
    await mount(<TestLocaleWithTime />);

    const timeInput = page.getByRole("textbox", { name: "Uhrzeit" });
    await expect(timeInput).toBeVisible();

    const timeValue = await timeInput.inputValue();
    expect(timeValue).toContain("14:30");
  });

  test("date input rejects out-of-range dates and reverts", async ({
    mount,
    page,
  }) => {
    await mount(<TestDateInputMinMax />);

    const dateInput = page.getByRole("textbox", { name: "Date" });
    await expect(dateInput).toHaveValue("02/11/2026");

    // Type a date before min (Feb 5)
    await dateInput.fill("02/01/2026");
    await dateInput.blur();

    await expect(dateInput).toHaveValue("02/11/2026");
    await expect(page.getByTestId("selected")).toHaveText("2026-02-11");

    // Type a date after max (Feb 25)
    await dateInput.fill("03/15/2026");
    await dateInput.blur();

    await expect(dateInput).toHaveValue("02/11/2026");
    await expect(page.getByTestId("selected")).toHaveText("2026-02-11");
  });

  test("invalid time input reverts to previous value", async ({
    mount,
    page,
  }) => {
    await mount(<TestWithTime />);

    const timeInput = page.getByRole("textbox", { name: "Time" });
    await expect(timeInput).toHaveValue("2:30 PM");

    await timeInput.fill("abc");
    await timeInput.blur();

    await expect(timeInput).toHaveValue("2:30 PM");
    await expect(page.getByTestId("selected-hours")).toHaveText("14");
    await expect(page.getByTestId("selected-minutes")).toHaveText("30");
  });

  test("keyboard PageDown/PageUp navigates months", async ({ mount, page }) => {
    await mount(<TestDefault />);

    await page
      .getByRole("button", { name: /Sunday, February 15, 2026/ })
      .click();

    await page.keyboard.press("PageDown");
    await expect(page.getByText("March 2026")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Sunday, March 15, 2026/ }),
    ).toHaveAttribute("tabindex", "0");

    // Re-focus the grid to enable PageUp
    await page.getByRole("button", { name: /Sunday, March 15, 2026/ }).focus();

    await page.keyboard.press("PageUp");
    await expect(page.getByText("February 2026")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Sunday, February 15, 2026/ }),
    ).toHaveAttribute("tabindex", "0");
  });

  test("keyboard Home moves to start of week, End to end", async ({
    mount,
    page,
  }) => {
    await mount(<TestDefault />);

    // Feb 11 2026 is Wednesday (weekStartsOn=0, so week starts Sunday)
    await page
      .getByRole("button", { name: /Wednesday, February 11, 2026/ })
      .click();

    await page.keyboard.press("Home");
    await expect(
      page.getByRole("button", { name: /Sunday, February 8, 2026/ }),
    ).toBeFocused();

    await page.keyboard.press("End");
    await expect(
      page.getByRole("button", { name: /Saturday, February 14, 2026/ }),
    ).toBeFocused();
  });

  test("keyboard Space selects focused date", async ({ mount, page }) => {
    await mount(<TestDefault />);

    await page
      .getByRole("button", { name: /Sunday, February 15, 2026/ })
      .click();

    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("button", { name: /Monday, February 16, 2026/ }),
    ).toBeFocused();

    await page.keyboard.press(" ");
    await expect(page.getByTestId("selected")).toHaveText("2026-02-16");
  });

  test("range hover preview shows in-range highlight", async ({
    mount,
    page,
  }) => {
    await mount(<TestRange />);

    // First click sets pendingStart
    await page
      .getByRole("button", { name: /Wednesday, February 11, 2026/ })
      .click();

    // Hover over a later date
    await page
      .getByRole("button", { name: /Sunday, February 15, 2026/ })
      .hover();

    // Mid-range day should show in-range preview
    const midBtn = page.getByRole("button", {
      name: /Thursday, February 12, 2026/,
    });
    await expect(midBtn).toHaveAttribute("data-in-range");

    // Start and end should show range markers
    const startBtn = page.getByRole("button", {
      name: /Wednesday, February 11, 2026/,
    });
    const endBtn = page.getByRole("button", {
      name: /Sunday, February 15, 2026/,
    });
    await expect(startBtn).toHaveAttribute("data-range-start");
    await expect(endBtn).toHaveAttribute("data-range-end");
  });

  test("typing start date past end date swaps with correct times", async ({
    mount,
    page,
  }) => {
    await mount(<TestRangeWithTime />);

    // Existing: start=Feb 11 9:00 AM, end=Feb 15 5:30 PM
    const startDate = page.getByRole("textbox", { name: "Start date" });

    // Type a start date after the end date
    await startDate.fill("02/20/2026");
    await startDate.blur();

    // Dates should swap: Feb 15 becomes start, Feb 20 becomes end
    const newStartBtn = page.getByRole("button", {
      name: /Sunday, February 15, 2026/,
    });
    const newEndBtn = page.getByRole("button", {
      name: /Friday, February 20, 2026/,
    });
    await expect(newStartBtn).toHaveAttribute("data-range-start");
    await expect(newEndBtn).toHaveAttribute("data-range-end");

    // Times should stay in their roles: start keeps 9:00, end keeps 17:30
    await expect(page.getByTestId("start-hours")).toHaveText("9");
    await expect(page.getByTestId("start-minutes")).toHaveText("0");
    await expect(page.getByTestId("end-hours")).toHaveText("17");
    await expect(page.getByTestId("end-minutes")).toHaveText("30");
  });
});
