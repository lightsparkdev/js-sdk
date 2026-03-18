import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultBadge,
  PurpleBadge,
  SkyBadge,
  VibrantBadge,
  AllVariantsBadge,
  VibrantVariantsBadge,
  CustomClassBadge,
} from "./Badge.test-stories";

test.describe("Badge", () => {
  test.describe("default behavior", () => {
    test("renders with label", async ({ mount, page }) => {
      await mount(<DefaultBadge />);
      const badge = page.locator("span").first();
      await expect(badge).toBeVisible();
      await expect(badge).toContainText("Test Label");
    });

    test("defaults to gray variant", async ({ mount, page }) => {
      await mount(<DefaultBadge />);
      const badge = page.locator("span").first();
      await expect(badge).toBeVisible();
    });
  });

  test.describe("variants", () => {
    test("renders purple variant", async ({ mount, page }) => {
      await mount(<PurpleBadge />);
      const badge = page.locator("span").first();
      await expect(badge).toBeVisible();
      await expect(badge).toContainText("Purple");
    });

    test("renders sky variant", async ({ mount, page }) => {
      await mount(<SkyBadge />);
      const badge = page.locator("span").first();
      await expect(badge).toBeVisible();
      await expect(badge).toContainText("Sky");
    });

    test("renders all color variants", async ({ mount, page }) => {
      await mount(<AllVariantsBadge />);
      await expect(page.getByText("Gray")).toBeVisible();
      await expect(page.getByText("Purple")).toBeVisible();
      await expect(page.getByText("Blue")).toBeVisible();
      await expect(page.getByText("Sky")).toBeVisible();
      await expect(page.getByText("Pink")).toBeVisible();
      await expect(page.getByText("Green")).toBeVisible();
      await expect(page.getByText("Yellow")).toBeVisible();
      await expect(page.getByText("Red")).toBeVisible();
    });
  });

  test.describe("vibrant style", () => {
    test("renders vibrant variant", async ({ mount, page }) => {
      await mount(<VibrantBadge />);
      const badge = page.locator("span").first();
      await expect(badge).toBeVisible();
      await expect(badge).toContainText("Vibrant");
    });

    test("renders all vibrant variants", async ({ mount, page }) => {
      await mount(<VibrantVariantsBadge />);
      await expect(page.getByText("Gray")).toBeVisible();
      await expect(page.getByText("Purple")).toBeVisible();
      await expect(page.getByText("Blue")).toBeVisible();
      await expect(page.getByText("Sky")).toBeVisible();
      await expect(page.getByText("Pink")).toBeVisible();
      await expect(page.getByText("Green")).toBeVisible();
      await expect(page.getByText("Yellow")).toBeVisible();
      await expect(page.getByText("Red")).toBeVisible();
    });
  });

  test.describe("custom class", () => {
    test("applies custom className", async ({ mount, page }) => {
      await mount(<CustomClassBadge />);
      const badge = page.locator("span.custom-class").first();
      await expect(badge).toBeVisible();
    });
  });
});
