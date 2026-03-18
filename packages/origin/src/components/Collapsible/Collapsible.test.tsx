import { test, expect } from "@playwright/experimental-ct-react";
import {
  TestDefault,
  TestDefaultOpen,
  TestDisabled,
  TestHideIcon,
  TestCustomIcon,
  TestControlled,
} from "./Collapsible.test-stories";

test.describe("Collapsible", () => {
  test.describe("Core", () => {
    test("has no accessibility violations", async ({ mount, page }) => {
      await mount(<TestDefault />);
      const AxeBuilder = (await import("@axe-core/playwright")).default;
      const results = await new AxeBuilder({ page })
        .exclude("html")
        .disableRules(["landmark-one-main", "page-has-heading-one", "region"])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("renders closed by default", async ({ mount }) => {
      const component = await mount(<TestDefault />);
      const trigger = component.getByRole("button", { name: "Toggle content" });
      const panel = component.getByText("Panel content");

      await expect(trigger).toBeVisible();
      await expect(panel).toBeHidden();
    });

    test("opens panel on click", async ({ mount }) => {
      const component = await mount(<TestDefault />);
      const trigger = component.getByRole("button", { name: "Toggle content" });
      const panel = component.getByText("Panel content");

      await trigger.click();
      await expect(panel).toBeVisible();
    });

    test("closes panel on second click", async ({ mount }) => {
      const component = await mount(<TestDefault />);
      const trigger = component.getByRole("button", { name: "Toggle content" });
      const panel = component.getByText("Panel content");

      await trigger.click();
      await expect(panel).toBeVisible();
      await trigger.click();
      await expect(panel).toBeHidden();
    });

    test("respects prefers-reduced-motion", async ({ mount, page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      const component = await mount(<TestDefault />);
      const iconWrapper = component.locator("button span").last();
      const transition = await iconWrapper.evaluate(
        (el) => window.getComputedStyle(el).transition,
      );
      expect(transition).toMatch(/none|all 0s/);
    });
  });

  test.describe("defaultOpen", () => {
    test("renders open on mount", async ({ mount }) => {
      const component = await mount(<TestDefaultOpen />);
      const panel = component.getByText("Panel content");

      await expect(panel).toBeVisible();
    });
  });

  test.describe("disabled", () => {
    test("cannot be expanded", async ({ mount }) => {
      const component = await mount(<TestDisabled />);
      const trigger = component.getByRole("button", { name: "Toggle content" });
      const panel = component.getByText("Should not open");

      await trigger.click({ force: true });
      await expect(panel).toBeHidden();
    });
  });

  test.describe("hideIcon", () => {
    test("hides the default chevron", async ({ mount }) => {
      const component = await mount(<TestHideIcon />);
      const trigger = component.getByRole("button", { name: "Toggle content" });
      const svg = trigger.locator("svg");

      await expect(svg).toHaveCount(0);
    });
  });

  test.describe("custom icon", () => {
    test("renders custom icon instead of chevron", async ({ mount }) => {
      const component = await mount(<TestCustomIcon />);
      const customIcon = component.getByTestId("custom-icon");

      await expect(customIcon).toBeVisible();
    });
  });

  test.describe("Keyboard", () => {
    test("Enter toggles panel", async ({ mount, page }) => {
      const component = await mount(<TestDefault />);
      const trigger = component.getByRole("button", { name: "Toggle content" });
      const panel = component.getByText("Panel content");

      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(panel).toBeVisible();
    });

    test("Space toggles panel", async ({ mount, page }) => {
      const component = await mount(<TestDefault />);
      const trigger = component.getByRole("button", { name: "Toggle content" });
      const panel = component.getByText("Panel content");

      await trigger.focus();
      await page.keyboard.press("Space");
      await expect(panel).toBeVisible();
    });
  });

  test.describe("controlled mode", () => {
    test("open/onOpenChange controls state", async ({ mount }) => {
      let lastOpen: boolean = false;
      const component = await mount(
        <TestControlled onChange={(v) => (lastOpen = v)} />,
      );
      const trigger = component.getByRole("button", { name: "Toggle content" });
      const panel = component.getByText("Panel content");

      await expect(panel).toBeHidden();
      await trigger.click();
      await expect(panel).toBeVisible();
      expect(lastOpen).toBe(true);
    });
  });
});
