/**
 * FilterBar Playwright CT tests.
 *
 * Covers behavior that needs a real browser: the add-filter menu (enum
 * submenu application, string editor opening), pill editors
 * (apply/validate/dismiss flows), clear-all, and axe scans.
 *
 * The filter model's pure transitions and URL codec are covered in
 * filter-model.unit.test.ts; the hook's controlled/uncontrolled contract
 * in useFilters.unit.test.tsx.
 */

import { test, expect } from "@playwright/experimental-ct-react";
import { type Page } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import {
  ControlledDateFilter,
  DateDefaultRangeOverride,
  DateFutureEnabled,
  DatePastOnly,
  Default,
  NoPlaceholderEditors,
  ProgrammaticEditorOpen,
  WithAppliedEditableFilters,
  WithAppliedFilters,
  WithDateApplied,
  WithDstGapDateApplied,
  WithEndOnlyDate,
  WithExclusiveEnum,
  WithOneSidedDate,
  WithPriorMonthDate,
  WithSameDayDateApplied,
} from "./FilterBar.test-stories";

const axeConfig = {
  rules: {
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
    region: { enabled: false },
    // Pre-existing Origin ChipFilter token pairing (secondary text on the
    // chip surface at 12px) sits below 4.5:1; the pills compose ChipFilter
    // as-is. Same suppression as other suites composing these tokens.
    "color-contrast": { enabled: false },
  },
};

