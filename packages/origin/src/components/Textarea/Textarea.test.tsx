import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultTextarea,
  FilledTextarea,
  DisabledTextarea,
  DisabledFilledTextarea,
  ReadOnlyTextarea,
  ControlledTextarea,
  TextareaWithRows,
  InvalidTextarea,
} from "./Textarea.test-stories";

test.describe("Textarea", () => {
  test.describe("default behavior", () => {
    test("renders with placeholder", async ({ mount, page }) => {
      await mount(<DefaultTextarea />);
      const textarea = page.getByPlaceholder("Placeholder");
      await expect(textarea).toBeVisible();
    });

    test("renders as a textarea element", async ({ mount, page }) => {
      await mount(<DefaultTextarea />);
      const textarea = page.locator("textarea");
      await expect(textarea).toHaveCount(1);
    });

    test("accepts text input", async ({ mount, page }) => {
      await mount(<DefaultTextarea />);
      const textarea = page.getByPlaceholder("Placeholder");

      await textarea.fill("Hello");
      await expect(textarea).toHaveValue("Hello");
    });

    test("supports multiline input", async ({ mount, page }) => {
      await mount(<DefaultTextarea />);
      const textarea = page.getByPlaceholder("Placeholder");

      await textarea.fill("Line 1\nLine 2\nLine 3");
      await expect(textarea).toHaveValue("Line 1\nLine 2\nLine 3");
    });

    test("renders with defaultValue", async ({ mount, page }) => {
      await mount(<FilledTextarea />);
      const textarea = page.getByRole("textbox");
      await expect(textarea).toHaveValue("Content");
    });
  });

  test.describe("disabled state", () => {
    test("disabled textarea is disabled", async ({ mount, page }) => {
      await mount(<DisabledTextarea />);
      const textarea = page.getByPlaceholder("Placeholder");
      await expect(textarea).toBeDisabled();
    });

    test("disabled textarea has data-disabled attribute", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledTextarea />);
      const textarea = page.getByPlaceholder("Placeholder");
      await expect(textarea).toHaveAttribute("data-disabled", "");
    });

    test("disabled textarea with value shows value", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledFilledTextarea />);
      const textarea = page.getByRole("textbox");
      await expect(textarea).toHaveValue("Content");
      await expect(textarea).toBeDisabled();
    });

    test("disabled textarea does not render resize handle", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledTextarea />);
      const handle = page.locator('[role="separator"]');
      await expect(handle).toHaveCount(0);
    });
  });

  test.describe("readOnly state", () => {
    test("readOnly textarea has readonly attribute", async ({
      mount,
      page,
    }) => {
      await mount(<ReadOnlyTextarea />);
      const textarea = page.getByRole("textbox");
      await expect(textarea).toHaveAttribute("readonly", "");
    });

    test("readOnly textarea shows value but cannot be edited", async ({
      mount,
      page,
    }) => {
      await mount(<ReadOnlyTextarea />);
      const textarea = page.getByRole("textbox");

      await expect(textarea).toHaveValue("Read only content");
      await textarea.focus();
      await textarea.press("a");
      await expect(textarea).toHaveValue("Read only content");
    });
  });

  test.describe("controlled mode", () => {
    test("controlled textarea reflects external state", async ({
      mount,
      page,
    }) => {
      await mount(<ControlledTextarea />);
      const textarea = page.getByPlaceholder("Type here");
      const value = page.locator('[data-testid="value"]');

      await expect(value).toHaveText("");
      await textarea.fill("Hello");
      await expect(value).toHaveText("Hello");
    });
  });

  test.describe("keyboard navigation", () => {
    test("Tab focuses the textarea", async ({ mount, page }) => {
      await mount(<DefaultTextarea />);
      const textarea = page.getByPlaceholder("Placeholder");

      await page.keyboard.press("Tab");
      await expect(textarea).toBeFocused();
    });

    test("disabled textarea is not focusable via Tab", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledTextarea />);
      const textarea = page.getByPlaceholder("Placeholder");

      await page.keyboard.press("Tab");
      await expect(textarea).not.toBeFocused();
    });
  });

  test.describe("rows prop", () => {
    test("renders with specified rows", async ({ mount, page }) => {
      await mount(<TextareaWithRows />);
      const textarea = page.getByPlaceholder("Tall textarea");
      await expect(textarea).toHaveAttribute("rows", "6");
    });
  });

  test.describe("resize handle", () => {
    test("renders resize handle when not disabled", async ({ mount, page }) => {
      await mount(<DefaultTextarea />);
      const handle = page.locator('[role="separator"]');
      await expect(handle).toBeVisible();
    });

    test("handle has correct aria attributes", async ({ mount, page }) => {
      await mount(<DefaultTextarea />);
      const handle = page.locator('[role="separator"]');
      await expect(handle).toHaveAttribute("aria-label", "Resize textarea");
      await expect(handle).toHaveAttribute("aria-orientation", "horizontal");
      await expect(handle).toHaveAttribute("tabindex", "0");
    });

    test("handle is focusable via Tab after textarea", async ({
      mount,
      page,
    }) => {
      await mount(<DefaultTextarea />);
      const handle = page.locator('[role="separator"]');

      // Tab to textarea, then Tab to handle
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await expect(handle).toBeFocused();
    });

    test("ArrowDown increases textarea height", async ({ mount, page }) => {
      await mount(<DefaultTextarea />);
      const textarea = page.locator("textarea");
      const handle = page.locator('[role="separator"]');

      const initialHeight = await textarea.evaluate((el) => el.offsetHeight);

      // Focus handle and press ArrowDown
      await handle.focus();
      await page.keyboard.press("ArrowDown");

      const newHeight = await textarea.evaluate((el) => el.offsetHeight);

      expect(newHeight).toBe(initialHeight + 20);
    });

    test("ArrowUp decreases textarea height after expansion", async ({
      mount,
      page,
    }) => {
      await mount(<DefaultTextarea />);
      const textarea = page.locator("textarea");
      const handle = page.locator('[role="separator"]');

      // First expand the textarea
      await handle.focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");

      const expandedHeight = await textarea.evaluate((el) => el.offsetHeight);

      // Now shrink it
      await page.keyboard.press("ArrowUp");

      const shrunkHeight = await textarea.evaluate((el) => el.offsetHeight);

      expect(shrunkHeight).toBe(expandedHeight - 20);
    });

    test("ArrowUp does not go below min-height", async ({ mount, page }) => {
      await mount(<DefaultTextarea />);
      const textarea = page.locator("textarea");
      const handle = page.locator('[role="separator"]');

      await handle.focus();
      // Press ArrowUp many times to try going below min
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press("ArrowUp");
      }

      const height = await textarea.evaluate((el) => el.offsetHeight);

      expect(height).toBeGreaterThanOrEqual(66);
    });
  });

  test.describe("visual styling", () => {
    test("has correct border-radius", async ({ mount, page }) => {
      await mount(<DefaultTextarea />);
      const textarea = page.locator("textarea");
      const borderRadius = await textarea.evaluate(
        (el) => getComputedStyle(el).borderRadius,
      );
      expect(borderRadius).toBe("6px");
    });

    test("has correct min-height", async ({ mount, page }) => {
      await mount(<DefaultTextarea />);
      const textarea = page.locator("textarea");
      const minHeight = await textarea.evaluate(
        (el) => getComputedStyle(el).minHeight,
      );
      expect(minHeight).toBe("66px");
    });

    test("native resize is disabled", async ({ mount, page }) => {
      await mount(<DefaultTextarea />);
      const textarea = page.locator("textarea");
      const resize = await textarea.evaluate(
        (el) => getComputedStyle(el).resize,
      );
      expect(resize).toBe("none");
    });

    test("disabled textarea has reduced opacity", async ({ mount, page }) => {
      await mount(<DisabledTextarea />);
      const textarea = page.locator("textarea");
      const opacity = await textarea.evaluate(
        (el) => getComputedStyle(el).opacity,
      );
      expect(parseFloat(opacity)).toBe(0.5);
    });

    test("focus state has box-shadow", async ({ mount, page }) => {
      await mount(<DefaultTextarea />);
      const textarea = page.locator("textarea");
      await textarea.focus();
      const boxShadow = await textarea.evaluate(
        (el) => getComputedStyle(el).boxShadow,
      );
      expect(boxShadow).not.toBe("none");
    });

    test("invalid state has critical border color", async ({ mount, page }) => {
      await mount(<InvalidTextarea />);
      const textarea = page.locator("textarea");
      const borderColor = await textarea.evaluate(
        (el) => getComputedStyle(el).borderColor,
      );
      // border/critical = #cc0909 → rgb(204, 9, 9)
      expect(borderColor).toBe("rgb(204, 9, 9)");
    });

    test("handle uses icon/tertiary color", async ({ mount, page }) => {
      await mount(<DefaultTextarea />);
      const handle = page.locator('[role="separator"]');
      const color = await handle.evaluate((el) => getComputedStyle(el).color);
      // icon/tertiary = #c1c0b8 → rgb(193, 192, 184)
      expect(color).toBe("rgb(193, 192, 184)");
    });

    test("handle positioned at bottom-right with 4px gap", async ({
      mount,
      page,
    }) => {
      await mount(<DefaultTextarea />);
      const handle = page.locator('[role="separator"]');
      const bottom = await handle.evaluate((el) => getComputedStyle(el).bottom);
      const right = await handle.evaluate((el) => getComputedStyle(el).right);
      expect(bottom).toBe("4px");
      expect(right).toBe("4px");
    });
  });
});
