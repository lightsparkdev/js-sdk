import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicContextMenu,
  ContextMenuWithIcons,
  ContextMenuWithCheckboxItems,
  ContextMenuWithRadioItems,
  ContextMenuWithSeparator,
  ContextMenuWithGroups,
  ContextMenuWithDisabledItems,
  ContextMenuWithSubmenu,
} from "./ContextMenu.test-stories";

test.describe("ContextMenu", () => {
  test("opens on right-click", async ({ mount, page }) => {
    await mount(<BasicContextMenu />);

    // Popup should not be visible initially
    await expect(page.getByRole("menu")).not.toBeVisible();

    // Right-click on trigger area
    await page.getByText("Right-click here").click({ button: "right" });

    // Popup should now be visible
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Cut" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Copy" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Paste" })).toBeVisible();
  });

  test("closes when clicking an item", async ({ mount, page }) => {
    await mount(<BasicContextMenu />);

    await page.getByText("Right-click here").click({ button: "right" });
    await expect(page.getByRole("menu")).toBeVisible();

    await page.getByRole("menuitem", { name: "Cut" }).click();
    await expect(page.getByRole("menu")).not.toBeVisible();
  });

  test("closes on Escape key", async ({ mount, page }) => {
    await mount(<BasicContextMenu />);

    await page.getByText("Right-click here").click({ button: "right" });
    await expect(page.getByRole("menu")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).not.toBeVisible();
  });

  test("supports keyboard navigation", async ({ mount, page }) => {
    await mount(<BasicContextMenu />);

    await page.getByText("Right-click here").click({ button: "right" });
    await expect(page.getByRole("menu")).toBeVisible();

    // Arrow down moves through items
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Cut" })).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Copy" })).toBeFocused();

    // Enter activates item and closes menu
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu")).not.toBeVisible();
  });

  test("renders with icons", async ({ mount, page }) => {
    await mount(<ContextMenuWithIcons />);

    await page.getByText("Right-click here").click({ button: "right" });
    await expect(page.getByRole("menu")).toBeVisible();

    // Items with icons should be present
    await expect(page.getByRole("menuitem", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Copy" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Delete" })).toBeVisible();
  });

  test("checkbox items toggle state", async ({ mount, page }) => {
    await mount(<ContextMenuWithCheckboxItems />);

    await page.getByText("Right-click here").click({ button: "right" });

    const minimapItem = page.getByRole("menuitemcheckbox", {
      name: "Show Minimap",
    });
    await expect(minimapItem).toHaveAttribute("aria-checked", "true");

    // Click to toggle (checkbox items keep menu open)
    await minimapItem.click();

    // Close menu with Escape, then re-open to verify state
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).not.toBeVisible();

    await page.getByText("Right-click here").click({ button: "right" });
    await expect(
      page.getByRole("menuitemcheckbox", { name: "Show Minimap" }),
    ).toHaveAttribute("aria-checked", "false");
  });

  test("radio items are mutually exclusive", async ({ mount, page }) => {
    await mount(<ContextMenuWithRadioItems />);

    await page.getByText("Right-click here").click({ button: "right" });

    // Initial state: "name" selected
    await expect(
      page.getByRole("menuitemradio", { name: "Name" }),
    ).toHaveAttribute("aria-checked", "true");
    await expect(
      page.getByRole("menuitemradio", { name: "Date" }),
    ).toHaveAttribute("aria-checked", "false");

    // Select "Date" (radio items keep menu open)
    await page.getByRole("menuitemradio", { name: "Date" }).click();

    // Close menu with Escape, then re-open to verify state
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).not.toBeVisible();

    await page.getByText("Right-click here").click({ button: "right" });
    await expect(
      page.getByRole("menuitemradio", { name: "Name" }),
    ).toHaveAttribute("aria-checked", "false");
    await expect(
      page.getByRole("menuitemradio", { name: "Date" }),
    ).toHaveAttribute("aria-checked", "true");
  });

  test("renders separator", async ({ mount, page }) => {
    await mount(<ContextMenuWithSeparator />);

    await page.getByText("Right-click here").click({ button: "right" });
    await expect(page.getByRole("separator")).toBeVisible();
  });

  test("renders groups with labels", async ({ mount, page }) => {
    await mount(<ContextMenuWithGroups />);

    await page.getByText("Right-click here").click({ button: "right" });
    await expect(page.getByRole("group", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("group", { name: "View" })).toBeVisible();
  });

  test("disabled items cannot be activated", async ({ mount, page }) => {
    await mount(<ContextMenuWithDisabledItems />);

    await page.getByText("Right-click here").click({ button: "right" });

    const disabledItem = page.getByRole("menuitem", { name: "Copy" });
    await expect(disabledItem).toHaveAttribute("aria-disabled", "true");

    // Clicking disabled item should not close menu
    await disabledItem.click({ force: true });
    await expect(page.getByRole("menu")).toBeVisible();
  });

  test("submenu opens on hover", async ({ mount, page }) => {
    await mount(<ContextMenuWithSubmenu />);

    await page.getByText("Right-click here").click({ button: "right" });
    await expect(page.getByRole("menu")).toBeVisible();

    // Hover over submenu trigger
    await page.getByRole("menuitem", { name: "Share" }).hover();

    // Submenu should appear
    await expect(page.getByRole("menuitem", { name: "Email" })).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: "Messages" }),
    ).toBeVisible();
  });
});
