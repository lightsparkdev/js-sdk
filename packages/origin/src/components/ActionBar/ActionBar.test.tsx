import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultActionBar,
  ActionBarWithCallbacks,
  ActionBarSingleButton,
  ActionBarCustomClassName,
} from "./ActionBar.test-stories";

test.describe("ActionBar", () => {
  test.describe("rendering", () => {
    test("renders with label and buttons", async ({ mount, page }) => {
      await mount(<DefaultActionBar />);
      const actionBar = page.getByTestId("action-bar");
      await expect(actionBar).toBeVisible();
      await expect(actionBar).toContainText("4 transactions selected");
      await expect(page.getByRole("button", { name: "Clear" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Export" })).toBeVisible();
    });

    test("renders label text correctly", async ({ mount, page }) => {
      await mount(<DefaultActionBar />);
      const label = page.getByTestId("action-bar-label");
      await expect(label).toContainText("4 transactions selected");
    });

    test("renders single button action bar", async ({ mount, page }) => {
      await mount(<ActionBarSingleButton />);
      const actionBar = page.getByTestId("action-bar");
      await expect(actionBar).toBeVisible();
      await expect(actionBar).toContainText("2 items selected");
      await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
    });
  });

  test.describe("accessibility", () => {
    test("has group role", async ({ mount, page }) => {
      await mount(<DefaultActionBar />);
      const group = page.getByRole("group");
      await expect(group).toBeVisible();
    });

    test("has aria-label for screen readers", async ({ mount, page }) => {
      await mount(<DefaultActionBar />);
      const group = page.getByRole("group", { name: "Selection actions" });
      await expect(group).toBeVisible();
    });

    test("buttons are focusable", async ({ mount, page }) => {
      await mount(<DefaultActionBar />);
      const clearButton = page.getByRole("button", { name: "Clear" });
      await clearButton.focus();
      await expect(clearButton).toBeFocused();
    });

    test("label has aria-live for selection count announcements", async ({
      mount,
      page,
    }) => {
      await mount(<DefaultActionBar />);
      const label = page.getByTestId("action-bar-label");
      await expect(label).toHaveAttribute("aria-live", "polite");
      await expect(label).toHaveAttribute("aria-atomic", "true");
    });
  });

  test.describe("button interactions", () => {
    test("clear button click triggers callback", async ({ mount, page }) => {
      await mount(<ActionBarWithCallbacks />);
      const clearButton = page.getByRole("button", { name: "Clear" });
      await clearButton.click();
      await expect(page.getByTestId("cleared")).toBeVisible();
    });

    test("export button click triggers callback", async ({ mount, page }) => {
      await mount(<ActionBarWithCallbacks />);
      const exportButton = page.getByRole("button", { name: "Export" });
      await exportButton.click();
      await expect(page.getByTestId("exported")).toBeVisible();
    });

    test("clear button activates on Enter key", async ({ mount, page }) => {
      await mount(<ActionBarWithCallbacks />);
      const clearButton = page.getByRole("button", { name: "Clear" });
      await clearButton.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("cleared")).toBeVisible();
    });

    test("export button activates on Space key", async ({ mount, page }) => {
      await mount(<ActionBarWithCallbacks />);
      const exportButton = page.getByRole("button", { name: "Export" });
      await exportButton.focus();
      await page.keyboard.press(" ");
      await expect(page.getByTestId("exported")).toBeVisible();
    });
  });

  test.describe("custom className", () => {
    test("accepts custom className on root", async ({ mount, page }) => {
      await mount(<ActionBarCustomClassName />);
      const actionBar = page.getByTestId("action-bar");
      await expect(actionBar).toHaveClass(/custom-class/);
    });
  });
});
