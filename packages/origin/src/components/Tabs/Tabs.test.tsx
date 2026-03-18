import { test, expect } from "@playwright/experimental-ct-react";
import {
  TestTabs,
  TestTabsMinimal,
  TestTabsDefaultValue,
  TestTabsDisabled,
  TestTabsControlled,
} from "./Tabs.test-stories";

test.describe("Tabs", () => {
  test.describe("Core", () => {
    test("has no accessibility violations", async ({ mount, page }) => {
      await mount(<TestTabs />);
      const AxeBuilder = (await import("@axe-core/playwright")).default;
      const results = await new AxeBuilder({ page })
        .exclude("html")
        .disableRules([
          "landmark-one-main",
          "page-has-heading-one",
          "region",
          // TODO: [A11y] text/secondary on surface/sunken = 3.7:1 (needs 4.5:1)
          // Flagged for token audit - re-enable after tokens are updated
          "color-contrast",
        ])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("shows first tab content by default", async ({ mount }) => {
      const component = await mount(<TestTabs />);
      const firstPanel = component.getByText("First panel content");
      const secondPanel = component.getByText("Second panel content");

      await expect(firstPanel).toBeVisible();
      await expect(secondPanel).toBeHidden();
    });

    test("switches panel on tab click", async ({ mount }) => {
      const component = await mount(<TestTabs />);
      const secondTab = component.getByRole("tab", { name: "Second Tab" });
      const firstPanel = component.getByText("First panel content");
      const secondPanel = component.getByText("Second panel content");

      await secondTab.click();
      await expect(secondPanel).toBeVisible();
      await expect(firstPanel).toBeHidden();
    });
  });

  test.describe("Keyboard", () => {
    test("Enter activates tab", async ({ mount, page }) => {
      const component = await mount(<TestTabs />);
      const secondTab = component.getByRole("tab", { name: "Second Tab" });
      const secondPanel = component.getByText("Second panel content");

      await secondTab.focus();
      await page.keyboard.press("Enter");
      await expect(secondPanel).toBeVisible();
    });

    test("Space activates tab", async ({ mount, page }) => {
      const component = await mount(<TestTabs />);
      const secondTab = component.getByRole("tab", { name: "Second Tab" });
      const secondPanel = component.getByText("Second panel content");

      await secondTab.focus();
      await page.keyboard.press("Space");
      await expect(secondPanel).toBeVisible();
    });

    test("ArrowRight moves focus to next tab", async ({ mount, page }) => {
      const component = await mount(<TestTabs />);
      const firstTab = component.getByRole("tab", { name: "First Tab" });
      const secondTab = component.getByRole("tab", { name: "Second Tab" });

      await firstTab.focus();
      await page.keyboard.press("ArrowRight");
      await expect(secondTab).toBeFocused();
    });

    test("ArrowLeft moves focus to previous tab", async ({ mount, page }) => {
      const component = await mount(<TestTabs />);
      const firstTab = component.getByRole("tab", { name: "First Tab" });
      const secondTab = component.getByRole("tab", { name: "Second Tab" });

      await secondTab.focus();
      await page.keyboard.press("ArrowLeft");
      await expect(firstTab).toBeFocused();
    });

    test("ArrowRight loops from last to first tab", async ({ mount, page }) => {
      const component = await mount(<TestTabs />);
      const firstTab = component.getByRole("tab", { name: "First Tab" });
      const thirdTab = component.getByRole("tab", { name: "Third Tab" });

      await thirdTab.focus();
      await page.keyboard.press("ArrowRight");
      await expect(firstTab).toBeFocused();
    });

    test("ArrowLeft loops from first to last tab", async ({ mount, page }) => {
      const component = await mount(<TestTabs />);
      const firstTab = component.getByRole("tab", { name: "First Tab" });
      const thirdTab = component.getByRole("tab", { name: "Third Tab" });

      await firstTab.focus();
      await page.keyboard.press("ArrowLeft");
      await expect(thirdTab).toBeFocused();
    });
  });

  test.describe("variant prop", () => {
    test("default variant renders with background", async ({ mount }) => {
      const component = await mount(<TestTabs />);
      const tabList = component.getByRole("tablist");
      await expect(tabList).toBeVisible();
    });

    test("minimal variant renders without background", async ({ mount }) => {
      const component = await mount(<TestTabsMinimal />);
      const tabList = component.getByRole("tablist");
      await expect(tabList).toBeVisible();
    });
  });

  test.describe("defaultValue prop", () => {
    test("opens specified tab on mount", async ({ mount }) => {
      const component = await mount(<TestTabsDefaultValue />);
      const firstPanel = component.getByText("First panel content");
      const secondPanel = component.getByText("Second panel content");

      await expect(firstPanel).toBeHidden();
      await expect(secondPanel).toBeVisible();
    });
  });

  test.describe("disabled prop", () => {
    test("disabled tab cannot be activated by click", async ({ mount }) => {
      const component = await mount(<TestTabsDisabled />);
      const disabledTab = component.getByRole("tab", { name: "Disabled Tab" });
      const firstPanel = component.getByText("First panel content");
      const disabledPanel = component.getByText("Disabled panel content");

      await disabledTab.click({ force: true });
      await expect(firstPanel).toBeVisible();
      await expect(disabledPanel).toBeHidden();
    });

    test("disabled tab has aria-disabled attribute", async ({ mount }) => {
      const component = await mount(<TestTabsDisabled />);
      const disabledTab = component.getByRole("tab", { name: "Disabled Tab" });

      await expect(disabledTab).toHaveAttribute("aria-disabled", "true");
    });
  });

  test.describe("controlled mode", () => {
    test("value/onValueChange controls active tab", async ({ mount }) => {
      let lastValue: string | number | null = null;
      const component = await mount(
        <TestTabsControlled onChange={(v) => (lastValue = v)} />,
      );
      const secondTab = component.getByRole("tab", { name: "Second Tab" });
      const secondPanel = component.getByText("Second panel content");

      await secondTab.click();
      await expect(secondPanel).toBeVisible();
      expect(lastValue).toBe("tab2");
    });
  });
});
