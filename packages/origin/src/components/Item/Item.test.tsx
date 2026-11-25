import { test, expect } from "@playwright/experimental-ct-react";
import { resolveTokenColor } from "@test-utils/resolveTokenColor";
import {
  BasicItem,
  ItemWithDescription,
  ItemWithLabel,
  ItemWithLeading,
  ItemWithTrailing,
  DisclosureItem,
  ItemWithBothSlots,
  CompactItem,
  DefaultSizeItem,
  CompactItemWithLabel,
  CompactItemAsLink,
  ClickableItem,
  NonClickableItem,
  SelectedItem,
  DisabledItem,
  DisabledClickableItem,
  ItemAsButton,
  InteractiveItemAsButton,
  InteractiveItemAsLink,
  InteractiveItemAsSummary,
  InteractiveItemAsComposedLink,
  DisabledItemAsComposedLink,
  DisabledItemAsRoutedLink,
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

    test("renders label inline with the title", async ({ mount, page }) => {
      await mount(<ItemWithLabel />);
      await expect(page.getByText("Jane Doe")).toBeVisible();
      await expect(page.getByText("Admin")).toBeVisible();

      const title = page.getByText("Jane Doe");
      const label = page.getByText("Admin");
      const titleBox = await title.boundingBox();
      const labelBox = await label.boundingBox();
      // Label sits on the same row, after the title.
      expect(labelBox!.x).toBeGreaterThan(titleBox!.x + titleBox!.width);
      expect(labelBox!.y).toBeLessThan(titleBox!.y + titleBox!.height);
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

    test("renders the canonical disclosure indicator", async ({
      mount,
      page,
    }) => {
      await mount(<DisclosureItem />);

      const icon = page.locator("svg");
      const iconSecondary = await resolveTokenColor(page, "--icon-secondary");
      await expect(icon).toHaveCount(1);
      await expect(icon).toHaveCSS("width", "20px");
      await expect(icon).toHaveCSS("height", "20px");
      await expect(icon).toHaveCSS("color", iconSecondary);
    });

    test("renders with both leading and trailing", async ({ mount, page }) => {
      await mount(<ItemWithBothSlots />);
      await expect(page.getByText("Settings")).toBeVisible();
      await expect(page.getByText("Manage your preferences")).toBeVisible();
      await expect(page.locator("svg")).toHaveCount(2);
    });
  });

  test.describe("Sizes", () => {
    test('compact item has data-size="compact"', async ({ mount, page }) => {
      await mount(<CompactItem />);
      await expect(page.locator('[data-size="compact"]')).toBeVisible();
    });

    test("default item has no data-size attribute", async ({ mount, page }) => {
      await mount(<DefaultSizeItem />);
      await expect(page.getByText("Payment received")).toBeVisible();
      await expect(page.locator("[data-size]")).toHaveCount(0);
    });

    test("compact item keeps the label inline with the title", async ({
      mount,
      page,
    }) => {
      await mount(<CompactItemWithLabel />);
      await expect(page.locator('[data-size="compact"]')).toBeVisible();

      const title = page.getByText("Jane Doe");
      const label = page.getByText("Admin");
      const titleBox = await title.boundingBox();
      const labelBox = await label.boundingBox();
      expect(labelBox!.x).toBeGreaterThan(titleBox!.x + titleBox!.width);
      expect(labelBox!.y).toBeLessThan(titleBox!.y + titleBox!.height);
    });

    test("compact applies through the render prop", async ({ mount, page }) => {
      await mount(<CompactItemAsLink />);
      const link = page.getByRole("link", { name: /Payment received/ });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("data-size", "compact");
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

    test("rendered button composes handlers once for pointer activation", async ({
      mount,
      page,
    }) => {
      await mount(<InteractiveItemAsButton />);
      const button = page.getByRole("button", { name: /Choose option/ });

      await button.click();

      await expect(page.getByTestId("item-activations")).toHaveText("1");
      await expect(page.getByTestId("render-activations")).toHaveText("1");
    });

    test("rendered button composes handlers once for Enter activation", async ({
      mount,
      page,
    }) => {
      await mount(<InteractiveItemAsButton />);
      const button = page.getByRole("button", { name: /Choose option/ });

      await button.focus();
      await page.keyboard.press("Enter");

      await expect(page.getByTestId("item-activations")).toHaveText("1");
      await expect(page.getByTestId("render-activations")).toHaveText("1");
    });

    test("rendered button composes handlers once for Space activation", async ({
      mount,
      page,
    }) => {
      await mount(<InteractiveItemAsButton />);
      const button = page.getByRole("button", { name: /Choose option/ });

      await button.focus();
      await page.keyboard.press("Space");

      await expect(page.getByTestId("item-activations")).toHaveText("1");
      await expect(page.getByTestId("render-activations")).toHaveText("1");
    });

    test("rendered button normalizes full-row presentation", async ({
      mount,
      page,
    }) => {
      await mount(<InteractiveItemAsButton />);
      const button = page.getByRole("button", { name: /Choose option/ });
      const width = await button.evaluate((element) => element.clientWidth);
      const parentWidth = await button.evaluate(
        (element) => element.parentElement?.clientWidth,
      );

      expect(width).toBe(parentWidth);
      await expect(button).toHaveCSS("text-align", "left");
      await expect(button).toHaveCSS("appearance", "none");
      await expect(button).toHaveCSS("border-top-width", "0px");
      await expect(button).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    });

    test("rendered button keeps descriptions readable at narrow widths", async ({
      mount,
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 600 });
      await mount(<InteractiveItemAsButton />);
      const description = page.getByText(
        "Continue with this longer option description that remains readable",
      );
      const layout = await description.evaluate((element) => {
        const style = window.getComputedStyle(element);
        const lineHeight = Number.parseFloat(style.lineHeight);
        const bounds = element.getBoundingClientRect();
        return {
          lines: bounds.height / lineHeight,
          fitsWidth: element.scrollWidth <= element.clientWidth,
        };
      });

      expect(layout.lines).toBeGreaterThan(1);
      expect(layout.fitsWidth).toBe(true);
    });

    test("rendered button exposes hover, pressed, and focus states", async ({
      mount,
      page,
    }) => {
      await mount(<InteractiveItemAsButton />);
      const button = page.getByRole("button", { name: /Choose option/ });
      const hover = await resolveTokenColor(page, "--surface-hover");
      const pressed = await resolveTokenColor(page, "--surface-secondary");

      await button.hover();
      await expect(button).toHaveCSS("background-color", hover);

      await page.mouse.down();
      await expect(button).toHaveCSS("background-color", pressed);
      await page.mouse.up();

      await button.blur();
      await page.keyboard.press("Tab");
      await expect(button).not.toHaveCSS("box-shadow", "none");
    });

    test("rendered link keeps native Enter activation", async ({
      mount,
      page,
    }) => {
      await mount(<InteractiveItemAsLink />);
      const link = page.getByRole("link", { name: "View details" });

      await link.focus();
      await page.keyboard.press("Enter");

      await expect(page).toHaveURL(/#details$/);
      await expect(page.getByTestId("link-activations")).toHaveText("1");
    });

    test("rendered summary keeps native keyboard activation", async ({
      mount,
      page,
    }) => {
      await mount(<InteractiveItemAsSummary />);
      const details = page.locator("details");
      const summary = page.locator("summary");

      await summary.focus();
      await page.keyboard.press("Enter");

      await expect(details).toHaveAttribute("open", "");
      await expect(page.getByTestId("summary-item-activations")).toHaveText(
        "1",
      );
      await expect(page.getByTestId("summary-render-activations")).toHaveText(
        "1",
      );

      await page.keyboard.press("Space");

      await expect(details).not.toHaveAttribute("open");
      await expect(page.getByTestId("summary-item-activations")).toHaveText(
        "2",
      );
      await expect(page.getByTestId("summary-render-activations")).toHaveText(
        "2",
      );
    });

    test("composed link keeps native Enter activation once", async ({
      mount,
      page,
    }) => {
      await mount(<InteractiveItemAsComposedLink />);
      const link = page.getByRole("link", { name: "View composed details" });

      await link.focus();
      await page.keyboard.press("Enter");

      await expect(page).toHaveURL(/#composed-details$/);
      await expect(page.getByTestId("composed-item-activations")).toHaveText(
        "1",
      );
      await expect(page.getByTestId("composed-render-activations")).toHaveText(
        "1",
      );
    });

    test("disabled composed link blocks navigation and activation", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledItemAsComposedLink />);
      const link = page.getByTestId("disabled-composed-link");

      await expect(link).toHaveAttribute("aria-disabled", "true");
      await expect(link).toHaveAttribute("tabindex", "-1");
      await expect(link).not.toHaveAttribute("href");
      await link.click({ force: true });
      await link.click({ button: "middle", force: true });

      await expect(page).not.toHaveURL(/#disabled-composed-details$/);
      await expect(page.getByTestId("disabled-item-activations")).toHaveText(
        "0",
      );
      await expect(page.getByTestId("disabled-render-activations")).toHaveText(
        "0",
      );
    });

    test("disabled routed link loses its derived href and never navigates", async ({
      mount,
      page,
    }) => {
      await mount(<DisabledItemAsRoutedLink />);
      const link = page.getByTestId("disabled-routed-link");

      await expect(link).toHaveAttribute("aria-disabled", "true");
      await expect(link).toHaveAttribute("tabindex", "-1");
      await expect(link).not.toHaveAttribute("href");

      await link.click({ force: true });
      await link.click({ button: "middle", force: true });
      await link.focus();
      await page.keyboard.press("Enter");

      await expect(page).not.toHaveURL(/\/example/);
      await expect(
        page.getByTestId("disabled-routed-item-activations"),
      ).toHaveText("0");
      await expect(
        page.getByTestId("disabled-routed-render-activations"),
      ).toHaveText("0");
    });

    test("renders as li when render prop is li", async ({ mount, page }) => {
      await mount(<ItemAsListItem />);
      await expect(page.getByRole("listitem")).toBeVisible();
      await expect(page.getByText("List item")).toBeVisible();
      await expect(page.getByRole("button")).toHaveCount(0);
    });
  });
});
