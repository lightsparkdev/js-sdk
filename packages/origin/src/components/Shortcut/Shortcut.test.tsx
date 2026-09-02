import { test, expect } from "@playwright/experimental-ct-react";
import {
  SingleKey,
  MultipleKeys,
  TwoKeys,
  CustomClassName,
  IconKey,
} from "./Shortcut.test-stories";
import { resolveTokenColor } from "@test-utils/resolveTokenColor";

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

    test("renders a node key inside a kbd with an accessible name", async ({
      mount,
      page,
    }) => {
      await mount(<IconKey />);
      const kbd = page.locator("kbd");
      await expect(kbd).toHaveCount(1);
      await expect(page.getByRole("img", { name: "Arrow up" })).toBeVisible();
      await expect(kbd.locator("svg")).toBeVisible();
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

    test("key background uses the alpha surface token", async ({
      mount,
      page,
    }) => {
      await mount(<SingleKey />);
      const kbd = page.locator("kbd");
      const expected = await resolveTokenColor(
        page,
        "--surface-alpha-primary",
        "backgroundColor",
      );
      await expect(kbd).toHaveCSS("background-color", expected);
      // Alpha token must stay translucent so the key adapts to its surface.
      expect(expected).toMatch(/rgba\(.*0\.0\d+\)/);
    });
  });
});
