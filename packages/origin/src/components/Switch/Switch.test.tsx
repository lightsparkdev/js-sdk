import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultSwitch,
  CheckedSwitch,
  SmallSwitch,
  SmallCheckedSwitch,
  DisabledSwitch,
  DisabledCheckedSwitch,
  ReadOnlySwitch,
  ControlledSwitch,
} from "./Switch.test-stories";

test.describe("Switch", () => {
  test.describe("default behavior", () => {
    test("renders unchecked by default", async ({ mount }) => {
      const component = await mount(<DefaultSwitch />);
      const switchEl = component.locator("span").first();
      await expect(switchEl).not.toHaveAttribute("data-checked", "");
    });

    test("renders checked when defaultChecked", async ({ mount }) => {
      const component = await mount(<CheckedSwitch />);
      const switchEl = component.locator("span").first();
      await expect(switchEl).toHaveAttribute("data-checked", "");
    });

    test("toggles on click", async ({ mount }) => {
      const component = await mount(<DefaultSwitch />);
      const switchEl = component.locator("span").first();

      await expect(switchEl).not.toHaveAttribute("data-checked", "");
      await switchEl.click();
      await expect(switchEl).toHaveAttribute("data-checked", "");
      await switchEl.click();
      await expect(switchEl).not.toHaveAttribute("data-checked", "");
    });
  });

  test.describe("sizes", () => {
    test("renders SM size", async ({ mount }) => {
      const component = await mount(<SmallSwitch />);
      const switchEl = component.locator("span").first();
      await expect(switchEl).toBeVisible();
    });

    test("SM size toggles correctly", async ({ mount }) => {
      const component = await mount(<SmallSwitch />);
      const switchEl = component.locator("span").first();

      await expect(switchEl).not.toHaveAttribute("data-checked", "");
      await switchEl.click();
      await expect(switchEl).toHaveAttribute("data-checked", "");
    });

    test("SM checked renders correctly", async ({ mount }) => {
      const component = await mount(<SmallCheckedSwitch />);
      const switchEl = component.locator("span").first();
      await expect(switchEl).toHaveAttribute("data-checked", "");
    });
  });

  test.describe("disabled state", () => {
    test("disabled switch has data-disabled attribute", async ({ mount }) => {
      const component = await mount(<DisabledSwitch />);
      const switchEl = component.locator("span").first();
      await expect(switchEl).toHaveAttribute("data-disabled", "");
    });

    test("disabled switch does not toggle on click", async ({ mount }) => {
      const component = await mount(<DisabledSwitch />);
      const switchEl = component.locator("span").first();

      await expect(switchEl).not.toHaveAttribute("data-checked", "");
      await switchEl.click({ force: true });
      await expect(switchEl).not.toHaveAttribute("data-checked", "");
    });

    test("disabled checked switch stays checked", async ({ mount }) => {
      const component = await mount(<DisabledCheckedSwitch />);
      const switchEl = component.locator("span").first();

      await expect(switchEl).toHaveAttribute("data-checked", "");
      await expect(switchEl).toHaveAttribute("data-disabled", "");
    });
  });

  test.describe("readOnly state", () => {
    test("readOnly switch has data-readonly attribute", async ({ mount }) => {
      const component = await mount(<ReadOnlySwitch />);
      const switchEl = component.locator("span").first();
      await expect(switchEl).toHaveAttribute("data-readonly", "");
    });

    test("readOnly switch does not toggle on click", async ({ mount }) => {
      const component = await mount(<ReadOnlySwitch />);
      const switchEl = component.locator("span").first();

      await expect(switchEl).toHaveAttribute("data-checked", "");
      await switchEl.click();
      await expect(switchEl).toHaveAttribute("data-checked", "");
    });
  });

  test.describe("controlled mode", () => {
    test("controlled switch reflects external state", async ({ mount }) => {
      const component = await mount(<ControlledSwitch />);
      const switchEl = component.locator("span").first();
      const status = component.locator('[data-testid="status"]');

      await expect(status).toHaveText("off");
      await switchEl.click();
      await expect(status).toHaveText("on");
      await switchEl.click();
      await expect(status).toHaveText("off");
    });
  });

  test.describe("keyboard navigation", () => {
    test("Space key toggles switch", async ({ mount }) => {
      const component = await mount(<DefaultSwitch />);
      const switchEl = component.locator("span").first();

      await switchEl.focus();
      await expect(switchEl).not.toHaveAttribute("data-checked", "");
      await switchEl.press("Space");
      await expect(switchEl).toHaveAttribute("data-checked", "");
      await switchEl.press("Space");
      await expect(switchEl).not.toHaveAttribute("data-checked", "");
    });

    test("Enter key toggles switch", async ({ mount }) => {
      const component = await mount(<DefaultSwitch />);
      const switchEl = component.locator("span").first();

      await switchEl.focus();
      await expect(switchEl).not.toHaveAttribute("data-checked", "");
      await switchEl.press("Enter");
      await expect(switchEl).toHaveAttribute("data-checked", "");
    });

    test("disabled switch is not focusable via Tab", async ({
      mount,
      page,
    }) => {
      const component = await mount(<DisabledSwitch />);
      const switchEl = component.locator("span").first();

      await page.keyboard.press("Tab");
      await expect(switchEl).not.toBeFocused();
    });
  });
});
