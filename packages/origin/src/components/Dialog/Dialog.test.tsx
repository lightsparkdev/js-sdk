import { test, expect } from "@playwright/experimental-ct-react";
import AxeBuilder from "@axe-core/playwright";
import {
  TestDialog,
  TestDialogWithTrigger,
  TestDialogWithoutCloseButton,
  TestDialogContentOnly,
} from "./Dialog.test-stories";

test.describe("Dialog", () => {
  test("has no accessibility violations when open", async ({ mount, page }) => {
    await mount(<TestDialog />);

    await expect(page.getByRole("dialog")).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("renders header with title and description", async ({ mount, page }) => {
    await mount(<TestDialog />);

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Test Title")).toBeVisible();
    await expect(page.getByText("Test description text.")).toBeVisible();
  });

  test("renders content area", async ({ mount, page }) => {
    await mount(<TestDialog />);

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Test content area.")).toBeVisible();
  });

  test("renders footer with action buttons", async ({ mount, page }) => {
    await mount(<TestDialog />);

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Confirm" })).toBeVisible();
  });

  test("renders close button", async ({ mount, page }) => {
    await mount(<TestDialog />);

    await expect(page.getByRole("dialog")).toBeVisible();
    // Close button is a button inside the dialog (not Cancel/Confirm)
    const buttons = page.getByRole("dialog").getByRole("button");
    await expect(buttons).toHaveCount(3); // CloseButton + Cancel + Confirm
  });

  test("closes on close button click", async ({ mount, page }) => {
    await mount(<TestDialog />);

    await expect(page.getByRole("dialog")).toBeVisible();

    // Click the X close button (first button in the dialog)
    const closeButton = page.getByRole("dialog").getByRole("button").first();
    await closeButton.click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("closes on Escape key", async ({ mount, page }) => {
    await mount(<TestDialog />);

    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("closes on Cancel button click", async ({ mount, page }) => {
    await mount(<TestDialog />);

    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("closes on backdrop click", async ({ mount, page }) => {
    await mount(<TestDialog />);

    await expect(page.getByRole("dialog")).toBeVisible();
    // Click outside the dialog (top-left corner)
    await page.mouse.click(0, 0);
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("traps focus inside the dialog", async ({ mount, page }) => {
    await mount(<TestDialog />);

    await expect(page.getByRole("dialog")).toBeVisible();

    const cancelButton = page.getByRole("button", { name: "Cancel" });
    await cancelButton.focus();
    await expect(cancelButton).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Confirm" })).toBeFocused();

    // Tab again should cycle (focus trap)
    await page.keyboard.press("Tab");
    // Focus should wrap back to the close button
    const closeButton = page.getByRole("dialog").getByRole("button").first();
    await expect(closeButton).toBeFocused();
  });

  test("returns focus to trigger on close", async ({ mount, page }) => {
    await mount(<TestDialogWithTrigger />);

    const trigger = page.getByRole("button", { name: "Open Dialog" });
    await trigger.click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test("works without close button", async ({ mount, page }) => {
    await mount(<TestDialogWithoutCloseButton />);

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("No Close Button")).toBeVisible();

    // Only Cancel button, no X button
    const buttons = page.getByRole("dialog").getByRole("button");
    await expect(buttons).toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("works with content only (no header or footer)", async ({
    mount,
    page,
  }) => {
    await mount(<TestDialogContentOnly />);

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByText("Content without header or footer."),
    ).toBeVisible();
  });

  test("respects reduced motion preference", async ({ mount, page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mount(<TestDialog />);

    const popup = page.getByRole("dialog");
    await expect(popup).toBeVisible();

    const transition = await popup.evaluate(
      (el) => getComputedStyle(el).transition,
    );

    expect(transition).toMatch(/none|0s/);
  });
});
