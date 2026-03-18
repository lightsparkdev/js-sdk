import { test, expect } from "@playwright/experimental-ct-react";
import {
  TestDefault,
  TestClosed,
  TestNonModal,
  TestControlled,
  TestSnapPoints,
  TestWithHandle,
  TestSidePanel,
  TestStackedSidePanel,
  TestEndingStackedRightPanel,
  TestEndingStackedLeftPanel,
  TestNestedRightPanel,
  TestNestedRightPanelStacked,
  TestNestedLeftPanel,
  TestNestedLeftPanelStacked,
  TestNestedTopSheet,
  TestNestedTopSheetStacked,
  TestNested,
  TestIndent,
} from "./Drawer.test-stories";

function getScaleXFromTransform(transform: string): number | null {
  const match = transform.match(/matrix\(([^)]+)\)/);

  if (!match) {
    return null;
  }

  const [scaleX] = match[1].split(",").map((value) => Number(value.trim()));
  return Number.isNaN(scaleX) ? null : scaleX;
}

async function getResolvedColor(
  page: import("@playwright/experimental-ct-react").Page,
  cssProperty: "backgroundColor" | "outlineColor",
  token: string,
) {
  return page.evaluate(
    ({ cssProperty, token }) => {
      const probe = document.createElement("div");
      if (cssProperty === "backgroundColor") {
        probe.style.backgroundColor = `var(${token})`;
      } else {
        probe.style.outline = `1px solid var(${token})`;
      }
      document.body.appendChild(probe);
      const resolved = getComputedStyle(probe)[cssProperty];
      probe.remove();
      return resolved;
    },
    { cssProperty, token },
  );
}

