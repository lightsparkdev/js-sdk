import { test, expect } from "@playwright/experimental-ct-react";
import {
  TestDefault,
  TestHover,
  TestWithArrow,
  TestRichContent,
} from "./PreviewCard.test-stories";

test.describe("PreviewCard", () => {
  test.describe("Core", () => {
    test("has no accessibility violations", async ({ mount, page }) => {
      await mount(<TestDefault />);
      const AxeBuilder = (await import("@axe-core/playwright")).default;
      const results = await new AxeBuilder({ page })
        .exclude("html")
        .disableRules(["landmark-one-main", "page-has-heading-one", "region"])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("renders popup when defaultOpen", async ({ mount, page }) => {
      await mount(<TestDefault />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();
      await expect(popup).toContainText("Preview content");
      await expect(popup).toHaveAttribute("data-open", "");
    });

    test("shows on hover", async ({ mount, page }) => {
      await mount(<TestHover />);
      const popup = page.getByTestId("popup");
      await expect(popup).not.toBeVisible();

      const trigger = page.getByTestId("trigger");
      await trigger.hover();
      await expect(popup).toBeVisible();
    });

    test("hides on escape", async ({ mount, page }) => {
      await mount(<TestDefault />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(popup).not.toBeVisible();
    });
  });

  test.describe("Arrow", () => {
    test("renders arrow element", async ({ mount, page }) => {
      await mount(<TestWithArrow />);
      const arrow = page.getByTestId("arrow");
      await expect(arrow).toBeAttached();
    });
  });

  test.describe("Rich content", () => {
    test("supports interactive content inside popup", async ({
      mount,
      page,
    }) => {
      await mount(<TestRichContent />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();

      const innerLink = page.getByTestId("inner-link");
      await expect(innerLink).toBeVisible();
    });
  });
});
