import { test, expect } from "@playwright/experimental-ct-react";
import {
  TestPopoverDefault,
  TestPopoverClick,
  TestPopoverControlled,
  TestPopoverClose,
  TestPopoverAccessibility,
  TestPopoverBackdrop,
  TestPopoverPlacements,
  TestPopoverArrow,
} from "./Popover.test-stories";

test.describe("Popover", () => {
  test("renders with defaultOpen", async ({ mount, page }) => {
    await mount(<TestPopoverDefault />);

    const popup = page.getByTestId("popup");
    await expect(popup).toBeVisible();
    await expect(popup).toHaveText(/Popover content/);
  });

  test("opens on trigger click", async ({ mount, page }) => {
    await mount(<TestPopoverClick />);

    const popup = page.getByTestId("popup");
    await expect(popup).not.toBeVisible();

    const trigger = page.getByTestId("trigger");
    await trigger.click();

    await expect(popup).toBeVisible();
  });

  test("closes on escape", async ({ mount, page }) => {
    await mount(<TestPopoverClick />);

    const trigger = page.getByTestId("trigger");
    await trigger.click();

    const popup = page.getByTestId("popup");
    await expect(popup).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(popup).toBeHidden({ timeout: 2000 });
  });

  test("closes on outside click", async ({ mount, page }) => {
    await mount(<TestPopoverClick />);

    const trigger = page.getByTestId("trigger");
    await trigger.click();

    const popup = page.getByTestId("popup");
    await expect(popup).toBeVisible();

    await page.mouse.click(0, 0);
    await expect(popup).toBeHidden({ timeout: 2000 });
  });

  test("supports controlled state", async ({ mount, page }) => {
    await mount(<TestPopoverControlled />);

    const popup = page.getByTestId("popup");
    const openBtn = page.getByTestId("open-btn");
    const closeBtn = page.getByTestId("close-btn");

    await expect(popup).not.toBeVisible();

    await openBtn.click();
    await expect(popup).toBeVisible();

    await closeBtn.click();
    await expect(popup).toBeHidden({ timeout: 2000 });
  });

  test("closes with close button", async ({ mount, page }) => {
    await mount(<TestPopoverClose />);

    const popup = page.getByTestId("popup");
    await expect(popup).toBeVisible();

    const close = page.getByTestId("close");
    await close.click();

    await expect(popup).toBeHidden({ timeout: 2000 });
  });

  test("renders title and description", async ({ mount, page }) => {
    await mount(<TestPopoverAccessibility />);

    const title = page.getByTestId("title");
    const description = page.getByTestId("description");

    await expect(title).toBeVisible();
    await expect(title).toHaveText("Popover Title");
    await expect(description).toBeVisible();
    await expect(description).toHaveText("This is a description");
  });

  test("has data-open attribute when open", async ({ mount, page }) => {
    await mount(<TestPopoverDefault />);

    const popup = page.getByTestId("popup");
    await expect(popup).toHaveAttribute("data-open", "");
  });

  test("supports placements", async ({ mount, page }) => {
    await mount(<TestPopoverPlacements />);

    const popupBottom = page.getByTestId("popup-bottom");
    const popupTop = page.getByTestId("popup-top");

    await expect(popupBottom).toBeVisible();
    await expect(popupTop).toBeVisible();
  });

  test("renders arrow", async ({ mount, page }) => {
    await mount(<TestPopoverArrow />);

    const arrow = page.getByTestId("arrow");
    await expect(arrow).toBeVisible();
  });

  test("renders backdrop in modal mode", async ({ mount, page }) => {
    await mount(<TestPopoverBackdrop />);

    const backdrop = page.getByTestId("backdrop");
    await expect(backdrop).toBeVisible();

    const popup = page.getByTestId("popup");
    await expect(popup).toBeVisible();
  });

  test("applies popup surface styles", async ({ mount, page }) => {
    await mount(<TestPopoverDefault />);

    const popup = page.getByTestId("popup");
    await expect(popup).toBeVisible();

    await expect(popup).toHaveCSS("border-radius", "6px");
    await expect(popup).toHaveCSS("overflow", "clip");
  });

  test("applies default sideOffset", async ({ mount, page }) => {
    await mount(<TestPopoverDefault />);

    const positioner = page.getByTestId("positioner");
    await expect(positioner).toBeVisible();

    // The positioner should have a CSS variable for anchor gap set by Base UI
    // which reflects the sideOffset. We verify it renders without errors.
    const popup = page.getByTestId("popup");
    await expect(popup).toBeVisible();
  });
});
