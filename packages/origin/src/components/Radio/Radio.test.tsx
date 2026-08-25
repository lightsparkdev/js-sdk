import { test, expect } from "@playwright/experimental-ct-react";
import {
  TestRadioDefault,
  TestRadioControlled,
  TestRadioDisabled,
  TestRadioDisabledItem,
  TestRadioCard,
  TestRadioCritical,
  TestRadioInDrawer,
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

    test("legend keeps the choice-legend text style over Field.Label's default", async ({
      mount,
      page,
    }) => {
      await mount(<TestRadioDefault />);

      // Radio.Legend layers .legend over Field.Label's single-class default
      // and must win by source order; if Field's default label style ever
      // gains specificity, the legend regresses to 12px/16px.
      const legend = page.getByTestId("legend");
      await expect(legend).toHaveCSS("font-size", "14px");
      await expect(legend).toHaveCSS("line-height", "20px");
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

  test.describe("field composition styles", () => {
    test("item labels use regular weight", async ({ mount, page }) => {
      await mount(<TestRadioDefault />);

      await expect(page.getByText("Option 1")).toHaveCSS("font-weight", "400");
    });

    test("group carries the legend text inset", async ({ mount, page }) => {
      await mount(<TestRadioDefault />);

      const group = page.getByTestId("radio-group");
      await expect(group).toHaveCSS("padding-left", "4px");
      await expect(group).toHaveCSS("padding-right", "4px");
    });

    test("card group keeps the full field width", async ({ mount, page }) => {
      await mount(<TestRadioCard />);

      const group = page.getByTestId("radio-group");
      await expect(group).toHaveCSS("padding-left", "0px");
      await expect(group).toHaveCSS("padding-right", "0px");
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

  // A drawer's swipe-to-dismiss gesture captures the pointer, which drops the
  // click before it reaches a span-rooted control (data-base-ui-swipe-ignore).
  test("selects inside a drawer", async ({ mount, page }) => {
    await mount(<TestRadioInDrawer />);

    await page.getByRole("radio", { name: "Option 2" }).click();

    await expect(page.getByTestId("selected-value")).toHaveText("opt2");
  });
});
