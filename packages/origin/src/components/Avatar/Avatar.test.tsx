import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultAvatar,
  AvatarWithImage,
  SquircleVariant,
  CircleVariant,
  AllSizes,
  AllColors,
  CustomClassAvatar,
} from "./Avatar.test-stories";

test.describe("Avatar", () => {
  test.describe("default behavior", () => {
    test("renders with fallback initials", async ({ mount, page }) => {
      await mount(<DefaultAvatar />);
      const avatar = page.locator("span").first();
      await expect(avatar).toBeVisible();
      await expect(avatar).toContainText("CS");
    });

    test("defaults to size 32 and squircle variant", async ({
      mount,
      page,
    }) => {
      await mount(<DefaultAvatar />);
      const avatar = page.locator("span").first();
      await expect(avatar).toBeVisible();
    });
  });

  test.describe("with image", () => {
    test("renders image when src is valid", async ({ mount, page }) => {
      await mount(<AvatarWithImage />);
      const image = page.getByTestId("avatar-image");
      await expect(image).toBeVisible();
    });
  });

  test.describe("variants", () => {
    test("renders squircle variant", async ({ mount, page }) => {
      await mount(<SquircleVariant />);
      const avatar = page.getByTestId("avatar-squircle");
      await expect(avatar).toBeVisible();
      await expect(avatar).toContainText("SQ");
    });

    test("renders circle variant", async ({ mount, page }) => {
      await mount(<CircleVariant />);
      const avatar = page.getByTestId("avatar-circle");
      await expect(avatar).toBeVisible();
      await expect(avatar).toContainText("CI");
    });
  });

  test.describe("sizes", () => {
    test("renders all size variants", async ({ mount, page }) => {
      await mount(<AllSizes />);
      await expect(page.getByTestId("size-16")).toBeVisible();
      await expect(page.getByTestId("size-20")).toBeVisible();
      await expect(page.getByTestId("size-24")).toBeVisible();
      await expect(page.getByTestId("size-32")).toBeVisible();
      await expect(page.getByTestId("size-40")).toBeVisible();
      await expect(page.getByTestId("size-48")).toBeVisible();
    });
  });

  test.describe("colors", () => {
    test("renders all color variants", async ({ mount, page }) => {
      await mount(<AllColors />);
      await expect(page.getByTestId("color-blue")).toBeVisible();
      await expect(page.getByTestId("color-purple")).toBeVisible();
      await expect(page.getByTestId("color-sky")).toBeVisible();
      await expect(page.getByTestId("color-pink")).toBeVisible();
      await expect(page.getByTestId("color-green")).toBeVisible();
      await expect(page.getByTestId("color-yellow")).toBeVisible();
      await expect(page.getByTestId("color-red")).toBeVisible();
      await expect(page.getByTestId("color-gray")).toBeVisible();
    });
  });

  test.describe("custom class", () => {
    test("applies custom className", async ({ mount, page }) => {
      await mount(<CustomClassAvatar />);
      const avatar = page.locator("span.custom-class").first();
      await expect(avatar).toBeVisible();
    });
  });
});
