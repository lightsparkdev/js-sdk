import { test, expect } from "@playwright/experimental-ct-react";
import AxeBuilder from "@axe-core/playwright";
import {
  Default,
  WithHeader,
  WithFooter,
  FullComposer,
  WithMaxHeight,
  Disabled,
  Invalid,
  Controlled,
  ConformanceRoot,
  ConformanceHeader,
  ConformanceTextarea,
  ConformanceFooter,
} from "./TextareaGroup.test-stories";

const axeConfig = {
  rules: {
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
    region: { enabled: false },
    "color-contrast": { enabled: false },
  },
};

test.describe("TextareaGroup", () => {
  // ---------------------------------------------------------------------------
  // Accessibility
  // ---------------------------------------------------------------------------
  test.describe("Accessibility", () => {
    test("default has no violations", async ({ mount, page }) => {
      await mount(<Default />);
      const results = await new AxeBuilder({ page })
        .options(axeConfig)
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("full composer has no violations", async ({ mount, page }) => {
      await mount(<FullComposer />);
      const results = await new AxeBuilder({ page })
        .options(axeConfig)
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("disabled has no violations", async ({ mount, page }) => {
      await mount(<Disabled />);
      const results = await new AxeBuilder({ page })
        .options(axeConfig)
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("invalid has no violations", async ({ mount, page }) => {
      await mount(<Invalid />);
      const results = await new AxeBuilder({ page })
        .options(axeConfig)
        .analyze();
      expect(results.violations).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  test.describe("Rendering", () => {
    test("renders textarea with placeholder", async ({ mount, page }) => {
      await mount(<Default />);
      const textarea = page.locator("textarea");
      await expect(textarea).toBeVisible();
      await expect(textarea).toHaveAttribute(
        "placeholder",
        "Write a message...",
      );
    });

    test("renders header with chips", async ({ mount, page }) => {
      await mount(<WithHeader />);
      const chips = page.getByTestId("chip");
      await expect(chips).toHaveCount(2);
      await expect(chips.first()).toHaveText("tag-1");
    });

    test("renders footer with buttons", async ({ mount, page }) => {
      await mount(<WithFooter />);
      const sendButton = page.getByRole("button", { name: "Send" });
      await expect(sendButton).toBeVisible();
    });

    test("renders full composer with all parts", async ({ mount, page }) => {
      await mount(<FullComposer />);
      const chips = page.getByTestId("chip");
      await expect(chips).toHaveCount(3); // 2 header + 1 footer
      await expect(page.locator("textarea")).toBeVisible();
      await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  test.describe("State", () => {
    test("disabled propagates to textarea", async ({ mount, page }) => {
      await mount(<Disabled />);
      const textarea = page.locator("textarea");
      await expect(textarea).toBeDisabled();
    });

    test("disabled sets data-disabled on root", async ({ mount, page }) => {
      await mount(<Disabled />);
      const root = page.locator("[data-textarea-group]");
      await expect(root).toHaveAttribute("data-disabled", "");
    });

    test("invalid sets data-invalid on root", async ({ mount, page }) => {
      await mount(<Invalid />);
      const root = page.locator("[data-textarea-group]");
      await expect(root).toHaveAttribute("data-invalid", "");
    });

    test("invalid sets aria-invalid on textarea", async ({ mount, page }) => {
      await mount(<Invalid />);
      const textarea = page.locator("textarea");
      await expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    test("controlled textarea updates value", async ({ mount, page }) => {
      await mount(<Controlled />);
      const textarea = page.locator("textarea");
      await textarea.fill("Hello world");
      await expect(page.getByTestId("value")).toHaveText("Hello world");
    });
  });

  // ---------------------------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------------------------
  test.describe("Keyboard", () => {
    test("Tab navigates into textarea", async ({ mount, page }) => {
      await mount(<Default />);
      await page.keyboard.press("Tab");
      const textarea = page.locator("textarea");
      await expect(textarea).toBeFocused();
    });

    test("Tab navigates through all focusable parts", async ({
      mount,
      page,
    }) => {
      await mount(<WithFooter />);
      // Tab to textarea
      await page.keyboard.press("Tab");
      await expect(page.locator("textarea")).toBeFocused();
      // Tab to add attachment button
      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("button", { name: "Add attachment" }),
      ).toBeFocused();
      // Tab to send button
      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: "Send" })).toBeFocused();
    });
  });

  // ---------------------------------------------------------------------------
  // Max Height
  // ---------------------------------------------------------------------------
  test.describe("Max Height", () => {
    test("respects maxHeight prop", async ({ mount, page }) => {
      await mount(<WithMaxHeight />);
      const root = page.locator("[data-textarea-group]");
      const box = await root.boundingBox();
      expect(box!.height).toBeLessThanOrEqual(200);
    });

    test("textarea scrolls when content exceeds maxHeight", async ({
      mount,
      page,
    }) => {
      await mount(<WithMaxHeight />);
      const textarea = page.locator("textarea");
      const scrollHeight = await textarea.evaluate((el) => el.scrollHeight);
      const clientHeight = await textarea.evaluate((el) => el.clientHeight);
      expect(scrollHeight).toBeGreaterThan(clientHeight);
    });

    test("footer stays visible when content exceeds maxHeight", async ({
      mount,
      page,
    }) => {
      await mount(<WithMaxHeight />);
      const sendButton = page.getByRole("button", { name: "Send" });
      await expect(sendButton).toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // Visual
  // ---------------------------------------------------------------------------
  test.describe("Visual", () => {
    test("root has 12px border-radius", async ({ mount, page }) => {
      await mount(<Default />);
      const root = page.locator("[data-textarea-group]");
      const radius = await root.evaluate(
        (el) => getComputedStyle(el).borderRadius,
      );
      expect(radius).toBe("12px");
    });

    test("root has 1px border", async ({ mount, page }) => {
      await mount(<Default />);
      const root = page.locator("[data-textarea-group]");
      const border = await root.evaluate(
        (el) => getComputedStyle(el).borderWidth,
      );
      expect(border).toBe("1px");
    });

    test("textarea has no border", async ({ mount, page }) => {
      await mount(<Default />);
      const textarea = page.locator("textarea");
      const border = await textarea.evaluate(
        (el) => getComputedStyle(el).borderWidth,
      );
      expect(border).toBe("0px");
    });

    test("textarea has field-sizing content", async ({ mount, page }) => {
      await mount(<Default />);
      const textarea = page.locator("textarea");
      const fieldSizing = await textarea.evaluate((el) =>
        getComputedStyle(el).getPropertyValue("field-sizing"),
      );
      expect(fieldSizing).toBe("content");
    });

    test("disabled state has reduced opacity", async ({ mount, page }) => {
      await mount(<Disabled />);
      const root = page.locator("[data-textarea-group]");
      const opacity = await root.evaluate((el) => getComputedStyle(el).opacity);
      expect(parseFloat(opacity)).toBeLessThan(1);
    });

    test("focus ring appears when textarea is focused", async ({
      mount,
      page,
    }) => {
      await mount(<Default />);
      const textarea = page.locator("textarea");
      await textarea.focus();
      const root = page.locator("[data-textarea-group]");
      const shadow = await root.evaluate(
        (el) => getComputedStyle(el).boxShadow,
      );
      expect(shadow).not.toBe("none");
    });

    test("invalid border color changes", async ({ mount, page }) => {
      await mount(<Invalid />);
      const root = page.locator("[data-textarea-group]");
      const borderColor = await root.evaluate(
        (el) => getComputedStyle(el).borderColor,
      );
      // Should use --border-critical, which resolves to a red-ish color
      expect(borderColor).not.toBe("rgba(0, 0, 0, 0.1)");
    });
  });

  // ---------------------------------------------------------------------------
  // Conformance
  // ---------------------------------------------------------------------------
  test.describe("Conformance", () => {
    test.describe("Root", () => {
      test("forwards props", async ({ mount, page }) => {
        await mount(<ConformanceRoot />);
        await expect(page.getByTestId("test-root")).toBeVisible();
      });

      test("merges className", async ({ mount, page }) => {
        await mount(<ConformanceRoot className="custom" />);
        const root = page.getByTestId("test-root");
        await expect(root).toHaveClass(/custom/);
      });
    });

    test.describe("Header", () => {
      test("forwards props", async ({ mount, page }) => {
        await mount(<ConformanceHeader />);
        await expect(page.getByTestId("test-root")).toBeVisible();
      });

      test("merges className", async ({ mount, page }) => {
        await mount(<ConformanceHeader className="custom" />);
        const header = page.getByTestId("test-root");
        await expect(header).toHaveClass(/custom/);
      });
    });

    test.describe("Textarea", () => {
      test("forwards props", async ({ mount, page }) => {
        await mount(<ConformanceTextarea />);
        await expect(page.getByTestId("test-root")).toBeVisible();
      });

      test("merges className", async ({ mount, page }) => {
        await mount(<ConformanceTextarea className="custom" />);
        const textarea = page.getByTestId("test-root");
        await expect(textarea).toHaveClass(/custom/);
      });
    });

    test.describe("Footer", () => {
      test("forwards props", async ({ mount, page }) => {
        await mount(<ConformanceFooter />);
        await expect(page.getByTestId("test-root")).toBeVisible();
      });

      test("merges className", async ({ mount, page }) => {
        await mount(<ConformanceFooter className="custom" />);
        const footer = page.getByTestId("test-root");
        await expect(footer).toHaveClass(/custom/);
      });
    });
  });
});
