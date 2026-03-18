import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicTable,
  SortableTable,
  AlignedTable,
  SortableAlignedTable,
  LoadingTable,
  DescriptionTable,
  FooterTable,
  CompactFooterTable,
  ClickableRowTable,
} from "./Table.test-stories";

test.describe("Table", () => {
  test.describe("Basic", () => {
    test("renders table with data", async ({ mount }) => {
      const component = await mount(<BasicTable />);

      // Check data is visible
      await expect(component.locator("text=Alice Johnson")).toBeVisible();
      await expect(component.locator("text=bob@example.com")).toBeVisible();
    });
  });

  test.describe("Sorting", () => {
    test("clicking sortable header toggles sort", async ({ mount }) => {
      const component = await mount(<SortableTable />);

      const nameHeader = component.locator("th").filter({ hasText: "Name" });

      // Initial state - no sort
      await expect(nameHeader).not.toHaveAttribute("data-sorted");

      // Click to sort ascending
      await nameHeader.click();
      await expect(nameHeader).toHaveAttribute("data-sorted", "asc");

      // Click to sort descending
      await nameHeader.click();
      await expect(nameHeader).toHaveAttribute("data-sorted", "desc");

      // Click to clear sort
      await nameHeader.click();
      await expect(nameHeader).not.toHaveAttribute("data-sorted");
    });

    test("non-sortable column has no sort indicator", async ({ mount }) => {
      const component = await mount(<SortableTable />);

      const roleHeader = component.locator("th").filter({ hasText: "Role" });

      // Should not have sortable attribute
      await expect(roleHeader).not.toHaveAttribute("data-sortable");
    });
  });

  test.describe("Alignment", () => {
    test("right-aligned cells have correct data attribute", async ({
      mount,
    }) => {
      const component = await mount(<AlignedTable />);

      // Status column should be right-aligned
      const statusHeader = component
        .locator("th")
        .filter({ hasText: "Status" });
      await expect(statusHeader).toHaveAttribute("data-align", "right");
    });

    test("sort icon position respects alignment", async ({ mount }) => {
      const component = await mount(<SortableAlignedTable />);

      // Left-aligned Name column: label should come before icon
      const nameHeader = component.locator("th").filter({ hasText: "Name" });
      const nameContent = nameHeader.locator("span").first();
      const nameText = await nameContent.textContent();
      // For left-aligned, text should start with "Name" (icon after)
      expect(nameText?.startsWith("Name")).toBe(true);

      // Right-aligned Status column: icon should come before label
      const statusHeader = component
        .locator("th")
        .filter({ hasText: "Status" });
      const statusContent = statusHeader.locator("span").first();
      const statusText = await statusContent.textContent();
      // For right-aligned, text should end with "Status" (icon before)
      expect(statusText?.endsWith("Status")).toBe(true);
    });
  });

  test.describe("Loading", () => {
    test("loading cells have loading attribute", async ({ mount }) => {
      const component = await mount(<LoadingTable />);

      // Find cells with loading state
      const loadingCells = component.locator('[data-loading="true"]');
      await expect(loadingCells.first()).toBeVisible();
    });
  });

  test.describe("Cell Content", () => {
    test("renders label and description", async ({ mount }) => {
      const component = await mount(<DescriptionTable />);

      // Check name and email are visible
      await expect(component.locator("text=Alice Johnson")).toBeVisible();
      await expect(component.locator("text=alice@example.com")).toBeVisible();
    });
  });

  test.describe("Footer", () => {
    test("renders footer content", async ({ mount }) => {
      const component = await mount(<FooterTable />);

      await expect(component.locator("text=Showing 1–5 of 20")).toBeVisible();
    });

    test("footer supports navigation role and aria-label", async ({
      mount,
    }) => {
      const component = await mount(<FooterTable />);

      const footer = component.locator('[role="navigation"]');
      await expect(footer).toBeVisible();
      await expect(footer).toHaveAttribute("aria-label", "Table pagination");
    });

    test("compact footer renders at reduced height", async ({ mount }) => {
      const component = await mount(<CompactFooterTable />);

      const footer = component.locator('[role="navigation"]');
      await expect(footer).toHaveAttribute("data-size", "compact");
    });
  });

  test.describe("Keyboard Navigation", () => {
    test("sortable headers respond to keyboard", async ({ mount, page }) => {
      const component = await mount(<SortableTable />);

      const nameHeader = component.locator("th").filter({ hasText: "Name" });

      // Focus and press Enter to sort
      await nameHeader.focus();
      await page.keyboard.press("Enter");
      await expect(nameHeader).toHaveAttribute("data-sorted", "asc");

      // Press Space to toggle to descending
      await page.keyboard.press("Space");
      await expect(nameHeader).toHaveAttribute("data-sorted", "desc");
    });
  });

  test.describe("Clickable Rows", () => {
    test("rows with onClick are focusable", async ({ mount }) => {
      const component = await mount(<ClickableRowTable />);

      const firstRow = component.locator("tbody tr").first();
      await expect(firstRow).toHaveAttribute("tabindex", "0");
    });

    test("Enter key triggers onClick", async ({ mount, page }) => {
      const component = await mount(<ClickableRowTable />);

      const firstRow = component.locator("tbody tr").first();
      await firstRow.focus();
      await page.keyboard.press("Enter");

      await expect(component.locator('[data-testid="clicked-row"]')).toHaveText(
        "Alice Johnson",
      );
    });

    test("Space key triggers onClick", async ({ mount, page }) => {
      const component = await mount(<ClickableRowTable />);

      const secondRow = component.locator("tbody tr").nth(1);
      await secondRow.focus();
      await page.keyboard.press("Space");

      await expect(component.locator('[data-testid="clicked-row"]')).toHaveText(
        "Bob Smith",
      );
    });

    test("non-clickable rows are not focusable", async ({ mount }) => {
      const component = await mount(<BasicTable />);

      const firstRow = component.locator("tbody tr").first();
      await expect(firstRow).not.toHaveAttribute("tabindex");
    });

    // Edge cases (child bubbling, consumer onKeyDown) tested in Table.unit.test.tsx
    // Playwright CT has issues with keyboard events on <tr> elements
  });
});
