import { test, expect } from "@playwright/experimental-ct-react";
import {
  SingleKey,
  MultipleKeys,
  TwoKeys,
  CustomClassName,
} from "./Shortcut.test-stories";

test.describe("Shortcut", () => {
  test.describe("rendering", () => {
    test("renders a single key", async ({ mount, page }) => {
      await mount(<SingleKey />);
      await expect(page.getByText("⌘")).toBeVisible();
    });

    test("renders two keys", async ({ mount, page }) => {
      await mount(<TwoKeys />);
      await expect(page.getByText("⌘")).toBeVisible();
      await expect(page.getByText("K")).toBeVisible();
    });

    test("renders multiple keys", async ({ mount, page }) => {
      await mount(<MultipleKeys />);
      await expect(page.getByText("⌘")).toBeVisible();
      await expect(page.getByText("⇧")).toBeVisible();
      await expect(page.getByText("K")).toBeVisible();
    });
  });

  test.describe("accessibility", () => {
    test("uses semantic kbd elements", async ({ mount, page }) => {
      await mount(<SingleKey />);
      const kbd = page.locator("kbd");
      await expect(kbd).toHaveCount(1);
      await expect(kbd).toContainText("⌘");
    });

    test("container has role=group for multiple keys", async ({
      mount,
      page,
    }) => {
      await mount(<MultipleKeys />);
      const container = page.locator('[role="group"]');
      await expect(container).toBeVisible();
    });
  });

  test.describe("custom styling", () => {
    test("applies custom className", async ({ mount, page }) => {
      await mount(<CustomClassName />);
      const shortcut = page.locator(".custom-class");
      await expect(shortcut).toBeVisible();
    });
  });
});
