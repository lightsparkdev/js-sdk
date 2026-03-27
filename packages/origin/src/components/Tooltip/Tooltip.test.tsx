import { test, expect } from "@playwright/experimental-ct-react";
import {
  TestTooltipDefault,
  TestTooltipHover,
  TestTooltipFocus,
  TestTooltipPlacements,
  TestTooltipControlled,
  TestTooltipDelay,
  TestTooltipLongText,
} from "./Tooltip.test-stories";

test.describe("Tooltip", () => {
  test("renders with defaultOpen", async ({ mount, page }) => {
    await mount(<TestTooltipDefault />);

    const popup = page.getByTestId("popup");
    await expect(popup).toBeVisible();
    await expect(popup).toHaveText(/Tooltip content/);
  });

  test("shows on hover", async ({ mount, page }) => {
    await mount(<TestTooltipHover />);

    const popup = page.getByTestId("popup");
    await expect(popup).not.toBeVisible();

    const trigger = page.getByTestId("trigger");
    await trigger.hover();

    await expect(popup).toBeVisible();
  });

  test("shows on focus", async ({ mount, page }) => {
    await mount(<TestTooltipFocus />);

    const popup = page.getByTestId("popup");
    await expect(popup).not.toBeVisible();

    const trigger = page.getByTestId("trigger").locator("button");
    await trigger.focus();

    await expect(popup).toBeVisible();
  });

  test("hides on escape", async ({ mount, page }) => {
    await mount(<TestTooltipHover />);

    const trigger = page.getByTestId("trigger");
    await trigger.hover();

    const popup = page.getByTestId("popup");
    await expect(popup).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(popup).not.toBeVisible();
  });

  test("supports placements", async ({ mount, page }) => {
    await mount(<TestTooltipPlacements />);

    const popupTop = page.getByTestId("popup-top");
    const popupBottom = page.getByTestId("popup-bottom");

    await expect(popupTop).toBeVisible();
    await expect(popupBottom).toBeVisible();
  });

  test("supports controlled state", async ({ mount, page }) => {
    await mount(<TestTooltipControlled />);

    const popup = page.getByTestId("popup");
    const toggle = page.getByTestId("toggle");

    await expect(popup).not.toBeVisible();

    await toggle.click();
    await expect(popup).toBeVisible();

    await toggle.click();
    await expect(popup).toBeHidden({ timeout: 2000 });
  });

  test("respects delay", async ({ mount, page }) => {
    await mount(<TestTooltipDelay />);

    const trigger = page.getByTestId("trigger");
    const popup = page.getByTestId("popup");

    await trigger.hover();
    await expect(popup).not.toBeVisible();

    await page.waitForTimeout(150);
    await expect(popup).toBeVisible();
  });

  test("renders long text with max-width", async ({ mount, page }) => {
    await mount(<TestTooltipLongText />);

    const popup = page.getByTestId("popup");
    await expect(popup).toBeVisible();

    const box = await popup.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(250);
  });

  test("renders arrow", async ({ mount, page }) => {
    await mount(<TestTooltipDefault />);

    const arrow = page.getByTestId("arrow");
    await expect(arrow).toBeVisible();
  });

  test("has correct data-open attribute when open", async ({ mount, page }) => {
    await mount(<TestTooltipDefault />);

    const popup = page.getByTestId("popup");
    await expect(popup).toHaveAttribute("data-open", "");
  });
});
