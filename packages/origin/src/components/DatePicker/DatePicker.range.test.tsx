import { test, expect } from "@playwright/experimental-ct-react";
import type { Page } from "playwright-core";
import {
  TestCallbackOnlyRangeDraft,
  TestControlledRangeDraft,
  TestEmptyRangeWithTime,
  TestFixedControlledRange,
  TestRangeWithTime,
  TestRejectingControlledRange,
  TestSameDayRangeWithTime,
  TestUncontrolledRangeWithTime,
} from "./DatePicker.test-stories";

interface ValidationTraceEntry {
  event: string;
  hasError: boolean;
  invalid: boolean;
  value: string;
}

async function startValidationTrace(
  page: Page,
  inputLabel: string,
  dayLabel: string,
) {
  await page.evaluate(
    ({ dayLabel, inputLabel }) => {
      const input = Array.from(document.querySelectorAll("input")).find(
        (element) => element.getAttribute("aria-label") === inputLabel,
      );
      const day = Array.from(document.querySelectorAll("button")).find(
        (element) => element.getAttribute("aria-label") === dayLabel,
      );
      if (!input || !day) {
        throw new Error("DatePicker trace targets were not found");
      }

      const trace: ValidationTraceEntry[] = [];
      const snapshot = (event: string) => {
        trace.push({
          event,
          hasError: Array.from(document.querySelectorAll("*")).some(
            (element) => element.textContent === "Enter a valid date",
          ),
          invalid: input.getAttribute("aria-invalid") === "true",
          value: input.value,
        });
      };
      input.addEventListener("blur", () => snapshot("blur"));
      day.addEventListener("pointerdown", () => snapshot("pointerdown"));
      day.addEventListener("click", () => snapshot("click"));
      const observer = new MutationObserver(() => snapshot("mutation"));
      observer.observe(document.body, {
        attributeFilter: ["aria-describedby", "aria-invalid"],
        attributes: true,
        childList: true,
        subtree: true,
      });

      Object.assign(window, {
        __datePickerValidationObserver: observer,
        __datePickerValidationTrace: trace,
      });
    },
    { dayLabel, inputLabel },
  );
}

async function stopValidationTrace(page: Page) {
  return page.evaluate(() => {
    const traceWindow = window as typeof window & {
      __datePickerValidationObserver?: MutationObserver;
      __datePickerValidationTrace?: ValidationTraceEntry[];
    };
    traceWindow.__datePickerValidationObserver?.disconnect();
    return traceWindow.__datePickerValidationTrace ?? [];
  });
}

