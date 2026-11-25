import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/experimental-ct-react";
import { resolveTokenColor } from "@test-utils/resolveTokenColor";
import {
  ControlledSecretInput,
  DefaultSecretInput,
  DisabledSecretInput,
  DynamicallyFieldDisabledSecretInput,
  DynamicallyFieldsetDisabledSecretInput,
  FieldDisabledSecretInput,
  FieldsetDisabledSecretInput,
  FilledSecretInput,
  SecretInputInForm,
  SecretInputWithField,
  SecretInputWithFieldInvalid,
} from "./SecretInput.test-stories";

const axeConfig = {
  rules: {
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
    region: { enabled: false },
    // Field helper-text contrast is a shared token issue, not SecretInput behavior.
    "color-contrast": { enabled: false },
  },
};

test.describe("SecretInput", () => {
  test.describe("Accessibility", () => {
    test("default has no violations", async ({ mount, page }) => {
      await mount(<DefaultSecretInput />);
      const results = await new AxeBuilder({ page })
        .options(axeConfig)
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test("with field has no violations", async ({ mount, page }) => {
      await mount(<SecretInputWithField />);
      const results = await new AxeBuilder({ page })
        .options(axeConfig)
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test("with invalid field has no violations", async ({ mount, page }) => {
      await mount(<SecretInputWithFieldInvalid />);
      const results = await new AxeBuilder({ page })
        .options(axeConfig)
        .analyze();

      expect(results.violations).toEqual([]);
    });
  });

  test.describe("Visibility toggle", () => {
    test("reveals and hides the value", async ({ mount, page }) => {
      await mount(<FilledSecretInput />);
      const input = page.locator("[data-input-group-input]");

      await page.getByRole("button", { name: "Show secret" }).click();
      await expect(input).toHaveAttribute("type", "text");
      await expect(input).toHaveValue("hunter2!");

      await page.getByRole("button", { name: "Hide secret" }).click();
      await expect(input).toHaveAttribute("type", "password");
      await expect(input).toHaveValue("hunter2!");
    });

    test("preserves a typed value", async ({ mount, page }) => {
      await mount(<ControlledSecretInput />);
      const input = page.getByPlaceholder("Type here");
      const value = page.getByTestId("value");

      await input.fill("my secret");
      await expect(value).toHaveText("my secret");

      await page.getByRole("button", { name: "Show secret" }).click();
      await expect(input).toHaveValue("my secret");
      await expect(value).toHaveText("my secret");
    });

    test("preserves the caret position", async ({ mount, page }) => {
      await mount(<FilledSecretInput />);
      const input = page.locator("[data-input-group-input]");

      await input.evaluate((element) => {
        element.setSelectionRange(3, 3);
      });
      await page.getByRole("button", { name: "Show secret" }).click();

      const selection = await input.evaluate((element) => ({
        start: element.selectionStart,
        end: element.selectionEnd,
      }));
      expect(selection).toEqual({ start: 3, end: 3 });
    });

    test("does not submit the enclosing form", async ({ mount, page }) => {
      await mount(<SecretInputInForm />);
      const submitCount = page.getByTestId("submit-count");

      await page.getByRole("button", { name: "Show secret" }).click();
      await page.getByRole("button", { name: "Hide secret" }).click();

      await expect(submitCount).toHaveText("0");
    });

    test("allows Enter in the input to submit", async ({ mount, page }) => {
      await mount(<SecretInputInForm />);
      const input = page.getByPlaceholder("Enter password");

      await input.fill("secret");
      await input.press("Enter");

      await expect(page.getByTestId("submit-count")).toHaveText("1");
    });
  });

  test.describe("Keyboard", () => {
    test("Tab moves from input to toggle", async ({ mount, page }) => {
      await mount(<DefaultSecretInput />);
      const input = page.getByPlaceholder("Enter password");
      const toggle = page.getByRole("button", { name: "Show secret" });

      await page.keyboard.press("Tab");
      await expect(input).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(toggle).toBeFocused();
      await expect(toggle).not.toHaveCSS("box-shadow", "none");
    });

    test("toggle activates with the keyboard", async ({ mount, page }) => {
      await mount(<DefaultSecretInput />);
      const input = page.locator("[data-input-group-input]");

      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");

      await expect(input).toHaveAttribute("type", "text");
    });
  });

  test.describe("Disabled states", () => {
    test("explicit disabled keeps the saved value masked and unfocusable", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledSecretInput />);
      const input = page.locator("[data-input-group-input]");
      const toggle = page.getByRole("button", { name: "Show secret" });

      await expect(input).toBeDisabled();
      await expect(toggle).toBeDisabled();
      await page.keyboard.press("Tab");
      await expect(input).not.toBeFocused();
      await expect(toggle).not.toBeFocused();
      await toggle.click({ force: true });
      await expect(input).toHaveAttribute("type", "password");
      await expect(input).toHaveValue("saved secret");
    });

    test("Field disabled keeps the saved value masked and unfocusable", async ({
      mount,
      page,
    }) => {
      await mount(<FieldDisabledSecretInput />);
      const input = page.locator("[data-input-group-input]");
      const toggle = page.getByRole("button", { name: "Show secret" });

      await expect(input).toBeDisabled();
      await expect(toggle).toBeDisabled();
      await page.keyboard.press("Tab");
      await expect(input).not.toBeFocused();
      await expect(toggle).not.toBeFocused();
      await toggle.click({ force: true });
      await expect(input).toHaveAttribute("type", "password");
      await expect(input).toHaveValue("saved secret");
    });

    test("Fieldset disabled keeps the saved value masked and unfocusable", async ({
      mount,
      page,
    }) => {
      await mount(<FieldsetDisabledSecretInput />);
      const input = page.locator("[data-input-group-input]");
      const toggle = page.getByRole("button", { name: "Show secret" });

      await expect(input).toBeDisabled();
      await expect(toggle).toBeDisabled();
      await page.keyboard.press("Tab");
      await expect(input).not.toBeFocused();
      await expect(toggle).not.toBeFocused();
      await toggle.click({ force: true });
      await expect(input).toHaveAttribute("type", "password");
      await expect(input).toHaveValue("saved secret");
    });

    test("dynamic Fieldset disable masks immediately and stays masked after re-enable", async ({
      mount,
      page,
    }) => {
      await mount(<DynamicallyFieldsetDisabledSecretInput />);
      const input = page.locator("[data-input-group-input]");

      await page.getByRole("button", { name: "Show secret" }).click();
      await expect(input).toHaveAttribute("type", "text");

      await page.getByRole("button", { name: "Disable fieldset" }).click();
      const disabledToggle = page.getByRole("button", { name: "Show secret" });
      await expect(input).toHaveAttribute("type", "password");
      await expect(input).toHaveValue("saved secret");
      await expect(disabledToggle).toBeDisabled();

      await disabledToggle.evaluate((element) => element.focus());
      await expect(disabledToggle).not.toBeFocused();
      await disabledToggle.click({ force: true });
      await expect(input).toHaveAttribute("type", "password");

      await page.getByRole("button", { name: "Enable fieldset" }).click();
      await expect(input).toBeEnabled();
      await expect(disabledToggle).toBeEnabled();
      await expect(input).toHaveAttribute("type", "password");
      await expect(input).toHaveValue("saved secret");
    });

    test("dynamic Field disable masks immediately and stays masked after re-enable", async ({
      mount,
      page,
    }) => {
      await mount(<DynamicallyFieldDisabledSecretInput />);
      const input = page.locator("[data-input-group-input]");

      await page.getByRole("button", { name: "Show secret" }).click();
      await expect(input).toHaveAttribute("type", "text");

      await page.getByRole("button", { name: "Disable field" }).click();
      const disabledToggle = page.getByRole("button", { name: "Show secret" });
      await expect(input).toHaveAttribute("type", "password");
      await expect(input).toHaveValue("saved secret");
      await expect(disabledToggle).toBeDisabled();

      await disabledToggle.evaluate((element) => element.focus());
      await expect(disabledToggle).not.toBeFocused();
      await disabledToggle.click({ force: true });
      await expect(input).toHaveAttribute("type", "password");

      await page.getByRole("button", { name: "Enable field" }).click();
      await expect(input).toBeEnabled();
      await expect(disabledToggle).toBeEnabled();
      await expect(input).toHaveAttribute("type", "password");
      await expect(input).toHaveValue("saved secret");
    });
  });

  test("shows the Field error when invalid", async ({ mount, page }) => {
    await mount(<SecretInputWithFieldInvalid />);

    await expect(page.getByText("Enter a password")).toBeVisible();
  });

  test.describe("Presentation", () => {
    test("renders the toggle inside the input border", async ({
      mount,
      page,
    }) => {
      await mount(<DefaultSecretInput />);
      const group = page.locator("[data-input-group]");
      const toggle = page.getByRole("button", { name: "Show secret" });

      await expect(group.locator("[data-input-group-cap]")).toHaveCount(0);
      await expect(toggle).toHaveCSS("height", "24px");
      expect(
        await toggle.evaluate(
          (element) =>
            element.parentElement === element.closest("[data-input-group]"),
        ),
      ).toBe(true);
    });

    test("uses the secondary icon color token", async ({ mount, page }) => {
      await mount(<DefaultSecretInput />);
      const iconSecondary = await resolveTokenColor(page, "--icon-secondary");
      const icon = page
        .getByRole("button", { name: "Show secret" })
        .locator("svg");

      await expect(icon).toHaveCSS("color", iconSecondary);
    });
  });
});
