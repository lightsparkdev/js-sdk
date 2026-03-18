import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicToast,
  ToastWithDescription,
  ToastWithAction,
  InfoToast,
  SuccessToast,
  WarningToast,
  InvalidToast,
  MultipleToasts,
  NoAutoDismiss,
} from "./Toast.test-stories";

test.describe("Toast", () => {
  test.describe("Core", () => {
    test("shows toast when triggered", async ({ mount, page }) => {
      await mount(<BasicToast />);
      const trigger = page.getByTestId("trigger");
      await trigger.click();

      const toast = page.getByText("Toast title");
      await expect(toast).toBeVisible();
    });

    test("renders title and description", async ({ mount, page }) => {
      await mount(<ToastWithDescription />);
      const trigger = page.getByTestId("trigger");
      await trigger.click();

      await expect(page.getByText("Toast title")).toBeVisible();
      await expect(page.getByText("Toast description.")).toBeVisible();
    });

    test("renders action button", async ({ mount, page }) => {
      await mount(<ToastWithAction />);
      const trigger = page.getByTestId("trigger");
      await trigger.click();

      // Wait for toast content to be visible first
      await expect(page.getByText("Toast title")).toBeVisible();
      // Check action button
      const actionButton = page.getByRole("button", { name: "Undo" });
      await expect(actionButton).toBeVisible();
    });
  });

  test.describe("Variants", () => {
    test("renders info variant with icon", async ({ mount, page }) => {
      await mount(<InfoToast />);
      const trigger = page.getByTestId("trigger");
      await trigger.click();

      const toast = page.locator('[data-variant="info"]');
      await expect(toast).toBeVisible();
    });

    test("renders success variant with icon", async ({ mount, page }) => {
      await mount(<SuccessToast />);
      const trigger = page.getByTestId("trigger");
      await trigger.click();

      const toast = page.locator('[data-variant="success"]');
      await expect(toast).toBeVisible();
    });

    test("renders warning variant with icon", async ({ mount, page }) => {
      await mount(<WarningToast />);
      const trigger = page.getByTestId("trigger");
      await trigger.click();

      const toast = page.locator('[data-variant="warning"]');
      await expect(toast).toBeVisible();
    });

    test("renders invalid variant with icon", async ({ mount, page }) => {
      await mount(<InvalidToast />);
      const trigger = page.getByTestId("trigger");
      await trigger.click();

      const toast = page.locator('[data-variant="invalid"]');
      await expect(toast).toBeVisible();
    });
  });

  test.describe("Close button", () => {
    test("closes toast when close button clicked", async ({ mount, page }) => {
      await mount(<NoAutoDismiss />);
      const trigger = page.getByTestId("trigger");
      await trigger.click();

      const toast = page.getByText("Persistent toast");
      await expect(toast).toBeVisible();

      // Find the close button by aria-label
      const closeButton = page.getByLabel("Close toast");
      await closeButton.click();

      await expect(toast).not.toBeVisible();
    });
  });

  test.describe("Multiple toasts", () => {
    test("can show multiple toasts", async ({ mount, page }) => {
      await mount(<MultipleToasts />);
      const trigger = page.getByTestId("multi-trigger");

      // Add 2 toasts
      await trigger.click();
      await page.waitForTimeout(100);
      await trigger.click();

      // Should show at least 2 toasts
      await expect(page.getByText("Toast 1")).toBeVisible();
      await expect(page.getByText("Toast 2")).toBeVisible();
    });
  });

  test.describe("Reduced motion", () => {
    test("respects prefers-reduced-motion", async ({ mount, page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await mount(<BasicToast />);
      const trigger = page.getByTestId("trigger");
      await trigger.click();

      const toast = page.locator('[data-variant="default"]');
      await expect(toast).toBeVisible();

      const transition = await toast.evaluate(
        (el) => window.getComputedStyle(el).transition,
      );
      expect(transition).toMatch(/none|all 0s/);
    });
  });
});
