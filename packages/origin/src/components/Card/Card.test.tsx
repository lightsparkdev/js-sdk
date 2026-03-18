import { test, expect } from "@playwright/experimental-ct-react";
import {
  StructuredCard,
  StructuredCardWithBackButton,
  SimpleCard,
  CardTitleOnly,
  CardCustomClassName,
  CardWithMultipleFooterButtons,
  CardWithFullwidthBody,
} from "./Card.test-stories";

test.describe("Card", () => {
  test.describe("structured variant", () => {
    test("renders with header, body, and footer", async ({ mount, page }) => {
      await mount(<StructuredCard />);
      const card = page.getByTestId("card");
      await expect(card).toBeVisible();
      await expect(page.getByText("Card title")).toBeVisible();
      await expect(page.getByText("Subtitle goes here.")).toBeVisible();
      await expect(
        page.getByText("Slot components in to the body"),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Button" })).toBeVisible();
    });

    test("renders back button and handles click", async ({ mount, page }) => {
      await mount(<StructuredCardWithBackButton />);
      const backButton = page.getByTestId("back-button");
      await expect(backButton).toBeVisible();
      await backButton.click();
      await expect(page.getByTestId("back-clicked")).toBeVisible();
    });

    test("renders multiple footer buttons", async ({ mount, page }) => {
      await mount(<CardWithMultipleFooterButtons />);
      await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Confirm" })).toBeVisible();
    });

    test("renders fullwidth body", async ({ mount, page }) => {
      await mount(<CardWithFullwidthBody />);
      await expect(page.getByText("Fullwidth body")).toBeVisible();
      await expect(page.getByText("Edge-to-edge content")).toBeVisible();
    });
  });

  test.describe("simple variant", () => {
    test("renders with flat layout", async ({ mount, page }) => {
      await mount(<SimpleCard />);
      const card = page.getByTestId("card");
      await expect(card).toBeVisible();
      await expect(page.getByText("Card title")).toBeVisible();
      await expect(page.getByText("Subtitle goes here.")).toBeVisible();
      await expect(page.getByRole("button", { name: "Button" })).toBeVisible();
    });

    test("renders without subtitle", async ({ mount, page }) => {
      await mount(<CardTitleOnly />);
      await expect(page.getByText("Title only card")).toBeVisible();
      await expect(page.getByText("No subtitle in this card.")).toBeVisible();
    });
  });

  test.describe("custom styling", () => {
    test("applies custom className to parts", async ({ mount, page }) => {
      await mount(<CardCustomClassName />);
      const card = page.locator(".custom-card-class");
      await expect(card).toBeVisible();
      await expect(page.locator(".custom-title-class")).toBeVisible();
      await expect(page.locator(".custom-body-class")).toBeVisible();
    });
  });
});
