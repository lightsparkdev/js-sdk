import { test, expect } from "@playwright/experimental-ct-react";
import AxeBuilder from "@axe-core/playwright";
import {
  HorizontalFilled,
  HorizontalOutline,
  HorizontalSecondary,
  VerticalFilled,
  VerticalOutline,
  VerticalSecondary,
  TwoButtons,
  SingleButton,
  WithLabel,
  ConformanceRoot,
} from "./ButtonGroup.test-stories";

const axeConfig = {
  rules: {
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
    region: { enabled: false },
    "color-contrast": { enabled: false },
  },
};

test.describe("ButtonGroup", () => {
  // ---------------------------------------------------------------------------
  // Accessibility
  // ---------------------------------------------------------------------------
  test.describe("Accessibility", () => {
    test("horizontal filled has no violations", async ({ mount, page }) => {
      await mount(<HorizontalFilled />);
      const results = await new AxeBuilder({ page })
        .options(axeConfig)
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("horizontal outline has no violations", async ({ mount, page }) => {
      await mount(<HorizontalOutline />);
      const results = await new AxeBuilder({ page })
        .options(axeConfig)
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("horizontal secondary has no violations", async ({ mount, page }) => {
      await mount(<HorizontalSecondary />);
      const results = await new AxeBuilder({ page })
        .options(axeConfig)
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("vertical has no violations", async ({ mount, page }) => {
      await mount(<VerticalFilled />);
      const results = await new AxeBuilder({ page })
        .options(axeConfig)
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test('renders with role="group"', async ({ mount, page }) => {
      await mount(<HorizontalOutline />);
      const group = page.getByRole("group");
      await expect(group).toBeVisible();
    });

    test("forwards aria-label", async ({ mount, page }) => {
      await mount(<WithLabel />);
      const group = page.getByRole("group", { name: "Actions" });
      await expect(group).toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  test.describe("Rendering", () => {
    test("renders horizontal by default", async ({ mount, page }) => {
      await mount(<HorizontalOutline />);
      const root = page.locator("[data-button-group]");
      await expect(root).toBeVisible();

      const direction = await root.evaluate(
        (el) => getComputedStyle(el).flexDirection,
      );
      expect(direction).toBe("row");
    });

    test("renders vertical orientation", async ({ mount, page }) => {
      await mount(<VerticalOutline />);
      const root = page.locator("[data-button-group]");

      const direction = await root.evaluate(
        (el) => getComputedStyle(el).flexDirection,
      );
      expect(direction).toBe("column");
    });

    test("renders all child buttons", async ({ mount, page }) => {
      await mount(<HorizontalFilled />);
      const buttons = page.getByRole("button");
      await expect(buttons).toHaveCount(3);
    });

    test("renders with two buttons", async ({ mount, page }) => {
      await mount(<TwoButtons />);
      const buttons = page.getByRole("button");
      await expect(buttons).toHaveCount(2);
    });

    test("renders single button", async ({ mount, page }) => {
      await mount(<SingleButton />);
      const buttons = page.getByRole("button");
      await expect(buttons).toHaveCount(1);
    });

    test("sets data-orientation attribute", async ({ mount, page }) => {
      await mount(<VerticalFilled />);
      const root = page.locator("[data-button-group]");
      await expect(root).toHaveAttribute("data-orientation", "vertical");
    });

    test('horizontal has data-orientation="horizontal"', async ({
      mount,
      page,
    }) => {
      await mount(<HorizontalFilled />);
      const root = page.locator("[data-button-group]");
      await expect(root).toHaveAttribute("data-orientation", "horizontal");
    });

    test("sets data-variant attribute", async ({ mount, page }) => {
      await mount(<HorizontalOutline />);
      const root = page.locator("[data-button-group]");
      await expect(root).toHaveAttribute("data-variant", "outline");
    });

    test("filled variant is default", async ({ mount, page }) => {
      await mount(<HorizontalFilled />);
      const root = page.locator("[data-button-group]");
      await expect(root).toHaveAttribute("data-variant", "filled");
    });

    test("secondary variant sets data-variant", async ({ mount, page }) => {
      await mount(<HorizontalSecondary />);
      const root = page.locator("[data-button-group]");
      await expect(root).toHaveAttribute("data-variant", "secondary");
    });
  });

  // ---------------------------------------------------------------------------
  // Visual - border radius merging
  // ---------------------------------------------------------------------------
  test.describe("Visual", () => {
    test("horizontal: first button has only left radius", async ({
      mount,
      page,
    }) => {
      await mount(<HorizontalOutline />);
      const first = page.getByRole("button").first();
      const radius = await first.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          tl: s.borderTopLeftRadius,
          tr: s.borderTopRightRadius,
          bl: s.borderBottomLeftRadius,
          br: s.borderBottomRightRadius,
        };
      });
      expect(radius.tl).not.toBe("0px");
      expect(radius.tr).toBe("0px");
      expect(radius.bl).not.toBe("0px");
      expect(radius.br).toBe("0px");
    });

    test("horizontal: last button has only right radius", async ({
      mount,
      page,
    }) => {
      await mount(<HorizontalOutline />);
      const last = page.getByRole("button").last();
      const radius = await last.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          tl: s.borderTopLeftRadius,
          tr: s.borderTopRightRadius,
          bl: s.borderBottomLeftRadius,
          br: s.borderBottomRightRadius,
        };
      });
      expect(radius.tl).toBe("0px");
      expect(radius.tr).not.toBe("0px");
      expect(radius.bl).toBe("0px");
      expect(radius.br).not.toBe("0px");
    });

    test("horizontal: middle button has no radius", async ({ mount, page }) => {
      await mount(<HorizontalOutline />);
      const middle = page.getByRole("button").nth(1);
      const radius = await middle.evaluate(
        (el) => getComputedStyle(el).borderRadius,
      );
      expect(radius).toBe("0px");
    });

    test("vertical: first button has only top radius", async ({
      mount,
      page,
    }) => {
      await mount(<VerticalOutline />);
      const first = page.getByRole("button").first();
      const radius = await first.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          tl: s.borderTopLeftRadius,
          tr: s.borderTopRightRadius,
          bl: s.borderBottomLeftRadius,
          br: s.borderBottomRightRadius,
        };
      });
      expect(radius.tl).not.toBe("0px");
      expect(radius.tr).not.toBe("0px");
      expect(radius.bl).toBe("0px");
      expect(radius.br).toBe("0px");
    });

    test("vertical: last button has only bottom radius", async ({
      mount,
      page,
    }) => {
      await mount(<VerticalOutline />);
      const last = page.getByRole("button").last();
      const radius = await last.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          tl: s.borderTopLeftRadius,
          tr: s.borderTopRightRadius,
          bl: s.borderBottomLeftRadius,
          br: s.borderBottomRightRadius,
        };
      });
      expect(radius.tl).toBe("0px");
      expect(radius.tr).toBe("0px");
      expect(radius.bl).not.toBe("0px");
      expect(radius.br).not.toBe("0px");
    });

    test("single button keeps full radius", async ({ mount, page }) => {
      await mount(<SingleButton />);
      const button = page.getByRole("button");
      const radius = await button.evaluate(
        (el) => getComputedStyle(el).borderRadius,
      );
      expect(radius).not.toBe("0px");
    });

    test("respects reduced motion", async ({ mount, page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await mount(<HorizontalOutline />);
      const first = page.getByRole("button").first();
      const transition = await first.evaluate(
        (el) => getComputedStyle(el).transition,
      );
      expect(transition).toMatch(/none|0s/);
    });
  });

  // ---------------------------------------------------------------------------
  // Variant-specific visual
  // ---------------------------------------------------------------------------
  test.describe("Variant visual", () => {
    test("outline: container has shadow", async ({ mount, page }) => {
      await mount(<HorizontalOutline />);
      const root = page.locator("[data-button-group]");
      const shadow = await root.evaluate(
        (el) => getComputedStyle(el).boxShadow,
      );
      expect(shadow).not.toBe("none");
    });

    test("outline: individual buttons have no shadow", async ({
      mount,
      page,
    }) => {
      await mount(<HorizontalOutline />);
      const first = page.getByRole("button").first();
      const shadow = await first.evaluate(
        (el) => getComputedStyle(el).boxShadow,
      );
      expect(shadow).toBe("none");
    });

    test("outline: container has border-radius", async ({ mount, page }) => {
      await mount(<HorizontalOutline />);
      const root = page.locator("[data-button-group]");
      const radius = await root.evaluate(
        (el) => getComputedStyle(el).borderRadius,
      );
      expect(radius).not.toBe("0px");
    });

    test("filled: container has no shadow", async ({ mount, page }) => {
      await mount(<HorizontalFilled />);
      const root = page.locator("[data-button-group]");
      const shadow = await root.evaluate(
        (el) => getComputedStyle(el).boxShadow,
      );
      expect(shadow).toBe("none");
    });

    test("secondary: container has no shadow", async ({ mount, page }) => {
      await mount(<HorizontalSecondary />);
      const root = page.locator("[data-button-group]");
      const shadow = await root.evaluate(
        (el) => getComputedStyle(el).boxShadow,
      );
      expect(shadow).toBe("none");
    });

    test("secondary: container has no border-radius", async ({
      mount,
      page,
    }) => {
      await mount(<HorizontalSecondary />);
      const root = page.locator("[data-button-group]");
      const radius = await root.evaluate(
        (el) => getComputedStyle(el).borderRadius,
      );
      expect(radius).toBe("0px");
    });

    test("secondary: has separator between buttons", async ({
      mount,
      page,
    }) => {
      await mount(<HorizontalSecondary />);
      // The second button should have a ::before pseudo-element acting as a separator
      const second = page.getByRole("button").nth(1);
      const hasSeparator = await second.evaluate((el) => {
        const before = getComputedStyle(el, "::before");
        return before.content !== "none" && before.content !== "";
      });
      expect(hasSeparator).toBe(true);
    });

    test("secondary vertical: direction is column", async ({ mount, page }) => {
      await mount(<VerticalSecondary />);
      const root = page.locator("[data-button-group]");
      const direction = await root.evaluate(
        (el) => getComputedStyle(el).flexDirection,
      );
      expect(direction).toBe("column");
    });
  });

  // ---------------------------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------------------------
  test.describe("Keyboard", () => {
    test("Tab moves between buttons individually", async ({ mount, page }) => {
      await mount(<HorizontalOutline />);
      const buttons = page.getByRole("button");

      await page.keyboard.press("Tab");
      await expect(buttons.first()).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(buttons.nth(1)).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(buttons.last()).toBeFocused();
    });
  });

  // ---------------------------------------------------------------------------
  // Conformance
  // ---------------------------------------------------------------------------
  test.describe("Conformance", () => {
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
});
