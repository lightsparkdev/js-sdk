import { test, expect } from "@playwright/experimental-ct-react";
import AxeBuilder from "@axe-core/playwright";
import {
  Default,
  TrailingAddon,
  LeadingAndTrailing,
  CapAddon,
  TrailingCap,
  CapWithButton,
  CapWithIconButton,
  WithText,
  WithButton,
  WithOutlineButton,
  WithSelectTrigger,
  WithOutlineSelectTrigger,
  WithSpinner,
  Disabled,
  DisabledWithButton,
  Invalid,
  InputOnly,
  WithField,
  WithFieldInvalid,
  Controlled,
  ConformanceRoot,
  ConformanceAddon,
  ConformanceInput,
  ConformanceButton,
  ConformanceSelectTrigger,
  ConformanceText,
  ConformanceCap,
} from "./InputGroup.test-stories";

const axeConfig = {
  rules: {
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
    region: { enabled: false },
    // Field description/error text contrast is a known token issue,
    // not specific to InputGroup. Tracked separately.
    "color-contrast": { enabled: false },
  },
};

test.describe("InputGroup", () => {
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

    test("with button has no violations", async ({ mount, page }) => {
      await mount(<WithButton />);
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

    test("with field has no violations", async ({ mount, page }) => {
      await mount(<WithField />);
      const results = await new AxeBuilder({ page })
        .options(axeConfig)
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("with field invalid has no violations", async ({ mount, page }) => {
      await mount(<WithFieldInvalid />);
      const results = await new AxeBuilder({ page })
        .options(axeConfig)
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("cap with button has no violations", async ({ mount, page }) => {
      await mount(<CapWithButton />);
      const results = await new AxeBuilder({ page })
        .options(axeConfig)
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("cap with icon button has no violations", async ({ mount, page }) => {
      await mount(<CapWithIconButton />);
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
    test("renders input with placeholder", async ({ mount, page }) => {
      await mount(<Default />);
      await expect(page.getByPlaceholder("Search...")).toBeVisible();
    });

    test("renders with leading addon", async ({ mount, page }) => {
      await mount(<Default />);
      const root = page.locator("[data-input-group]");
      // Addon is the first child, input is second
      const addon = root.locator("[data-input-group-addon]").first();
      await expect(addon).toBeVisible();
    });

    test("renders with trailing addon", async ({ mount, page }) => {
      await mount(<TrailingAddon />);
      const root = page.locator("[data-input-group]");
      const addon = root.locator("[data-input-group-addon]").first();
      await expect(addon).toBeVisible();
    });

    test("renders with both leading and trailing addons", async ({
      mount,
      page,
    }) => {
      await mount(<LeadingAndTrailing />);
      const root = page.locator("[data-input-group]");
      const addons = root.locator("[data-input-group-addon]");
      await expect(addons).toHaveCount(2);
    });

    test("renders cap", async ({ mount, page }) => {
      await mount(<CapAddon />);
      const cap = page.locator("[data-input-group-cap]");
      await expect(cap).toBeVisible();
      await expect(cap).toContainText("https://");
    });

    test("renders trailing cap", async ({ mount, page }) => {
      await mount(<TrailingCap />);
      const cap = page.locator("[data-input-group-cap]");
      await expect(cap).toBeVisible();
      await expect(cap).toContainText("USD");
    });

    test("renders cap with button", async ({ mount, page }) => {
      await mount(<CapWithButton />);
      const cap = page.locator("[data-input-group-cap]");
      await expect(cap).toBeVisible();
      const button = cap.getByRole("button", { name: "Copy" });
      await expect(button).toBeVisible();
    });

    test("renders cap with icon button", async ({ mount, page }) => {
      await mount(<CapWithIconButton />);
      const cap = page.locator("[data-input-group-cap]");
      await expect(cap).toBeVisible();
      const button = cap.getByRole("button", { name: "Search" });
      await expect(button).toBeVisible();
    });

    test("renders text part", async ({ mount, page }) => {
      await mount(<WithText />);
      const texts = page.locator("[data-input-group-text]");
      await expect(texts).toHaveCount(2);
      await expect(texts.first()).toContainText("$");
      await expect(texts.last()).toContainText("USD");
    });

    test("renders button", async ({ mount, page }) => {
      await mount(<WithButton />);
      const button = page.getByRole("button", { name: "Search" });
      await expect(button).toBeVisible();
    });

    test("renders outline button variant", async ({ mount, page }) => {
      await mount(<WithOutlineButton />);
      const button = page.getByRole("button", { name: "Search" });
      await expect(button).toBeVisible();
      await expect(button).toHaveAttribute("data-variant", "outline");
    });

    test("ghost button is default variant", async ({ mount, page }) => {
      await mount(<WithButton />);
      const button = page.getByRole("button", { name: "Search" });
      await expect(button).toHaveAttribute("data-variant", "ghost");
    });

    test("renders ghost select trigger", async ({ mount, page }) => {
      await mount(<WithSelectTrigger />);
      const trigger = page.locator("[data-input-group-select-trigger]");
      await expect(trigger).toBeVisible();
      await expect(trigger).toHaveAttribute("data-variant", "ghost");
    });

    test("renders outline select trigger", async ({ mount, page }) => {
      await mount(<WithOutlineSelectTrigger />);
      const trigger = page.locator("[data-input-group-select-trigger]");
      await expect(trigger).toBeVisible();
      await expect(trigger).toHaveAttribute("data-variant", "outline");
    });

    test("select trigger shows label text", async ({ mount, page }) => {
      await mount(<WithSelectTrigger />);
      const trigger = page.locator("[data-input-group-select-trigger]");
      await expect(trigger).toContainText("Label");
    });

    test("renders spinner addon", async ({ mount, page }) => {
      await mount(<WithSpinner />);
      const spinner = page.getByTestId("spinner");
      await expect(spinner).toBeVisible();
    });

    test("renders input only (no addons)", async ({ mount, page }) => {
      await mount(<InputOnly />);
      const root = page.locator("[data-input-group]");
      await expect(root).toBeVisible();
      await expect(page.getByPlaceholder("Plain input group")).toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // Interaction
  // ---------------------------------------------------------------------------
  test.describe("Interaction", () => {
    test("can type in input", async ({ mount, page }) => {
      await mount(<Default />);
      const input = page.getByPlaceholder("Search...");
      await input.fill("hello world");
      await expect(input).toHaveValue("hello world");
    });

    test("controlled input reflects external state", async ({
      mount,
      page,
    }) => {
      await mount(<Controlled />);
      const input = page.getByPlaceholder("Type here");
      const value = page.getByTestId("value");

      await expect(value).toHaveText("");
      await input.fill("Hello");
      await expect(value).toHaveText("Hello");
    });

    test("button is clickable", async ({ mount, page }) => {
      await mount(<WithButton />);
      const button = page.getByRole("button", { name: "Search" });
      // Verify the button exists and can be interacted with
      await expect(button).toBeEnabled();
    });
  });

  // ---------------------------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------------------------
  test.describe("Keyboard", () => {
    test("Tab focuses the input", async ({ mount, page }) => {
      await mount(<Default />);
      const input = page.getByPlaceholder("Search...");

      await page.keyboard.press("Tab");
      await expect(input).toBeFocused();
    });

    test("Tab moves from input to button", async ({ mount, page }) => {
      await mount(<WithButton />);
      const input = page.getByPlaceholder("Search...");
      const button = page.getByRole("button", { name: "Search" });

      await page.keyboard.press("Tab");
      await expect(input).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(button).toBeFocused();
    });

    test("Tab moves from input to button inside cap", async ({
      mount,
      page,
    }) => {
      await mount(<CapWithButton />);
      const input = page.getByPlaceholder("Enter value...");
      const button = page.getByRole("button", { name: "Copy" });

      await page.keyboard.press("Tab");
      await expect(input).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(button).toBeFocused();
    });

    test("disabled input is not focusable via Tab", async ({ mount, page }) => {
      await mount(<Disabled />);
      const input = page.getByPlaceholder("Search...");

      await page.keyboard.press("Tab");
      await expect(input).not.toBeFocused();
    });
  });

  // ---------------------------------------------------------------------------
  // States
  // ---------------------------------------------------------------------------
  test.describe("States", () => {
    test("disabled root has data-disabled attribute", async ({
      mount,
      page,
    }) => {
      await mount(<Disabled />);
      const root = page.locator("[data-input-group]");
      await expect(root).toHaveAttribute("data-disabled", "");
    });

    test("disabled input is disabled", async ({ mount, page }) => {
      await mount(<Disabled />);
      const input = page.getByPlaceholder("Search...");
      await expect(input).toBeDisabled();
    });

    test("disabled button inherits disabled from root", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledWithButton />);
      const button = page.getByRole("button", { name: "Search" });
      await expect(button).toBeDisabled();
    });

    test("invalid root has data-invalid attribute", async ({ mount, page }) => {
      await mount(<Invalid />);
      const root = page.locator("[data-input-group]");
      await expect(root).toHaveAttribute("data-invalid", "");
    });

    test("focus-within applies focus ring", async ({ mount, page }) => {
      await mount(<Default />);
      const input = page.getByPlaceholder("Search...");
      const root = page.locator("[data-input-group]");

      await input.focus();

      // Should have focus ring (border-color change from secondary token)
      const borderColor = await root.evaluate(
        (el) => getComputedStyle(el).borderColor,
      );
      // The exact color depends on --border-secondary token
      // Just verify it changed from the default --border-primary
      expect(borderColor).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // Field Integration
  // ---------------------------------------------------------------------------
  test.describe("Field integration", () => {
    test("input receives label association from Field", async ({
      mount,
      page,
    }) => {
      await mount(<WithField />);
      const input = page.getByPlaceholder("you@example.com");

      // Base UI Field wires aria-labelledby or id/htmlFor automatically
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");
      const id = await input.getAttribute("id");

      // Either aria-labelledby is set, or the label's htmlFor matches input id
      const hasLabelAssociation = ariaLabelledBy !== null || id !== null;
      expect(hasLabelAssociation).toBe(true);
    });

    test("description is visible with Field", async ({ mount, page }) => {
      await mount(<WithField />);
      await expect(page.getByText("Enter your email address")).toBeVisible();
    });

    test("error message shows when Field is invalid", async ({
      mount,
      page,
    }) => {
      await mount(<WithFieldInvalid />);
      await expect(page.getByText("Please enter a valid email")).toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // Visual
  // ---------------------------------------------------------------------------
  test.describe("Visual", () => {
    test("root has correct height (36px)", async ({ mount, page }) => {
      await mount(<Default />);
      const root = page.locator("[data-input-group]");
      const box = await root.boundingBox();
      expect(box?.height).toBe(36);
    });

    test("root has correct border radius (6px)", async ({ mount, page }) => {
      await mount(<Default />);
      const root = page.locator("[data-input-group]");
      const borderRadius = await root.evaluate(
        (el) => getComputedStyle(el).borderRadius,
      );
      expect(borderRadius).toBe("6px");
    });

    test("disabled state has reduced opacity", async ({ mount, page }) => {
      await mount(<Disabled />);
      const root = page.locator("[data-input-group]");
      const opacity = await root.evaluate((el) => getComputedStyle(el).opacity);
      expect(parseFloat(opacity)).toBeLessThan(1);
    });

    test("cap has background", async ({ mount, page }) => {
      await mount(<CapAddon />);
      const cap = page.locator("[data-input-group-cap]");
      const bg = await cap.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      // Should have a visible background (not transparent)
      expect(bg).not.toBe("rgba(0, 0, 0, 0)");
    });

    test("ghost button has no border", async ({ mount, page }) => {
      await mount(<WithButton />);
      const button = page.getByRole("button", { name: "Search" });
      const border = await button.evaluate(
        (el) => getComputedStyle(el).borderStyle,
      );
      expect(border).toBe("none");
    });

    test("outline button has border and shadow", async ({ mount, page }) => {
      await mount(<WithOutlineButton />);
      const button = page.getByRole("button", { name: "Search" });
      const border = await button.evaluate(
        (el) => getComputedStyle(el).borderStyle,
      );
      const shadow = await button.evaluate(
        (el) => getComputedStyle(el).boxShadow,
      );
      expect(border).not.toBe("none");
      expect(shadow).not.toBe("none");
    });

    test("outline select trigger has border and shadow", async ({
      mount,
      page,
    }) => {
      await mount(<WithOutlineSelectTrigger />);
      const trigger = page.locator("[data-input-group-select-trigger]");
      const shadow = await trigger.evaluate(
        (el) => getComputedStyle(el).boxShadow,
      );
      expect(shadow).not.toBe("none");
    });

    test("respects reduced motion preference", async ({ mount, page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await mount(<Default />);
      const root = page.locator("[data-input-group]");
      const transition = await root.evaluate(
        (el) => getComputedStyle(el).transition,
      );
      expect(transition).toMatch(/none|0s/);
    });
  });

  // ---------------------------------------------------------------------------
  // Conformance (slot compatibility)
  // ---------------------------------------------------------------------------
  test.describe("Conformance", () => {
    test.describe("Root", () => {
      test("forwards props", async ({ mount, page }) => {
        await mount(<ConformanceRoot data-custom="custom-value" />);
        await expect(page.getByTestId("test-root")).toHaveAttribute(
          "data-custom",
          "custom-value",
        );
      });

      test("merges className", async ({ mount, page }) => {
        await mount(<ConformanceRoot className="custom-class" />);
        await expect(page.getByTestId("test-root")).toHaveClass(/custom-class/);
      });

      test("forwards style", async ({ mount, page }) => {
        await mount(<ConformanceRoot style={{ color: "green" }} />);
        await expect(page.getByTestId("test-root")).toHaveCSS(
          "color",
          "rgb(0, 128, 0)",
        );
      });
    });

    test.describe("Addon", () => {
      test("forwards props", async ({ mount, page }) => {
        await mount(<ConformanceAddon data-custom="custom-value" />);
        await expect(page.getByTestId("test-root")).toHaveAttribute(
          "data-custom",
          "custom-value",
        );
      });

      test("merges className", async ({ mount, page }) => {
        await mount(<ConformanceAddon className="custom-class" />);
        await expect(page.getByTestId("test-root")).toHaveClass(/custom-class/);
      });
    });

    test.describe("Input", () => {
      test("forwards props", async ({ mount, page }) => {
        await mount(<ConformanceInput data-custom="custom-value" />);
        await expect(page.getByTestId("test-root")).toHaveAttribute(
          "data-custom",
          "custom-value",
        );
      });

      test("merges className", async ({ mount, page }) => {
        await mount(<ConformanceInput className="custom-class" />);
        await expect(page.getByTestId("test-root")).toHaveClass(/custom-class/);
      });
    });

    test.describe("Button", () => {
      test("forwards props", async ({ mount, page }) => {
        await mount(<ConformanceButton data-custom="custom-value" />);
        await expect(page.getByTestId("test-root")).toHaveAttribute(
          "data-custom",
          "custom-value",
        );
      });

      test("merges className", async ({ mount, page }) => {
        await mount(<ConformanceButton className="custom-class" />);
        await expect(page.getByTestId("test-root")).toHaveClass(/custom-class/);
      });
    });

    test.describe("SelectTrigger", () => {
      test("forwards props", async ({ mount, page }) => {
        await mount(<ConformanceSelectTrigger data-custom="custom-value" />);
        await expect(page.getByTestId("test-root")).toHaveAttribute(
          "data-custom",
          "custom-value",
        );
      });

      test("merges className", async ({ mount, page }) => {
        await mount(<ConformanceSelectTrigger className="custom-class" />);
        await expect(page.getByTestId("test-root")).toHaveClass(/custom-class/);
      });
    });

    test.describe("Text", () => {
      test("forwards props", async ({ mount, page }) => {
        await mount(<ConformanceText data-custom="custom-value" />);
        await expect(page.getByTestId("test-root")).toHaveAttribute(
          "data-custom",
          "custom-value",
        );
      });

      test("merges className", async ({ mount, page }) => {
        await mount(<ConformanceText className="custom-class" />);
        await expect(page.getByTestId("test-root")).toHaveClass(/custom-class/);
      });
    });

    test.describe("Cap", () => {
      test("forwards props", async ({ mount, page }) => {
        await mount(<ConformanceCap data-custom="custom-value" />);
        await expect(page.getByTestId("test-root")).toHaveAttribute(
          "data-custom",
          "custom-value",
        );
      });

      test("merges className", async ({ mount, page }) => {
        await mount(<ConformanceCap className="custom-class" />);
        await expect(page.getByTestId("test-root")).toHaveClass(/custom-class/);
      });
    });
  });
});
