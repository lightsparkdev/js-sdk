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
  AutoSizing,
  BoundedContent,
  Default,
  DenseLoading,
  Empty,
  EmptyBoundedContent,
  ErrorState,
  ErrorWithRows,
  Loading,
  LoadingSizing,
  LoadingTransition,
  LoadingWithRows,
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

  test("uses native auto layout without clipping ordinary currency content", async ({
    mount,
    page,
  }) => {
    await mount(<AutoSizing />);

    const table = page.getByRole("table", { name: "Auto-sized payments" });
    await expect(table).toHaveCSS("table-layout", "auto");

    const amountHeader = page.getByRole("columnheader", { name: "Amount" });
    await expect(amountHeader).not.toHaveAttribute("style", /width/);

    const amountCell = page.getByRole("cell", { name: "MX$2,300.00 MXN" });
    await expect(amountCell).toBeVisible();
    const amountGeometry = await amountCell.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(amountGeometry.scrollWidth).toBeLessThanOrEqual(
      amountGeometry.clientWidth,
    );

    const actionHeader = page.locator("thead th").last();
    await expect(table.locator("colgroup col[style]")).toHaveCSS(
      "width",
      "64px",
    );
    expect(
      await actionHeader.evaluate(
        (element) => element.getBoundingClientRect().width,
      ),
    ).toBeGreaterThanOrEqual(63);
    expect(
      await actionHeader.evaluate(
        (element) => element.getBoundingClientRect().width,
      ),
    ).toBeLessThanOrEqual(65);
  });

  test("constrains the opted-in column intrinsically and discloses full text without activating the row", async ({
    mount,
    page,
  }) => {
    await mount(<BoundedContent />);

    const table = page.getByRole("table", { name: "Bounded payments" });
    const referenceHeader = page.getByRole("columnheader", {
      name: "Reference",
    });
    const referenceCell = page.getByRole("cell", {
      name: /^REF-B+$/,
    });
    const disclosureTrigger = page.getByRole("button", {
      name: /^REF-B+$/,
    });
    const boundedText = disclosureTrigger.getByText(/^REF-B+$/);
    await expect(disclosureTrigger).toBeVisible();
    await expect(boundedText).toHaveCSS("text-overflow", "ellipsis");

    const geometry = await referenceCell.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        contentWidth:
          element.getBoundingClientRect().width -
          Number.parseFloat(style.paddingLeft) -
          Number.parseFloat(style.paddingRight),
      };
    });
    expect(geometry.contentWidth).toBeLessThanOrEqual(240);
    const [cellBox, headerBox] = await Promise.all([
      referenceCell.boundingBox(),
      referenceHeader.boundingBox(),
    ]);
    expect(cellBox).not.toBeNull();
    expect(headerBox).not.toBeNull();
    expect(Math.abs(cellBox!.width - headerBox!.width)).toBeLessThan(1);
    const textGeometry = await boundedText.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(textGeometry.scrollWidth).toBeGreaterThan(textGeometry.clientWidth);

    const amountCell = page.getByRole("cell", { name: "MX$2,300.00 MXN" });
    expect(
      await boundedText.evaluate(
        (element) => getComputedStyle(element).fontFamily,
      ),
    ).toBe(
      await amountCell.evaluate(
        (element) => getComputedStyle(element).fontFamily,
      ),
    );
    const amountGeometry = await amountCell.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(amountGeometry.scrollWidth).toBeLessThanOrEqual(
      amountGeometry.clientWidth,
    );

    const row = page.getByRole("row", { name: /^View REF-B+$/ });
    await row.focus();
    await page.keyboard.press("Tab");
    await expect(disclosureTrigger).toBeFocused();
    await page.keyboard.press("Enter");
    const disclosurePopup = page.getByLabel("Full cell value");
    await expect(disclosurePopup).toBeVisible();
    const disclosureAxeResults = await new AxeBuilder({ page })
      .options(axeConfig)
      .analyze();
    expect(disclosureAxeResults.violations).toEqual([]);
    await expect(page.getByTestId("activated")).toBeEmpty();
    await page.keyboard.press("Escape");
    await disclosureTrigger.click();
    await expect(disclosurePopup).toBeVisible();
    await expect(page.getByTestId("activated")).toBeEmpty();
    await page.keyboard.press("Escape");
  });

  test("anchors bounded content to the right-aligned cell edge", async ({
    mount,
    page,
  }) => {
    await mount(<BoundedContent align="right" />);

    const referenceCell = page.getByRole("cell", {
      name: /^REF-B+$/,
    });
    const boundedContent = referenceCell.locator(":scope > [data-bounded]");
    const geometry = await boundedContent.evaluate((element) => {
      const cell = element.parentElement;
      if (!cell) {
        throw new Error("Expected bounded content to be a direct cell child");
      }
      const cellBox = cell.getBoundingClientRect();
      const contentBox = element.getBoundingClientRect();
      const cellStyle = getComputedStyle(cell);
      const cellContentRight =
        cellBox.right - Number.parseFloat(cellStyle.paddingRight);
      const cellContentWidth =
        cellBox.width -
        Number.parseFloat(cellStyle.paddingLeft) -
        Number.parseFloat(cellStyle.paddingRight);
      return {
        boundedRight: contentBox.right,
        boundedWidth: contentBox.width,
        cellContentRight,
        cellContentWidth,
      };
    });

    expect(geometry.cellContentWidth).toBeGreaterThan(geometry.boundedWidth);
    expect(
      Math.abs(geometry.cellContentRight - geometry.boundedRight),
    ).toBeLessThan(1);
  });

  test("does not expose unnamed disclosure controls for empty bounded text", async ({
    mount,
    page,
  }) => {
    await mount(<EmptyBoundedContent />);

    const cases = page.getByRole("region", {
      name: "Bounded text accessibility cases",
    });
    await expect(cases.getByRole("button")).toHaveCount(1);
    await expect(
      cases.getByRole("button", { name: "Account description" }),
    ).toBeVisible();
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("lets intrinsic content widen the table inside the existing viewport", async ({
    mount,
    page,
  }) => {
    await mount(<AutoSizing />);

    const longCell = page.getByRole("cell", {
      name: /^PAY-A+$/,
    });
    const table = page.getByRole("table", { name: "Auto-sized payments" });
    const viewport = table.locator("..");
    const shell = viewport.locator("..");

    const longCellGeometry = await longCell.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(longCellGeometry.scrollWidth).toBeLessThanOrEqual(
      longCellGeometry.clientWidth,
    );

    const overflow = await viewport.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBeGreaterThan(overflow.clientWidth);
    await expect(shell).toHaveAttribute("data-overflow-x", "true");
    await expect(shell).toHaveAttribute("data-at-left", "true");
    await expect(shell).not.toHaveAttribute("data-at-right");
    await expect
      .poll(() =>
        shell.evaluate(
          (element) => getComputedStyle(element, "::after").opacity,
        ),
      )
      .toBe("1");

    await viewport.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
      element.dispatchEvent(new Event("scroll"));
    });
    await expect(shell).toHaveAttribute("data-at-right", "true");
    await expect(shell).not.toHaveAttribute("data-at-left");
    await expect
      .poll(() =>
        shell.evaluate(
          (element) => getComputedStyle(element, "::before").opacity,
        ),
      )
      .toBe("1");
  });

  test("keeps the header sticky while the auto-sized table scrolls vertically", async ({
    mount,
    page,
  }) => {
    await mount(<AutoSizing />);

    const table = page.getByRole("table", { name: "Auto-sized payments" });
    const viewport = table.locator("..");
    const shell = viewport.locator("..");
    const header = page.getByRole("columnheader", { name: "Reference" });

    await expect(shell).toHaveAttribute("data-overflow-y", "true");
    await expect(header).toHaveCSS("position", "sticky");
    await viewport.evaluate((element) => {
      element.scrollTop = 100;
      element.dispatchEvent(new Event("scroll"));
    });
    await expect(shell).not.toHaveAttribute("data-at-top");

    const positions = await Promise.all([
      viewport.evaluate((element) => element.getBoundingClientRect().top),
      header.evaluate((element) => element.getBoundingClientRect().top),
    ]);
    expect(Math.abs(positions[0] - positions[1])).toBeLessThanOrEqual(1);
    await expect
      .poll(() =>
        header.evaluate(
          (element) => getComputedStyle(element, "::after").opacity,
        ),
      )
      .toBe("1");
  });

  test("keeps auto layout when horizontal scrolling is disabled", async ({
    mount,
    page,
  }) => {
    await mount(<AutoSizing scrollX={false} />);

    const table = page.getByRole("table", { name: "Auto-sized payments" });
    await expect(table).toHaveCSS("table-layout", "auto");
    await expect(table.locator("..")).toHaveCSS("overflow-x", "hidden");
  });

  test("renders a table-shaped cold shell with accessible textual headers", async ({
    mount,
    page,
  }) => {
    await mount(<Loading />);

    // 4 skeleton rows x 2 columns of loading cells.
    await expect(page.locator("td[data-loading]")).toHaveCount(8);
    await expect(page.locator("th[data-loading]")).toHaveCount(2);
    const loadingTable = page.getByRole("table", { name: "Items" });
    await expect(loadingTable).toBeVisible();
    await expect(loadingTable).toHaveAttribute("aria-busy", "true");
    await expect(
      page.getByRole("columnheader", { name: "Name" }),
    ).toBeVisible();
    await expect(loadingTable.locator("..")).toHaveCSS("overflow-x", "auto");
    await expect(loadingTable.locator("..")).toHaveCSS("overflow-y", "auto");
  });

  test("replaces loading rows by default and preserves opted-in warm rows", async ({
    mount,
    page,
  }) => {
    await mount(<LoadingWithRows />);

    const defaultTable = page.getByRole("table", { name: "Default loading" });
    await expect(defaultTable.locator("td[data-loading]")).toHaveCount(4);
    await expect(
      defaultTable.getByRole("cell", { name: "Item 1" }),
    ).toHaveCount(0);

    const warmTable = page.getByRole("table", { name: "Warm loading" });
    await expect(warmTable.locator("td[data-loading]")).toHaveCount(0);
    await expect(warmTable.getByRole("cell", { name: "Item 1" })).toBeVisible();
    await expect(warmTable).toHaveAttribute("aria-busy", "true");
  });

  test("caps responsive loading bars at the loading token", async ({
    mount,
    page,
  }) => {
    await mount(<LoadingSizing />);

    const table = page.getByRole("table", { name: "Loading sizing" });
    const headerCells = table.locator("thead th");
    const bodyCells = table.locator("tbody td");
    const wideHeaderBar = headerCells.nth(0).locator(":scope > div");
    const wideBodyBar = bodyCells.nth(0).locator(":scope > div");

    for (const bar of [wideHeaderBar, wideBodyBar]) {
      await expect(bar).toHaveCSS("max-width", "208px");
    }
    await expect(wideHeaderBar).toHaveCSS("width", "208px");
    await expect(wideBodyBar).toHaveCSS("width", "208px");
  });

  test("lets dense cold columns overflow without compressing structural widths", async ({
    mount,
    page,
  }) => {
    await mount(<DenseLoading />);

    const table = page.getByRole("table", { name: "Dense loading" });
    const viewport = page.locator('[data-scroll-x="true"]').filter({
      has: table,
    });
    const loadingColumns = table.locator("colgroup col:not([style])");
    const structuralColumn = table.locator("colgroup col[style]");
    const loadingMinimum = await table.evaluate((element) =>
      Number.parseFloat(
        getComputedStyle(element).getPropertyValue("--spacing-16xl"),
      ),
    );

    await expect(loadingColumns).toHaveCount(6);
    const loadingColumnWidths = await loadingColumns.evaluateAll((columns) =>
      columns.map((column) => column.getBoundingClientRect().width),
    );
    for (const width of loadingColumnWidths) {
      expect(width).toBeGreaterThanOrEqual(loadingMinimum);
    }
    await expect(structuralColumn).toHaveCount(1);
    const declaredStructuralWidth = await structuralColumn.evaluate((element) =>
      Number.parseFloat(element.style.minWidth),
    );
    const structuralWidth = await structuralColumn.evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    expect(Math.abs(structuralWidth - declaredStructuralWidth)).toBeLessThan(1);

    await expect(viewport).toHaveCount(1);
    const loadingOverflow = await viewport.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(loadingOverflow.scrollWidth).toBeGreaterThan(
      loadingOverflow.clientWidth,
    );
  });

  test("swaps the cold shell for settled headers and rows together", async ({
    mount,
    page,
  }) => {
    await mount(<LoadingTransition />);

    const table = page.getByRole("table", { name: "Items" });
    await expect(table.locator("th[data-loading]")).toHaveCount(2);
    await expect(table.locator("td[data-loading]")).toHaveCount(6);
    await expect(
      page.getByRole("columnheader", { name: "Name" }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "Item 1" })).toHaveCount(0);

    await page.getByRole("button", { name: "Resolve loading" }).click();

    await expect(table.locator("th[data-loading]")).toHaveCount(0);
    await expect(table.locator("td[data-loading]")).toHaveCount(0);
    await expect(
      page.getByRole("columnheader", { name: "Name" }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "Item 1" })).toBeVisible();
    await expect(table).not.toHaveAttribute("aria-busy");
  });

  test("animates the first settled data after a cold shell", async ({
    mount,
    page,
  }) => {
    await mount(<LoadingTransition />);

    const table = page.getByRole("table", { name: "Items" });
    const animationStarted = table.evaluate(
      (element) =>
        new Promise<{
          name: string;
          duration: string;
          timingFunction: string;
        }>((resolve) => {
          const onAnimationStart = (event: AnimationEvent) => {
            if (event.target !== element) {
              return;
            }
            element.removeEventListener("animationstart", onAnimationStart);
            const style = getComputedStyle(element);
            resolve({
              name: style.animationName,
              duration: style.animationDuration,
              timingFunction: style.animationTimingFunction,
            });
          };
          element.addEventListener("animationstart", onAnimationStart);
        }),
    );
    await page.getByRole("button", { name: "Resolve loading" }).click();

    const animation = await animationStarted;
    expect(animation.name).toMatch(/data-table-cold-reveal/);
    expect(animation.duration).toBe("0.12s");
    expect(animation.timingFunction).toBe("ease-out");
    await expect(table).not.toHaveAttribute("data-cold-reveal");
  });

  test("leaves no reveal animation or marker for reduced motion", async ({
    mount,
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mount(<LoadingTransition />);

    const table = page.getByRole("table", { name: "Items" });
    await page.getByRole("button", { name: "Resolve loading" }).click();

    await expect(table).not.toHaveAttribute("data-cold-reveal");
    await expect
      .poll(() => table.evaluate((element) => element.getAnimations().length))
      .toBe(0);
    await expect(table).toHaveCSS("animation-name", "none");
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
    const emptyViewport = page.locator('[data-state-overlay="true"]');
    await expect(emptyViewport).toHaveCSS("overflow-x", "hidden");
    await expect(emptyViewport).toHaveCSS("overflow-y", "hidden");
  });

  test("shows the error card with a working retry action", async ({
    mount,
    page,
  }) => {
    await mount(<ErrorState />);

    await expect(page.getByText("Couldn't load items")).toBeVisible();
    const errorViewport = page.locator('[data-state-overlay="true"]');
    await expect(page.locator("table")).not.toBeVisible();
    await expect(errorViewport).toHaveCSS("overflow-x", "hidden");
    await expect(errorViewport).toHaveCSS("overflow-y", "hidden");
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
