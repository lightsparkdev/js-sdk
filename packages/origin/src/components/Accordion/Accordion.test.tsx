import { test, expect } from "@playwright/experimental-ct-react";
import {
  TestAccordion,
  TestAccordionMultiple,
  TestAccordionDisabled,
  TestAccordionDefaultValue,
  TestAccordionControlled,
} from "./Accordion.test-stories";

test.describe("Accordion", () => {
  test.describe("Core", () => {
    test("has no accessibility violations", async ({ mount, page }) => {
      await mount(<TestAccordion />);
      const AxeBuilder = (await import("@axe-core/playwright")).default;
      const results = await new AxeBuilder({ page })
        .exclude("html")
        .disableRules(["landmark-one-main", "page-has-heading-one", "region"])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("expands panel on click", async ({ mount }) => {
      const component = await mount(<TestAccordion />);
      const trigger = component.getByRole("button", { name: "First Item" });
      const panel = component.getByText("First panel content");

      await expect(panel).toBeHidden();
      await trigger.click();
      await expect(panel).toBeVisible();
    });

    test("respects prefers-reduced-motion", async ({ mount, page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      const component = await mount(<TestAccordion />);
      const icon = component.locator("button").first().locator("svg").first();
      const transition = await icon.evaluate(
        (el) => window.getComputedStyle(el).transition,
      );
      expect(transition).toMatch(/none|all 0s/);
    });
  });

  test.describe("Keyboard", () => {
    test("Enter expands panel", async ({ mount, page }) => {
      const component = await mount(<TestAccordion />);
      const trigger = component.getByRole("button", { name: "First Item" });
      const panel = component.getByText("First panel content");

      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(panel).toBeVisible();
    });

    test("Space expands panel", async ({ mount, page }) => {
      const component = await mount(<TestAccordion />);
      const trigger = component.getByRole("button", { name: "First Item" });
      const panel = component.getByText("First panel content");

      await trigger.focus();
      await page.keyboard.press("Space");
      await expect(panel).toBeVisible();
    });

    test("Tab moves focus between triggers", async ({ mount, page }) => {
      const component = await mount(<TestAccordion />);
      const first = component.getByRole("button", { name: "First Item" });
      const second = component.getByRole("button", { name: "Second Item" });

      await first.focus();
      await expect(first).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(second).toBeFocused();
    });

    test("ArrowDown moves focus to next trigger", async ({ mount, page }) => {
      const component = await mount(<TestAccordion />);
      const first = component.getByRole("button", { name: "First Item" });
      const second = component.getByRole("button", { name: "Second Item" });

      await first.focus();
      await page.keyboard.press("ArrowDown");
      await expect(second).toBeFocused();
    });

    test("ArrowUp moves focus to previous trigger", async ({ mount, page }) => {
      const component = await mount(<TestAccordion />);
      const first = component.getByRole("button", { name: "First Item" });
      const second = component.getByRole("button", { name: "Second Item" });

      await second.focus();
      await page.keyboard.press("ArrowUp");
      await expect(first).toBeFocused();
    });
  });

  test.describe("multiple prop", () => {
    test("single mode: opening one closes another", async ({ mount }) => {
      const component = await mount(<TestAccordion />);
      const first = component.getByRole("button", { name: "First Item" });
      const second = component.getByRole("button", { name: "Second Item" });
      const firstPanel = component.getByText("First panel content");
      const secondPanel = component.getByText("Second panel content");

      await first.click();
      await expect(firstPanel).toBeVisible();

      await second.click();
      await expect(secondPanel).toBeVisible();
      await expect(firstPanel).toBeHidden();
    });

    test("multiple mode: both stay open", async ({ mount }) => {
      const component = await mount(<TestAccordionMultiple />);
      const first = component.getByRole("button", { name: "First Item" });
      const second = component.getByRole("button", { name: "Second Item" });
      const firstPanel = component.getByText("First panel content");
      const secondPanel = component.getByText("Second panel content");

      await first.click();
      await expect(firstPanel).toBeVisible();

      await second.click();
      await expect(secondPanel).toBeVisible();
      await expect(firstPanel).toBeVisible();
    });
  });

  test.describe("disabled prop", () => {
    test("disabled accordion cannot be expanded", async ({ mount }) => {
      const component = await mount(<TestAccordionDisabled />);
      const trigger = component.getByRole("button", { name: "Disabled Item" });
      const panel = component.getByText("Should not open");

      await trigger.click({ force: true });
      await expect(panel).toBeHidden();
    });
  });

  test.describe("defaultValue prop", () => {
    test("opens specified item on mount", async ({ mount }) => {
      const component = await mount(<TestAccordionDefaultValue />);
      const firstPanel = component.getByText("First panel content");
      const secondPanel = component.getByText("Second panel content");

      await expect(firstPanel).toBeHidden();
      await expect(secondPanel).toBeVisible();
    });
  });

  test.describe("controlled mode", () => {
    test("value/onValueChange controls open state", async ({ mount }) => {
      let lastValue: string[] = [];
      const component = await mount(
        <TestAccordionControlled onChange={(v) => (lastValue = v)} />,
      );
      const trigger = component.getByRole("button", { name: "First Item" });
      const panel = component.getByText("First panel content");

      await expect(panel).toBeHidden();
      await trigger.click();
      await expect(panel).toBeVisible();
      expect(lastValue).toContain("item-1");
    });
  });
});
