import { test, expect } from "@playwright/experimental-ct-react";
import {
  TestRadioDefault,
  TestRadioControlled,
  TestRadioDisabled,
  TestRadioDisabledItem,
  TestRadioCard,
  TestRadioCritical,
} from "./Radio.test-stories";

test.describe("Radio", () => {
  test.describe("default behavior", () => {
    test("renders radio group with options", async ({ mount, page }) => {
      await mount(<TestRadioDefault />);

      await expect(page.getByTestId("option1")).toBeVisible();
      await expect(page.getByTestId("option2")).toBeVisible();
      await expect(page.getByTestId("option3")).toBeVisible();
    });

    test("renders legend", async ({ mount, page }) => {
      await mount(<TestRadioDefault />);

      await expect(page.getByTestId("legend")).toHaveText("Select an option");
    });

    test("renders description", async ({ mount, page }) => {
      await mount(<TestRadioDefault />);

      await expect(page.getByTestId("description")).toHaveText("Help text");
    });

    test("first option is selected by default", async ({ mount, page }) => {
      await mount(<TestRadioDefault />);

      const option1 = page.getByTestId("option1");
      await expect(option1).toHaveAttribute("data-checked", "");
    });

    test("clicking another option changes selection", async ({
      mount,
      page,
    }) => {
      await mount(<TestRadioDefault />);

      const option2 = page.getByTestId("option2");
      await option2.click();

      await expect(option2).toHaveAttribute("data-checked", "");
      await expect(page.getByTestId("option1")).not.toHaveAttribute(
        "data-checked",
        "",
      );
    });

    test("supports keyboard navigation with arrow keys", async ({
      mount,
      page,
    }) => {
      await mount(<TestRadioDefault />);

      const option1 = page.getByTestId("option1");
      await option1.focus();
      await page.keyboard.press("ArrowDown");

      const option2 = page.getByTestId("option2");
      await expect(option2).toBeFocused();
    });
  });

  test.describe("controlled mode", () => {
    test("updates value when option clicked", async ({ mount, page }) => {
      await mount(<TestRadioControlled />);

      const status = page.getByTestId("status");
      await expect(status).toHaveText("option1");

      await page.getByTestId("option2").click();
      await expect(status).toHaveText("option2");
    });
  });

  test.describe("disabled state", () => {
    test("group disabled prevents all interactions", async ({
      mount,
      page,
    }) => {
      await mount(<TestRadioDisabled />);

      const option1 = page.getByTestId("option1");
      const option2 = page.getByTestId("option2");

      await expect(option1).toHaveAttribute("data-disabled", "");
      await expect(option2).toHaveAttribute("data-disabled", "");

      // Option 1 should remain checked even after clicking option 2
      await option2.click({ force: true });
      await expect(option1).toHaveAttribute("data-checked", "");
    });

    test("individual item disabled", async ({ mount, page }) => {
      await mount(<TestRadioDisabledItem />);

      const option2 = page.getByTestId("option2");
      await expect(option2).toHaveAttribute("data-disabled", "");

      // Should not be able to select disabled item
      await option2.click({ force: true });
      await expect(page.getByTestId("option1")).toHaveAttribute(
        "data-checked",
        "",
      );
    });
  });

  test.describe("card variant", () => {
    test("renders with card styling", async ({ mount, page }) => {
      await mount(<TestRadioCard />);

      const card1 = page.getByTestId("card1");
      await expect(card1).toBeVisible();
      await expect(page.getByText("Description").first()).toBeVisible();
    });

    test("card selection changes", async ({ mount, page }) => {
      await mount(<TestRadioCard />);

      const card2 = page.getByTestId("card2");
      await card2.click();

      await expect(card2).toHaveAttribute("data-checked", "");
    });
  });

  test.describe("critical state", () => {
    test("renders error message", async ({ mount, page }) => {
      await mount(<TestRadioCritical />);

      const errorMessage = page.getByTestId("error");
      await expect(errorMessage).toHaveText("This field is required");
    });

    test("field has invalid attribute", async ({ mount, page }) => {
      await mount(<TestRadioCritical />);

      const field = page.getByTestId("radio-field");
      // Field.Root sets aria-invalid when invalid prop is true
      await expect(field).toHaveAttribute("data-invalid", "");
    });
  });
});
