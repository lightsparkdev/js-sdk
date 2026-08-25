import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicStepper,
  ControlledStepper,
  NestedStepper,
  NonInteractiveStepper,
  LockedStepper,
  CustomProgressLabelStepper,
  OutOfRangeProgressStepper,
} from "./Stepper.test-stories";

test.describe("Stepper", () => {
  test.describe("Core", () => {
    test("has no accessibility violations", async ({ mount, page }) => {
      await mount(<NestedStepper />);
      const AxeBuilder = (await import("@axe-core/playwright")).default;
      const results = await new AxeBuilder({ page })
        .exclude("html")
        .disableRules([
          "landmark-one-main",
          "page-has-heading-one",
          "region",
          // TODO: [A11y] text/secondary on surface/sunken = 3.7:1 (needs 4.5:1)
          // Flagged for token audit - re-enable after tokens are updated
          "color-contrast",
        ])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("renders navigation with accessible name", async ({ mount, page }) => {
      await mount(<BasicStepper />);
      const nav = page.getByRole("navigation", { name: "Setup progress" });
      await expect(nav).toBeVisible();
    });

    test("renders each step as a list item", async ({ mount }) => {
      const component = await mount(<BasicStepper />);
      await expect(component.getByRole("listitem")).toHaveCount(3);
    });

    test("marks only the current step's trigger with aria-current", async ({
      mount,
    }) => {
      const component = await mount(<BasicStepper value="details" />);
      const details = component.getByRole("button", { name: "Details" });
      const account = component.getByRole("button", { name: "Account" });

      await expect(details).toHaveAttribute("aria-current", "step");
      await expect(account).not.toHaveAttribute("aria-current", "step");
    });

    test("exposes completion state through data-status", async ({ mount }) => {
      const component = await mount(<BasicStepper />);
      const items = component.getByRole("listitem");

      await expect(items.nth(0)).toHaveAttribute("data-status", "complete");
      await expect(items.nth(1)).toHaveAttribute("data-status", "partial");
      await expect(items.nth(2)).toHaveAttribute("data-status", "upcoming");
    });
  });

  test.describe("state transitions via props", () => {
    test("moving value moves aria-current", async ({ mount }) => {
      const component = await mount(<BasicStepper value="account" />);
      const account = component.getByRole("button", { name: "Account" });
      await expect(account).toHaveAttribute("aria-current", "step");

      await component.update(<BasicStepper value="review" />);
      const review = component.getByRole("button", { name: "Review" });
      await expect(review).toHaveAttribute("aria-current", "step");
      await expect(account).not.toHaveAttribute("aria-current", "step");
    });

    test("click reports the step value and controlled value follows", async ({
      mount,
    }) => {
      let lastValue: string | null = null;
      const component = await mount(
        <ControlledStepper onValueChange={(v) => (lastValue = v)} />,
      );
      const review = component.getByRole("button", { name: "Review" });

      await review.click();
      await expect(review).toHaveAttribute("aria-current", "step");
      expect(lastValue).toBe("review");
    });
  });

  test.describe("Keyboard", () => {
    test("Tab moves focus through step triggers", async ({ mount, page }) => {
      const component = await mount(<BasicStepper />);
      const account = component.getByRole("button", { name: "Account" });
      const details = component.getByRole("button", { name: "Details" });

      await account.focus();
      await page.keyboard.press("Tab");
      await expect(details).toBeFocused();
    });

    test("Enter activates the focused step", async ({ mount, page }) => {
      const component = await mount(<ControlledStepper />);
      const review = component.getByRole("button", { name: "Review" });

      await review.focus();
      await page.keyboard.press("Enter");
      await expect(review).toHaveAttribute("aria-current", "step");
    });
  });

  test.describe("Non-interactive", () => {
    test("renders no buttons without activation handlers", async ({
      mount,
    }) => {
      const component = await mount(<NonInteractiveStepper />);
      await expect(component.getByRole("button")).toHaveCount(0);
      // Content and current-step semantics are preserved.
      await expect(component.getByText("Details")).toBeVisible();
      await expect(component.locator('[aria-current="step"]')).toHaveCount(1);
    });

    test("triggers are not tab stops", async ({ mount, page }) => {
      const component = await mount(<NonInteractiveStepper />);
      await page.keyboard.press("Tab");
      const focusedTriggers = component.locator(
        '[aria-current="step"]:focus, div:focus',
      );
      await expect(focusedTriggers).toHaveCount(0);
    });
  });

  test.describe("Disabled", () => {
    test("disabled trigger is skipped by Tab", async ({ mount, page }) => {
      const component = await mount(<LockedStepper />);
      const details = component.getByRole("button", { name: "Details" });
      const review = component.getByRole("button", { name: "Review" });

      await expect(review).toBeDisabled();
      await details.focus();
      await page.keyboard.press("Tab");
      await expect(review).not.toBeFocused();
    });

    test("disabled trigger is visually muted", async ({ mount }) => {
      const component = await mount(<LockedStepper />);
      const review = component.getByRole("button", { name: "Review" });

      await expect(review).toHaveCSS("cursor", "default");
      // --text-secondary
      await expect(component.getByText("Review")).toHaveCSS(
        "color",
        "rgb(124, 124, 124)",
      );
    });
  });

  test.describe("Substeps", () => {
    test("renders substeps as a nested list", async ({ mount }) => {
      const component = await mount(<NestedStepper />);
      // 3 top-level steps + 3 substeps.
      await expect(component.getByRole("listitem")).toHaveCount(6);
      await expect(
        component.getByRole("button", { name: "Profile" }),
      ).toBeVisible();
    });

    test("current substep carries aria-current", async ({ mount }) => {
      const component = await mount(<NestedStepper value="address" />);
      const address = component.getByRole("button", { name: "Address" });
      const parent = component.getByRole("listitem").first();

      await expect(address).toHaveAttribute("aria-current", "step");
      await expect(parent).not.toHaveAttribute("data-current", "");
    });

    test("parent renders active on first paint while its substep is current", async ({
      mount,
    }) => {
      const component = await mount(<NestedStepper value="address" />);
      // Immediately after mount — the active treatment is pure CSS (:has),
      // so no effect pass is needed for the parent label's medium weight.
      await expect(component.getByText("Details")).toHaveCSS(
        "font-weight",
        "500",
      );
      // A sibling top-level step stays at regular weight.
      await expect(component.getByText("Review")).toHaveCSS(
        "font-weight",
        "400",
      );
    });
  });

  test.describe("Progress", () => {
    test("unfinished step's accessible name includes its progress", async ({
      mount,
    }) => {
      const component = await mount(<NestedStepper />);
      const details = component.getByRole("button", {
        name: "Details 1 of 3 complete",
      });
      await expect(details).toBeVisible();
    });

    test("complete steps omit progress from the accessible name", async ({
      mount,
    }) => {
      const component = await mount(<NestedStepper />);
      const verification = component.getByRole("button", {
        name: "Verification",
        exact: true,
      });
      await expect(verification).toBeVisible();
    });

    test("formatProgressLabel overrides the progress text", async ({
      mount,
    }) => {
      const component = await mount(<CustomProgressLabelStepper />);
      const details = component.getByRole("button", {
        name: "Details 1/3 done",
      });
      await expect(details).toBeVisible();
    });

    test("out-of-range progress is clamped for the accessible name", async ({
      mount,
    }) => {
      const component = await mount(<OutOfRangeProgressStepper />);
      // completed > total clamps to total.
      const details = component.getByRole("button", {
        name: "Details 5 of 5 complete",
      });
      await expect(details).toBeVisible();
      // A non-positive total carries no information: no progress announced.
      const review = component.getByRole("button", {
        name: "Review",
        exact: true,
      });
      await expect(review).toBeVisible();
      // Non-finite values carry no information either: no progress announced.
      const confirm = component.getByRole("button", {
        name: "Confirm",
        exact: true,
      });
      await expect(confirm).toBeVisible();
    });
  });

  test.describe("Markers", () => {
    test("markers are hidden from assistive technology", async ({ mount }) => {
      const component = await mount(<BasicStepper />);
      await expect(
        component.locator('[aria-hidden="true"]').first(),
      ).toBeAttached();
      // The triggers' names come only from their labels.
      await expect(
        component.getByRole("button", { name: "Account" }),
      ).toBeVisible();
    });
  });
});
