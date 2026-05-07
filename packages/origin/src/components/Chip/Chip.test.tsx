import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultChip,
  DisabledChip,
  FilterChip,
  ChipNoDismiss,
  ChipWithArbitraryChild,
} from "./Chip.test-stories";

test.describe("Chip", () => {
  test.describe("default behavior", () => {
    test("renders with label", async ({ mount, page }) => {
      await mount(<DefaultChip />);
      const chip = page.locator("span").first();
      await expect(chip).toBeVisible();
      await expect(chip).toContainText("Test Label");
    });

    test("renders arbitrary children directly", async ({ mount, page }) => {
      await mount(<ChipWithArbitraryChild />);
      const chip = page.locator("span").first();

      await expect(
        chip.locator("> [data-testid='chip-custom-child']"),
      ).toHaveText("Custom child");
    });

    test("dismiss button has correct aria-label", async ({ mount, page }) => {
      await mount(<DefaultChip />);
      const dismissButton = page.getByRole("button", { name: /remove/i });
      await expect(dismissButton).toBeVisible();
    });

    test("dismisses on click", async ({ mount, page }) => {
      await mount(<DefaultChip />);
      const dismissButton = page.getByRole("button", { name: /remove/i });
      await dismissButton.click();
      await expect(page.locator('[data-testid="dismissed"]')).toBeVisible();
    });

    test("dismisses on Enter key", async ({ mount, page }) => {
      await mount(<DefaultChip />);
      const dismissButton = page.getByRole("button", { name: /remove/i });
      await dismissButton.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator('[data-testid="dismissed"]')).toBeVisible();
    });

    test("dismisses on Space key", async ({ mount, page }) => {
      await mount(<DefaultChip />);
      const dismissButton = page.getByRole("button", { name: /remove/i });
      await dismissButton.focus();
      await page.keyboard.press(" ");
      await expect(page.locator('[data-testid="dismissed"]')).toBeVisible();
    });
  });

  test.describe("disabled state", () => {
    test("has data-disabled attribute when disabled", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledChip />);
      const chip = page.locator("span[data-disabled]").first();
      await expect(chip).toBeVisible();
    });

    test("dismiss button is disabled", async ({ mount, page }) => {
      await mount(<DisabledChip />);
      const dismissButton = page.getByRole("button", { name: /remove/i });
      await expect(dismissButton).toBeDisabled();
    });

    test("does not dismiss when disabled", async ({ mount, page }) => {
      await mount(<DisabledChip />);
      const dismissButton = page.getByRole("button", { name: /remove/i });
      await dismissButton.click({ force: true });
      await expect(page.locator('[data-testid="dismissed"]')).not.toBeVisible();
    });
  });

  test.describe("filter variant", () => {
    test("renders property, operator, and value", async ({ mount, page }) => {
      await mount(<FilterChip />);
      const chip = page.locator("span").first();
      await expect(chip).toContainText("Status");
      await expect(chip).toContainText("is");
      await expect(chip).toContainText("Active");
    });

    test("dismisses on click", async ({ mount, page }) => {
      await mount(<FilterChip />);
      const dismissButton = page.getByRole("button", {
        name: /remove filter/i,
      });
      await dismissButton.click();
      await expect(page.locator('[data-testid="dismissed"]')).toBeVisible();
    });
  });

  test.describe("no dismiss button", () => {
    test("does not render dismiss button when onDismiss not provided", async ({
      mount,
      page,
    }) => {
      await mount(<ChipNoDismiss />);
      const chip = page.locator("span").first();
      await expect(chip).toBeVisible();
      await expect(page.getByRole("button")).not.toBeVisible();
    });
  });

  test.describe("keyboard navigation", () => {
    test("dismiss button is focusable", async ({ mount, page }) => {
      await mount(<DefaultChip />);
      const dismissButton = page.getByRole("button", { name: /remove/i });
      await dismissButton.focus();
      await expect(dismissButton).toBeFocused();
    });

    test("dismiss button is not focusable when disabled", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledChip />);
      const dismissButton = page.getByRole("button", { name: /remove/i });
      await expect(dismissButton).toBeDisabled();
    });
  });
});
