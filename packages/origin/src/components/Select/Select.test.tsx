import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultSelect,
  DisabledSelect,
  WithDefaultValue,
  WithGroups,
  ControlledSelect,
  DisabledItem,
  MultiSelectDefault,
  MultiSelectControlled,
  GhostSelect,
  GhostSelectPlaceholder,
  GhostSelectDisabled,
  GhostSelectControlled,
  HybridSelect,
  HybridSelectControlled,
} from "./Select.test-stories";

test.describe("Select", () => {
  test("renders trigger", async ({ mount, page }) => {
    await mount(<DefaultSelect />);

    const trigger = page.getByRole("combobox");
    await expect(trigger).toBeVisible();
  });

  test("opens popup on click", async ({ mount, page }) => {
    await mount(<DefaultSelect />);

    const trigger = page.getByRole("combobox");
    await trigger.click();

    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
  });

  test("selects an option", async ({ mount, page }) => {
    await mount(<DefaultSelect />);

    const trigger = page.getByRole("combobox");
    await trigger.click();

    const option = page.getByRole("option", { name: "Apple" });
    await option.click();

    // Popup should close after selection
    const listbox = page.getByRole("listbox");
    await expect(listbox).not.toBeVisible();

    // Re-open to verify Apple is selected
    await trigger.click();
    const appleOption = page.getByRole("option", { name: "Apple" });
    await expect(appleOption).toHaveAttribute("data-selected");
  });

  test("shows default value", async ({ mount, page }) => {
    await mount(<WithDefaultValue />);

    // Open to verify Banana is selected
    const trigger = page.getByRole("combobox");
    await trigger.click();
    const bananaOption = page.getByRole("option", { name: "Banana" });
    await expect(bananaOption).toHaveAttribute("data-selected");
  });

  test("disabled select cannot be opened", async ({ mount, page }) => {
    await mount(<DisabledSelect />);

    const trigger = page.getByRole("combobox");
    await expect(trigger).toHaveAttribute("data-disabled");

    await trigger.click({ force: true });

    const listbox = page.getByRole("listbox");
    await expect(listbox).not.toBeVisible();
  });

  test("renders groups with labels", async ({ mount, page }) => {
    await mount(<WithGroups />);

    const trigger = page.getByRole("combobox");
    await trigger.click();

    // First list has items without group label, second has "Vegetables" label
    await expect(page.getByText("Vegetables")).toBeVisible();
    await expect(page.getByText("Carrot")).toBeVisible();
  });

  test("controlled value updates", async ({ mount, page }) => {
    await mount(<ControlledSelect />);

    const selectedValue = page.getByTestId("selected-value");
    await expect(selectedValue).toHaveText("none");

    const trigger = page.getByRole("combobox");
    await trigger.click();

    const option = page.getByRole("option", { name: "Orange" });
    await option.click();

    await expect(selectedValue).toHaveText("orange");
  });

  test("keyboard navigation opens popup", async ({ mount, page }) => {
    await mount(<DefaultSelect />);

    const trigger = page.getByRole("combobox");
    await trigger.focus();
    await trigger.press("Enter");

    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();

    // Escape closes
    await page.keyboard.press("Escape");
    await expect(listbox).not.toBeVisible();
  });

  test("disabled item cannot be selected", async ({ mount, page }) => {
    await mount(<DisabledItem />);

    const trigger = page.getByRole("combobox");
    await trigger.click();

    const disabledOption = page.getByRole("option", { name: /Banana/ });
    await expect(disabledOption).toHaveAttribute("data-disabled");
  });

  test("multi-select shows multiple selected items", async ({
    mount,
    page,
  }) => {
    await mount(<MultiSelectDefault />);

    const trigger = page.getByRole("combobox");
    // Default value is ['apple', 'banana'], should show "Apple +1"
    await expect(trigger).toContainText("Apple +1");

    await trigger.click();

    // Both items should be selected
    const appleOption = page.getByRole("option", { name: "Apple" });
    const bananaOption = page.getByRole("option", { name: "Banana" });
    await expect(appleOption).toHaveAttribute("data-selected");
    await expect(bananaOption).toHaveAttribute("data-selected");
  });

  test("multi-select allows toggling items", async ({ mount, page }) => {
    await mount(<MultiSelectControlled />);

    const trigger = page.getByRole("combobox");
    const selectedCount = page.getByTestId("selected-count");

    await expect(selectedCount).toHaveText("0");

    await trigger.click();

    // Select Apple
    await page.getByRole("option", { name: "Apple" }).click();
    await expect(selectedCount).toHaveText("1");

    // Select Banana (popup stays open in multi-select)
    await page.getByRole("option", { name: "Banana" }).click();
    await expect(selectedCount).toHaveText("2");

    // Deselect Apple
    await page.getByRole("option", { name: "Apple" }).click();
    await expect(selectedCount).toHaveText("1");
  });
});