test.describe("FilterBar", () => {
  test("has no accessibility violations", async ({ mount, page }) => {
    await mount(<WithAppliedFilters />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("renders hydrated filters as pills", async ({ mount, page }) => {
    await mount(<WithAppliedFilters />);

    await expect(page.getByText("Status", { exact: true })).toBeVisible();
    await expect(page.getByText("Active", { exact: true })).toBeVisible();
    await expect(page.getByText("Reason", { exact: true })).toBeVisible();
    await expect(page.getByText("timeout", { exact: true })).toBeVisible();
    await expect(page.getByTestId("applied-count")).toHaveText("2");
  });

  test("applies an enum option from the add menu submenu", async ({
    mount,
    page,
  }) => {
    await mount(<Default />);

    await page.getByRole("button", { name: "Filter" }).click();
    await page.getByRole("menuitem", { name: "Status" }).hover();
    await page.getByRole("menuitemcheckbox", { name: "Active" }).click();

    await expect(page.getByTestId("applied-count")).toHaveText("1");
    await expect(page.getByTestId("signature")).toHaveText("status=ACTIVE");
  });

  test("adds a string filter empty and applies a value through its editor", async ({
    mount,
    page,
  }) => {
    await mount(<Default />);

    await page.getByRole("button", { name: "Filter" }).click();
    await page.getByRole("menuitem", { name: "Reason" }).click();

    // The pill appears applied-but-empty with its editor open.
    await expect(page.getByText("Empty", { exact: true })).toBeVisible();
    const input = page.getByPlaceholder("Enter a reason");
    await expect(input).toBeVisible();
    await input.fill("timeout");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page.getByText("timeout", { exact: true })).toBeVisible();
    await expect(page.getByTestId("signature")).toHaveText("reason=timeout");
  });

  test("string editor normalizes valid values and rejects invalid ones", async ({
    mount,
    page,
  }) => {
    await mount(<Default />);

    await page.getByRole("button", { name: "Filter" }).click();
    await page.getByRole("menuitem", { name: "Code" }).click();

    const input = page.getByPlaceholder("Enter a code");
    await input.fill("invalid");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page.getByRole("alert")).toHaveText("Enter a valid code");
    await expect(page.getByTestId("signature")).toHaveText("code=");

    await input.fill(" code-123 ");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByTestId("signature")).toHaveText("code=CODE-123");
  });

  test("labels text editors from descriptors without placeholders", async ({
    mount,
    page,
  }) => {
    await mount(<NoPlaceholderEditors />);

    await page.getByRole("button", { name: "Filter" }).click();
    await page.getByRole("menuitem", { name: "Reference" }).click();
    await expect(
      page.getByRole("textbox", { name: "Reference" }),
    ).toBeVisible();
  });

  test("dismissing a pill removes the filter", async ({ mount, page }) => {
    await mount(<WithAppliedFilters />);

    await page
      .getByRole("button", { name: "Remove filter Reason is timeout" })
      .click();

    await expect(page.getByTestId("applied-count")).toHaveText("1");
    await expect(page.getByTestId("signature")).toHaveText("status=ACTIVE");
  });

  test("clear removes every applied filter and hides itself", async ({
    mount,
    page,
  }) => {
    await mount(<WithAppliedFilters />);

    await page.getByRole("button", { name: "Clear" }).click();

    await expect(page.getByTestId("applied-count")).toHaveText("0");
    await expect(page.getByTestId("signature")).toHaveText("");
    await expect(page.getByRole("button", { name: "Clear" })).toHaveCount(0);
  });

  test("add button collapses to icon-only once a filter is applied", async ({
    mount,
    page,
  }) => {
    await mount(<WithAppliedFilters />);

    const trigger = page.getByRole("button", { name: "Filter", exact: true });
    await expect(trigger).toBeVisible();
    await expect(trigger).not.toHaveText("Filter");
  });

  test("toggles multi-select options without closing the menu", async ({
    mount,
    page,
  }) => {
    await mount(<WithAppliedFilters />);

    // Open the pill's value editor menu.
    await page.getByRole("button", { name: "Active", exact: true }).click();
    await page.getByRole("menuitemcheckbox", { name: "Closed" }).click();

    await expect(page.getByTestId("signature")).toHaveText(
      "status=ACTIVE&status=CLOSED&reason=timeout",
    );
    // The menu stays open for further toggles.
    await page.getByRole("menuitemcheckbox", { name: "Active" }).click();
    await expect(page.getByTestId("signature")).toHaveText(
      "status=CLOSED&reason=timeout",
    );

    // Toggling off the last value leaves an applied-but-empty pill.
    await page.getByRole("menuitemcheckbox", { name: "Closed" }).click();
    await expect(page.getByTestId("signature")).toHaveText(
      "status=&reason=timeout",
    );
    await expect(
      page.getByRole("button", { name: "Remove filter Status is Empty" }),
    ).toBeVisible();
  });

  test("swaps exclusive enum selection via add-menu radio items", async ({
    mount,
    page,
  }) => {
    await mount(<WithExclusiveEnum />);

    await page.getByRole("button", { name: "Filter", exact: true }).click();
    await page.getByRole("menuitem", { name: "Type" }).hover();

    // The applied option reads as selected.
    const outgoing = page.getByRole("menuitemradio", { name: "Outgoing" });
    await expect(outgoing).toHaveAttribute("aria-checked", "true");

    await page.getByRole("menuitemradio", { name: "Incoming" }).click();

    await expect(page.getByTestId("signature")).toHaveText("type=INCOMING");
    await expect(
      page.getByRole("button", { name: "Incoming", exact: true }),
    ).toBeVisible();
  });

  test("enforces descriptor conflicts when adding through the UI", async ({
    mount,
    page,
  }) => {
    await mount(<WithExclusiveEnum />);

    // Applying Reason (conflictsWith: ["type"]) resets the Type pill.
    await page.getByRole("button", { name: "Filter", exact: true }).click();
    await page.getByRole("menuitem", { name: "Reason" }).click();

    await expect(
      page.getByRole("button", { name: /^Remove filter Type/ }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Remove filter Reason is Empty" }),
    ).toBeVisible();
    await expect(page.getByTestId("signature")).toHaveText("reason=");
  });

  test("opens a pill editor programmatically via model.setEditorOpen", async ({
    mount,
    page,
  }) => {
    await mount(<ProgrammaticEditorOpen />);

    await expect(page.getByRole("textbox")).toHaveCount(0);
    await page.getByRole("button", { name: "Open reason editor" }).click();

    const input = page.getByRole("textbox");
    await expect(input).toBeVisible();
    await expect(input).toHaveValue("TIMEOUT");
  });

  test("reopens applied string and date filters without clearing on cancel", async ({
    mount,
    page,
  }) => {
    await mount(<WithAppliedEditableFilters />);
    const expectedSignature = new URLSearchParams({
      reason: "timeout",
      code: "CODE-123",
      createdAt: "2026-06-01T09:30:00.000Z,2026-06-10T17:00:00.000Z",
    }).toString();

    await page.getByRole("button", { name: "Filter", exact: true }).click();
    await page.getByRole("menuitem", { name: "Reason" }).click();
    const reasonInput = page.getByPlaceholder("Enter a reason");
    await expect(reasonInput).toHaveValue("timeout");
    await reasonInput.fill("draft only");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("signature")).toHaveText(expectedSignature);

    await page.getByRole("button", { name: "Filter", exact: true }).click();
    await page.getByRole("menuitem", { name: "Code" }).click();
    const codeInput = page.getByPlaceholder("Enter a code");
    await expect(codeInput).toHaveValue("CODE-123");
    await codeInput.fill("draft only");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("signature")).toHaveText(expectedSignature);

    await page.getByRole("button", { name: "Filter", exact: true }).click();
    await page.getByRole("menuitem", { name: "Created" }).click();
    await expect(page.getByLabel("Start date", { exact: true })).toHaveValue(
      "06/01/2026",
    );
    await expect(page.getByLabel("Start time", { exact: true })).toHaveValue(
      "9:30 AM",
    );
    await expect(page.getByLabel("End date", { exact: true })).toHaveValue(
      "06/10/2026",
    );
    await expect(page.getByLabel("End time", { exact: true })).toHaveValue(
      "5:00 PM",
    );
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("signature")).toHaveText(expectedSignature);
  });

  test("formats hydrated date ranges as UTC wall-clock values", async ({
    mount,
    page,
  }) => {
    await mount(<WithDateApplied />);

    await expect(
      page.getByRole("button", {
        name: "Jun 01, 09:30 - Jun 10, 17:00",
        exact: true,
      }),
    ).toBeVisible();
  });

  test.describe("UTC date editor through a DST gap", () => {
    test.use({ timezoneId: "America/New_York" });

    test("preserves exact UTC instants through open and Apply", async ({
      mount,
      page,
    }) => {
      await mount(<WithDstGapDateApplied />);
      await page
        .getByRole("button", {
          name: "Mar 08, 02:30 - Mar 08, 04:30",
          exact: true,
        })
        .click();

      await expect(page.getByLabel("Start time", { exact: true })).toHaveValue(
        "2:30 AM",
      );
      await page.getByRole("button", { name: "Apply" }).click();

      await expect(page.getByTestId("signature")).toHaveText(
        new URLSearchParams({
          createdAt: "2026-03-08T02:30:00.000Z,2026-03-08T04:30:00.000Z",
        }).toString(),
      );
    });

    test("edits a UTC wall-clock time inside the local DST gap", async ({
      mount,
      page,
    }) => {
      await mount(<WithDstGapDateApplied />);
      await page
        .getByRole("button", {
          name: "Mar 08, 02:30 - Mar 08, 04:30",
          exact: true,
        })
        .click();

      const startTime = page.getByLabel("Start time", { exact: true });
      await startTime.fill("2:45 AM");
      await startTime.blur();
      await page.getByRole("button", { name: "Apply" }).click();

      await expect(page.getByTestId("signature")).toHaveText(
        new URLSearchParams({
          createdAt: "2026-03-08T02:45:00.000Z,2026-03-08T04:30:00.000Z",
        }).toString(),
      );
    });
  });

  test.describe("date editor seeding and future constraint", () => {
    // 2026-06-15 12:00 UTC is mid-month, so the current month grid has
    // both past and future days.
    const FIXED_NOW = new Date("2026-06-15T12:00:00.000Z");

    async function openDateEditor(page: Page) {
      await page.getByRole("button", { name: "Filter", exact: true }).click();
      await page.getByRole("menuitem", { name: "Created" }).click();
      await expect(page.getByRole("button", { name: "Apply" })).toBeVisible();
    }

    test("opens an empty editor without a default range", async ({
      mount,
      page,
    }) => {
      await page.clock.setFixedTime(FIXED_NOW);
      await mount(<Default />);
      await openDateEditor(page);

      await expect(page.getByLabel("Start date", { exact: true })).toHaveValue(
        "",
      );
      await expect(page.getByLabel("End date", { exact: true })).toHaveValue(
        "",
      );
      await expect(page.getByTestId("signature")).toHaveText("createdAt=%2C");

      await page.getByRole("button", { name: "Apply" }).click();

      await expect(page.getByTestId("signature")).toHaveText("createdAt=%2C");
    });

    test("dismissing an empty editor commits nothing", async ({
      mount,
      page,
    }) => {
      await page.clock.setFixedTime(FIXED_NOW);
      await mount(<Default />);
      await openDateEditor(page);

      await page.keyboard.press("Escape");

      await expect(page.getByTestId("signature")).toHaveText("createdAt=%2C");
      await expect(
        page.getByRole("button", { name: "Empty", exact: true }),
      ).toBeVisible();
    });

    test("keeps a committed value on reopen instead of reseeding", async ({
      mount,
      page,
    }) => {
      await page.clock.setFixedTime(FIXED_NOW);
      await mount(<WithDateApplied />);

      await page
        .getByRole("button", {
          name: "Jun 01, 09:30 - Jun 10, 17:00",
          exact: true,
        })
        .click();
      await expect(page.getByRole("button", { name: "Apply" })).toBeVisible();

      await expect(page.getByLabel("Start date", { exact: true })).toHaveValue(
        "06/01/2026",
      );
      await expect(page.getByLabel("End date", { exact: true })).toHaveValue(
        "06/10/2026",
      );
    });

    test("resyncs changed committed dates without erasing a draft on an equivalent rerender", async ({
      mount,
      page,
    }) => {
      const initialStart = "2026-06-01T09:30:00.000Z";
      const initialEnd = "2026-06-10T17:00:00.000Z";
      const component = await mount(
        <ControlledDateFilter start={initialStart} end={initialEnd} />,
      );
      await page
        .getByRole("button", {
          name: "Jun 01, 09:30 - Jun 10, 17:00",
          exact: true,
        })
        .click();

      const startDate = page.getByLabel("Start date", { exact: true });
      await startDate.fill("06/02/2026");
      await startDate.blur();
      await expect(startDate).toHaveValue("06/02/2026");

      await component.update(
        <ControlledDateFilter start={initialStart} end={initialEnd} />,
      );
      await expect(startDate).toHaveValue("06/02/2026");

      await component.update(
        <ControlledDateFilter
          start="2026-06-03T10:00:00.000Z"
          end="2026-06-12T18:00:00.000Z"
        />,
      );
      await expect(startDate).toHaveValue("06/03/2026");
      await expect(page.getByLabel("Start time", { exact: true })).toHaveValue(
        "10:00 AM",
      );
      await expect(page.getByLabel("End date", { exact: true })).toHaveValue(
        "06/12/2026",
      );
      await expect(page.getByLabel("End time", { exact: true })).toHaveValue(
        "6:00 PM",
      );
    });

    test("keeps a same-day range ordered when start time crosses end", async ({
      mount,
      page,
    }) => {
      await mount(<WithSameDayDateApplied />);
      await page
        .getByRole("button", {
          name: "Jun 10, 09:00 - Jun 10, 17:30",
          exact: true,
        })
        .click();

      const startTime = page.getByLabel("Start time", { exact: true });
      await startTime.fill("8:00 PM");
      await startTime.blur();

      await expect(page.getByLabel("Start time", { exact: true })).toHaveValue(
        "5:30 PM",
      );
      await expect(page.getByLabel("End time", { exact: true })).toHaveValue(
        "8:00 PM",
      );
      await page.getByRole("button", { name: "Apply" }).click();
      await expect(page.getByTestId("signature")).toHaveText(
        new URLSearchParams({
          createdAt: "2026-06-10T17:30:00.000Z,2026-06-10T20:00:00.000Z",
        }).toString(),
      );
    });

    test("keeps a same-day range ordered when end time crosses start", async ({
      mount,
      page,
    }) => {
      await mount(<WithSameDayDateApplied />);
      await page
        .getByRole("button", {
          name: "Jun 10, 09:00 - Jun 10, 17:30",
          exact: true,
        })
        .click();

      const endTime = page.getByLabel("End time", { exact: true });
      await endTime.fill("8:00 AM");
      await endTime.blur();

      await expect(page.getByLabel("Start time", { exact: true })).toHaveValue(
        "8:00 AM",
      );
      await expect(page.getByLabel("End time", { exact: true })).toHaveValue(
        "9:00 AM",
      );
      await page.getByRole("button", { name: "Apply" }).click();
      await expect(page.getByTestId("signature")).toHaveText(
        new URLSearchParams({
          createdAt: "2026-06-10T08:00:00.000Z,2026-06-10T09:00:00.000Z",
        }).toString(),
      );
    });

    test("opens the calendar on the committed range's month", async ({
      mount,
      page,
    }) => {
      await page.clock.setFixedTime(FIXED_NOW);
      await mount(<WithPriorMonthDate />);

      await page.getByRole("button", { name: "Empty", exact: true }).click();
      await expect(page.getByRole("button", { name: "Apply" })).toBeVisible();

      await expect(page.getByText("March 2026")).toBeVisible();
    });

    test("preserves a one-sided URL range through open and Apply", async ({
      mount,
      page,
    }) => {
      await page.clock.setFixedTime(FIXED_NOW);
      await mount(<WithOneSidedDate />);

      // A one-sided range is a committed value and must remain intact when
      // the editor opens.
      await page.getByRole("button", { name: "Empty", exact: true }).click();
      await expect(page.getByRole("button", { name: "Apply" })).toBeVisible();
      await expect(
        page.getByLabel("Start date", { exact: true }),
      ).not.toHaveValue("06/14/2026");

      // Apply re-commits the untouched one-sided range.
      await page.getByRole("button", { name: "Apply" }).click();

      const expected = new URLSearchParams({
        createdAt: "2026-06-01T09:30:00.000Z,",
      }).toString();
      await expect(page.getByTestId("signature")).toHaveText(expected);
    });

    test("preserves a start-only bound while editing the missing end", async ({
      mount,
      page,
    }) => {
      await page.clock.setFixedTime(FIXED_NOW);
      await mount(<WithOneSidedDate />);

      await page.getByRole("button", { name: "Empty", exact: true }).click();
      await expect(page.getByLabel("Start date", { exact: true })).toHaveValue(
        "06/01/2026",
      );
      const endDate = page.getByLabel("End date", { exact: true });
      await expect(endDate).toHaveValue("");
      await endDate.fill("06/10/2026");
      await endDate.blur();
      await page.getByRole("button", { name: "Apply" }).click();

      await expect(page.getByTestId("signature")).toHaveText(
        new URLSearchParams({
          createdAt: "2026-06-01T09:30:00.000Z,2026-06-10T00:00:00.000Z",
        }).toString(),
      );
    });

    test("preserves and orders an end-only bound completed from the calendar", async ({
      mount,
      page,
    }) => {
      await page.clock.setFixedTime(FIXED_NOW);
      await mount(<WithEndOnlyDate />);

      await page.getByRole("button", { name: "Empty", exact: true }).click();
      const startDate = page.getByLabel("Start date", { exact: true });
      await expect(startDate).toHaveValue("");
      await expect(page.getByLabel("End date", { exact: true })).toHaveValue(
        "06/10/2026",
      );
      await page.getByRole("button", { name: "Friday, June 12, 2026" }).click();
      await expect(startDate).toHaveValue("06/10/2026");
      await expect(page.getByLabel("End date", { exact: true })).toHaveValue(
        "06/12/2026",
      );
      await page.getByRole("button", { name: "Apply" }).click();

      await expect(page.getByTestId("signature")).toHaveText(
        new URLSearchParams({
          createdAt: "2026-06-10T17:00:00.000Z,2026-06-12T12:00:00.000Z",
        }).toString(),
      );
    });

    test("seeds from a descriptor defaultRange override", async ({
      mount,
      page,
    }) => {
      await page.clock.setFixedTime(FIXED_NOW);
      await mount(<DateDefaultRangeOverride />);
      await page.getByRole("button", { name: "Empty", exact: true }).click();
      await expect(page.getByRole("button", { name: "Apply" })).toBeVisible();

      await expect(page.getByText("March 2026")).toBeVisible();
      await expect(page.getByLabel("Start date", { exact: true })).toHaveValue(
        "03/02/2026",
      );
      await expect(page.getByLabel("End date", { exact: true })).toHaveValue(
        "03/05/2026",
      );

      await page.getByRole("button", { name: "Apply" }).click();

      const expected = new URLSearchParams({
        createdAt: "2026-03-02T00:00:00.000Z,2026-03-05T00:00:00.000Z",
      }).toString();
      await expect(page.getByTestId("signature")).toHaveText(expected);
    });

    test("allows future dates by default", async ({ mount, page }) => {
      await page.clock.setFixedTime(FIXED_NOW);
      await mount(<Default />);
      await openDateEditor(page);

      await expect(
        page.getByRole("button", { name: "Next month" }),
      ).toBeEnabled();
      await expect(
        page.getByRole("button", { name: /June 20, 2026/ }),
      ).not.toHaveAttribute("aria-disabled");
    });

    test("allows future dates when explicitly enabled", async ({
      mount,
      page,
    }) => {
      await page.clock.setFixedTime(FIXED_NOW);
      await mount(<DateFutureEnabled />);
      await openDateEditor(page);

      await expect(
        page.getByRole("button", { name: "Next month" }),
      ).toBeEnabled();
      await expect(
        page.getByRole("button", { name: /June 20, 2026/ }),
      ).not.toHaveAttribute("aria-disabled");
    });

    test("constrains the calendar when allowFuture is false", async ({
      mount,
      page,
    }) => {
      await page.clock.setFixedTime(FIXED_NOW);
      await mount(<DatePastOnly />);
      await openDateEditor(page);

      // Forward month navigation would exceed today's month.
      await expect(
        page.getByRole("button", { name: "Next month" }),
      ).toBeDisabled();

      // Future days in the current month are disabled; past days are not.
      await expect(
        page.getByRole("button", { name: /June 20, 2026/ }),
      ).toHaveAttribute("aria-disabled", "true");
      await expect(
        page.getByRole("button", { name: /June 10, 2026/ }),
      ).not.toHaveAttribute("aria-disabled");

      // A typed future date is rejected by the input and reverts.
      const endInput = page.getByLabel("End date", { exact: true });
      await endInput.fill("07/01/2026");
      await page.keyboard.press("Tab");
      await expect(endInput).toHaveValue("");
    });
  });
});
