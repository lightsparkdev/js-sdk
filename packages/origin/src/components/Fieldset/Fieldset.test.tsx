import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicFieldset,
  FieldsetWithDescription,
  HorizontalFieldset,
  NoLegendFieldset,
  HiddenLegendFieldset,
  ErrorFieldset,
  HorizontalErrorFieldset,
  DisabledFieldset,
} from "./Fieldset.test-stories";

test.describe("Fieldset", () => {
  test("renders legend and children", async ({ mount }) => {
    const component = await mount(<BasicFieldset />);

    await expect(component.getByText("Personal Information")).toBeVisible();
    await expect(component.getByPlaceholder("Enter first name")).toBeVisible();
    await expect(component.getByPlaceholder("Enter last name")).toBeVisible();
  });

  test("renders fields with descriptions", async ({ mount }) => {
    const component = await mount(<FieldsetWithDescription />);

    await expect(component.getByText("Contact Details")).toBeVisible();
    await expect(
      component.getByText("We'll use this to contact you."),
    ).toBeVisible();
    await expect(component.getByText("Optional phone number.")).toBeVisible();
  });

  test("horizontal orientation renders fields in a row", async ({ mount }) => {
    const component = await mount(<HorizontalFieldset />);

    await expect(component.getByText("Address")).toBeVisible();
    await expect(component.getByPlaceholder("Enter city")).toBeVisible();
    await expect(component.getByPlaceholder("Enter state")).toBeVisible();
    await expect(component.getByPlaceholder("Enter zip")).toBeVisible();

    const fieldsWrapper = component.locator('[data-orientation="horizontal"]');
    await expect(fieldsWrapper).toHaveCSS("flex-direction", "row");
  });

  test("vertical orientation renders fields in a column", async ({ mount }) => {
    const component = await mount(<BasicFieldset />);

    const fieldsWrapper = component.locator('[data-orientation="vertical"]');
    await expect(fieldsWrapper).toHaveCSS("flex-direction", "column");
  });

  test("renders without a legend", async ({ mount }) => {
    const component = await mount(<NoLegendFieldset />);

    await expect(component.getByPlaceholder("Enter minimum")).toBeVisible();
    await expect(component.getByPlaceholder("Enter maximum")).toBeVisible();

    const fieldsWrapper = component.locator('[data-orientation="vertical"]');
    await expect(fieldsWrapper).toHaveCSS("flex-direction", "column");
  });

  test("visually hides legend while keeping it accessible", async ({
    mount,
  }) => {
    const component = await mount(<HiddenLegendFieldset />);

    // Legend is in the DOM and visually hidden via clip + 1px sizing
    const legend = component.getByText("Transaction limits");
    await expect(legend).toBeAttached();
    await expect(legend).toHaveCSS("position", "absolute");
    await expect(legend).toHaveCSS("width", "1px");
    await expect(legend).toHaveCSS("height", "1px");
    await expect(legend).toHaveCSS("overflow", "hidden");

    // Fields still render correctly
    await expect(component.getByPlaceholder("1.00")).toBeVisible();
    await expect(component.getByPlaceholder("10,000.00")).toBeVisible();
  });

  test("renders group error message", async ({ mount }) => {
    const component = await mount(<ErrorFieldset />);

    const error = component.getByText("Minimum must be less than maximum");
    await expect(error).toBeVisible();

    // Error uses critical color token
    await expect(error).toHaveCSS("color", "rgb(204, 9, 9)"); // --text-critical: #CC0909

    // Fields still render
    await expect(component.getByPlaceholder("1.00")).toBeVisible();
    await expect(component.getByPlaceholder("10,000.00")).toBeVisible();
  });

  test("renders group error in horizontal orientation", async ({ mount }) => {
    const component = await mount(<HorizontalErrorFieldset />);

    const error = component.getByText("Minimum must be less than maximum");
    await expect(error).toBeVisible();

    // Fields are still horizontal
    const fieldsWrapper = component.locator('[data-orientation="horizontal"]');
    await expect(fieldsWrapper).toHaveCSS("flex-direction", "row");

    // Error is below the fields, not inside the row
    await expect(component.getByPlaceholder("1.00")).toBeVisible();
    await expect(component.getByPlaceholder("10,000.00")).toBeVisible();
  });

  test("disables all children when disabled", async ({ mount }) => {
    const component = await mount(<DisabledFieldset />);

    await expect(component.getByPlaceholder("Disabled input")).toBeDisabled();
    await expect(component.getByPlaceholder("Also disabled")).toBeDisabled();
  });
});
