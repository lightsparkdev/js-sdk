import { test, expect } from "@playwright/experimental-ct-react";
import {
  TestCombobox,
  TestComboboxMultiple,
  TestComboboxDisabled,
  TestComboboxDefaultValue,
  TestComboboxControlled,
  TestComboboxWithGroups,
  TestComboboxWithClear,
  TestComboboxChipPassThrough,
  ConformanceInputWrapper,
  ConformanceActionButtons,
} from "./Combobox.test-stories";

test.describe("Combobox", () => {
  test.describe("Core", () => {
    test("has no accessibility violations", async ({ mount, page }) => {
      await mount(<TestCombobox />);
      const AxeBuilder = (await import("@axe-core/playwright")).default;
      const results = await new AxeBuilder({ page })
        .exclude("html")
        .disableRules([
          "landmark-one-main",
          "page-has-heading-one",
          "region",
          // Base UI Combobox pattern: trigger wraps focusable input
          "nested-interactive",
        ])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("opens popup on input click", async ({ mount, page }) => {
      const component = await mount(<TestCombobox />);
      const input = component.getByPlaceholder("Select a fruit...");

      await input.click();
      await expect(page.getByRole("listbox")).toBeVisible();
    });

    test("closes popup on item selection", async ({ mount, page }) => {
      const component = await mount(<TestCombobox />);
      const input = component.getByPlaceholder("Select a fruit...");

      await input.click();
      await page.getByRole("option", { name: "Apple" }).click();
      await expect(page.getByRole("listbox")).toBeHidden();
    });

    test("displays all options when opened", async ({ mount, page }) => {
      const component = await mount(<TestCombobox />);
      const input = component.getByPlaceholder("Select a fruit...");

      await input.click();
      await expect(page.getByRole("option", { name: "Apple" })).toBeVisible();
      await expect(page.getByRole("option", { name: "Cherry" })).toBeVisible();
      await expect(page.getByRole("option", { name: "Grape" })).toBeVisible();
    });

    test("shows empty state when no matches", async ({ mount, page }) => {
      const component = await mount(<TestCombobox />);
      const input = component.getByPlaceholder("Select a fruit...");

      await input.click();
      await input.fill("xyz");
      await expect(page.getByText("No results found.")).toBeVisible();
    });

    test("respects prefers-reduced-motion", async ({ mount, page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      const component = await mount(<TestCombobox />);
      const icon = component.locator("svg").first();
      const transition = await icon.evaluate(
        (el) => window.getComputedStyle(el.parentElement!).transition,
      );
      expect(transition).toMatch(/none|all 0s/);
    });
  });

  test.describe("Keyboard", () => {
    test("Enter selects highlighted item", async ({ mount, page }) => {
      const component = await mount(<TestCombobox />);
      const input = component.getByPlaceholder("Select a fruit...");

      await input.click();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await expect(input).toHaveValue("Apple");
    });

    test("ArrowDown moves highlight down", async ({ mount, page }) => {
      const component = await mount(<TestCombobox />);
      const input = component.getByPlaceholder("Select a fruit...");

      await input.click();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      const highlighted = page.locator("[data-highlighted]");
      await expect(highlighted).toContainText("Banana");
    });

    test("ArrowUp moves highlight up", async ({ mount, page }) => {
      const component = await mount(<TestCombobox />);
      const input = component.getByPlaceholder("Select a fruit...");

      await input.click();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowUp");
      const highlighted = page.locator("[data-highlighted]");
      await expect(highlighted).toContainText("Apple");
    });

    test("Escape closes popup", async ({ mount, page }) => {
      const component = await mount(<TestCombobox />);
      const input = component.getByPlaceholder("Select a fruit...");

      await input.click();
      await expect(page.getByRole("listbox")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("listbox")).toBeHidden();
    });
  });

  test.describe("multiple prop", () => {
    test("allows selecting multiple items", async ({ mount, page }) => {
      const component = await mount(<TestComboboxMultiple />);
      const input = component.getByPlaceholder("Select fruits...");

      await input.click();
      await page.getByRole("option", { name: "Apple" }).click();
      await page.getByRole("option", { name: "Banana" }).click();

      const apple = page.getByRole("option", { name: "Apple" });
      const banana = page.getByRole("option", { name: "Banana" });
      await expect(apple).toHaveAttribute("data-selected", "");
      await expect(banana).toHaveAttribute("data-selected", "");
    });

    test("renders chip children directly and removes through wrapped ChipRemove", async ({
      mount,
      page,
    }) => {
      await mount(<TestComboboxChipPassThrough />);
      const chip = page.getByTestId("combobox-chip");

      await expect(
        chip.locator("> [data-testid='chip-label-child']"),
      ).toHaveText("Apple");
      await expect(
        chip.locator("> [data-testid='remove-wrapper']"),
      ).toBeVisible();

      await page.getByRole("button", { name: "Remove Apple" }).click();
      await expect(chip).toBeHidden();
    });
  });

  test.describe("disabled prop", () => {
    test("disabled combobox cannot be opened", async ({ mount, page }) => {
      const component = await mount(<TestComboboxDisabled />);
      const input = component.getByPlaceholder("Disabled...");

      await input.click({ force: true });
      await expect(page.getByRole("listbox")).toBeHidden();
    });
  });

  test.describe("defaultValue prop", () => {
    test("selects specified item on mount", async ({ mount }) => {
      const component = await mount(<TestComboboxDefaultValue />);
      const input = component.getByPlaceholder("Select a fruit...");
      await expect(input).toHaveValue("Cherry");
    });
  });

  test.describe("controlled mode", () => {
    test("value/onValueChange controls selection", async ({ mount, page }) => {
      let lastValue: string | null = null;
      const component = await mount(
        <TestComboboxControlled onChange={(v) => (lastValue = v)} />,
      );
      const input = component.getByPlaceholder("Select a fruit...");

      await input.click();
      await page.getByRole("option", { name: "Banana" }).click();
      expect(lastValue).toBe("Banana");
    });
  });

  test.describe("groups", () => {
    test("renders groups with labels", async ({ mount, page }) => {
      const component = await mount(<TestComboboxWithGroups />);
      const input = component.getByPlaceholder("Select a fruit...");

      await input.click();
      await expect(page.getByText("Common")).toBeVisible();
      await expect(page.getByText("Exotic")).toBeVisible();
    });
  });

  test.describe("clear button", () => {
    test("clears selection on click", async ({ mount }) => {
      const component = await mount(<TestComboboxWithClear />);
      const input = component.getByPlaceholder("Select a fruit...");
      const clear = component.locator('button[class*="clear"]');

      await expect(input).toHaveValue("Apple");
      await clear.click();
      await expect(input).toHaveValue("");
    });
  });

  test.describe("Conformance (slot compatibility)", () => {
    test.describe("InputWrapper", () => {
      test("forwards props", async ({ mount, page }) => {
        await mount(<ConformanceInputWrapper data-custom="custom-value" />);
        await expect(page.getByTestId("test-root")).toHaveAttribute(
          "data-custom",
          "custom-value",
        );
      });

      test("merges className", async ({ mount, page }) => {
        await mount(<ConformanceInputWrapper className="custom-class" />);
        await expect(page.getByTestId("test-root")).toHaveClass(/custom-class/);
      });

      test("forwards style", async ({ mount, page }) => {
        await mount(<ConformanceInputWrapper style={{ color: "green" }} />);
        await expect(page.getByTestId("test-root")).toHaveCSS(
          "color",
          "rgb(0, 128, 0)",
        );
      });
    });

    test.describe("ActionButtons", () => {
      test("forwards props", async ({ mount, page }) => {
        await mount(<ConformanceActionButtons data-custom="custom-value" />);
        await expect(page.getByTestId("test-root")).toHaveAttribute(
          "data-custom",
          "custom-value",
        );
      });

      test("merges className", async ({ mount, page }) => {
        await mount(<ConformanceActionButtons className="custom-class" />);
        await expect(page.getByTestId("test-root")).toHaveClass(/custom-class/);
      });
    });

    // ItemText tests skipped - requires popup to be visible in DOM
    // The component itself follows slot pattern, but testing requires complex setup

    // ChipText tests skipped - requires multi-select chips to render
    // The component itself follows slot pattern, but testing requires complex setup
  });
});
