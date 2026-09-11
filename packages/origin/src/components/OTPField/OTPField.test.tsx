/**
 * OTPField Playwright CT tests.
 *
 * Covers behavior that needs a real browser: typing and focus advancement,
 * paste distribution, keyboard navigation, accessible-name resolution,
 * computed styling, and axe scans.
 *
 * Static attribute contracts (slot counts, per-slot aria-labels,
 * autocomplete, disabled attributes) live in OTPField.unit.test.tsx.
 */

import { test, expect } from "@playwright/experimental-ct-react";
import AxeBuilder from "@axe-core/playwright";
import {
  AutoSubmit,
  Default,
  Controlled,
  Disabled,
  WithField,
  WithFieldInvalid,
  Normalization,
  Placeholder,
  ReadOnly,
} from "./OTPField.test-stories";

const axeConfig = {
  rules: {
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
    region: { enabled: false },
  },
};

test.describe("OTPField", () => {
  test("has no accessibility violations", async ({ mount, page }) => {
    await mount(<WithField />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("first slot is labelled by the field label", async ({ mount, page }) => {
    await mount(<WithField />);

    const firstSlot = page.locator("[data-otp-field-input]").first();
    await expect(firstSlot).toHaveAccessibleName("Verification code");
  });

  test("later slots resolve their positional accessible name", async ({
    mount,
    page,
  }) => {
    await mount(<WithField />);

    const slots = page.locator("[data-otp-field-input]");
    await expect(slots.nth(1)).toHaveAccessibleName("Character 2 of 6");
  });

  test("typing advances focus through slots", async ({ mount, page }) => {
    await mount(<Default />);

    const slots = page.locator("[data-otp-field-input]");
    await slots.first().click();
    await page.keyboard.type("123");

    await expect(slots.nth(0)).toHaveValue("1");
    await expect(slots.nth(1)).toHaveValue("2");
    await expect(slots.nth(2)).toHaveValue("3");
    await expect(slots.nth(3)).toBeFocused();
  });

  test("rejects non-numeric characters by default", async ({ mount, page }) => {
    await mount(<Controlled />);

    const slots = page.locator("[data-otp-field-input]");
    await slots.first().click();
    await page.keyboard.type("a1b2");

    await expect(page.getByTestId("value")).toHaveText("12");
  });

  test("pasting distributes characters across slots", async ({
    mount,
    page,
  }) => {
    await mount(<Controlled />);

    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
    const slots = page.locator("[data-otp-field-input]");
    await slots.first().click();
    await page.evaluate(() => navigator.clipboard.writeText("123456"));
    await page.keyboard.press("ControlOrMeta+v");

    await expect(page.getByTestId("value")).toHaveText("123456");
    await expect(slots.nth(0)).toHaveValue("1");
    await expect(slots.nth(5)).toHaveValue("6");
  });

  test("arrow keys move focus between slots", async ({ mount, page }) => {
    await mount(<Default />);

    const slots = page.locator("[data-otp-field-input]");
    await slots.first().click();
    await page.keyboard.type("12");

    await expect(slots.nth(2)).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(slots.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(slots.nth(2)).toBeFocused();
    await page.keyboard.press("Home");
    await expect(slots.nth(0)).toBeFocused();
  });

  test("backspace clears the previous slot and moves focus", async ({
    mount,
    page,
  }) => {
    await mount(<Controlled />);

    const slots = page.locator("[data-otp-field-input]");
    await slots.first().click();
    await page.keyboard.type("12");
    await page.keyboard.press("Backspace");

    await expect(page.getByTestId("value")).toHaveText("1");
    await expect(slots.nth(1)).toBeFocused();
  });

  test("fires onValueComplete when all slots are filled", async ({
    mount,
    page,
  }) => {
    await mount(<Controlled />);

    const slots = page.locator("[data-otp-field-input]");
    await slots.first().click();
    await page.keyboard.type("123456");

    await expect(page.getByTestId("completed")).toHaveText("123456");
  });

  test("autoSubmit submits the owning form on completion", async ({
    mount,
    page,
  }) => {
    await mount(<AutoSubmit />);

    const slots = page.locator("[data-otp-field-input]");
    await slots.first().click();
    await page.keyboard.type("123456");

    await expect(page.getByTestId("submitted")).toHaveText("123456");
  });

  test("normalization uppercases typed letters", async ({ mount, page }) => {
    await mount(<Normalization />);

    const slots = page.locator("[data-otp-field-input]");
    await slots.first().click();
    await page.keyboard.type("ab1");

    await expect(page.getByTestId("value")).toHaveText("AB1");
  });

  test("rejected characters surface feedback and clear on correction", async ({
    mount,
    page,
  }) => {
    await mount(<Normalization />);

    const slots = page.locator("[data-otp-field-input]");
    await slots.first().click();
    await page.keyboard.type("!");

    await expect(page.getByText("Use letters and numbers only")).toBeVisible();

    await page.keyboard.type("a");
    await expect(
      page.getByText("Use letters and numbers only"),
    ).not.toBeVisible();
  });

  test("mixed-content paste commits clean characters and keeps the error", async ({
    mount,
    page,
  }) => {
    await mount(<Normalization />);

    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
    const slots = page.locator("[data-otp-field-input]");
    await slots.first().click();
    await page.evaluate(() => navigator.clipboard.writeText("AB!12"));
    await page.keyboard.press("ControlOrMeta+v");

    // The rejection (onValueInvalid) and the commit (onValueChange) come
    // from the same paste event; the error must survive the commit.
    await expect(page.getByTestId("value")).toHaveText("AB12");
    await expect(page.getByText("Use letters and numbers only")).toBeVisible();
  });

  test("placeholder is visible when empty and hidden on the focused slot", async ({
    mount,
    page,
  }) => {
    await mount(<Placeholder />);

    const slots = page.locator("[data-otp-field-input]");
    const placeholderColor = (slot: ReturnType<typeof slots.nth>) =>
      slot.evaluate((el) =>
        getComputedStyle(el, "::placeholder").getPropertyValue("color"),
      );

    const unfocusedColor = await placeholderColor(slots.nth(0));
    expect(unfocusedColor).not.toBe("rgba(0, 0, 0, 0)");

    await slots.first().click();
    const focusedColor = await placeholderColor(slots.nth(0));
    expect(focusedColor).toBe("rgba(0, 0, 0, 0)");

    // Later slots keep their hint while the first slot is active.
    const laterColor = await placeholderColor(slots.nth(1));
    expect(laterColor).toBe(unfocusedColor);
  });

  // Styling-focused rather than a typing test: disabled inputs reject
  // click/focus at the browser level, so a typing flow can't run.
  test("disabled applies data-disabled and disabled styling", async ({
    mount,
    page,
  }) => {
    await mount(<Disabled />);

    const firstSlot = page.locator("[data-otp-field-input]").first();
    await expect(firstSlot).toHaveAttribute("data-disabled", "");
    await expect(firstSlot).toBeDisabled();

    const cursor = await firstSlot.evaluate(
      (el) => getComputedStyle(el).cursor,
    );
    expect(cursor).toBe("not-allowed");

    await expect(page.locator("[data-otp-field-root]")).toHaveAttribute(
      "data-disabled",
      "",
    );
  });

  test("readOnly ignores typing", async ({ mount, page }) => {
    await mount(<ReadOnly />);

    const slots = page.locator("[data-otp-field-input]");
    await slots.first().click();
    await page.keyboard.type("999");

    await expect(slots.nth(0)).toHaveValue("1");
    await expect(slots.nth(1)).toHaveValue("2");
    await expect(slots.nth(2)).toHaveValue("3");
  });

  test("invalid state applies critical styling", async ({ mount, page }) => {
    await mount(<WithFieldInvalid />);

    const firstSlot = page.locator("[data-otp-field-input]").first();
    await expect(firstSlot).toHaveAttribute("data-invalid", "");
    await expect(firstSlot).toHaveAttribute("aria-invalid", "true");

    const boxShadow = await firstSlot.evaluate(
      (el) => getComputedStyle(el).boxShadow,
    );
    expect(boxShadow).not.toBe("none");
  });

  test("shows the error message when invalid", async ({ mount, page }) => {
    await mount(<WithFieldInvalid />);

    await expect(
      page.getByText("Enter the code we sent to your device"),
    ).toBeVisible();
  });

  test("slots have correct size", async ({ mount, page }) => {
    await mount(<Default />);

    const box = await page
      .locator("[data-otp-field-input]")
      .first()
      .boundingBox();
    expect(box?.width).toBe(32);
    expect(box?.height).toBe(36);
  });

  test("slots have enough gap for the critical halo", async ({
    mount,
    page,
  }) => {
    await mount(<Default />);

    const gap = await page
      .locator("[data-otp-field-root]")
      .evaluate((el) => getComputedStyle(el).columnGap);
    expect(gap).toBe("8px");
  });

  test("respects reduced motion preference", async ({ mount, page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mount(<Default />);

    const transition = await page
      .locator("[data-otp-field-input]")
      .first()
      .evaluate((el) => getComputedStyle(el).transition);

    expect(transition).toMatch(/none|0s/);
  });
});
