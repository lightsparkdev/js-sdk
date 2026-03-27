import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicForm,
  FormWithMultipleFields,
  FormWithServerErrors,
} from "./Form.test-stories";

test.describe("Form", () => {
  test("renders field and button children", async ({ mount }) => {
    const component = await mount(<BasicForm />);

    await expect(component.getByPlaceholder("Enter email")).toBeVisible();
    await expect(
      component.getByRole("button", { name: "Submit" }),
    ).toBeVisible();
  });

  test("renders multiple fields", async ({ mount }) => {
    const component = await mount(<FormWithMultipleFields />);

    await expect(component.getByPlaceholder("First name")).toBeVisible();
    await expect(component.getByPlaceholder("Last name")).toBeVisible();
    await expect(component.getByPlaceholder("Email")).toBeVisible();
    await expect(
      component.getByRole("button", { name: "Submit" }),
    ).toBeVisible();
  });

  test("displays server-side errors", async ({ mount }) => {
    const component = await mount(<FormWithServerErrors />);

    await expect(
      component.getByText("This email is already registered"),
    ).toBeVisible();
  });
});
