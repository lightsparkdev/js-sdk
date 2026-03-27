import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicItem,
  ItemWithDescription,
  ItemWithLeading,
  ItemWithTrailing,
  ItemWithBothSlots,
  ClickableItem,
  NonClickableItem,
  SelectedItem,
  DisabledItem,
  DisabledClickableItem,
  ItemAsButton,
  ItemAsListItem,
} from "./Item.test-stories";

test.describe("Item", () => {
  test.describe("Basic rendering", () => {
    test("renders title", async ({ mount, page }) => {
      await mount(<BasicItem />);
      await expect(page.getByText("Settings")).toBeVisible();
    });

    test("renders title and description", async ({ mount, page }) => {
      await mount(<ItemWithDescription />);
      await expect(page.getByText("Dark mode")).toBeVisible();
      await expect(page.getByText("Use system setting")).toBeVisible();
    });
  });

  test.describe("Slots", () => {
    test("renders with leading element", async ({ mount, page }) => {
      await mount(<ItemWithLeading />);
      await expect(page.getByText("Settings")).toBeVisible();
      await expect(page.locator("svg")).toBeVisible();
    });

    test("renders with trailing element", async ({ mount, page }) => {
      await mount(<ItemWithTrailing />);
      await expect(page.getByText("Settings")).toBeVisible();
      await expect(page.locator("svg")).toBeVisible();
    });

    test("renders with both leading and trailing", async ({ mount, page }) => {
      await mount(<ItemWithBothSlots />);
      await expect(page.getByText("Settings")).toBeVisible();
      await expect(page.getByText("Manage your preferences")).toBeVisible();
      await expect(page.locator("svg")).toHaveCount(2);
    });
  });

  test.describe("Clickable behavior", () => {
    test("clickable item responds to click", async ({ mount, page }) => {
      await mount(<ClickableItem />);
      await expect(page.getByText("Click me")).toBeVisible();

      await page.getByText("Click me").click();
      await expect(page.getByText("Clicked!")).toBeVisible();
    });

    test('non-clickable item has data-clickable="false"', async ({
      mount,
      page,
    }) => {
      await mount(<NonClickableItem />);
      await expect(page.locator('[data-clickable="false"]')).toBeVisible();
    });
  });

  test.describe("States", () => {
    test("selected item has data-selected attribute", async ({
      mount,
      page,
    }) => {
      await mount(<SelectedItem />);
      await expect(page.locator("[data-selected]")).toBeVisible();
    });

    test("disabled item has data-disabled attribute", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledItem />);
      await expect(page.locator("[data-disabled]")).toBeVisible();
    });

    test("disabled item does not respond to click", async ({ mount, page }) => {
      await mount(<DisabledClickableItem />);

      // Try to click
      await page.getByText("Disabled clickable").click({ force: true });

      // Text should not change
      await expect(page.getByText("Disabled clickable")).toBeVisible();
    });
  });

  test.describe("Keyboard navigation", () => {
    test("clickable item responds to Enter key", async ({ mount, page }) => {
      await mount(<ClickableItem />);

      // Focus and press Enter
      await page.getByRole("button", { name: "Click me" }).focus();
      await page.keyboard.press("Enter");

      await expect(page.getByText("Clicked!")).toBeVisible();
    });

    test("clickable item responds to Space key", async ({ mount, page }) => {
      await mount(<ClickableItem />);

      // Focus and press Space
      await page.getByRole("button", { name: "Click me" }).focus();
      await page.keyboard.press("Space");

      await expect(page.getByText("Clicked!")).toBeVisible();
    });
  });

  test.describe("Custom render", () => {
    test("renders as button when render prop is button", async ({
      mount,
      page,
    }) => {
      await mount(<ItemAsButton />);
      await expect(
        page.getByRole("button", { name: "Button item" }),
      ).toBeVisible();
    });

    test("renders as li when render prop is li", async ({ mount, page }) => {
      await mount(<ItemAsListItem />);
      await expect(page.getByRole("listitem")).toBeVisible();
      await expect(page.getByText("List item")).toBeVisible();
    });
  });
});
