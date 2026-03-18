import { test, expect } from "@playwright/experimental-ct-react";
import AxeBuilder from "@axe-core/playwright";
import { TestDialog, TestDialogWithTrigger } from "./AlertDialog.test-stories";

test.describe("AlertDialog", () => {
  test("has no accessibility violations when open", async ({ mount, page }) => {
    await mount(<TestDialog />);

    // Wait for dialog to be visible
    await expect(page.getByRole("alertdialog")).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("closes on Escape key", async ({ mount, page }) => {
    await mount(<TestDialog />);

    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("alertdialog")).not.toBeVisible();
  });

  test("closes when Cancel button is clicked", async ({ mount, page }) => {
    await mount(<TestDialog />);

    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("alertdialog")).not.toBeVisible();
  });

  test("traps focus inside the dialog", async ({ mount, page }) => {
    await mount(<TestDialog />);

    await expect(page.getByRole("alertdialog")).toBeVisible();

    // Click Cancel to ensure dialog has focus
    const cancelButton = page.getByRole("button", { name: "Cancel" });
    await cancelButton.focus();
    await expect(cancelButton).toBeFocused();

    // Tab to next button
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Confirm" })).toBeFocused();

    // Tab again should cycle back (focus trap)
    await page.keyboard.press("Tab");
    await expect(cancelButton).toBeFocused();
  });

  test("returns focus to trigger on close", async ({ mount, page }) => {
    await mount(<TestDialogWithTrigger />);

    const trigger = page.getByRole("button", { name: "Open Dialog" });
    await trigger.click();

    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.keyboard.press("Escape");

    await expect(page.getByRole("alertdialog")).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test("respects reduced motion preference", async ({ mount, page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mount(<TestDialog />);

    const popup = page.getByRole("alertdialog");
    await expect(popup).toBeVisible();

    // Verify no transition is applied
    const transition = await popup.evaluate(
      (el) => getComputedStyle(el).transition,
    );

    // With reduced motion, transition should be 'none' or '0s'
    expect(transition).toMatch(/none|0s/);
  });
});
