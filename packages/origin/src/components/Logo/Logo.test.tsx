import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultLogo,
  LogoRegular,
  LogoLight,
  LogomarkRegular,
  LogomarkLight,
  WordmarkRegular,
  AllVariants,
  CustomHeight,
  CustomClassName,
} from "./Logo.test-stories";

test.describe("Logo", () => {
  test.describe("default behavior", () => {
    test("renders with default variant (logo, regular)", async ({
      mount,
      page,
    }) => {
      await mount(<DefaultLogo />);
      const logo = page.getByRole("img", { name: "Lightspark" });
      await expect(logo).toBeVisible();
    });

    test("has accessible label", async ({ mount, page }) => {
      await mount(<DefaultLogo />);
      const logo = page.getByRole("img", { name: "Lightspark" });
      await expect(logo).toHaveAttribute("aria-label", "Lightspark");
    });
  });

  test.describe("logo variants", () => {
    test("renders logo regular", async ({ mount, page }) => {
      await mount(<LogoRegular />);
      const logo = page.getByRole("img", { name: "Lightspark" });
      await expect(logo).toBeVisible();
    });

    test("renders logo light", async ({ mount, page }) => {
      await mount(<LogoLight />);
      const logo = page.getByRole("img", { name: "Lightspark" });
      await expect(logo).toBeVisible();
    });
  });

  test.describe("logomark variants", () => {
    test("renders logomark regular", async ({ mount, page }) => {
      await mount(<LogomarkRegular />);
      const logo = page.getByRole("img", { name: "Lightspark" });
      await expect(logo).toBeVisible();
    });

    test("renders logomark light", async ({ mount, page }) => {
      await mount(<LogomarkLight />);
      const logo = page.getByRole("img", { name: "Lightspark" });
      await expect(logo).toBeVisible();
    });
  });

  test.describe("wordmark variant", () => {
    test("renders wordmark", async ({ mount, page }) => {
      await mount(<WordmarkRegular />);
      const logo = page.getByRole("img", { name: "Lightspark" });
      await expect(logo).toBeVisible();
    });
  });

  test.describe("all variants", () => {
    test("renders all variants", async ({ mount, page }) => {
      await mount(<AllVariants />);
      await expect(
        page.getByRole("img", { name: "Lightspark logo regular" }),
      ).toBeVisible();
      await expect(
        page.getByRole("img", { name: "Lightspark logo light" }),
      ).toBeVisible();
      await expect(
        page.getByRole("img", { name: "Lightspark logomark regular" }),
      ).toBeVisible();
      await expect(
        page.getByRole("img", { name: "Lightspark logomark light" }),
      ).toBeVisible();
      await expect(
        page.getByRole("img", { name: "Lightspark wordmark" }),
      ).toBeVisible();
    });
  });

  test.describe("custom height", () => {
    test("applies custom height", async ({ mount, page }) => {
      await mount(<CustomHeight />);
      const logo = page.getByRole("img", { name: "Lightspark" });
      await expect(logo).toBeVisible();
      const box = await logo.boundingBox();
      expect(box?.height).toBe(40);
    });
  });

  test.describe("custom className", () => {
    test("applies custom className", async ({ mount, page }) => {
      await mount(<CustomClassName />);
      const logo = page.locator(".custom-logo-class");
      await expect(logo).toBeVisible();
    });
  });
});
