import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicMenubar,
  MenubarWithShortcuts,
  MenubarWithSubmenu,
  MenubarDisabled,
  MenubarKeyboardNavigation,
} from "./Menubar.test-stories";

test.describe("Menubar", () => {
  test("renders menubar with triggers", async ({ mount, page }) => {
    await mount(<BasicMenubar />);

    await expect(page.getByRole("menubar")).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "File" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "View" })).toBeVisible();
  });

  test("opens menu on trigger click", async ({ mount, page }) => {
    await mount(<BasicMenubar />);

    await page.getByRole("menuitem", { name: "File" }).click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "New" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Open" })).toBeVisible();
  });

  test("closes menu on item click", async ({ mount, page }) => {
    await mount(<BasicMenubar />);

    await page.getByRole("menuitem", { name: "File" }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    await page.getByRole("menuitem", { name: "New" }).click();
    await expect(page.getByRole("menu")).not.toBeVisible();
  });

  test("navigates between menus with arrow keys", async ({ mount, page }) => {
    await mount(<MenubarKeyboardNavigation />);

    // Open first menu
    await page.getByRole("menuitem", { name: "First" }).click();
    await expect(page.getByRole("menuitem", { name: "Item A" })).toBeVisible();

    // Arrow right to next menu
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("menuitem", { name: "Item C" })).toBeVisible();

    // Arrow right again
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("menuitem", { name: "Item E" })).toBeVisible();

    // Arrow left back
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("menuitem", { name: "Item C" })).toBeVisible();
  });

  test("closes menu on Escape", async ({ mount, page }) => {
    await mount(<BasicMenubar />);

    await page.getByRole("menuitem", { name: "File" }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).not.toBeVisible();
  });

  test("renders shortcuts in menu items", async ({ mount, page }) => {
    await mount(<MenubarWithShortcuts />);

    await page.getByRole("menuitem", { name: "File" }).click();
    await expect(page.getByText("⌘N")).toBeVisible();
    await expect(page.getByText("⌘O")).toBeVisible();
    await expect(page.getByText("⌘S")).toBeVisible();
  });

  test("opens submenu", async ({ mount, page }) => {
    await mount(<MenubarWithSubmenu />);

    await page.getByRole("menuitem", { name: "File" }).click();
    await page.getByRole("menuitem", { name: "Export" }).hover();

    await expect(page.getByRole("menuitem", { name: "PDF" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "PNG" })).toBeVisible();
  });

  test("disabled menubar prevents interaction", async ({ mount, page }) => {
    await mount(<MenubarDisabled />);

    const fileTrigger = page.getByRole("menuitem", { name: "File" });
    await expect(fileTrigger).toHaveAttribute("data-disabled", "");

    await fileTrigger.click({ force: true });
    await expect(page.getByRole("menu")).not.toBeVisible();
  });
});
