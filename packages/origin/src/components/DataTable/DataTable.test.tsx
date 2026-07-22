/**
 * DataTable Playwright CT tests.
 *
 * Covers behavior that needs a real browser: rendered table semantics,
 * empty/error overlays replacing the table, retry activation, row
 * activation by mouse and keyboard, end-to-end cursor paging (range label,
 * next/previous, rows-per-page), footer visibility, and axe scans.
 *
 * The cursor pagination state machine itself is covered field-by-field in
 * the focused DataTable pagination unit tests.
 */

import { test, expect } from "@playwright/experimental-ct-react";
import AxeBuilder from "@axe-core/playwright";
import {
  Default,
  Empty,
  ErrorState,
  ErrorWithRows,
  Loading,
  LowerBound,
  RowActivate,
  RowActivateWithControls,
  SinglePage,
  WithPagination,
} from "./DataTable.test-stories";

const axeConfig = {
  rules: {
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
    region: { enabled: false },
  },
};

test.describe("DataTable", () => {
  test("has no accessibility violations", async ({ mount, page }) => {
    await mount(<WithPagination />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("renders headers and consumer-formatted cells", async ({
    mount,
    page,
  }) => {
    await mount(<Default />);

    await expect(
      page.getByRole("columnheader", { name: "Name" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Amount" }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "Item 1" })).toBeVisible();
    // The amount column renders through the consumer's `cell` slot.
    await expect(page.getByRole("cell", { name: "$10.00" })).toBeVisible();
  });

  test("names the table via its caption", async ({ mount, page }) => {
    await mount(<Default />);

    await expect(page.getByRole("table", { name: "Items" })).toBeVisible();
  });

  test("renders skeleton rows while loading", async ({ mount, page }) => {
    await mount(<Loading />);

    // 4 skeleton rows x 2 columns of loading cells.
    await expect(page.locator("td[data-loading]")).toHaveCount(8);
  });

  test("shows the empty card instead of the table for zero rows", async ({
    mount,
    page,
  }) => {
    await mount(<Empty />);

    await expect(page.getByText("No rows found")).toBeVisible();
    await expect(
      page.getByText("Adjust the filters to widen the search"),
    ).toBeVisible();
    await expect(page.locator("table")).not.toBeVisible();
  });

  test("shows the error card with a working retry action", async ({
    mount,
    page,
  }) => {
    await mount(<ErrorState />);

    await expect(page.getByText("Couldn't load items")).toBeVisible();
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByTestId("retries")).toHaveText("1");
  });

  test("keeps populated rows visible when a background request errors", async ({
    mount,
    page,
  }) => {
    await mount(<ErrorWithRows />);

    await expect(page.getByRole("table", { name: "Items" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Item 1" })).toBeVisible();
    await expect(page.getByText("Couldn't load items")).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Try again" }),
    ).not.toBeVisible();
  });

  test("empty and error states pass axe", async ({ mount, page }) => {
    await mount(<ErrorState />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("activates a row on click", async ({ mount, page }) => {
    await mount(<RowActivate />);

    const row = page.getByRole("row", { name: "View Item 2" });
    await expect(row).toHaveAttribute("aria-roledescription", "actionable row");
    await expect(row).toHaveAttribute("aria-keyshortcuts", "Enter Space");
    await expect(row).toHaveJSProperty("tagName", "TR");
    await row.click();
    await expect(page.getByTestId("activated")).toHaveText("row-2");
  });

  test("activates a focused row with the keyboard", async ({ mount, page }) => {
    await mount(<RowActivate />);

    await page.getByRole("row", { name: /Item 3/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("activated")).toHaveText("row-3");
  });

  test("does not activate a row when a nested button is clicked", async ({
    mount,
    page,
  }) => {
    await mount(<RowActivateWithControls />);

    await page.getByRole("button", { name: "Button Item 1" }).click();
    await expect(page.getByTestId("control-activated")).toHaveText(
      "button-row-1",
    );
    await expect(page.getByTestId("activated")).toBeEmpty();
  });

  test("does not activate a row when a nested link is clicked", async ({
    mount,
    page,
  }) => {
    await mount(<RowActivateWithControls />);

    await page.getByRole("link", { name: "Link Item 2" }).click();
    await expect(page.getByTestId("control-activated")).toHaveText(
      "link-row-2",
    );
    await expect(page.getByTestId("activated")).toBeEmpty();
  });

  test("does not activate a row from nested keyboard activation", async ({
    mount,
    page,
  }) => {
    await mount(<RowActivateWithControls />);

    const button = page.getByRole("button", { name: "Button Item 3" });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("control-activated")).toHaveText(
      "button-row-3",
    );
    await expect(page.getByTestId("activated")).toBeEmpty();
  });

  test("activates rows with Enter and Space while suppressing interactive descendants", async ({
    mount,
    page,
  }) => {
    await mount(<RowActivateWithControls />);

    const firstRow = page.getByRole("row", { name: "View Item 1" });
    await firstRow.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("activated")).toHaveText("row-1");

    const secondRow = page.getByRole("row", { name: "View Item 2" });
    await secondRow.focus();
    await page.keyboard.press("Space");
    await expect(page.getByTestId("activated")).toHaveText("row-2");

    await page.getByRole("button", { name: "Button Item 3" }).click();
    await expect(page.getByTestId("control-activated")).toHaveText(
      "button-row-3",
    );
    await expect(page.getByTestId("activated")).toHaveText("row-2");

    const firstButton = page.getByRole("button", { name: "Button Item 1" });
    await firstButton.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("control-activated")).toHaveText(
      "button-row-1",
    );
    await expect(page.getByTestId("activated")).toHaveText("row-2");
  });

  test("respects a nested control that prevents the click default", async ({
    mount,
    page,
  }) => {
    await mount(<RowActivateWithControls />);

    await page.getByText("Prevented Item 1").click();
    await expect(page.getByTestId("control-activated")).toHaveText(
      "prevented-row-1",
    );
    await expect(page.getByTestId("activated")).toBeEmpty();
  });

  test("pages forward and backward through the cursor space", async ({
    mount,
    page,
  }) => {
    await mount(<WithPagination />);

    await expect(page.getByText("Viewing 1-10 of 25 results")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Item 1", exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Next page" }).click();
    await expect(page.getByText("Viewing 11-20 of 25 results")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Item 11" })).toBeVisible();

    await page.getByRole("button", { name: "Next page" }).click();
    await expect(page.getByText("Viewing 21-25 of 25 results")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Next page" }),
    ).toBeDisabled();

    await page.getByRole("button", { name: "Previous page" }).click();
    await expect(page.getByText("Viewing 11-20 of 25 results")).toBeVisible();
  });

  test("changing rows-per-page resets to the first page", async ({
    mount,
    page,
  }) => {
    await mount(<WithPagination />);

    await page.getByRole("button", { name: "Next page" }).click();
    await expect(page.getByText("Viewing 11-20 of 25 results")).toBeVisible();

    await page.getByRole("combobox", { name: "Rows per page" }).click();
    await page.getByRole("option", { name: "25" }).click();

    await expect(page.getByText("Viewing 1-25 of 25 results")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Item 1", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "Item 25" })).toBeVisible();
  });

  test("renders lower-bound counts without clamping later pages", async ({
    mount,
    page,
  }) => {
    await mount(<LowerBound />);

    await expect(
      page.getByRole("cell", { name: "Item 1", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Viewing 1-10 of 3+ results")).toBeVisible();

    await page.getByRole("button", { name: "Next page" }).click();

    await expect(page.getByText("Viewing 11-20 of 3+ results")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Item 11" })).toBeVisible();
  });

  test("hides the pagination for a single-page result set", async ({
    mount,
    page,
  }) => {
    await mount(<SinglePage />);

    await expect(page.getByRole("cell", { name: "Item 1" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Items pagination" }),
    ).toHaveCount(0);
  });
});
