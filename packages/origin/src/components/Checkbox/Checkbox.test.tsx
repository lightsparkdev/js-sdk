import { test, expect } from "@playwright/experimental-ct-react";
import {
  TestCheckboxDefault,
  TestCheckboxCard,
  TestCheckboxDisabled,
  TestCheckboxControlled,
  TestCheckboxIndeterminate,
  TestCheckboxCritical,
  TestCheckboxKeyboard,
  TestCheckboxReadOnly,
  TestCheckboxRequired,
  TestCheckboxName,
} from "./Checkbox.test-stories";

test.describe("Checkbox", () => {
  test("renders default variant with checked state", async ({
    mount,
    page,
  }) => {
    await mount(<TestCheckboxDefault />);

    const legend = page.getByText("Legend");
    const option1 = page.getByText("Option 1").first();
    const option2 = page.getByText("Option 2").first();
    const description = page.getByText("Help text goes here.");

    await expect(legend).toBeVisible();
    await expect(option1).toBeVisible();
    await expect(option2).toBeVisible();
    await expect(description).toBeVisible();

    const checkboxes = page.getByRole("checkbox");
    await expect(checkboxes.first()).toBeChecked();
    await expect(checkboxes.nth(1)).not.toBeChecked();
  });

  test("renders card variant", async ({ mount, page }) => {
    await mount(<TestCheckboxCard />);

    const checkboxes = page.getByRole("checkbox");
    await expect(checkboxes.first()).toBeVisible();
    await expect(checkboxes.first()).toBeChecked();
  });

  test("renders disabled state", async ({ mount, page }) => {
    await mount(<TestCheckboxDisabled />);

    const checkbox = page.getByRole("checkbox", { name: /Disabled Option/ });
    await expect(checkbox).toBeDisabled();
  });

  test("supports controlled mode", async ({ mount, page }) => {
    await mount(<TestCheckboxControlled />);

    const option1 = page.getByRole("checkbox", { name: /Option 1/ });
    const option2 = page.getByRole("checkbox", { name: /Option 2/ });
    const selectedValues = page.getByTestId("selected-values");

    await expect(option1).toBeChecked();
    await expect(option2).not.toBeChecked();
    await expect(selectedValues).toHaveText("option1");

    await option2.click();
    await expect(option2).toBeChecked();
    await expect(selectedValues).toHaveText("option1,option2");

    await option1.click();
    await expect(option1).not.toBeChecked();
    await expect(selectedValues).toHaveText("option2");
  });

  test("supports indeterminate state with parent checkbox", async ({
    mount,
    page,
  }) => {
    await mount(<TestCheckboxIndeterminate />);

    const parent = page.getByTestId("parent-checkbox");
    const checkboxes = page.getByRole("checkbox");
    const child1 = checkboxes.nth(1);
    const child2 = checkboxes.nth(2);
    const child3 = checkboxes.nth(3);

    await expect(parent).toHaveAttribute("data-indeterminate", "");
    await expect(child1).toBeChecked();
    await expect(child2).not.toBeChecked();
    await expect(child3).not.toBeChecked();

    await parent.click();
    await expect(parent).toBeChecked();
    await expect(child1).toBeChecked();
    await expect(child2).toBeChecked();
    await expect(child3).toBeChecked();

    await parent.click();
    await expect(parent).not.toBeChecked();
    await expect(child1).not.toBeChecked();
    await expect(child2).not.toBeChecked();
    await expect(child3).not.toBeChecked();
  });

  test("renders error state", async ({ mount, page }) => {
    await mount(<TestCheckboxCritical />);

    const error = page.getByText("Error text goes here.");
    await expect(error).toBeVisible();
  });

  test("supports keyboard navigation", async ({ mount, page }) => {
    await mount(<TestCheckboxKeyboard />);

    const checkbox1 = page.getByTestId("checkbox-1");
    const checkbox2 = page.getByTestId("checkbox-2");

    await checkbox1.focus();
    await expect(checkbox1).toBeFocused();
    await expect(checkbox1).not.toBeChecked();

    await page.keyboard.press("Space");
    await expect(checkbox1).toBeChecked();

    await page.keyboard.press("Tab");
    await expect(checkbox2).toBeFocused();

    await page.keyboard.press("Space");
    await expect(checkbox2).toBeChecked();
  });

  test("renders readOnly state", async ({ mount, page }) => {
    await mount(<TestCheckboxReadOnly />);

    const checkedReadOnly = page.getByRole("checkbox", {
      name: "Read Only Checked",
    });
    const uncheckedReadOnly = page.getByRole("checkbox", {
      name: "Read Only Unchecked",
    });

    await expect(checkedReadOnly).toBeChecked();
    await expect(uncheckedReadOnly).not.toBeChecked();

    await checkedReadOnly.click();
    await expect(checkedReadOnly).toBeChecked();

    await uncheckedReadOnly.click();
    await expect(uncheckedReadOnly).not.toBeChecked();
  });

  test("renders required state", async ({ mount, page }) => {
    await mount(<TestCheckboxRequired />);

    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).toHaveAttribute("data-required", "");
  });

  test("renders with name attribute", async ({ mount, page }) => {
    await mount(<TestCheckboxName />);

    const checkbox = page.getByRole("checkbox", { name: "With Name" });
    await expect(checkbox).toBeChecked();
  });
});