test.describe("Select Ghost Variant", () => {
  test("renders ghost trigger with value", async ({ mount, page }) => {
    await mount(<GhostSelect />);

    const trigger = page.getByRole("combobox");
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("data-variant", "ghost");
    // Value displays the raw value (lowercase) not the label
    await expect(trigger).toContainText("production");
  });

  test("renders ghost trigger with placeholder", async ({ mount, page }) => {
    await mount(<GhostSelectPlaceholder />);

    const trigger = page.getByRole("combobox");
    await expect(trigger).toBeVisible();
    await expect(trigger).toContainText("Select environment");
  });

  test("ghost trigger opens popup on click", async ({ mount, page }) => {
    await mount(<GhostSelect />);

    const trigger = page.getByRole("combobox");
    await trigger.click();

    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
  });

  test("ghost trigger selects an option", async ({ mount, page }) => {
    await mount(<GhostSelectControlled />);

    const trigger = page.getByRole("combobox");
    const selectedEnv = page.getByTestId("selected-env");

    await expect(selectedEnv).toHaveText("production");

    await trigger.click();
    await page.getByRole("option", { name: "Sandbox" }).click();

    await expect(selectedEnv).toHaveText("sandbox");
  });

  test("disabled ghost trigger cannot be opened", async ({ mount, page }) => {
    await mount(<GhostSelectDisabled />);

    const trigger = page.getByRole("combobox");
    await expect(trigger).toHaveAttribute("data-disabled");

    await trigger.click({ force: true });

    const listbox = page.getByRole("listbox");
    await expect(listbox).not.toBeVisible();
  });

  test("ghost trigger keyboard navigation", async ({ mount, page }) => {
    await mount(<GhostSelect />);

    const trigger = page.getByRole("combobox");
    await trigger.focus();
    await trigger.press("Enter");

    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();

    // Escape closes
    await page.keyboard.press("Escape");
    await expect(listbox).not.toBeVisible();
  });
});

test.describe("Select Hybrid Variant", () => {
  test("renders hybrid trigger with value", async ({ mount, page }) => {
    await mount(<HybridSelect />);

    const trigger = page.getByRole("combobox");
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("data-variant", "hybrid");
    // Value is the raw value 'production', not the display label
    await expect(trigger).toContainText("production");
  });

  test("hybrid icon click opens popup", async ({ mount, page }) => {
    await mount(<HybridSelectControlled />);

    // Click on the icon button to open
    const icon = page.getByTestId("hybrid-icon");
    await icon.click();

    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
  });

  test("hybrid label click does not open popup", async ({ mount, page }) => {
    await mount(<HybridSelectControlled />);

    // Click on the label/value text (not the icon)
    const value = page.getByTestId("hybrid-value");
    await value.click({ force: true }); // force: true to click even with pointer-events: none

    // Popup should NOT be visible because click passed through
    const listbox = page.getByRole("listbox");
    await expect(listbox).not.toBeVisible();
  });

  test("hybrid trigger keyboard navigation still works", async ({
    mount,
    page,
  }) => {
    await mount(<HybridSelectControlled />);

    // Tab to focus the trigger, then Enter to open
    const trigger = page.getByRole("combobox");
    await trigger.focus();
    await trigger.press("Enter");

    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();

    // Navigate and select with keyboard - select Staging explicitly
    await page.getByRole("option", { name: "Staging" }).focus();
    await page.keyboard.press("Enter");

    // Verify selection changed
    await expect(page.getByTestId("selected-env")).toHaveText("staging");
  });

  test("hybrid trigger selects an option via icon click", async ({
    mount,
    page,
  }) => {
    await mount(<HybridSelectControlled />);

    // Click on the icon to open
    const icon = page.getByTestId("hybrid-icon");
    await icon.click();

    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();

    // Select Staging
    await page.getByRole("option", { name: "Staging" }).click();

    // Verify selection
    await expect(page.getByTestId("selected-env")).toHaveText("staging");
  });
});
