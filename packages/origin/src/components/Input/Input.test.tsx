import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultInput,
  FilledInput,
  DisabledInput,
  DisabledFilledInput,
  ReadOnlyInput,
  ControlledInput,
  InputWithType,
} from "./Input.test-stories";

test.describe("Input", () => {
  test.describe("default behavior", () => {
    test("renders with placeholder", async ({ mount, page }) => {
      await mount(<DefaultInput />);
      const input = page.getByPlaceholder("Placeholder");
      await expect(input).toBeVisible();
    });

    test("accepts text input", async ({ mount, page }) => {
      await mount(<DefaultInput />);
      const input = page.getByPlaceholder("Placeholder");

      await input.fill("Hello");
      await expect(input).toHaveValue("Hello");
    });

    test("renders with defaultValue", async ({ mount, page }) => {
      await mount(<FilledInput />);
      const input = page.getByRole("textbox");
      await expect(input).toHaveValue("Content");
    });
  });

  test.describe("disabled state", () => {
    test("disabled input is disabled", async ({ mount, page }) => {
      await mount(<DisabledInput />);
      const input = page.getByPlaceholder("Placeholder");
      await expect(input).toBeDisabled();
    });

    test("disabled input has data-disabled attribute", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledInput />);
      const input = page.getByPlaceholder("Placeholder");
      await expect(input).toHaveAttribute("data-disabled", "");
    });

    test("disabled input with value shows value", async ({ mount, page }) => {
      await mount(<DisabledFilledInput />);
      const input = page.getByRole("textbox");
      await expect(input).toHaveValue("Content");
      await expect(input).toBeDisabled();
    });
  });

  test.describe("readOnly state", () => {
    test("readOnly input has readonly attribute", async ({ mount, page }) => {
      await mount(<ReadOnlyInput />);
      const input = page.getByRole("textbox");
      await expect(input).toHaveAttribute("readonly", "");
    });

    test("readOnly input shows value but cannot be edited", async ({
      mount,
      page,
    }) => {
      await mount(<ReadOnlyInput />);
      const input = page.getByRole("textbox");

      await expect(input).toHaveValue("Read only content");
      await input.focus();
      await input.press("a");
      await expect(input).toHaveValue("Read only content");
    });
  });

  test.describe("controlled mode", () => {
    test("controlled input reflects external state", async ({
      mount,
      page,
    }) => {
      await mount(<ControlledInput />);
      const input = page.getByPlaceholder("Type here");
      const value = page.locator('[data-testid="value"]');

      await expect(value).toHaveText("");
      await input.fill("Hello");
      await expect(value).toHaveText("Hello");
    });
  });

  test.describe("keyboard navigation", () => {
    test("Tab focuses the input", async ({ mount, page }) => {
      await mount(<DefaultInput />);
      const input = page.getByPlaceholder("Placeholder");

      await page.keyboard.press("Tab");
      await expect(input).toBeFocused();
    });

    test("disabled input is not focusable via Tab", async ({ mount, page }) => {
      await mount(<DisabledInput />);
      const input = page.getByPlaceholder("Placeholder");

      await page.keyboard.press("Tab");
      await expect(input).not.toBeFocused();
    });
  });

  test.describe("input types", () => {
    test("renders with specified type", async ({ mount, page }) => {
      await mount(<InputWithType />);
      const input = page.getByPlaceholder("Email address");
      await expect(input).toHaveAttribute("type", "email");
    });
  });
});
