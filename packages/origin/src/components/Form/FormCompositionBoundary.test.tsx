import { test, expect } from "@playwright/experimental-ct-react";
import {
  CompositeFormErrorsBoundary,
  FieldRootRenderFormBoundary,
  KybOriginFormCompositionBoundary,
} from "./FormCompositionBoundary.test-stories";

test.describe("Origin form composition boundaries", () => {
  test("connects Form errors, Field names, external invalid state, controlled Input, and invalid focus", async ({
    mount,
    page,
  }) => {
    await mount(<KybOriginFormCompositionBoundary />);

    await page.getByRole("button", { name: "Review" }).click();
    await expect(page.getByText("Enter a legal business name")).toBeVisible();
    await expect(
      page.getByPlaceholder("Enter legal business name"),
    ).toBeFocused();

    const legalName = page.getByPlaceholder("Enter legal business name");
    await legalName.fill("Acme Treasury LLC");
    await expect(page.getByTestId("legal-name-value")).toHaveText(
      "Acme Treasury LLC",
    );

    await page.getByRole("button", { name: "Review" }).click();
    await expect(page.getByText("Select a registration country")).toBeVisible();
    await expect(page.getByText("Enter a business purpose")).toBeVisible();
    await expect(page.getByPlaceholder("Search countries")).toBeFocused();
    await expect(page.getByPlaceholder("Search countries")).toHaveAttribute(
      "data-invalid",
      "",
    );

    const purpose = page.getByPlaceholder("Describe business purpose");
    await purpose.fill("Treasury operations");
    await expect(page.getByText("Enter a business purpose")).not.toBeVisible();
  });

  test("maps product-style Select options to a controlled string value", async ({
    mount,
    page,
  }) => {
    await mount(<KybOriginFormCompositionBoundary />);

    await page.getByTestId("entity-type-trigger").click();
    await page
      .getByRole("option", { name: "Limited liability company" })
      .click();

    await expect(page.getByTestId("entity-type-value")).toHaveText("llc");
    await expect(page.getByTestId("entity-type-trigger")).toContainText(
      "Limited liability company",
    );
  });

  test("maps searchable Combobox objects to product string state with controlled input, popup, and portal state", async ({
    mount,
    page,
  }) => {
    await mount(<KybOriginFormCompositionBoundary />);

    const countryInput = page.getByPlaceholder("Search countries");
    await countryInput.click();
    await expect(page.getByTestId("country-open-state")).toHaveText("open");
    await expect(
      page.getByTestId("country-portal").getByRole("listbox"),
    ).toBeVisible();

    await countryInput.fill("Can");
    await expect(page.getByTestId("country-search-value")).toHaveText("Can");

    await page.getByRole("option", { name: "Canada" }).click();

    await expect(page.getByTestId("country-value")).toHaveText("CA");
    await expect(countryInput).toHaveValue("Canada");
    await expect(page.getByTestId("country-open-state")).toHaveText("closed");
  });

  test("supports Combobox multi-select chips with accessible chip removal", async ({
    mount,
    page,
  }) => {
    await mount(<KybOriginFormCompositionBoundary />);

    const rolesInput = page.getByPlaceholder("Add owner roles");
    await rolesInput.click();
    await page.getByRole("option", { name: "Control person" }).click();
    await page.getByRole("option", { name: "Signer" }).click();

    await expect(page.getByTestId("combobox-roles-value")).toHaveText(
      "control-person,signer",
    );
    await expect(
      page.getByRole("toolbar").getByText("Control person"),
    ).toBeVisible();
    await expect(page.getByRole("toolbar").getByText("Signer")).toBeVisible();

    await page.getByRole("button", { name: "Remove Signer" }).click();

    await expect(page.getByTestId("combobox-roles-value")).toHaveText(
      "control-person",
    );
  });

  test("supports Checkbox.Group owner-role-style controlled multi selection", async ({
    mount,
    page,
  }) => {
    await mount(<KybOriginFormCompositionBoundary />);

    await expect(page.getByTestId("checkbox-roles-value")).toHaveText(
      "control-person",
    );

    await page.getByTestId("checkbox-role-signer").click();

    await expect(page.getByTestId("checkbox-roles-value")).toHaveText(
      "control-person,signer",
    );
  });

  test("supports Field.Root render with merged classes and Form invalid state", async ({
    mount,
    page,
  }) => {
    await mount(<FieldRootRenderFormBoundary />);

    const root = page.getByTestId("form-rendered-field-root");
    await expect(root).toBeVisible();
    await expect(root).toHaveJSProperty("tagName", "SECTION");
    await expect(root).toHaveAttribute("data-custom-root", "");
    await expect(root).toHaveAttribute("data-invalid", "");
    await expect(root).toHaveCSS("display", "flex");
    await expect(root).toHaveCSS("flex-direction", "column");
    await expect(root).toHaveClass(/consumer-form-field-root/);
    await expect(root).toHaveClass(/rendered-form-field-root/);
    await expect(
      page.getByPlaceholder("Enter registered business name"),
    ).toHaveAttribute("data-invalid", "");
    await expect(
      page.getByText("Enter a registered business name"),
    ).toBeVisible();
  });

  test("propagates Form errors to composite Select and Combobox fields without explicit invalid props", async ({
    mount,
    page,
  }) => {
    await mount(<CompositeFormErrorsBoundary />);

    await expect(page.getByText("Select a country")).toBeVisible();
    await expect(page.getByText("Select a business type")).toBeVisible();

    await expect(page.getByTestId("country-trigger")).toHaveAttribute(
      "data-invalid",
      "",
    );
    await expect(page.getByTestId("business-type-wrapper")).toHaveAttribute(
      "data-invalid",
      "",
    );
    await expect(
      page.getByPlaceholder("Search business types"),
    ).toHaveAttribute("data-invalid", "");
  });
});
