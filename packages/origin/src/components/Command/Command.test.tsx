import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicCommand,
  CommandWithTrigger,
  CommandWithGroups,
  CommandWithIcons,
  CommandWithDisabledItems,
  ControlledCommand,
  CommandWithCallback,
  FigmaDesignCommand,
  CommandWithKeywords,
} from "./Command.test-stories";

test.describe("Command", () => {
  test.describe("basic rendering", () => {
    test("renders command popup when open", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const popup = page.getByRole("dialog");
      await expect(popup).toBeVisible();
    });

    test("renders input with placeholder", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const input = page.getByPlaceholder("Type a command or search...");
      await expect(input).toBeVisible();
    });

    test("renders command items", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      await expect(page.getByRole("option", { name: "Copy" })).toBeVisible();
      await expect(page.getByRole("option", { name: "Paste" })).toBeVisible();
      await expect(page.getByRole("option", { name: "Cut" })).toBeVisible();
    });
  });

  test.describe("trigger behavior", () => {
    test("opens command when trigger is clicked", async ({ mount, page }) => {
      await mount(<CommandWithTrigger />);
      const trigger = page.getByText("Open Command");
      await trigger.click();
      const popup = page.getByRole("dialog");
      await expect(popup).toBeVisible();
    });
  });

  test.describe("groups", () => {
    test("renders groups with headings", async ({ mount, page }) => {
      await mount(<CommandWithGroups />);
      await expect(page.getByText("Suggestions")).toBeVisible();
      await expect(page.getByText("Settings")).toBeVisible();
    });
  });

  test.describe("icons", () => {
    test("renders items with icons", async ({ mount, page }) => {
      await mount(<CommandWithIcons />);
      await expect(page.getByRole("option", { name: "Copy" })).toBeVisible();
      await expect(page.getByRole("option", { name: "Paste" })).toBeVisible();
    });
  });

  test.describe("disabled state", () => {
    test("renders disabled items with data-disabled", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithDisabledItems />);
      const disabledItem = page.getByRole("option", { name: "Disabled Item" });
      await expect(disabledItem).toHaveAttribute("data-disabled");
    });

    test("skips disabled items during keyboard navigation", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithDisabledItems />);
      const input = page.getByPlaceholder("Type a command or search...");
      await input.focus();

      // Wait for auto-highlight
      await page.waitForTimeout(200);

      // First item (Enabled Item) is auto-highlighted, ArrowDown twice should skip disabled
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(100);
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(100);

      // Should have skipped the disabled item and gone to Another Item
      const anotherItem = page.getByRole("option", { name: "Another Item" });
      await expect(anotherItem).toHaveAttribute("data-highlighted");
    });
  });

  test.describe("empty state", () => {
    test("shows empty state when no results match", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const input = page.getByPlaceholder("Type a command or search...");
      // Type something that won't match
      await input.fill("xyz123");
      await expect(page.getByText("No results.")).toBeVisible();
    });
  });

  test.describe("filtering", () => {
    test("filters items based on search input", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const input = page.getByPlaceholder("Type a command or search...");
      await input.fill("cop");
      await expect(page.getByRole("option", { name: "Copy" })).toBeVisible();
      await expect(
        page.getByRole("option", { name: "Paste" }),
      ).not.toBeVisible();
    });

    test("filters by keywords", async ({ mount, page }) => {
      await mount(<CommandWithKeywords />);
      const input = page.getByPlaceholder("Try searching 'duplicate'...");
      await input.fill("duplicate");
      // "Copy" has keyword "duplicate"
      await expect(page.getByRole("option", { name: "Copy" })).toBeVisible();
      // Others should be hidden
      await expect(
        page.getByRole("option", { name: "Paste" }),
      ).not.toBeVisible();
    });
  });

  test.describe("keyboard navigation", () => {
    test("auto-highlights first item", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      // Wait for auto-highlight
      await page.waitForTimeout(50);
      const firstItem = page.getByRole("option", { name: "Copy" });
      await expect(firstItem).toHaveAttribute("data-highlighted", "");
    });

    test("navigates through items with arrow keys", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const input = page.getByPlaceholder("Type a command or search...");
      await input.focus();

      // Wait for auto-highlight
      await page.waitForTimeout(100);

      // First item is already highlighted, ArrowDown moves to second
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(50);

      const secondItem = page.getByRole("option", { name: "Paste" });
      await expect(secondItem).toHaveAttribute("data-highlighted", "");
    });

    test("selects item on Enter", async ({ mount, page }) => {
      await mount(<CommandWithCallback />);
      const input = page.getByPlaceholder("Type a command or search...");
      await input.focus();

      // Wait for auto-highlight
      await page.waitForTimeout(100);

      // First item is auto-highlighted, just press Enter
      await page.keyboard.press("Enter");
      await page.waitForTimeout(50);

      const selected = page.getByTestId("selected");
      await expect(selected).toHaveText("copy");
    });

    test("closes on backdrop click", async ({ mount, page }) => {
      await mount(<ControlledCommand />);
      // Click on backdrop to close
      const backdrop = page.locator('[class*="backdrop"]');
      await backdrop.click({ force: true });

      const popup = page.getByRole("dialog");
      await expect(popup).not.toBeVisible();
    });

    test("loops navigation by default", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const input = page.getByPlaceholder("Type a command or search...");
      await input.focus();

      // Wait for auto-highlight
      await page.waitForTimeout(100);

      // Go up from first item - should loop to last
      await page.keyboard.press("ArrowUp");
      await page.waitForTimeout(50);

      const lastItem = page.getByRole("option", { name: "Cut" });
      await expect(lastItem).toHaveAttribute("data-highlighted", "");
    });
  });

  test.describe("selection", () => {
    test("calls onSelect when item is clicked", async ({ mount, page }) => {
      await mount(<CommandWithCallback />);
      const item = page.getByRole("option", { name: "Copy" });
      await item.click();

      const selected = page.getByTestId("selected");
      await expect(selected).toHaveText("copy");
    });
  });

  test.describe("accessibility", () => {
    test("has proper ARIA attributes on input", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const input = page.getByPlaceholder("Type a command or search...");
      await expect(input).toHaveAttribute("role", "combobox");
      await expect(input).toHaveAttribute("aria-autocomplete", "list");
    });

    test("has proper ARIA attributes on list", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const list = page.getByRole("listbox");
      await expect(list).toBeVisible();
    });

    test("items have option role", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const items = page.getByRole("option");
      await expect(items).toHaveCount(3);
    });
  });

  test.describe("Figma design", () => {
    test("renders matching Figma design structure", async ({ mount, page }) => {
      await mount(<FigmaDesignCommand />);
      const popup = page.getByRole("dialog");
      await expect(popup).toBeVisible();
      await expect(page.getByText("Title")).toBeVisible();
      const items = page.getByRole("option");
      await expect(items).toHaveCount(4);
    });
  });
});