test.describe("Drawer", () => {
  test.describe("Core", () => {
    test("has no accessibility violations", async ({ mount, page }) => {
      await mount(<TestDefault />);
      const AxeBuilder = (await import("@axe-core/playwright")).default;
      const results = await new AxeBuilder({ page })
        .exclude("html")
        .disableRules(["landmark-one-main", "page-has-heading-one", "region"])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test("renders popup when defaultOpen", async ({ mount, page }) => {
      await mount(<TestDefault />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();
      await expect(popup).toHaveAttribute("data-open", "");
    });

    test("renders title and description", async ({ mount, page }) => {
      await mount(<TestDefault />);
      await expect(page.getByTestId("title")).toHaveText("Drawer title");
      await expect(page.getByTestId("description")).toHaveText(
        "Drawer description",
      );
    });

    test("renders backdrop", async ({ mount, page }) => {
      await mount(<TestDefault />);
      const backdrop = page.getByTestId("backdrop");
      await expect(backdrop).toBeAttached();
    });

    test("uses surface-primary and border-primary by default", async ({
      mount,
      page,
    }) => {
      await mount(<TestDefault />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();

      const expectedBackgroundColor = await getResolvedColor(
        page,
        "backgroundColor",
        "--surface-primary",
      );
      const expectedOutlineColor = await getResolvedColor(
        page,
        "outlineColor",
        "--border-primary",
      );

      const popupStyles = await popup.evaluate((element) => {
        const styles = getComputedStyle(element);
        return {
          backgroundColor: styles.backgroundColor,
          outlineColor: styles.outlineColor,
        };
      });

      expect(popupStyles.backgroundColor).toBe(expectedBackgroundColor);
      expect(popupStyles.outlineColor).toBe(expectedOutlineColor);
    });
  });

  test.describe("Interaction", () => {
    test("opens on trigger click", async ({ mount, page }) => {
      await mount(<TestClosed />);
      const popup = page.getByTestId("popup");
      await expect(popup).not.toBeVisible();

      await page.getByTestId("trigger").click();
      await expect(popup).toBeVisible();
    });

    test("closes on close button click", async ({ mount, page }) => {
      await mount(<TestDefault />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();

      await page.getByTestId("close").click();
      await expect(popup).not.toBeVisible();
    });

    test("closes on escape", async ({ mount, page }) => {
      await mount(<TestDefault />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(popup).not.toBeVisible();
    });

    test("closes on backdrop click", async ({ mount, page }) => {
      await mount(<TestClosed />);
      await page.getByTestId("trigger").click();
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();

      await page.mouse.click(10, 10);
      await expect(popup).not.toBeVisible();
    });
  });

  test.describe("Non-modal", () => {
    test("renders without backdrop", async ({ mount, page }) => {
      await mount(<TestNonModal />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();
    });

    test("allows clicks on background content", async ({ mount, page }) => {
      await mount(<TestNonModal />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();

      const bgButton = page.getByTestId("background-button");
      await bgButton.click({ force: true });
      await expect(bgButton).toHaveText("Clicked");
    });
  });

  test.describe("Controlled", () => {
    test("opens via external state and closes via close button", async ({
      mount,
      page,
    }) => {
      await mount(<TestControlled />);
      const popup = page.getByTestId("popup");
      await expect(popup).not.toBeVisible();

      await page.getByTestId("toggle").click();
      await expect(popup).toBeVisible();

      await page.getByTestId("close").click();
      await expect(popup).not.toBeVisible();
    });
  });

  test.describe("Snap points", () => {
    test("renders at snap point offset", async ({ mount, page }) => {
      await mount(<TestSnapPoints />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();

      const transform = await popup.evaluate(
        (el) => getComputedStyle(el).transform,
      );
      expect(transform).not.toBe("none");
    });
  });

  test.describe("Handle", () => {
    test("renders handle bar element", async ({ mount, page }) => {
      await mount(<TestWithHandle />);
      const handle = page.getByTestId("handle");
      await expect(handle).toBeVisible();
    });

    test("handle is hidden from accessibility tree", async ({
      mount,
      page,
    }) => {
      await mount(<TestWithHandle />);
      const handle = page.getByTestId("handle");
      await expect(handle).toHaveAttribute("aria-hidden", "true");
    });
  });

  test.describe("Side panel", () => {
    test("renders with swipe direction attribute", async ({ mount, page }) => {
      await mount(<TestSidePanel />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();
      await expect(popup).toHaveAttribute("data-swipe-direction", "right");
    });

    test("adds a popup hook when nestedMotion is stack", async ({
      mount,
      page,
    }) => {
      await mount(<TestStackedSidePanel />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();
      await expect(popup).toHaveAttribute("data-nested-motion", "stack");
    });

    test("keeps stacked right panel scaled while exiting", async ({
      mount,
      page,
    }) => {
      await mount(<TestEndingStackedRightPanel />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();

      const transform = await popup.evaluate(
        (element) => getComputedStyle(element).transform,
      );
      expect(getScaleXFromTransform(transform)).toBeCloseTo(0.95, 2);
    });

    test("keeps stacked left panel scaled while exiting", async ({
      mount,
      page,
    }) => {
      await mount(<TestEndingStackedLeftPanel />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();

      const transform = await popup.evaluate(
        (element) => getComputedStyle(element).transform,
      );
      expect(getScaleXFromTransform(transform)).toBeCloseTo(0.95, 2);
    });

    test("closes on escape", async ({ mount, page }) => {
      await mount(<TestSidePanel />);
      const popup = page.getByTestId("popup");
      await expect(popup).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(popup).not.toBeVisible();
    });
  });

  test.describe("Nested drawers", () => {
    test("parent visible, child opens on trigger click", async ({
      mount,
      page,
    }) => {
      await mount(<TestNested />);
      const parentPopup = page.getByTestId("parent-popup");
      await expect(parentPopup).toBeVisible();

      const childTrigger = page.getByTestId("child-trigger");
      await expect(childTrigger).toBeVisible();

      await childTrigger.click();
      const childPopup = page.getByTestId("child-popup");
      await expect(childPopup).toBeVisible();
    });

    test("keeps default nested right panels unstacked", async ({
      mount,
      page,
    }) => {
      await mount(<TestNestedRightPanel />);
      const parentPopup = page.getByTestId("parent-popup");

      const beforeTransform = await parentPopup.evaluate(
        (element) => getComputedStyle(element).transform,
      );

      await page.getByTestId("child-trigger").click();
      await expect(parentPopup).toHaveAttribute("data-nested-drawer-open", "");

      await expect
        .poll(
          async () =>
            parentPopup.evaluate(
              (element) => getComputedStyle(element).transform,
            ),
          { timeout: 1000 },
        )
        .toBe(beforeTransform);
    });

    test("stacks nested right panels when opted in", async ({
      mount,
      page,
    }) => {
      await mount(<TestNestedRightPanelStacked />);
      const parentPopup = page.getByTestId("parent-popup");
      const childPopup = page.getByTestId("child-popup");

      const beforeTransform = await parentPopup.evaluate(
        (element) => getComputedStyle(element).transform,
      );

      await page.getByTestId("child-trigger").click();
      await expect(parentPopup).toHaveAttribute("data-nested-drawer-open", "");
      await expect(childPopup).toBeVisible();

      await expect
        .poll(
          async () =>
            parentPopup.evaluate(
              (element) => getComputedStyle(element).transform,
            ),
          { timeout: 1000 },
        )
        .not.toBe(beforeTransform);

      await expect
        .poll(
          async () => {
            const parentBox = await parentPopup.boundingBox();
            const childBox = await childPopup.boundingBox();

            if (!parentBox || !childBox) {
              return null;
            }

            return Number((childBox.x - parentBox.x).toFixed(2));
          },
          { timeout: 1000 },
        )
        .toBeGreaterThanOrEqual(11);

      await expect
        .poll(
          async () => {
            const parentBox = await parentPopup.boundingBox();
            const childBox = await childPopup.boundingBox();

            if (!parentBox || !childBox) {
              return null;
            }

            return Number((childBox.x - parentBox.x).toFixed(2));
          },
          { timeout: 1000 },
        )
        .toBeLessThanOrEqual(13);
    });

    test("keeps default nested left panels unstacked", async ({
      mount,
      page,
    }) => {
      await mount(<TestNestedLeftPanel />);
      const parentPopup = page.getByTestId("parent-popup");

      const beforeTransform = await parentPopup.evaluate(
        (element) => getComputedStyle(element).transform,
      );

      await page.getByTestId("child-trigger").click();
      await expect(parentPopup).toHaveAttribute("data-nested-drawer-open", "");

      await expect
        .poll(
          async () =>
            parentPopup.evaluate(
              (element) => getComputedStyle(element).transform,
            ),
          { timeout: 1000 },
        )
        .toBe(beforeTransform);
    });

    test("stacks nested left panels when opted in", async ({ mount, page }) => {
      await mount(<TestNestedLeftPanelStacked />);
      const parentPopup = page.getByTestId("parent-popup");
      const childPopup = page.getByTestId("child-popup");

      const beforeTransform = await parentPopup.evaluate(
        (element) => getComputedStyle(element).transform,
      );

      await page.getByTestId("child-trigger").click();
      await expect(parentPopup).toHaveAttribute("data-nested-drawer-open", "");
      await expect(childPopup).toBeVisible();

      await expect
        .poll(
          async () =>
            parentPopup.evaluate(
              (element) => getComputedStyle(element).transform,
            ),
          { timeout: 1000 },
        )
        .not.toBe(beforeTransform);

      await expect
        .poll(
          async () => {
            const parentBox = await parentPopup.boundingBox();
            const childBox = await childPopup.boundingBox();

            if (!parentBox || !childBox) {
              return null;
            }

            return Number(
              (
                parentBox.x +
                parentBox.width -
                (childBox.x + childBox.width)
              ).toFixed(2),
            );
          },
          { timeout: 1000 },
        )
        .toBeGreaterThanOrEqual(11);

      await expect
        .poll(
          async () => {
            const parentBox = await parentPopup.boundingBox();
            const childBox = await childPopup.boundingBox();

            if (!parentBox || !childBox) {
              return null;
            }

            return Number(
              (
                parentBox.x +
                parentBox.width -
                (childBox.x + childBox.width)
              ).toFixed(2),
            );
          },
          { timeout: 1000 },
        )
        .toBeLessThanOrEqual(13);
    });

    test("keeps default nested top sheets unstacked", async ({
      mount,
      page,
    }) => {
      await mount(<TestNestedTopSheet />);
      const parentPopup = page.getByTestId("parent-popup");

      const beforeTransform = await parentPopup.evaluate(
        (element) => getComputedStyle(element).transform,
      );

      await page.getByTestId("child-trigger").click();
      await expect(parentPopup).toHaveAttribute("data-nested-drawer-open", "");

      await expect
        .poll(
          async () =>
            parentPopup.evaluate(
              (element) => getComputedStyle(element).transform,
            ),
          { timeout: 1000 },
        )
        .toBe(beforeTransform);
    });

    test("stacks nested top sheets when opted in", async ({ mount, page }) => {
      await mount(<TestNestedTopSheetStacked />);
      const parentPopup = page.getByTestId("parent-popup");

      const beforeTransform = await parentPopup.evaluate(
        (element) => getComputedStyle(element).transform,
      );

      await page.getByTestId("child-trigger").click();
      await expect(parentPopup).toHaveAttribute("data-nested-drawer-open", "");

      await expect
        .poll(
          async () =>
            parentPopup.evaluate(
              (element) => getComputedStyle(element).transform,
            ),
          { timeout: 1000 },
        )
        .not.toBe(beforeTransform);
    });
  });

  test.describe("Indent effect", () => {
    test("indent element receives data-active when drawer is open", async ({
      mount,
      page,
    }) => {
      await mount(<TestIndent />);
      const indent = page.getByTestId("indent");
      await expect(indent).toHaveAttribute("data-active", "");
    });
  });
});
