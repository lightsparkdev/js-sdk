import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultSeparator,
  HairlineSeparator,
  VerticalSeparator,
  VerticalHairlineSeparator,
  CustomClassSeparator,
  InNavigation,
} from "./Separator.test-stories";

test.describe("Separator", () => {
  test.describe("default behavior", () => {
    test("renders horizontal separator by default", async ({ mount, page }) => {
      await mount(<DefaultSeparator />);
      const separator = page.getByRole("separator");
      await expect(separator).toBeVisible();
      await expect(separator).toHaveAttribute("aria-orientation", "horizontal");
    });

    test("renders with default 1px stroke", async ({ mount, page }) => {
      await mount(<DefaultSeparator />);
      const separator = page.getByRole("separator");
      await expect(separator).toBeVisible();
    });
  });

  test.describe("variants", () => {
    test("renders hairline variant", async ({ mount, page }) => {
      await mount(<HairlineSeparator />);
      const separator = page.getByRole("separator");
      await expect(separator).toBeVisible();
    });

    test("renders vertical orientation", async ({ mount, page }) => {
      await mount(<VerticalSeparator />);
      const separator = page.getByRole("separator");
      await expect(separator).toBeVisible();
      await expect(separator).toHaveAttribute("aria-orientation", "vertical");
    });

    test("renders vertical hairline", async ({ mount, page }) => {
      await mount(<VerticalHairlineSeparator />);
      const separator = page.getByRole("separator");
      await expect(separator).toBeVisible();
      await expect(separator).toHaveAttribute("aria-orientation", "vertical");
    });
  });

  test.describe("accessibility", () => {
    test("has separator role", async ({ mount, page }) => {
      await mount(<DefaultSeparator />);
      const separator = page.getByRole("separator");
      await expect(separator).toBeVisible();
    });

    test("vertical separator has correct aria-orientation", async ({
      mount,
      page,
    }) => {
      await mount(<VerticalSeparator />);
      const separator = page.getByRole("separator");
      await expect(separator).toHaveAttribute("aria-orientation", "vertical");
    });
  });

  test.describe("custom class", () => {
    test("applies custom className", async ({ mount, page }) => {
      await mount(<CustomClassSeparator />);
      const separator = page.locator(".custom-class");
      await expect(separator).toBeVisible();
    });
  });

  test.describe("usage patterns", () => {
    test("works in navigation context", async ({ mount, page }) => {
      await mount(<InNavigation />);
      const separator = page.getByRole("separator");
      await expect(separator).toBeVisible();
      // Verify navigation links are present
      await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
    });
  });
});
