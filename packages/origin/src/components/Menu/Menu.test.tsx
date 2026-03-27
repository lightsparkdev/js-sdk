import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicMenu,
  MenuWithIcons,
  MenuWithShortcuts,
  MenuWithCheckboxItems,
  MenuWithRadioItems,
  MenuWithSeparator,
  MenuWithGroups,
  MenuWithDisabledItems,
  MenuWithSubmenu,
  ControlledMenu,
} from "./Menu.test-stories";

test.describe("Menu", () => {
  test("opens on trigger click", async ({ mount, page }) => {
    await mount(<BasicMenu />);

    // Menu should be closed initially
    await expect(page.getByRole("menu")).not.toBeVisible();

    // Click trigger to open
    await page.getByRole("button", { name: "Open Menu" }).click();

    // Menu should be visible
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Cut" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Copy" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Paste" })).toBeVisible();
  });

  test("closes on item click", async ({ mount, page }) => {
    await mount(<BasicMenu />);

    await page.getByRole("button", { name: "Open Menu" }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    await page.getByRole("menuitem", { name: "Cut" }).click();
    await expect(page.getByRole("menu")).not.toBeVisible();
  });

  test("closes on Escape key", async ({ mount, page }) => {
    await mount(<BasicMenu />);

    await page.getByRole("button", { name: "Open Menu" }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).not.toBeVisible();
  });

  test("supports keyboard navigation", async ({ mount, page }) => {
    await mount(<BasicMenu />);

    await page.getByRole("button", { name: "Open Menu" }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Arrow down to navigate
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Cut" })).toHaveAttribute(
      "data-highlighted",
      "",
    );

    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Copy" })).toHaveAttribute(
      "data-highlighted",
      "",
    );

    // Enter to select
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu")).not.toBeVisible();
  });

  test("renders leading and trailing icons", async ({ mount, page }) => {
    await mount(<MenuWithIcons />);

    await page.getByRole("button", { name: "Actions" }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Items should be visible with their content
    await expect(page.getByRole("menuitem", { name: "Cut" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Copy" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Paste" })).toBeVisible();
  });

  test("renders shortcut hints", async ({ mount, page }) => {
    await mount(<MenuWithShortcuts />);

    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Shortcuts should be visible
    await expect(page.getByText("⌘X")).toBeVisible();
    await expect(page.getByText("⌘C")).toBeVisible();
    await expect(page.getByText("⌘V")).toBeVisible();
  });

  test("checkbox items toggle state", async ({ mount, page }) => {
    await mount(<MenuWithCheckboxItems />);

    await page.getByRole("button", { name: "View" }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    // First item should be checked initially
    const minimapItem = page.getByRole("menuitemcheckbox", {
      name: "Show Minimap",
    });
    await expect(minimapItem).toHaveAttribute("data-checked", "");

    // Second item should be unchecked
    const breadcrumbsItem = page.getByRole("menuitemcheckbox", {
      name: "Show Breadcrumbs",
    });
    await expect(breadcrumbsItem).not.toHaveAttribute("data-checked");

    // Click to toggle
    await breadcrumbsItem.click();

    // Reopen menu to verify state persisted
    await page.getByRole("button", { name: "View" }).click();
    await expect(
      page.getByRole("menuitemcheckbox", { name: "Show Breadcrumbs" }),
    ).toHaveAttribute("data-checked", "");
  });

  test("radio items select single value", async ({ mount, page }) => {
    await mount(<MenuWithRadioItems />);

    await page.getByRole("button", { name: "Sort" }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Name should be selected initially
    await expect(
      page.getByRole("menuitemradio", { name: "Name" }),
    ).toHaveAttribute("data-checked", "");
    await expect(
      page.getByRole("menuitemradio", { name: "Date" }),
    ).not.toHaveAttribute("data-checked");

    // Click Date
    await page.getByRole("menuitemradio", { name: "Date" }).click();

    // Reopen to verify
    await page.getByRole("button", { name: "Sort" }).click();
    await expect(
      page.getByRole("menuitemradio", { name: "Date" }),
    ).toHaveAttribute("data-checked", "");
    await expect(
      page.getByRole("menuitemradio", { name: "Name" }),
    ).not.toHaveAttribute("data-checked");
  });

  test("renders separator", async ({ mount, page }) => {
    await mount(<MenuWithSeparator />);

    await page.getByRole("button", { name: "File" }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Separator should be present
    await expect(page.getByRole("separator")).toBeVisible();
  });

  test("renders groups with labels", async ({ mount, page }) => {
    await mount(<MenuWithGroups />);

    await page.getByRole("button", { name: "Options" }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Group labels should be visible
    await expect(page.getByText("Actions")).toBeVisible();
    await expect(page.getByText("View")).toBeVisible();
  });

  test("disabled items are not interactive", async ({ mount, page }) => {
    await mount(<MenuWithDisabledItems />);

    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Disabled items should have data-disabled
    await expect(page.getByRole("menuitem", { name: "Copy" })).toHaveAttribute(
      "data-disabled",
      "",
    );
    await expect(
      page.getByRole("menuitem", { name: "Delete" }),
    ).toHaveAttribute("data-disabled", "");

    // Clicking disabled item should not close menu
    await page.getByRole("menuitem", { name: "Copy" }).click({ force: true });
    await expect(page.getByRole("menu")).toBeVisible();
  });

  test("submenu opens on keyboard navigation", async ({ mount, page }) => {
    await mount(<MenuWithSubmenu />);

    await page.getByRole("button", { name: "File" }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Navigate to Share submenu trigger using keyboard
    const shareTrigger = page.getByRole("menuitem", { name: "Share" });

    // Press arrow down until Share is highlighted
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("ArrowDown");
      if ((await shareTrigger.getAttribute("data-highlighted")) === "") {
        break;
      }
    }

    // Arrow right to open submenu
    await page.keyboard.press("ArrowRight");

    // Wait for submenu to open
    await expect(page.getByRole("menuitem", { name: "Email" })).toBeVisible({
      timeout: 2000,
    });
  });

  test("controlled mode works", async ({ mount, page }) => {
    await mount(<ControlledMenu />);

    // Use trigger to open (external button also works but trigger is more direct)
    await page.getByRole("button", { name: "Controlled Menu" }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Click an item to close
    await page.getByRole("menuitem", { name: "Item 1" }).click();
    await expect(page.getByRole("menu")).not.toBeVisible();
  });
});
