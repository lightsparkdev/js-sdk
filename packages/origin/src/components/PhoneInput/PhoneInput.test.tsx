import { test, expect } from "@playwright/experimental-ct-react";
import AxeBuilder from "@axe-core/playwright";
import {
  Default,
  WithSelectedCountry,
  Disabled,
  Invalid,
  CustomPlaceholder,
  WithPhoneNumber,
} from "./PhoneInput.test-stories";

const axeConfig = {
  rules: {
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
    region: { enabled: false },
  },
};

test.describe("PhoneInput", () => {
  test("has no accessibility violations", async ({ mount, page }) => {
    await mount(<Default />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("renders with default country selected", async ({ mount, page }) => {
    await mount(<Default />);

    // Should show the dial code in the trigger
    await expect(page.getByText("+1")).toBeVisible();
  });

  test("can type in the phone input", async ({ mount, page }) => {
    await mount(<Default />);

    const input = page.getByPlaceholder("Enter phone");
    await input.fill("5309494902");

    await expect(input).toHaveValue("5309494902");
  });

  test("opens country dropdown on trigger click", async ({ mount, page }) => {
    await mount(<Default />);

    // Click the country trigger (combobox button)
    const trigger = page.getByRole("combobox");
    await trigger.click();

    // Should show country options
    await expect(
      page.getByRole("option", { name: /United States/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("option", { name: /United Kingdom/ }),
    ).toBeVisible();
  });

  test("can select a different country", async ({ mount, page }) => {
    await mount(<Default />);

    // Open dropdown
    const trigger = page.getByRole("combobox");
    await trigger.click();

    // Select United Kingdom
    await page.getByRole("option", { name: /United Kingdom/ }).click();

    // Should show +44 dial code in the trigger (not in dropdown which is closed)
    await expect(trigger.getByText("+44")).toBeVisible();
  });

  test("can navigate countries with keyboard", async ({ mount, page }) => {
    await mount(<Default />);

    // Focus and open with Enter
    const trigger = page.getByRole("combobox");
    await trigger.focus();
    await page.keyboard.press("Enter");

    // Wait for popup to open
    await expect(page.locator("[data-phone-input-popup]")).toBeVisible();

    // Navigate with arrows
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    // Select with Enter
    await page.keyboard.press("Enter");

    // Should have closed dropdown after selection
    await expect(page.locator("[data-phone-input-popup]")).not.toBeVisible();
  });

  test("closes dropdown on Escape", async ({ mount, page }) => {
    await mount(<Default />);

    // Open dropdown
    const trigger = page.getByRole("combobox");
    await trigger.click();
    await expect(
      page.getByRole("option", { name: /United States/ }),
    ).toBeVisible();

    // Press Escape
    await page.keyboard.press("Escape");

    // Dropdown should be closed - check the popup element instead of options
    await expect(page.locator("[data-phone-input-popup]")).not.toBeVisible();
  });

  test("disabled state prevents interaction", async ({ mount, page }) => {
    await mount(<Disabled />);

    // Trigger should be disabled
    const trigger = page.getByRole("combobox");
    await expect(trigger).toBeDisabled();

    // Input should be disabled
    const input = page.getByPlaceholder("Enter phone");
    await expect(input).toBeDisabled();
  });

  test("shows pre-selected country", async ({ mount, page }) => {
    await mount(<WithSelectedCountry />);

    // Should show UK dial code
    await expect(page.getByText("+44")).toBeVisible();
  });

  test("shows custom placeholder", async ({ mount, page }) => {
    await mount(<CustomPlaceholder />);

    await expect(page.getByPlaceholder("(555) 123-4567")).toBeVisible();
  });

  test("shows pre-filled phone number", async ({ mount, page }) => {
    await mount(<WithPhoneNumber />);

    const input = page.getByRole("textbox");
    await expect(input).toHaveValue("(530) 949-4902");
  });

  test("invalid state has correct styling", async ({ mount, page }) => {
    await mount(<Invalid />);

    // Focus the input to trigger the invalid focus ring
    const input = page.getByPlaceholder("Enter phone");
    await input.focus();

    // The root container should have data-invalid attribute
    const root = page.locator("[data-invalid]");
    await expect(root).toBeVisible();
  });

  test("has correct height", async ({ mount, page }) => {
    await mount(<Default />);

    const root = page.locator("[data-phone-input-root]");
    const box = await root.boundingBox();
    expect(box?.height).toBe(36);
  });

  test("has correct border radius", async ({ mount, page }) => {
    await mount(<Default />);

    const root = page.locator("[data-phone-input-root]");
    const borderRadius = await root.evaluate(
      (el) => getComputedStyle(el).borderRadius,
    );

    expect(borderRadius).toBe("6px");
  });

  test("respects reduced motion preference", async ({ mount, page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mount(<Default />);

    // Open dropdown
    const trigger = page.getByRole("combobox");
    await trigger.click();

    const popup = page.locator("[data-phone-input-popup]");
    const transition = await popup.evaluate(
      (el) => getComputedStyle(el).transition,
    );

    expect(transition).toMatch(/none|0s/);
  });

  test("trigger has right border separator", async ({ mount, page }) => {
    await mount(<Default />);

    const trigger = page.locator("[data-phone-input-trigger]");
    const borderRight = await trigger.evaluate(
      (el) => getComputedStyle(el).borderRightWidth,
    );

    expect(borderRight).toBe("1px");
  });
});
