import { test, expect } from "@playwright/experimental-ct-react";
import AxeBuilder from "@axe-core/playwright";
import {
  FilledButton,
  SecondaryButton,
  DisabledSecondaryButton,
  OutlineButton,
  GhostButton,
  CriticalButton,
  DisabledButton,
  DisabledOutlineButton,
  LoadingButton,
  AllSizes,
  IconOnlyButton,
  IconOnlyButtonWithChildren,
  ButtonWithLeadingIcon,
  ButtonWithTrailingIcon,
  LinkButton,
  AnchorButtonLink,
  DisabledAnchorButtonLink,
  RenderedButtonLink,
  RenderedButtonLinkWithMergedProps,
  RenderedButtonLinkWithMergedRefs,
  DisabledRenderedButtonLink,
  DisabledLinkButton,
  FullWidthButton,
} from "./Button.test-stories";

const axeConfig = {
  rules: {
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
    region: { enabled: false },
  },
};

test.describe("Button", () => {
  test("filled variant has no accessibility violations", async ({
    mount,
    page,
  }) => {
    await mount(<FilledButton />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("outline variant has no accessibility violations", async ({
    mount,
    page,
  }) => {
    await mount(<OutlineButton />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("ghost variant has no accessibility violations", async ({
    mount,
    page,
  }) => {
    await mount(<GhostButton />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("critical variant has no accessibility violations", async ({
    mount,
    page,
  }) => {
    await mount(<CriticalButton />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("secondary variant has no accessibility violations", async ({
    mount,
    page,
  }) => {
    await mount(<SecondaryButton />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("secondary variant has subtle background", async ({ mount, page }) => {
    await mount(<SecondaryButton />);

    const button = page.getByRole("button");
    const bgColor = await button.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    // --surface-alpha-secondary resolves to a low-opacity tint
    expect(bgColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("secondary variant has no border by default", async ({
    mount,
    page,
  }) => {
    await mount(<SecondaryButton />);

    const button = page.getByRole("button");
    const borderColor = await button.evaluate(
      (el) => getComputedStyle(el).borderColor,
    );
    // transparent border (reserving space for focus state)
    expect(borderColor).toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
  });

  test("disabled secondary button has correct opacity", async ({
    mount,
    page,
  }) => {
    await mount(<DisabledSecondaryButton />);

    const button = page.getByRole("button");
    const opacity = await button.evaluate((el) => getComputedStyle(el).opacity);
    // Secondary uses same 15% opacity as filled when disabled
    expect(parseFloat(opacity)).toBeCloseTo(0.15, 2);
  });

  test("can be activated with Enter key", async ({ mount, page }) => {
    await mount(<FilledButton />);

    const button = page.getByRole("button");
    await button.focus();
    await page.keyboard.press("Enter");

    await expect(button).toBeFocused();
  });

  test("can be activated with Space key", async ({ mount, page }) => {
    await mount(<FilledButton />);

    const button = page.getByRole("button");
    await button.focus();
    await page.keyboard.press("Space");

    await expect(button).toBeFocused();
  });

  test("disabled button cannot be focused", async ({ mount, page }) => {
    await mount(<DisabledButton />);

    const button = page.getByRole("button");
    await expect(button).toBeDisabled();
  });

  test("loading button is disabled", async ({ mount, page }) => {
    await mount(<LoadingButton />);

    const button = page.getByRole("button");
    await expect(button).toBeDisabled();
  });

  test("loading button shows loader", async ({ mount, page }) => {
    await mount(<LoadingButton />);

    const loader = page.getByRole("status", { name: "Loading" });
    await expect(loader).toBeVisible();
  });

  test("sizes render correctly", async ({ mount, page }) => {
    await mount(<AllSizes />);

    await expect(page.getByRole("button", { name: "Compact" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Default" })).toBeVisible();
  });

  test("compact size has correct height", async ({ mount, page }) => {
    await mount(<AllSizes />);

    const compactButton = page.getByRole("button", { name: "Compact" });
    const box = await compactButton.boundingBox();
    expect(box?.height).toBe(32);
  });

  test("default size has correct height", async ({ mount, page }) => {
    await mount(<AllSizes />);

    const defaultButton = page.getByRole("button", { name: "Default" });
    const box = await defaultButton.boundingBox();
    expect(box?.height).toBe(36);
  });

  test("fullWidth fills its parent width", async ({ mount, page }) => {
    await mount(<FullWidthButton />);

    const button = page.getByRole("button", { name: "Full width" });
    const box = await button.boundingBox();
    expect(box?.width).toBe(320);
  });

  test("icon-only button has accessible name", async ({ mount, page }) => {
    await mount(<IconOnlyButton />);

    const button = page.getByRole("button", { name: "Add item" });
    await expect(button).toBeVisible();

    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("icon-only button renders children as icon", async ({ mount, page }) => {
    await mount(<IconOnlyButtonWithChildren />);

    const button = page.getByRole("button", { name: "Add item" });
    await expect(button).toBeVisible();
    await expect(button.locator("svg")).toBeVisible();

    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("renders with leading icon", async ({ mount, page }) => {
    await mount(<ButtonWithLeadingIcon />);

    const button = page.getByRole("button", { name: "Back" });
    await expect(button).toBeVisible();
    await expect(button.locator("svg")).toBeVisible();
  });

  test("renders with trailing icon", async ({ mount, page }) => {
    await mount(<ButtonWithTrailingIcon />);

    const button = page.getByRole("button", { name: "Next" });
    await expect(button).toBeVisible();
    await expect(button.locator("svg")).toBeVisible();
  });

  test("respects reduced motion preference", async ({ mount, page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mount(<FilledButton />);

    const button = page.getByRole("button");
    const transition = await button.evaluate(
      (el) => getComputedStyle(el).transition,
    );

    expect(transition).toMatch(/none|0s/);
  });

  test("has correct border radius", async ({ mount, page }) => {
    await mount(<FilledButton />);

    const button = page.getByRole("button");
    const borderRadius = await button.evaluate(
      (el) => getComputedStyle(el).borderRadius,
    );

    expect(borderRadius).toBe("6px");
  });

  test("disabled filled button has correct opacity", async ({
    mount,
    page,
  }) => {
    await mount(<DisabledButton />);

    const button = page.getByRole("button");
    const opacity = await button.evaluate((el) => getComputedStyle(el).opacity);

    // Filled variant uses 15% opacity when disabled
    expect(parseFloat(opacity)).toBeCloseTo(0.15, 2);
  });

  test("disabled outline button has correct opacity", async ({
    mount,
    page,
  }) => {
    await mount(<DisabledOutlineButton />);

    const button = page.getByRole("button");
    const opacity = await button.evaluate((el) => getComputedStyle(el).opacity);

    // Outline/Ghost/Critical variants use 50% opacity when disabled
    expect(parseFloat(opacity)).toBeCloseTo(0.5, 1);
  });

  test("link variant has no accessibility violations", async ({
    mount,
    page,
  }) => {
    await mount(<LinkButton />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("link variant has no fixed height", async ({ mount, page }) => {
    await mount(<LinkButton />);

    const button = page.getByRole("button");
    const height = await button.evaluate((el) => getComputedStyle(el).height);

    // Link variant should have auto height based on content, not fixed 36px or 32px
    expect(height).not.toBe("36px");
    expect(height).not.toBe("32px");
  });

  test("link variant has transparent background", async ({ mount, page }) => {
    await mount(<LinkButton />);

    const button = page.getByRole("button");
    const bgColor = await button.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    // Should be transparent (rgba(0, 0, 0, 0))
    expect(bgColor).toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
  });

  test("disabled link button has correct opacity", async ({ mount, page }) => {
    await mount(<DisabledLinkButton />);

    const button = page.getByRole("button");
    const opacity = await button.evaluate((el) => getComputedStyle(el).opacity);

    // Link variant uses 50% opacity when disabled
    expect(parseFloat(opacity)).toBeCloseTo(0.5, 1);
  });

  test("ButtonLink renders an anchor with link semantics", async ({
    mount,
    page,
  }) => {
    await mount(<AnchorButtonLink />);

    const link = page.getByRole("link", { name: "Read docs" });
    await expect(link).toHaveAttribute("href", /\/docs$/);
    await expect(page.getByRole("button", { name: "Read docs" })).toHaveCount(
      0,
    );
  });

  test("ButtonLink omits href while disabled", async ({ mount, page }) => {
    await mount(<DisabledAnchorButtonLink />);

    const link = page.locator("a", { hasText: "Disabled docs" });
    await expect(link).toHaveAttribute("aria-disabled", "true");
    await expect(link).toHaveAttribute("tabindex", "-1");
    await expect(link).not.toHaveAttribute("href");
  });

  test("ButtonLink can style a rendered anchor target", async ({
    mount,
    page,
  }) => {
    await mount(<RenderedButtonLink />);

    const link = page.getByRole("link", { name: "Settings" });
    await expect(link).toHaveAttribute("href", /\/settings$/);
    const bgColor = await link.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    // Secondary uses a visible low-opacity tint.
    expect(bgColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("ButtonLink merges render props with button props", async ({
    mount,
    page,
  }) => {
    await mount(<RenderedButtonLinkWithMergedProps />);

    const link = page.getByRole("link", { name: "Merged props" });
    await expect(link).toHaveAttribute("href", /\/merged$/);
    await expect(link).toHaveAttribute("data-render-source", "render");
    await expect(link).toHaveAttribute(
      "data-button-link-source",
      "button-link",
    );
    await expect(link).toHaveClass(/rendered-link-target/);

    await link.click();
    await expect(page.locator("body")).toHaveAttribute(
      "data-render-click",
      "true",
    );
    await expect(page.locator("body")).toHaveAttribute(
      "data-button-link-click",
      "true",
    );
  });

  test("ButtonLink merges refs with the rendered target", async ({
    mount,
    page,
  }) => {
    await mount(<RenderedButtonLinkWithMergedRefs />);

    const link = page.getByRole("link", { name: "Merged refs" });
    await expect(link).toHaveAttribute("href", /\/refs$/);
    await expect(page.locator("body")).toHaveAttribute(
      "data-render-ref",
      "/refs",
    );
    await expect(page.locator("body")).toHaveAttribute(
      "data-button-link-ref",
      "/refs",
    );
  });

  test("ButtonLink prevents rendered handlers while disabled", async ({
    mount,
    page,
  }) => {
    await mount(<DisabledRenderedButtonLink />);

    const link = page.locator("a", { hasText: "Disabled link" });
    await expect(link).toHaveAttribute("aria-disabled", "true");
    await expect(link).toHaveAttribute("tabindex", "-1");
    await expect(link).not.toHaveAttribute("href");

    await link.click({ force: true });
    await expect(page.locator("body")).not.toHaveAttribute(
      "data-disabled-render-click",
      "true",
    );
    await expect(page.locator("body")).not.toHaveAttribute(
      "data-disabled-button-link-click",
      "true",
    );
  });
});
