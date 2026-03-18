import { test, expect } from "@playwright/experimental-ct-react";
import {
  TestToggleDefault,
  TestToggleWithLabel,
  TestToggleDefaultPressed,
  TestToggleControlled,
  TestToggleDisabled,
  TestTogglePressedDisabled,
  TestToggleGroupDefault,
  TestToggleGroupDefaultValue,
  TestToggleGroupControlled,
  TestToggleGroupMultiple,
  TestToggleGroupDisabled,
  TestToggleGroupKeyboard,
} from "./Toggle.test-stories";

test.describe("Toggle", () => {
  test("renders as a button", async ({ mount, page }) => {
    await mount(<TestToggleDefault />);

    const toggle = page.getByTestId("toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveRole("button");
  });

  test("renders children as label", async ({ mount, page }) => {
    await mount(<TestToggleWithLabel />);

    const toggle = page.getByTestId("toggle");
    await expect(toggle).toHaveText("Favorite");
  });

  test("toggles pressed state on click", async ({ mount, page }) => {
    await mount(<TestToggleDefault />);

    const toggle = page.getByTestId("toggle");
    await expect(toggle).not.toHaveAttribute("data-pressed", "");

    await toggle.click();
    await expect(toggle).toHaveAttribute("data-pressed", "");

    await toggle.click();
    await expect(toggle).not.toHaveAttribute("data-pressed", "");
  });

  test("supports defaultPressed", async ({ mount, page }) => {
    await mount(<TestToggleDefaultPressed />);

    const toggle = page.getByTestId("toggle");
    await expect(toggle).toHaveAttribute("data-pressed", "");
  });

  test("supports controlled state", async ({ mount, page }) => {
    await mount(<TestToggleControlled />);

    const toggle = page.getByTestId("toggle");
    const pressBtn = page.getByTestId("press-btn");
    const unpressBtn = page.getByTestId("unpress-btn");

    await expect(toggle).not.toHaveAttribute("data-pressed", "");

    await pressBtn.click();
    await expect(toggle).toHaveAttribute("data-pressed", "");

    await unpressBtn.click();
    await expect(toggle).not.toHaveAttribute("data-pressed", "");
  });

  test("supports disabled state", async ({ mount, page }) => {
    await mount(<TestToggleDisabled />);

    const toggle = page.getByTestId("toggle");
    await expect(toggle).toHaveAttribute("data-disabled", "");
    await expect(toggle).toBeDisabled();
  });

  test("toggles on Space key", async ({ mount, page }) => {
    await mount(<TestToggleDefault />);

    const toggle = page.getByTestId("toggle");
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(toggle).toHaveAttribute("data-pressed", "");
  });

  test("toggles on Enter key", async ({ mount, page }) => {
    await mount(<TestToggleDefault />);

    const toggle = page.getByTestId("toggle");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("data-pressed", "");
  });

  test("does not toggle when disabled", async ({ mount, page }) => {
    await mount(<TestToggleDisabled />);

    const toggle = page.getByTestId("toggle");
    await toggle.click({ force: true });
    await expect(toggle).not.toHaveAttribute("data-pressed", "");
  });

  test("has aria-pressed attribute", async ({ mount, page }) => {
    await mount(<TestToggleDefault />);

    const toggle = page.getByTestId("toggle");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  test("renders pressed and disabled together", async ({ mount, page }) => {
    await mount(<TestTogglePressedDisabled />);

    const toggle = page.getByTestId("toggle");
    await expect(toggle).toHaveAttribute("data-pressed", "");
    await expect(toggle).toHaveAttribute("data-disabled", "");
    await expect(toggle).toBeDisabled();

    // Clicking should not change state
    await toggle.click({ force: true });
    await expect(toggle).toHaveAttribute("data-pressed", "");
  });
});

test.describe("ToggleGroup", () => {
  test("renders a group of toggles", async ({ mount, page }) => {
    await mount(<TestToggleGroupDefault />);

    const group = page.getByTestId("group");
    await expect(group).toBeVisible();

    await expect(page.getByTestId("toggle-a")).toBeVisible();
    await expect(page.getByTestId("toggle-b")).toBeVisible();
    await expect(page.getByTestId("toggle-c")).toBeVisible();
  });

  test("supports single selection (default)", async ({ mount, page }) => {
    await mount(<TestToggleGroupDefault />);

    const toggleA = page.getByTestId("toggle-a");
    const toggleB = page.getByTestId("toggle-b");

    await toggleA.click();
    await expect(toggleA).toHaveAttribute("data-pressed", "");

    // Clicking B should deselect A
    await toggleB.click();
    await expect(toggleB).toHaveAttribute("data-pressed", "");
    await expect(toggleA).not.toHaveAttribute("data-pressed", "");
  });

  test("supports defaultValue", async ({ mount, page }) => {
    await mount(<TestToggleGroupDefaultValue />);

    const toggleB = page.getByTestId("toggle-b");
    await expect(toggleB).toHaveAttribute("data-pressed", "");

    const toggleA = page.getByTestId("toggle-a");
    await expect(toggleA).not.toHaveAttribute("data-pressed", "");
  });

  test("supports controlled value", async ({ mount, page }) => {
    await mount(<TestToggleGroupControlled />);

    const toggleA = page.getByTestId("toggle-a");
    const toggleB = page.getByTestId("toggle-b");
    const selectB = page.getByTestId("select-b");
    const clear = page.getByTestId("clear");

    await expect(toggleA).not.toHaveAttribute("data-pressed", "");
    await expect(toggleB).not.toHaveAttribute("data-pressed", "");

    await selectB.click();
    await expect(toggleB).toHaveAttribute("data-pressed", "");

    await clear.click();
    await expect(toggleB).not.toHaveAttribute("data-pressed", "");
  });

  test("supports multiple selection", async ({ mount, page }) => {
    await mount(<TestToggleGroupMultiple />);

    const toggleA = page.getByTestId("toggle-a");
    const toggleB = page.getByTestId("toggle-b");

    await toggleA.click();
    await expect(toggleA).toHaveAttribute("data-pressed", "");

    await toggleB.click();
    await expect(toggleB).toHaveAttribute("data-pressed", "");
    // A should still be pressed
    await expect(toggleA).toHaveAttribute("data-pressed", "");
  });

  test("supports group-level disabled", async ({ mount, page }) => {
    await mount(<TestToggleGroupDisabled />);

    const toggleA = page.getByTestId("toggle-a");
    const toggleB = page.getByTestId("toggle-b");

    await expect(toggleA).toBeDisabled();
    await expect(toggleB).toBeDisabled();
  });

  test("supports arrow key navigation", async ({ mount, page }) => {
    await mount(<TestToggleGroupKeyboard />);

    const toggleA = page.getByTestId("toggle-a");
    const toggleB = page.getByTestId("toggle-b");
    const toggleC = page.getByTestId("toggle-c");

    await toggleA.focus();
    await expect(toggleA).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await expect(toggleB).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await expect(toggleC).toBeFocused();

    // Loop back to A
    await page.keyboard.press("ArrowRight");
    await expect(toggleA).toBeFocused();
  });

  test("supports keyboard selection in group", async ({ mount, page }) => {
    await mount(<TestToggleGroupKeyboard />);

    const toggleA = page.getByTestId("toggle-a");
    const toggleB = page.getByTestId("toggle-b");

    await toggleA.focus();
    await page.keyboard.press("ArrowRight");
    await expect(toggleB).toBeFocused();

    // Press Enter to select B
    await page.keyboard.press("Enter");
    await expect(toggleB).toHaveAttribute("data-pressed", "");
  });

  test("supports deselect in multiple mode", async ({ mount, page }) => {
    await mount(<TestToggleGroupMultiple />);

    const toggleA = page.getByTestId("toggle-a");

    await toggleA.click();
    await expect(toggleA).toHaveAttribute("data-pressed", "");

    // Click again to deselect
    await toggleA.click();
    await expect(toggleA).not.toHaveAttribute("data-pressed", "");
  });

  test("has data-orientation attribute", async ({ mount, page }) => {
    await mount(<TestToggleGroupDefault />);

    const group = page.getByTestId("group");
    await expect(group).toHaveAttribute("data-orientation", "horizontal");
  });
});
