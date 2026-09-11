import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultChip,
  DisabledChip,
  DisabledFilterChipWithTrigger,
  DisabledFilterChipWithMenuTrigger,
  FilterChip,
  FilterChipWithNodeValue,
  FilterChipWithNumericValue,
  FilterChipWithTriggerValue,
  FilterChipWithTriggerValueNoLabel,
  FilterChipWithRawAttributeTrigger,
  FilterChipWithPlainButtonValue,
  ChipNoDismiss,
  ChipWithArbitraryChild,
} from "./Chip.test-stories";
import { resolveTokenColor } from "@test-utils/resolveTokenColor";

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

    test("dismiss hover uses the hover surface, clipped by the chip radius", async ({
      mount,
      page,
    }) => {
      await mount(<DefaultChip />);
      const chip = page.locator("span").first();
      // Hover backgrounds on interactive segments are clipped to the
      // chip's rounded corners.
      await expect(chip).toHaveCSS("overflow", "hidden");

      const hoverColor = await resolveTokenColor(
        page,
        "--surface-hover",
        "backgroundColor",
      );
      const dismissButton = page.getByRole("button", { name: /remove/i });
      await dismissButton.hover();
      await expect(dismissButton).toHaveCSS("background-color", hoverColor);
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

    test("numeric value appears in the dismiss aria-label without valueLabel", async ({
      mount,
      page,
    }) => {
      await mount(<FilterChipWithNumericValue />);
      await expect(
        page.getByRole("button", { name: "Remove filter Count = 5" }),
      ).toBeVisible();
    });

    test("renders a non-string value node", async ({ mount, page }) => {
      await mount(<FilterChipWithNodeValue />);
      await expect(page.locator('[data-testid="node-value"]')).toHaveText(
        "Active",
      );
      await expect(
        page.getByRole("button", { name: "Remove filter Status is Active" }),
      ).toBeVisible();
    });

    test("trigger inside value is clickable", async ({ mount, page }) => {
      await mount(<FilterChipWithTriggerValue />);
      const trigger = page.getByRole("button", { name: "Active", exact: true });
      await trigger.click();
      await trigger.click();
      await expect(page.locator('[data-testid="click-count"]')).toHaveText("2");
    });

    test("opted-in trigger takes over the segment padding", async ({
      mount,
      page,
    }) => {
      await mount(<FilterChipWithTriggerValue />);
      // Segments are property / operator / value in order; the value segment
      // cedes its padding to the data-chip-trigger element.
      const chip = page.locator("span").first();
      const valueSegment = chip.locator("> span").nth(2);
      await expect(valueSegment).toHaveCSS("padding", "0px");
    });

    test("a raw data-chip-trigger attribute still takes over the segment", async ({
      mount,
      page,
    }) => {
      await mount(<FilterChipWithRawAttributeTrigger />);
      // Published contract: consumers who set the attribute directly (before
      // ChipFilter.Trigger existed) keep the segment-takeover styling.
      const chip = page.locator("span").first();
      const valueSegment = chip.locator("> span").nth(2);
      await expect(valueSegment).toHaveCSS("padding", "0px");
    });

    test("a button without data-chip-trigger is not restyled", async ({
      mount,
      page,
    }) => {
      await mount(<FilterChipWithPlainButtonValue />);
      // Buttons that don't opt in to the trigger contract must not trigger
      // the segment-padding takeover or the button-reset styling.
      const chip = page.locator("span").first();
      const valueSegment = chip.locator("> span").nth(2);
      await expect(valueSegment).not.toHaveCSS("padding", "0px");
    });

    test("uses valueLabel in dismiss aria-label for node values", async ({
      mount,
      page,
    }) => {
      await mount(<FilterChipWithTriggerValue />);
      const dismissButton = page.getByRole("button", {
        name: "Remove filter Status is Active",
      });
      await dismissButton.click();
      await expect(page.locator('[data-testid="dismissed"]')).toBeVisible();
    });

    test("omits value from dismiss aria-label when no valueLabel is given", async ({
      mount,
      page,
    }) => {
      await mount(<FilterChipWithTriggerValueNoLabel />);
      await expect(
        page.getByRole("button", { name: "Remove filter Status is" }),
      ).toBeVisible();
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

    test("filter trigger is not focusable when the chip is disabled", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledFilterChipWithTrigger />);
      const trigger = page.getByRole("button", { name: "Active", exact: true });
      await expect(trigger).toBeDisabled();

      // Keyboard access must be blocked too — data-disabled only stops
      // pointer events.
      await page.keyboard.press("Tab");
      await expect(trigger).not.toBeFocused();
      await expect(page.locator('[data-testid="click-count"]')).toHaveText("0");
    });

    test("menu-composed filter trigger is not focusable when the chip is disabled", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledFilterChipWithMenuTrigger />);
      const trigger = page.getByRole("button", { name: "Active", exact: true });
      await expect(trigger).toBeDisabled();

      await page.keyboard.press("Tab");
      await expect(trigger).not.toBeFocused();
      await expect(page.locator('[data-testid="menu-item"]')).not.toBeVisible();
    });
  });
});
