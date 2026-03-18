import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultAlert,
  CriticalAlert,
  WarningAlert,
  TitleOnlyAlert,
  NoIconAlert,
  CustomIconAlert,
} from "./Alert.test-stories";

test.describe("Alert", () => {
  test.describe("default variant", () => {
    test('renders with role="alert"', async ({ mount, page }) => {
      await mount(<DefaultAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
    });

    test("renders title and description", async ({ mount, page }) => {
      await mount(<DefaultAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toContainText("Default Title");
      await expect(alert).toContainText("Default description text.");
    });

    test("renders default icon", async ({ mount, page }) => {
      await mount(<DefaultAlert />);
      const icon = page.locator("svg");
      await expect(icon).toBeVisible();
    });
  });

  test.describe("critical variant", () => {
    test('renders with role="alert"', async ({ mount, page }) => {
      await mount(<CriticalAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
    });

    test("renders title and description", async ({ mount, page }) => {
      await mount(<CriticalAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toContainText("Critical Title");
      await expect(alert).toContainText("Critical description text.");
    });
  });

  test.describe("warning variant", () => {
    test('renders with role="alert"', async ({ mount, page }) => {
      await mount(<WarningAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
    });

    test("renders title and description", async ({ mount, page }) => {
      await mount(<WarningAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toContainText("Warning Title");
      await expect(alert).toContainText("Warning description text.");
    });
  });

  test.describe("content combinations", () => {
    test("renders with title only", async ({ mount, page }) => {
      await mount(<TitleOnlyAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toContainText("Title Only");
    });
  });

  test.describe("icon options", () => {
    test("hides icon when icon={false}", async ({ mount, page }) => {
      await mount(<NoIconAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
      const icon = page.locator("svg");
      await expect(icon).not.toBeVisible();
    });

    test("renders custom icon", async ({ mount, page }) => {
      await mount(<CustomIconAlert />);
      const customIcon = page.locator('[data-testid="custom-icon"]');
      await expect(customIcon).toBeVisible();
    });
  });
});
