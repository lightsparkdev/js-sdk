import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultField,
  FieldWithError,
  DisabledField,
  FieldWithoutLabel,
  FieldWithoutDescription,
  ControlledField,
  FieldWithValidation,
  FieldWithName,
  FieldWithRenderedRoot,
  FieldWithStatefulRootClassName,
} from "./Field.test-stories";

test.describe("Field", () => {
  test.describe("default behavior", () => {
    test("renders label, input, and description", async ({ mount, page }) => {
      await mount(<DefaultField />);

      const label = page.getByText("Email", { exact: true });
      const input = page.getByPlaceholder("Enter your email");
      const description = page.getByText("We'll never share your email.");

      await expect(label).toBeVisible();
      await expect(input).toBeVisible();
      await expect(description).toBeVisible();
    });

    test("label is associated with input via aria", async ({ mount, page }) => {
      await mount(<DefaultField />);

      const input = page.getByPlaceholder("Enter your email");
      const labelledBy = await input.getAttribute("aria-labelledby");

      expect(labelledBy).toBeTruthy();
    });

    test("description is associated with input via aria", async ({
      mount,
      page,
    }) => {
      await mount(<DefaultField />);

      const input = page.getByPlaceholder("Enter your email");
      const describedBy = await input.getAttribute("aria-describedby");

      expect(describedBy).toBeTruthy();
    });
  });

  test.describe("invalid state", () => {
    test("renders error message when invalid", async ({ mount, page }) => {
      await mount(<FieldWithError />);

      const error = page.getByText("Please enter a valid email address.");
      await expect(error).toBeVisible();
    });

    test("input has data-invalid attribute when invalid", async ({
      mount,
      page,
    }) => {
      await mount(<FieldWithError />);

      const input = page.getByPlaceholder("Enter your email");
      await expect(input).toHaveAttribute("data-invalid", "");
    });

    test("field root has data-invalid attribute when invalid", async ({
      mount,
      page,
    }) => {
      await mount(<FieldWithError />);

      const field = page.locator("[data-invalid]").first();
      await expect(field).toBeVisible();
    });
  });

  test.describe("disabled state", () => {
    test("disabled field has disabled input", async ({ mount, page }) => {
      await mount(<DisabledField />);

      const input = page.getByPlaceholder("Enter your email");
      await expect(input).toBeDisabled();
    });

    test("disabled field has data-disabled attribute", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledField />);

      const input = page.getByPlaceholder("Enter your email");
      await expect(input).toHaveAttribute("data-disabled", "");
    });
  });

  test.describe("optional parts", () => {
    test("renders without label", async ({ mount, page }) => {
      await mount(<FieldWithoutLabel />);

      const input = page.getByPlaceholder("No label field");
      const description = page.getByText("A field without a label.");

      await expect(input).toBeVisible();
      await expect(description).toBeVisible();
    });

    test("renders without description", async ({ mount, page }) => {
      await mount(<FieldWithoutDescription />);

      const label = page.getByText("Password", { exact: true });
      const input = page.getByPlaceholder("Enter password");

      await expect(label).toBeVisible();
      await expect(input).toBeVisible();
    });
  });

  test.describe("controlled mode", () => {
    test("controlled field reflects external state", async ({
      mount,
      page,
    }) => {
      await mount(<ControlledField />);

      const input = page.getByPlaceholder("Type here");
      const value = page.locator('[data-testid="field-value"]');

      await expect(value).toHaveText("");
      await input.fill("John Doe");
      await expect(value).toHaveText("John Doe");
    });
  });

  test.describe("validation", () => {
    test("validation state updates based on input", async ({ mount, page }) => {
      await mount(<FieldWithValidation />);

      const input = page.getByPlaceholder("Enter email");
      const state = page.locator('[data-testid="validation-state"]');

      await expect(state).toHaveText("valid");

      await input.fill("invalid");
      await expect(state).toHaveText("invalid");

      await input.fill("valid@email.com");
      await expect(state).toHaveText("valid");
    });

    test("error message appears when invalid", async ({ mount, page }) => {
      await mount(<FieldWithValidation />);

      const input = page.getByPlaceholder("Enter email");
      await input.fill("invalid");

      const error = page.getByText("Email must contain @");
      await expect(error).toBeVisible();
    });

    test("description appears when valid", async ({ mount, page }) => {
      await mount(<FieldWithValidation />);

      const description = page.getByText("Enter a valid email.");
      await expect(description).toBeVisible();
    });
  });

  test.describe("keyboard navigation", () => {
    test("Tab focuses the input", async ({ mount, page }) => {
      await mount(<DefaultField />);

      const input = page.getByPlaceholder("Enter your email");
      await page.keyboard.press("Tab");
      await expect(input).toBeFocused();
    });

    test("disabled field input is not focusable via Tab", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledField />);

      const input = page.getByPlaceholder("Enter your email");
      await page.keyboard.press("Tab");
      await expect(input).not.toBeFocused();
    });
  });

  test.describe("form integration", () => {
    test("field with name attribute", async ({ mount, page }) => {
      await mount(<FieldWithName />);

      const input = page.getByPlaceholder("Enter your email");
      await expect(input).toBeVisible();
    });
  });

  test.describe("render prop", () => {
    test("renders a custom root while preserving Origin and consumer classes", async ({
      mount,
      page,
    }) => {
      await mount(<FieldWithRenderedRoot />);

      const root = page.getByTestId("rendered-field-root");
      await expect(root).toBeVisible();
      await expect(root).toHaveJSProperty("tagName", "SECTION");
      await expect(root).toHaveAttribute("data-custom-root", "");
      await expect(root).toHaveAttribute("data-invalid", "");
      await expect(root).toHaveCSS("display", "flex");
      await expect(root).toHaveCSS("flex-direction", "column");
      await expect(root).toHaveClass(/consumer-field-root/);
      await expect(root).toHaveClass(/rendered-field-root/);
    });

    test("supports stateful root class names with a rendered root class", async ({
      mount,
      page,
    }) => {
      await mount(<FieldWithStatefulRootClassName />);

      const root = page.getByTestId("stateful-class-field-root");
      await expect(root).toBeVisible();
      await expect(root).toHaveJSProperty("tagName", "SECTION");
      await expect(root).toHaveAttribute("data-custom-root", "");
      await expect(root).toHaveAttribute("data-invalid", "");
      await expect(root).toHaveCSS("display", "flex");
      await expect(root).toHaveCSS("flex-direction", "column");
      await expect(root).toHaveClass(/consumer-field-root-invalid/);
      await expect(root).toHaveClass(/rendered-stateful-field-root/);
      await expect(root).not.toHaveClass(/consumer-field-root-valid/);
    });
  });
});
