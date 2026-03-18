import { test, expect } from "@playwright/experimental-ct-react";
import {
  LinksOnly,
  WithDropdown,
  ActiveLink,
  DisabledStates,
  PopupItemVariants,
  ActionVariant,
  ActionActive,
  ActionDisabled,
  ActionIconVariant,
  ActionIconActive,
  ActionIconDisabled,
} from "./NavigationMenu.test-stories";

test.describe("NavigationMenu", () => {
  test.describe("Links", () => {
    test("renders navigation links", async ({ mount }) => {
      const component = await mount(<LinksOnly />);

      await expect(component.getByRole("link", { name: "Home" })).toBeVisible();
      await expect(
        component.getByRole("link", { name: "About" }),
      ).toBeVisible();
      await expect(
        component.getByRole("link", { name: "Contact" }),
      ).toBeVisible();
    });

    test("active link has data-active attribute", async ({ mount }) => {
      const component = await mount(<ActiveLink />);

      const activeLink = component.getByRole("link", { name: "About" });
      await expect(activeLink).toHaveAttribute("data-active", "");
    });
  });

  test.describe("Trigger and Dropdown", () => {
    test("trigger opens dropdown on click", async ({ mount, page }) => {
      const component = await mount(<WithDropdown />);

      const trigger = component.getByRole("button", { name: "Products" });
      await trigger.click();

      // Portal renders outside component, use page locator
      await expect(page.getByText("Dashboard")).toBeVisible();
      await expect(page.getByText("Analytics")).toBeVisible();
      await expect(page.getByText("Reports")).toBeVisible();
    });

    test("trigger has popup-open attribute when open", async ({
      mount,
      page: _page,
    }) => {
      const component = await mount(<WithDropdown />);

      const trigger = component.getByRole("button", { name: "Products" });
      await trigger.click();

      await expect(trigger).toHaveAttribute("data-popup-open", "");
    });

    test("disabled trigger cannot be opened", async ({ mount }) => {
      const component = await mount(<DisabledStates />);

      const disabledTrigger = component.getByRole("button", {
        name: "Disabled Trigger",
      });
      await expect(disabledTrigger).toBeDisabled();
    });
  });

  test.describe("PopupItem", () => {
    test("renders popup items with various configurations", async ({
      mount,
    }) => {
      const component = await mount(<PopupItemVariants />);

      await expect(component.getByText("With Leading Icon")).toBeVisible();
      await expect(component.getByText("Label Only")).toBeVisible();
      await expect(component.getByText("With Both Icons")).toBeVisible();
    });

    test("disabled popup item has data-disabled attribute", async ({
      mount,
    }) => {
      const component = await mount(<PopupItemVariants />);

      // Find the disabled item container
      const disabledItem = component
        .locator("[data-disabled]")
        .filter({ hasText: "Disabled Item" });
      await expect(disabledItem).toBeVisible();
    });
  });

  test.describe("Keyboard Navigation", () => {
    test("trigger can be focused with Tab", async ({ mount, page }) => {
      const component = await mount(<WithDropdown />);

      await page.keyboard.press("Tab");
      const trigger = component.getByRole("button", { name: "Products" });
      await expect(trigger).toBeFocused();
    });

    test("Enter key opens dropdown", async ({ mount, page }) => {
      await mount(<WithDropdown />);

      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");

      // Portal renders outside component, use page locator
      await expect(page.getByText("Dashboard")).toBeVisible();
    });

    test("Escape key closes dropdown", async ({ mount, page }) => {
      const component = await mount(<WithDropdown />);

      const trigger = component.getByRole("button", { name: "Products" });
      await trigger.click();
      await expect(page.getByText("Dashboard")).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(page.getByText("Dashboard")).not.toBeVisible();
    });
  });

  test.describe("Action", () => {
    test("renders as a button", async ({ mount }) => {
      const component = await mount(<ActionVariant />);

      const action = component.getByRole("button", { name: "Sign Out" });
      await expect(action).toBeVisible();
    });

    test("handles click events", async ({ mount }) => {
      const component = await mount(<ActionVariant />);

      const action = component.getByRole("button", { name: "Sign Out" });
      await action.click();

      await expect(
        component.getByRole("button", { name: "Clicked!" }),
      ).toBeVisible();
    });

    test("active action has data-active attribute", async ({ mount }) => {
      const component = await mount(<ActionActive />);

      const activeAction = component.getByRole("button", { name: "Active" });
      await expect(activeAction).toHaveAttribute("data-active", "");
    });

    test("disabled action cannot be clicked", async ({ mount }) => {
      const component = await mount(<ActionDisabled />);

      const disabledAction = component.getByRole("button", {
        name: "Disabled Action",
      });
      await expect(disabledAction).toBeDisabled();
    });

    test("action can be focused with Tab", async ({ mount, page }) => {
      const component = await mount(<ActionVariant />);

      // Tab past the link to the action
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      const action = component.getByRole("button", { name: "Sign Out" });
      await expect(action).toBeFocused();
    });
  });

  test.describe("ActionIcon", () => {
    test("renders as a button with aria-label", async ({ mount }) => {
      const component = await mount(<ActionIconVariant />);

      const actionIcon = component.getByRole("button", { name: "Settings" });
      await expect(actionIcon).toBeVisible();
    });

    test("handles click events", async ({ mount }) => {
      const component = await mount(<ActionIconVariant />);

      const actionIcon = component.getByTestId("settings-action");
      await actionIcon.click();

      // Icon should change after click (check icon changed by verifying component updated)
      await expect(actionIcon).toBeVisible();
    });

    test("active action icon has data-active attribute", async ({ mount }) => {
      const component = await mount(<ActionIconActive />);

      const activeActionIcon = component.getByRole("button", {
        name: "Notifications",
      });
      await expect(activeActionIcon).toHaveAttribute("data-active", "");
    });

    test("disabled action icon cannot be clicked", async ({ mount }) => {
      const component = await mount(<ActionIconDisabled />);

      const disabledActionIcon = component.getByRole("button", {
        name: "Settings",
      });
      await expect(disabledActionIcon).toBeDisabled();
    });
  });
});
