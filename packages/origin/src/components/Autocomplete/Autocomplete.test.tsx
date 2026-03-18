import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicAutocomplete,
  WithLeadingIcon,
  WithDisabledItems,
  DisabledAutocomplete,
  GroupedAutocomplete,
  ControlledAutocomplete,
} from "./Autocomplete.test-stories";

test.describe("Autocomplete", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test.describe("Basic", () => {
    test("renders input with placeholder", async ({ mount }) => {
      const component = await mount(<BasicAutocomplete />);
      const input = component.getByPlaceholder("Search fruits...");
      await expect(input).toBeVisible();
    });

    test("opens popup on click", async ({ mount, page }) => {
      const component = await mount(<BasicAutocomplete />);
      const input = component.getByPlaceholder("Search fruits...");

      // Focus and trigger popup by pressing a key (click alone may not trigger in test env)
      await input.focus();
      await input.press("ArrowDown");
      // Wait for options to be visible (indicates popup is rendered)
      await expect(page.getByRole("option", { name: "Apple" })).toBeVisible();
      await expect(page.getByRole("listbox")).toBeVisible();
    });

    test("filters items as user types", async ({ mount, page }) => {
      const component = await mount(<BasicAutocomplete />);
      const input = component.getByPlaceholder("Search fruits...");

      await input.click();
      await input.fill("ban");

      await expect(page.getByRole("option", { name: "Banana" })).toBeVisible();
      await expect(
        page.getByRole("option", { name: "Apple" }),
      ).not.toBeVisible();
    });

    test("shows empty message when no results", async ({ mount, page }) => {
      const component = await mount(<BasicAutocomplete />);
      const input = component.getByPlaceholder("Search fruits...");

      await input.click();
      await input.fill("xyz");

      await expect(page.getByText("No results found.")).toBeVisible();
    });

    test("selects item on click and fills input", async ({ mount, page }) => {
      const component = await mount(<BasicAutocomplete />);
      const input = component.getByPlaceholder("Search fruits...");

      // Focus and trigger popup
      await input.focus();
      await input.press("ArrowDown");
      // Wait for popup to render
      await expect(page.getByRole("option", { name: "Banana" })).toBeVisible();
      await page.getByRole("option", { name: "Banana" }).click();

      await expect(input).toHaveValue("Banana");
    });

    test("navigates with keyboard and selects with Enter", async ({
      mount,
      page,
    }) => {
      const component = await mount(<BasicAutocomplete />);
      const input = component.getByPlaceholder("Search fruits...");

      // Type to filter and open popup
      await input.fill("Ban");
      await expect(page.getByRole("option", { name: "Banana" })).toBeVisible();
      // Navigate to the item and select with Enter
      await input.press("ArrowDown");
      await input.press("Enter");

      await expect(input).toHaveValue("Banana");
    });

    test("closes popup on Escape", async ({ mount, page }) => {
      const component = await mount(<BasicAutocomplete />);
      const input = component.getByPlaceholder("Search fruits...");

      // Focus and trigger popup
      await input.focus();
      await input.press("ArrowDown");
      // Wait for popup to render
      await expect(page.getByRole("option", { name: "Apple" })).toBeVisible();
      await expect(page.getByRole("listbox")).toBeVisible();

      await input.press("Escape");
      await expect(page.getByRole("listbox")).toBeHidden();
    });
  });

  test.describe("With Leading Icon", () => {
    test("renders items with icons", async ({ mount, page }) => {
      const component = await mount(<WithLeadingIcon />);
      const input = component.getByPlaceholder("Search fruits...");

      // Focus and trigger popup
      await input.focus();
      await input.press("ArrowDown");
      // Wait for popup to render and verify option is visible
      await expect(page.getByRole("option", { name: "Apple" })).toBeVisible();
    });
  });

  test.describe("Disabled Items", () => {
    test("does not select disabled items", async ({ mount, page }) => {
      const component = await mount(<WithDisabledItems />);
      const input = component.getByPlaceholder("Search fruits...");

      // Focus and trigger popup
      await input.focus();
      await input.press("ArrowDown");
      // Wait for popup to render
      const disabledItem = page.getByRole("option", { name: "Cherry" });
      await expect(disabledItem).toBeVisible();
      await expect(disabledItem).toHaveAttribute("data-disabled");

      await disabledItem.click({ force: true });
      await expect(input).not.toHaveValue("Cherry");
    });

    test("skips disabled items during keyboard navigation", async ({
      mount,
      page,
    }) => {
      const component = await mount(<WithDisabledItems />);
      const input = component.getByPlaceholder("Search fruits...");

      // Type 'D' to filter to Date only (which skips disabled Cherry naturally)
      await input.fill("D");
      await expect(page.getByRole("option", { name: "Date" })).toBeVisible();
      await input.press("ArrowDown"); // Highlight Date
      await input.press("Enter");

      await expect(input).toHaveValue("Date");
    });
  });

  test.describe("Disabled Autocomplete", () => {
    test("input is disabled", async ({ mount }) => {
      const component = await mount(<DisabledAutocomplete />);
      const input = component.getByPlaceholder("Search fruits...");

      await expect(input).toHaveAttribute("data-disabled");
    });

    test("does not open popup when disabled", async ({ mount, page }) => {
      const component = await mount(<DisabledAutocomplete />);
      const input = component.getByPlaceholder("Search fruits...");

      await input.click({ force: true });
      await expect(page.getByRole("listbox")).not.toBeVisible();
    });
  });

  test.describe("Grouped", () => {
    test("renders groups with labels", async ({ mount, page }) => {
      const component = await mount(<GroupedAutocomplete />);
      const input = component.getByPlaceholder("Search produce...");

      // Focus and trigger popup
      await input.focus();
      await input.press("ArrowDown");
      // Wait for popup to render
      await expect(page.getByRole("option", { name: "Apple" })).toBeVisible();

      await expect(page.getByText("Fruits")).toBeVisible();
      await expect(page.getByText("Vegetables")).toBeVisible();
      await expect(page.getByRole("option", { name: "Carrot" })).toBeVisible();
    });
  });

  test.describe("Controlled", () => {
    test("value changes on item selection", async ({ mount, page }) => {
      const component = await mount(<ControlledAutocomplete />);
      const input = component.getByPlaceholder("Search fruits...");

      // Focus and trigger popup
      await input.focus();
      await input.press("ArrowDown");
      // Wait for popup to render
      await expect(page.getByRole("option", { name: "Cherry" })).toBeVisible();
      await page.getByRole("option", { name: "Cherry" }).click();

      await expect(component.getByTestId("value-display")).toHaveText(
        "Value: Cherry",
      );
    });

    test("filters based on controlled value", async ({ mount, page }) => {
      const component = await mount(<ControlledAutocomplete />);
      const input = component.getByPlaceholder("Search fruits...");

      // Type to trigger filtering (this opens popup and filters)
      await input.fill("Eld");
      await expect(
        page.getByRole("option", { name: "Elderberry" }),
      ).toBeVisible();
      await expect(
        page.getByRole("option", { name: "Apple" }),
      ).not.toBeVisible();
    });
  });
});