test.describe("DatePicker range ownership and ordering", () => {
  test("restores the controlled range when a completed update is rejected", async ({
    mount,
    page,
  }) => {
    await mount(<TestRejectingControlledRange />);

    const endDate = page.getByRole("textbox", { name: "End date" });
    await endDate.fill("02/20/2026");
    await endDate.blur();

    await expect(page.getByTestId("attempted-end")).toHaveText("2026-02-20");
    await expect(page.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/11/2026",
    );
    await expect(endDate).toHaveValue("02/15/2026");
  });

  test("keeps a fixed controlled range when no change handler is provided", async ({
    mount,
    page,
  }) => {
    await mount(<TestFixedControlledRange />);

    const endDate = page.getByRole("textbox", { name: "End date" });
    await endDate.fill("02/20/2026");
    await endDate.blur();

    await expect(page.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/11/2026",
    );
    await expect(endDate).toHaveValue("02/15/2026");
  });

  test("displays a completed range accepted by the controlled parent", async ({
    mount,
    page,
  }) => {
    await mount(<TestRangeWithTime />);

    const endDate = page.getByRole("textbox", { name: "End date" });
    await endDate.fill("02/20/2026");
    await endDate.blur();

    await expect(endDate).toHaveValue("02/20/2026");
  });

  test("uses a focused endpoint for the next calendar click", async ({
    mount,
    page,
  }) => {
    await mount(<TestRangeWithTime />);

    const endDate = page.getByRole("textbox", { name: "End date" });
    await endDate.focus();
    await page
      .getByRole("button", { name: "Friday, February 20, 2026" })
      .click();

    await expect(page.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/11/2026",
    );
    await expect(endDate).toHaveValue("02/20/2026");
    await expect(page.getByRole("textbox", { name: "End time" })).toHaveValue(
      "5:30 PM",
    );
  });

  for (const { dayLabel, expectedEnd, expectedStart, inputLabel, testName } of [
    {
      dayLabel: "Tuesday, February 10, 2026",
      expectedEnd: "02/15/2026",
      expectedStart: "02/10/2026",
      inputLabel: "Start date",
      testName: "replacing Start date",
    },
    {
      dayLabel: "Friday, February 20, 2026",
      expectedEnd: "02/20/2026",
      expectedStart: "02/11/2026",
      inputLabel: "End date",
      testName: "replacing End date",
    },
    {
      dayLabel: "Thursday, February 5, 2026",
      expectedEnd: "02/11/2026",
      expectedStart: "02/05/2026",
      inputLabel: "End date",
      testName: "cleared End crosses before Start",
    },
    {
      dayLabel: "Friday, February 20, 2026",
      expectedEnd: "02/20/2026",
      expectedStart: "02/15/2026",
      inputLabel: "Start date",
      testName: "cleared Start crosses after End",
    },
  ]) {
    test(`preserves range roles without transient validation when ${testName}`, async ({
      mount,
      page,
    }) => {
      await mount(<TestRangeWithTime />);

      const input = page.getByRole("textbox", { name: inputLabel });
      await input.fill("");
      await startValidationTrace(page, inputLabel, dayLabel);
      await page.getByRole("button", { name: dayLabel }).click();

      await expect(
        page.getByRole("textbox", { name: "Start date" }),
      ).toHaveValue(expectedStart);
      await expect(
        page.getByRole("textbox", { name: "Start time" }),
      ).toHaveValue("9:00 AM");
      await expect(page.getByRole("textbox", { name: "End date" })).toHaveValue(
        expectedEnd,
      );
      await expect(page.getByRole("textbox", { name: "End time" })).toHaveValue(
        "5:30 PM",
      );
      const trace = await stopValidationTrace(page);
      expect(trace.filter((entry) => entry.hasError || entry.invalid)).toEqual(
        [],
      );
    });
  }

  test("shows invalid state when a cleared endpoint leaves the DatePicker", async ({
    mount,
    page,
  }) => {
    await mount(
      <>
        <TestRangeWithTime />
        <button type="button">Outside</button>
      </>,
    );

    const startDate = page.getByRole("textbox", { name: "Start date" });
    await startDate.fill("");
    await page.getByRole("button", { name: "Outside" }).click();

    await expect(startDate).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Enter a valid date")).toBeVisible();
  });

  test("shows invalid state when a calendar replacement is canceled", async ({
    mount,
    page,
  }) => {
    await mount(<TestRangeWithTime />);

    const endDate = page.getByRole("textbox", { name: "End date" });
    const day = page.getByRole("button", {
      name: "Friday, February 20, 2026",
    });
    await endDate.fill("");
    await day.dispatchEvent("pointerdown");
    await endDate.evaluate((element) => element.blur());
    await day.dispatchEvent("pointercancel");

    await expect(endDate).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Enter a valid date")).toBeVisible();
  });

  test("shows invalid state when a calendar replacement does not complete", async ({
    mount,
    page,
  }) => {
    await mount(<TestRangeWithTime />);

    const startDate = page.getByRole("textbox", { name: "Start date" });
    const day = page.getByRole("button", {
      name: "Tuesday, February 10, 2026",
    });
    await startDate.fill("");
    await day.dispatchEvent("pointerdown");
    await startDate.evaluate((element) => element.blur());
    await day.dispatchEvent("pointerup");
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 0)));

    await expect(startDate).toHaveValue("");
    await expect(startDate).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Enter a valid date")).toBeVisible();
  });

  test("keeps endpoint intent when an internal pointer does not move focus", async ({
    mount,
    page,
  }) => {
    await mount(<TestRangeWithTime />);

    const endDate = page.getByRole("textbox", { name: "End date" });
    const dayButton = page.getByRole("button", {
      name: "Friday, February 20, 2026",
    });
    await endDate.focus();
    await dayButton.dispatchEvent("pointerdown");
    await endDate.evaluate((element) => element.blur());
    await dayButton.dispatchEvent("pointerup");
    await dayButton.dispatchEvent("click");

    await expect(page.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/11/2026",
    );
    await expect(endDate).toHaveValue("02/20/2026");
  });

  test("resets an internal pointer handoff when no click follows", async ({
    mount,
    page,
  }) => {
    await mount(<TestRangeWithTime />);

    const endDate = page.getByRole("textbox", { name: "End date" });
    const firstDay = page.getByRole("button", {
      name: "Friday, February 20, 2026",
    });
    await endDate.focus();
    await firstDay.dispatchEvent("pointerdown");
    await endDate.evaluate((element) => element.blur());
    await firstDay.dispatchEvent("pointerup");
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 0)));

    const nextMonth = page.getByRole("button", { name: "Next month" });
    await nextMonth.focus();
    await nextMonth.evaluate((element) => element.blur());
    await firstDay.click();
    await page
      .getByRole("button", { name: "Tuesday, February 24, 2026" })
      .click();

    await expect(page.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/20/2026",
    );
    await expect(endDate).toHaveValue("02/24/2026");
  });

  test("discards endpoint intent when focus leaves the DatePicker", async ({
    mount,
    page,
  }) => {
    await mount(
      <>
        <TestRangeWithTime />
        <button type="button">Outside</button>
      </>,
    );

    await page.getByRole("textbox", { name: "End date" }).focus();
    await page
      .getByRole("button", { name: "Friday, February 20, 2026" })
      .focus();
    await page.getByRole("button", { name: "Outside" }).focus();
    await page
      .getByRole("button", { name: "Friday, February 20, 2026" })
      .click();
    await page
      .getByRole("button", { name: "Tuesday, February 24, 2026" })
      .click();

    await expect(page.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/20/2026",
    );
    await expect(page.getByRole("textbox", { name: "End date" })).toHaveValue(
      "02/24/2026",
    );
  });

  test("keeps endpoint intent through internal calendar navigation", async ({
    mount,
    page,
  }) => {
    await mount(<TestRangeWithTime />);

    await page.getByRole("textbox", { name: "End date" }).focus();
    await page.getByRole("button", { name: "Next month" }).click();
    await page.getByRole("button", { name: "Friday, March 20, 2026" }).click();

    await expect(page.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/11/2026",
    );
    await expect(page.getByRole("textbox", { name: "End date" })).toHaveValue(
      "03/20/2026",
    );
  });

  test("discards intent after pointer navigation followed by an outside click", async ({
    mount,
    page,
  }) => {
    await mount(
      <>
        <TestRangeWithTime />
        <button type="button">Outside</button>
      </>,
    );

    const endDate = page.getByRole("textbox", { name: "End date" });
    const nextMonth = page.getByRole("button", { name: "Next month" });
    await endDate.focus();
    await nextMonth.dispatchEvent("pointerdown");
    await endDate.evaluate((element) => element.blur());
    await nextMonth.dispatchEvent("pointerup");
    await nextMonth.dispatchEvent("click");
    await page.getByRole("button", { name: "Outside" }).click();
    await page.getByRole("button", { name: "Friday, March 20, 2026" }).click();
    await page.getByRole("button", { name: "Tuesday, March 24, 2026" }).click();

    await expect(page.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "03/20/2026",
    );
    await expect(endDate).toHaveValue("03/24/2026");
  });

  test("keeps a typed partial date visible until the range is complete", async ({
    mount,
    page,
  }) => {
    await mount(<TestEmptyRangeWithTime />);

    const startDate = page.getByRole("textbox", { name: "Start date" });
    const endDate = page.getByRole("textbox", { name: "End date" });

    await startDate.fill("02/11/2026");
    await startDate.blur();

    await expect(startDate).toHaveValue("02/11/2026");
    await expect(endDate).toHaveValue("");
    await expect(page.getByTestId("change-count")).toHaveText("0");

    await endDate.fill("02/15/2026");
    await endDate.blur();

    await expect(page.getByTestId("change-count")).toHaveText("1");
    await expect(page.getByTestId("range-start")).toHaveText("2026-02-11");
    await expect(page.getByTestId("range-end")).toHaveText("2026-02-15");
  });

  test("keeps callback-only draft edits internal while notifying the observer", async ({
    mount,
    page,
  }) => {
    await mount(<TestCallbackOnlyRangeDraft />);

    const startDate = page.getByRole("textbox", { name: "Start date" });
    const endDate = page.getByRole("textbox", { name: "End date" });

    await startDate.fill("02/11/2026");
    await startDate.blur();

    await expect(startDate).toHaveValue("02/11/2026");
    await expect(endDate).toHaveValue("");
    await expect(page.getByTestId("draft-updates")).toHaveText(
      "2026-02-11|none",
    );
    await expect(page.getByTestId("completed-range")).toHaveText("none");

    await endDate.fill("02/15/2026");
    await endDate.blur();

    await expect(page.getByTestId("draft-updates")).toHaveText(
      "2026-02-11|none,2026-02-11|2026-02-15",
    );
    await expect(page.getByTestId("completed-range")).toHaveText(
      "2026-02-11|2026-02-15",
    );
  });

  test("keeps rangeDraft externally authoritative", async ({ mount, page }) => {
    await mount(<TestControlledRangeDraft />);

    const startDate = page.getByRole("textbox", { name: "Start date" });
    const endDate = page.getByRole("textbox", { name: "End date" });
    await expect(startDate).toHaveValue("02/11/2026");
    await expect(endDate).toHaveValue("");

    await endDate.fill("02/15/2026");
    await endDate.blur();

    await expect(page.getByTestId("controlled-draft-update")).toHaveText(
      "2026-02-11|2026-02-15",
    );
    await expect(startDate).toHaveValue("02/11/2026");
    await expect(endDate).toHaveValue("");
  });

  test("requires the missing date before editing its time in a controlled draft", async ({
    mount,
    page,
  }) => {
    await mount(<TestControlledRangeDraft />);

    await expect(
      page.getByRole("textbox", { name: "Start time" }),
    ).toBeEnabled();
    const endTime = page.getByRole("textbox", { name: "End time" });
    await expect(endTime).toBeDisabled();
    await expect(endTime).toHaveValue("");
    await expect(page.getByTestId("controlled-draft-update")).toHaveText(
      "none",
    );
  });

  test("retains a completed uncontrolled range", async ({ mount, page }) => {
    await mount(<TestUncontrolledRangeWithTime />);

    const startDate = page.getByRole("textbox", { name: "Start date" });
    const endDate = page.getByRole("textbox", { name: "End date" });

    await startDate.fill("02/11/2026");
    await startDate.blur();
    await endDate.fill("02/15/2026");
    await endDate.blur();

    await expect(startDate).toHaveValue("02/11/2026");
    await expect(endDate).toHaveValue("02/15/2026");
    await expect(page.getByTestId("emitted-start")).toHaveText("2026-02-11");
    await expect(page.getByTestId("emitted-end")).toHaveText("2026-02-15");
  });

  test("requires dates before time edits with a callback-only draft", async ({
    mount,
    page,
  }) => {
    await mount(<TestEmptyRangeWithTime />);

    const startTime = page.getByRole("textbox", { name: "Start time" });
    const endTime = page.getByRole("textbox", { name: "End time" });
    await expect(startTime).toBeDisabled();
    await expect(endTime).toBeDisabled();
    await expect(startTime).toHaveValue("");
    await expect(endTime).toHaveValue("");

    const startDate = page.getByRole("textbox", { name: "Start date" });
    await startDate.fill("02/11/2026");
    await startDate.blur();

    await expect(startTime).toBeEnabled();
    await expect(endTime).toBeDisabled();
    await startTime.fill("5:00 PM");
    await startTime.blur();
    await expect(startTime).toHaveValue("5:00 PM");
    await expect(page.getByTestId("change-count")).toHaveText("0");
    await expect(page.getByTestId("range-start")).toHaveText("none");
    await expect(page.getByTestId("range-end")).toHaveText("none");
  });

  test("preserves legacy time-first today synthesis without the draft API", async ({
    mount,
    page,
  }) => {
    await page.clock.setFixedTime(new Date("2026-02-10T12:00:00.000Z"));
    await mount(<TestUncontrolledRangeWithTime />);

    const startTime = page.getByRole("textbox", { name: "Start time" });
    await expect(startTime).toBeEnabled();
    await startTime.fill("5:00 PM");
    await startTime.blur();

    const today = await page.getByTestId("today-date").textContent();
    await expect(page.getByTestId("emitted-local-start")).toHaveText(today!);
    await expect(page.getByTestId("emitted-start")).not.toHaveText("none");
    await expect(page.getByTestId("emitted-end")).toHaveText(
      await page.getByTestId("emitted-start").textContent(),
    );
    await expect(startTime).toHaveValue("5:00 PM");
    const endTime = page.getByRole("textbox", { name: "End time" });
    await expect(endTime).toHaveValue("5:00 PM");
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

  test("swaps same-day bounds when start time moves after end time", async ({
    mount,
    page,
  }) => {
    await mount(<TestSameDayRangeWithTime />);

    const startTime = page.getByRole("textbox", { name: "Start time" });
    await startTime.fill("8:00 PM");
    await startTime.blur();

    await expect(page.getByRole("textbox", { name: "Start time" })).toHaveValue(
      "5:30 PM",
    );
    await expect(page.getByRole("textbox", { name: "End time" })).toHaveValue(
      "8:00 PM",
    );
    await expect(page.getByTestId("start-hours")).toHaveText("17");
    await expect(page.getByTestId("start-minutes")).toHaveText("30");
    await expect(page.getByTestId("end-hours")).toHaveText("20");
    await expect(page.getByTestId("end-minutes")).toHaveText("0");
  });

  test("swaps same-day bounds when end time moves before start time", async ({
    mount,
    page,
  }) => {
    await mount(<TestSameDayRangeWithTime />);

    const endTime = page.getByRole("textbox", { name: "End time" });
    await endTime.fill("8:00 AM");
    await endTime.blur();

    await expect(page.getByRole("textbox", { name: "Start time" })).toHaveValue(
      "8:00 AM",
    );
    await expect(page.getByRole("textbox", { name: "End time" })).toHaveValue(
      "9:00 AM",
    );
    await expect(page.getByTestId("start-hours")).toHaveText("8");
    await expect(page.getByTestId("start-minutes")).toHaveText("0");
    await expect(page.getByTestId("end-hours")).toHaveText("9");
    await expect(page.getByTestId("end-minutes")).toHaveText("0");
  });

  test("orders bounds when start date collapses onto an earlier end time", async ({
    mount,
    page,
  }) => {
    await mount(<TestRangeWithTime />);

    const startTime = page.getByRole("textbox", { name: "Start time" });
    await startTime.fill("8:00 PM");
    await startTime.blur();

    const startDate = page.getByRole("textbox", { name: "Start date" });
    await startDate.fill("02/15/2026");
    await startDate.blur();

    await expect(page.getByRole("textbox", { name: "Start time" })).toHaveValue(
      "5:30 PM",
    );
    await expect(page.getByRole("textbox", { name: "End time" })).toHaveValue(
      "8:00 PM",
    );
    await expect(page.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/15/2026",
    );
    await expect(page.getByRole("textbox", { name: "End date" })).toHaveValue(
      "02/15/2026",
    );
  });

  test("orders bounds when end date collapses onto a later start time", async ({
    mount,
    page,
  }) => {
    await mount(<TestRangeWithTime />);

    const endTime = page.getByRole("textbox", { name: "End time" });
    await endTime.fill("8:00 AM");
    await endTime.blur();

    const endDate = page.getByRole("textbox", { name: "End date" });
    await endDate.fill("02/11/2026");
    await endDate.blur();

    await expect(page.getByRole("textbox", { name: "Start time" })).toHaveValue(
      "8:00 AM",
    );
    await expect(page.getByRole("textbox", { name: "End time" })).toHaveValue(
      "9:00 AM",
    );
    await expect(page.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/11/2026",
    );
    await expect(page.getByRole("textbox", { name: "End date" })).toHaveValue(
      "02/11/2026",
    );
  });

  test("leaves normal cross-day ranges and role times unchanged", async ({
    mount,
    page,
  }) => {
    await mount(<TestRangeWithTime />);

    const startDate = page.getByRole("textbox", { name: "Start date" });
    await startDate.fill("02/12/2026");
    await startDate.blur();

    await expect(page.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/12/2026",
    );
    await expect(page.getByRole("textbox", { name: "End date" })).toHaveValue(
      "02/15/2026",
    );
    await expect(page.getByRole("textbox", { name: "Start time" })).toHaveValue(
      "9:00 AM",
    );
    await expect(page.getByRole("textbox", { name: "End time" })).toHaveValue(
      "5:30 PM",
    );
  });
});
