import { test, expect } from "@playwright/experimental-ct-react";
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
