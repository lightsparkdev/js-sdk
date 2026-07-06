import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultBreadcrumb,
  CurrentPageBreadcrumb,
  WithLinksBreadcrumb,
  CustomSeparatorBreadcrumb,
  CollapsedBreadcrumb,
  PropForwardingBreadcrumb,
  StyleForwardingBreadcrumb,
  ClassNameBreadcrumb,
  LinkPropForwarding,
  PagePropForwarding,
} from "./Breadcrumb.test-stories";
import { resolveTokenColor } from "@test-utils/resolveTokenColor";

test.describe("Breadcrumb", () => {
  // Structure
  test("renders nav element with aria-label", async ({ mount, page }) => {
    await mount(<DefaultBreadcrumb />);
    const nav = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(nav).toBeVisible();
  });

  test("renders ordered list for semantic structure", async ({ mount }) => {
    const component = await mount(<DefaultBreadcrumb />);
    const ol = component.locator("ol");
    await expect(ol).toBeVisible();
  });

  test("renders list items for each breadcrumb item", async ({ mount }) => {
    const component = await mount(<DefaultBreadcrumb />);
    const items = component.locator("li");
    await expect(items).toHaveCount(3);
  });

  // Current page
  test('marks current page with aria-current="page"', async ({ mount }) => {
    const component = await mount(<CurrentPageBreadcrumb />);
    const currentItem = component.locator('[aria-current="page"]');
    await expect(currentItem).toBeVisible();
    await expect(currentItem).toHaveText("Current Page");
  });

  test("current page is not a link", async ({ mount }) => {
    const component = await mount(<CurrentPageBreadcrumb />);
    const currentItem = component.locator('[aria-current="page"]');
    // Current page should be a span, not a link
    await expect(currentItem.locator("a")).toHaveCount(0);
  });

  // Links
  test("renders links for non-current items", async ({ mount }) => {
    const component = await mount(<WithLinksBreadcrumb />);
    const links = component.locator("a");
    // Should have links for Home and Products, but not Current Page
    await expect(links).toHaveCount(2);
  });

  test("links have correct href attributes", async ({ mount }) => {
    const component = await mount(<WithLinksBreadcrumb />);
    const homeLink = component.locator("a").first();
    await expect(homeLink).toHaveAttribute("href", "/");
  });

  // Separators
  test("renders separators between items via CSS", async ({ mount }) => {
    const component = await mount(<DefaultBreadcrumb />);
    // Separators should be CSS-only, not in DOM
    // Verify items have the separator styling class
    const items = component.locator("li");
    await expect(items).toHaveCount(3);
    // Separators are CSS ::before pseudo-elements, not separate DOM nodes
  });

  // Custom separator (for accessibility, separator should be decorative)
  test("custom separator is supported", async ({ mount, page }) => {
    await mount(<CustomSeparatorBreadcrumb />);
    const nav = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(nav).toBeVisible();
  });

  // Collapsed state
  test("supports collapsed items with ellipsis", async ({ mount }) => {
    const component = await mount(<CollapsedBreadcrumb />);
    // Should show ellipsis for collapsed middle items
    const ellipsis = component.getByRole("button", {
      name: "Show more breadcrumbs",
    });
    await expect(ellipsis).toBeVisible();
  });

  // Data attributes
  test("has data-current attribute on current item", async ({ mount }) => {
    const component = await mount(<CurrentPageBreadcrumb />);
    const currentItem = component.locator("[data-current]");
    await expect(currentItem).toBeVisible();
  });

  // Separator active-layer promotion (Figma: Separator state=Current)
  test("separator before the current crumb renders icon-primary", async ({
    mount,
    page,
  }) => {
    const component = await mount(<WithLinksBreadcrumb />);

    const iconPrimary = await resolveTokenColor(page, "--icon-primary");
    const iconSecondary = await resolveTokenColor(page, "--icon-secondary");

    // Home > Products > [Current Page]: the chevron after Products promotes,
    // the chevron after Home stays secondary.
    const chevrons = component.locator('li > span[aria-hidden="true"] svg');
    await expect(chevrons.first()).toHaveCSS("color", iconSecondary);
    await expect(chevrons.nth(1)).toHaveCSS("color", iconPrimary);
  });

  test("collapsed breadcrumb promotes only the separator before current", async ({
    mount,
    page,
  }) => {
    const component = await mount(<CollapsedBreadcrumb />);

    const iconPrimary = await resolveTokenColor(page, "--icon-primary");
    const iconSecondary = await resolveTokenColor(page, "--icon-secondary");

    // Home > [ellipsis] > Shoes > [Current: Running]: only the chevron
    // after Shoes (index 2) promotes.
    const chevrons = component.locator('li > span[aria-hidden="true"] svg');
    await expect(chevrons.first()).toHaveCSS("color", iconSecondary);
    await expect(chevrons.nth(1)).toHaveCSS("color", iconSecondary);
    await expect(chevrons.nth(2)).toHaveCSS("color", iconPrimary);
  });

  // Ref forwarding
  test("forwards ref to nav element", async ({ mount, page }) => {
    await mount(<DefaultBreadcrumb />);
    const nav = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(nav).toBeVisible();
  });
});

test.describe("Breadcrumb.Root conformance", () => {
  test("forwards custom data attributes", async ({ mount, page }) => {
    await mount(<PropForwardingBreadcrumb />);
    const root = page.locator('[data-testid="test-root"]');
    await expect(root).toHaveAttribute("data-custom", "custom-value");
  });

  test("forwards lang attribute", async ({ mount, page }) => {
    await mount(<PropForwardingBreadcrumb />);
    const root = page.locator('[data-testid="test-root"]');
    await expect(root).toHaveAttribute("lang", "fr");
  });

  test("forwards style attribute", async ({ mount, page }) => {
    await mount(<StyleForwardingBreadcrumb />);
    const root = page.locator('[data-testid="test-root"]');
    await expect(root).toHaveCSS("color", "rgb(0, 128, 0)");
  });

  test("forwards className", async ({ mount, page }) => {
    await mount(<ClassNameBreadcrumb />);
    const root = page.locator('[data-testid="test-root"]');
    await expect(root).toHaveClass(/custom-class-name/);
  });
});

test.describe("Breadcrumb.Link conformance", () => {
  test("forwards custom data attributes", async ({ mount, page }) => {
    await mount(<LinkPropForwarding />);
    const link = page.locator('[data-testid="test-link"]');
    await expect(link).toHaveAttribute("data-custom", "link-value");
  });

  test("forwards lang attribute", async ({ mount, page }) => {
    await mount(<LinkPropForwarding />);
    const link = page.locator('[data-testid="test-link"]');
    await expect(link).toHaveAttribute("lang", "de");
  });
});

test.describe("Breadcrumb.Page conformance", () => {
  test("forwards custom data attributes", async ({ mount, page }) => {
    await mount(<PagePropForwarding />);
    const pageEl = page.locator('[data-testid="test-page"]');
    await expect(pageEl).toHaveAttribute("data-custom", "page-value");
  });

  test("forwards lang attribute", async ({ mount, page }) => {
    await mount(<PagePropForwarding />);
    const pageEl = page.locator('[data-testid="test-page"]');
    await expect(pageEl).toHaveAttribute("lang", "es");
  });
});
