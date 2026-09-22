import {
  expect,
  test,
  type Locator,
  type Page,
} from "@playwright/experimental-ct-react";
import {
  BasicToast,
  InfoToast,
  InvalidToast,
  LayoutToast,
  MultipleToasts,
  NoAutoDismiss,
  PlacementToast,
  StackedToasts,
  StateAttributeOverrideToast,
  SuccessToast,
  TimedStackedToasts,
  ToastWithAction,
  ToastWithDescription,
  ToastWithHostileGlobalMargins,
  ToastWithTextLinks,
  ViewportRefCleanup,
  WarningToast,
} from "./Toast.test-stories";
import { resolveTokenColor } from "@test-utils/resolveTokenColor";

const SEMANTIC_ICON_EXPECTATIONS = {
  info: "rgb(0, 114, 219)",
  success: "rgb(26, 26, 26)",
  warning: "rgb(224, 144, 0)",
  invalid: "rgb(204, 9, 9)",
} as const;

async function assertSemanticIcon(
  page: Page,
  variant: keyof typeof SEMANTIC_ICON_EXPECTATIONS,
) {
  await page.getByTestId("trigger").click();
  await expect(page.locator(`[data-variant="${variant}"]`)).toBeVisible();
  const icon = page.getByTestId("semantic-icon");
  const expectedIcon = page.getByTestId("expected-semantic-icon");

  await expect(icon).toBeVisible();
  await expect(icon).toHaveCSS("color", SEMANTIC_ICON_EXPECTATIONS[variant]);
  await expect(icon).toHaveCSS("width", "24px");
  await expect(icon).toHaveCSS("height", "24px");
  const [actualMarkup, expectedMarkup] = await Promise.all([
    icon.locator("svg").evaluate((element) => element.innerHTML),
    expectedIcon.locator("svg").evaluate((element) => element.innerHTML),
  ]);
  expect(actualMarkup).toBe(expectedMarkup);
}

async function waitForAnimations(locator: Locator) {
  await locator.evaluate(async (element) => {
    await Promise.all(
      element
        .getAnimations()
        .map((animation) => animation.finished.catch(() => undefined)),
    );
  });
}

async function assertConstrainedLayout(page: Page, layout: "compact" | "pill") {
  const toast = page.getByRole("dialog");
  await expect(toast).toHaveAttribute("data-layout", layout);
  await expect(toast).toHaveCSS("height", "36px");
  await expect(
    page.getByText("Description should only appear in Default."),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Undo" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Close toast" })).toHaveCount(
    0,
  );
  await expect(page.getByTestId("semantic-icon")).toHaveCSS("width", "16px");
}

async function getVerticalBounds(locator: Locator) {
  return locator.evaluate((element) => {
    const { bottom, height, left, right, top, width } =
      element.getBoundingClientRect();
    return { bottom, height, left, right, top, width };
  });
}

async function getLayoutSize(locator: Locator) {
  return locator.evaluate((element) => ({
    height: element.offsetHeight,
    width: element.offsetWidth,
  }));
}

function getToast(page: Page, title: string) {
  return page.locator('[role="dialog"]').filter({ hasText: title });
}

async function addStackToast(page: Page, number: number) {
  await page.getByTestId("stack-trigger").click();
  const toast = getToast(page, `Toast ${number}`);
  await expect(toast).toBeAttached();
  await waitForAnimations(toast);
  return toast;
}

async function getCustomPixelValue(locator: Locator, property: string) {
  return locator.evaluate(
    (element, name) =>
      Number.parseFloat(
        window.getComputedStyle(element).getPropertyValue(name),
      ),
    property,
  );
}

async function observeTimedCollapsedPromotion(
  viewport: Locator,
  naturalBehindHeight: number,
) {
  await viewport.evaluate((viewportElement, expectedNaturalHeight) => {
    const samples: Array<{
      baseMeasurementCleared: boolean;
      behindHeight: number;
      frontmostHeight: number | null;
      phase: "visible" | "ending" | "promoting";
    }> = [];
    let animationFrame = 0;
    let frontmostSeen = false;

    const finish = () => {
      viewportElement.dataset.promotionObservation = JSON.stringify(samples);
    };

    const sampleFrame = () => {
      const behindElement = viewportElement.querySelector<HTMLElement>(
        '[data-layout="default"]',
      );
      const frontmostElement = viewportElement.querySelector<HTMLElement>(
        '[data-layout="pill"]',
      );

      if (frontmostElement && behindElement) {
        frontmostSeen = true;
        samples.push({
          baseMeasurementCleared:
            viewportElement.style
              .getPropertyValue("--toast-frontmost-height")
              .trim() === "",
          behindHeight: behindElement.offsetHeight,
          frontmostHeight: frontmostElement.offsetHeight,
          phase: frontmostElement.hasAttribute("data-ending-style")
            ? "ending"
            : "visible",
        });
      } else if (frontmostSeen && behindElement) {
        const behindHeight = behindElement.offsetHeight;
        samples.push({
          baseMeasurementCleared:
            viewportElement.style
              .getPropertyValue("--toast-frontmost-height")
              .trim() === "",
          behindHeight,
          frontmostHeight: null,
          phase: "promoting",
        });

        if (behindHeight === expectedNaturalHeight) {
          finish();
          return;
        }
      }

      animationFrame = requestAnimationFrame(sampleFrame);
    };

    animationFrame = requestAnimationFrame(sampleFrame);

    window.addEventListener(
      "pagehide",
      () => {
        cancelAnimationFrame(animationFrame);
      },
      { once: true },
    );
  }, naturalBehindHeight);
}

test.describe("Toast", () => {
  test("runs a forwarded Viewport callback ref cleanup on unmount", async ({
    mount,
    page,
  }) => {
    await mount(<ViewportRefCleanup />);
    const cleanupCount = page.getByTestId("viewport-ref-cleanup-count");
    const countBeforeUnmount = Number(await cleanupCount.textContent());

    await page.getByTestId("unmount-viewport").click();

    await expect(cleanupCount).toHaveText(String(countBeforeUnmount + 1));
  });

  test("renders Default content and wires action callbacks", async ({
    mount,
    page,
  }) => {
    await mount(<ToastWithAction />);
    await page.getByTestId("trigger").click();

    const toast = page.getByRole("dialog");
    await expect(toast).toHaveAttribute("data-layout", "default");
    await expect(page.getByText("Toast title")).toBeVisible();
    await expect(page.getByText("Toast description.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
    await expect(toast).toHaveCSS("width", "320px");

    await page.getByTestId("action").click();
    await expect(page.getByTestId("action-count")).toHaveText("1");
  });

  test("defaults the viewport and stack to bottom placement", async ({
    mount,
    page,
  }) => {
    await mount(<BasicToast />);
    const viewport = page.getByRole("region", { name: "Notifications" });

    await expect(viewport).toHaveAttribute("data-placement", "bottom");
    await expect(viewport).toHaveCSS("bottom", "16px");
    expect(
      await viewport.evaluate(
        (element) =>
          window.innerHeight - element.getBoundingClientRect().bottom,
      ),
    ).toBe(16);
  });

  for (const [placement, direction] of [
    ["bottom", 1],
    ["top", -1],
  ] as const) {
    test(`${placement} placement anchors and uses its edge for normal enter and exit`, async ({
      mount,
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await mount(<PlacementToast placement={placement} />);
      const viewport = page.getByRole("region", { name: "Notifications" });

      await expect(viewport).toHaveAttribute("data-placement", placement);
      await expect(viewport).toHaveCSS(placement, "16px");
      expect(
        await viewport.evaluate((element, edge) => {
          const bounds = element.getBoundingClientRect();
          return edge === "top"
            ? bounds.top
            : window.innerHeight - bounds.bottom;
        }, placement),
      ).toBe(16);

      await page.getByTestId("trigger").click();
      const toast = page.getByRole("dialog");
      await waitForAnimations(toast);
      const transitionDirections = await toast.evaluate((element) => {
        const directionFor = (
          attribute: "data-ending-style" | "data-starting-style",
        ) => {
          element.removeAttribute("data-ending-style");
          element.removeAttribute("data-starting-style");
          element.setAttribute(attribute, "");
          return Math.sign(
            new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
          );
        };

        return {
          enter: directionFor("data-starting-style"),
          exit: directionFor("data-ending-style"),
        };
      });

      expect(transitionDirections).toEqual({
        enter: direction,
        exit: direction,
      });
    });
  }

  test("top placement stacks and expands away from the top edge", async ({
    mount,
    page,
  }) => {
    await mount(<MultipleToasts placement="top" />);
    const trigger = page.getByTestId("multi-trigger");
    await trigger.click();
    await trigger.click();

    const oldest = getToast(page, "Toast 1");
    const newest = getToast(page, "Toast 2");
    await Promise.all([waitForAnimations(oldest), waitForAnimations(newest)]);
    const [collapsedOldest, collapsedNewest] = await Promise.all([
      getVerticalBounds(oldest),
      getVerticalBounds(newest),
    ]);
    expect(collapsedOldest.top).toBeGreaterThan(collapsedNewest.top);

    await newest.hover();
    await Promise.all([waitForAnimations(oldest), waitForAnimations(newest)]);
    const [expandedOldest, expandedNewest] = await Promise.all([
      getVerticalBounds(oldest),
      getVerticalBounds(newest),
    ]);
    expect(expandedOldest.top).toBeGreaterThanOrEqual(expandedNewest.bottom);
  });

  test("styles native and rendered text links as inline Origin links", async ({
    mount,
    page,
  }) => {
    await mount(<ToastWithTextLinks />);
    await page.getByTestId("trigger").click();

    const nativeLink = page.getByTestId("native-toast-link");
    const renderedLink = page.getByTestId("rendered-toast-link");
    const renderedButton = page.getByTestId("rendered-toast-button");
    const linkColor = await resolveTokenColor(page, "--text-link");
    const title = page.getByRole("heading", { name: /Read the/ });

    await expect(nativeLink).toHaveAttribute("href", "/docs");
    await expect(nativeLink).toHaveCSS("color", linkColor);
    await expect(nativeLink).toHaveCSS("display", "inline");
    await expect(nativeLink).toHaveCSS("text-decoration-line", "underline");
    await expect(nativeLink).toHaveCSS(
      "font-size",
      await title.evaluate((element) => getComputedStyle(element).fontSize),
    );
    await expect(renderedLink).toHaveAttribute("href", "/settings");
    await expect(renderedLink).toHaveAttribute("data-router-link", "");
    await expect(renderedLink).toHaveClass(/consumer-toast-link/);
    await expect(renderedLink).toHaveClass(/router-toast-link/);
    await expect(renderedLink).toHaveCSS("color", linkColor);
    await expect(renderedButton).toHaveRole("button");
    await expect(renderedButton).toHaveCSS("margin", "0px");
    await expect(renderedButton).toHaveCSS("padding", "0px");
    await expect(renderedButton).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
    await expect(renderedButton).toHaveCSS("border-top-width", "0px");
    await expect(renderedButton).toHaveCSS("cursor", "pointer");
    await expect(renderedButton).toHaveCSS("text-decoration-line", "underline");
  });

  test("neutralizes global heading and paragraph margins", async ({
    mount,
    page,
  }) => {
    await mount(<ToastWithHostileGlobalMargins />);
    await page.getByTestId("trigger").click();

    const title = page.getByRole("heading", { name: "Toast title" });
    const description = page.getByText("Toast description.");

    await expect(title).toHaveCSS("margin-top", "0px");
    await expect(title).toHaveCSS("margin-bottom", "0px");
    await expect(description).toHaveCSS("margin-top", "0px");
    await expect(description).toHaveCSS("margin-bottom", "0px");
  });

  test("renders responsive neutral feedback without an icon", async ({
    mount,
    page,
  }) => {
    await page.setViewportSize({ width: 280, height: 400 });
    await mount(<BasicToast />);
    await page.getByTestId("trigger").click();

    await expect(page.getByTestId("semantic-icon")).toHaveCount(0);
    const width = await page
      .getByRole("dialog")
      .evaluate((element) => element.getBoundingClientRect().width);
    expect(width).toBeLessThanOrEqual(248);
  });

  test("renders the info semantic icon", async ({ mount, page }) => {
    await mount(<InfoToast />);
    await assertSemanticIcon(page, "info");
  });

  test("centers single-line content with its semantic icon", async ({
    mount,
    page,
  }) => {
    await mount(<InfoToast />);
    await page.getByTestId("trigger").click();

    const toast = page.getByRole("dialog");
    const icon = page.getByTestId("semantic-icon");
    const title = page.getByRole("heading", { name: "Info toast" });
    const [toastBounds, iconBounds, titleBounds] = await Promise.all([
      getVerticalBounds(toast),
      getVerticalBounds(icon),
      getVerticalBounds(title),
    ]);
    const toastCenter = toastBounds.top + toastBounds.height / 2;

    expect(iconBounds.top + iconBounds.height / 2).toBe(toastCenter);
    expect(titleBounds.top + titleBounds.height / 2).toBe(toastCenter);
  });

  test("renders the success semantic icon", async ({ mount, page }) => {
    await mount(<SuccessToast />);
    await assertSemanticIcon(page, "success");
  });

  test("renders the warning semantic icon", async ({ mount, page }) => {
    await mount(<WarningToast />);
    await assertSemanticIcon(page, "warning");
  });

  test("renders the invalid semantic icon", async ({ mount, page }) => {
    await mount(<InvalidToast />);
    await assertSemanticIcon(page, "invalid");
  });

  test("Compact is fixed-width, one-line, and non-actionable", async ({
    mount,
    page,
  }) => {
    await mount(<LayoutToast layout="compact" />);
    await page.getByTestId("trigger").click();

    await assertConstrainedLayout(page, "compact");
    await expect(page.getByRole("dialog")).toHaveCSS("width", "320px");
  });

  test("Pill is content-width, one-line, and non-actionable", async ({
    mount,
    page,
  }) => {
    await mount(<LayoutToast layout="pill" />);
    await page.getByTestId("trigger").click();

    await assertConstrainedLayout(page, "pill");
    const width = await page
      .getByRole("dialog")
      .evaluate((element) => element.getBoundingClientRect().width);
    expect(width).toBeLessThan(320);
  });

  test("incrementally re-indexes mixed layouts with shared collapsed geometry", async ({
    mount,
    page,
  }) => {
    await mount(<StackedToasts />);

    const viewport = page.getByRole("region", { name: "Notifications" });
    const oldest = await addStackToast(page, 1);
    await expect(oldest).toHaveAttribute("data-layout", "default");
    await expect(oldest).toHaveCSS("--toast-index", "0");
    const firstBounds = await getVerticalBounds(oldest);
    expect(firstBounds.height).toBeGreaterThan(36);
    await expect
      .poll(() => getCustomPixelValue(viewport, "--toast-frontmost-height"))
      .toBeCloseTo(firstBounds.height, 0);

    const middle = await addStackToast(page, 2);
    await expect(middle).toHaveAttribute("data-layout", "compact");
    await expect(middle).toHaveCSS("--toast-index", "0");
    await expect(oldest).toHaveCSS("--toast-index", "1");
    await expect(middle).toHaveCSS("height", "36px");
    await expect(oldest).toHaveCSS("height", "36px");
    await expect
      .poll(() => getCustomPixelValue(viewport, "--toast-frontmost-height"))
      .toBe(36);

    const newest = await addStackToast(page, 3);
    await expect(newest).toHaveAttribute("data-layout", "pill");
    await expect(newest).toHaveCSS("--toast-index", "0");
    await expect(middle).toHaveCSS("--toast-index", "1");
    await expect(oldest).toHaveCSS("--toast-index", "2");
    const oldestContent = oldest.locator("[data-behind]");

    await expect(viewport).not.toHaveAttribute("data-expanded", "");
    await expect(newest).toHaveCSS("position", "absolute");
    await expect(oldest).toHaveCSS("pointer-events", "none");
    await expect(oldestContent).toHaveCSS("opacity", "0");
    const hiddenAction = oldest.locator("button", { hasText: "Undo 1" });
    const hiddenClose = oldest.locator('[aria-label="Close toast"]');
    await expect(hiddenAction).toHaveCSS("visibility", "hidden");
    await expect(hiddenAction).toHaveCSS("pointer-events", "none");
    await expect(hiddenClose).toHaveCSS("visibility", "hidden");
    await expect(hiddenClose).toHaveCSS("pointer-events", "none");
    await waitForAnimations(newest);

    const [collapsedOldest, collapsedMiddle, collapsedNewest] =
      await Promise.all([
        getLayoutSize(oldest),
        getLayoutSize(middle),
        getLayoutSize(newest),
      ]);
    expect(collapsedOldest.height).toBe(36);
    expect(collapsedMiddle.height).toBe(36);
    expect(collapsedNewest.height).toBe(36);
    expect(collapsedOldest.width).toBe(collapsedNewest.width);
    expect(collapsedMiddle.width).toBe(collapsedNewest.width);
    await expect
      .poll(() => getCustomPixelValue(viewport, "--toast-frontmost-height"))
      .toBe(36);

    const [middleBounds, frontBounds] = await Promise.all([
      getVerticalBounds(middle),
      getVerticalBounds(newest),
    ]);
    expect(middleBounds.bottom).toBeGreaterThan(frontBounds.top);
    const hitToastText = await page.evaluate(
      ({ x, y }) =>
        document
          .elementFromPoint(x, y)
          ?.closest('[role="dialog"]')
          ?.textContent?.trim(),
      {
        x: frontBounds.left + 2,
        y: frontBounds.top + frontBounds.height / 2,
      },
    );
    expect(hitToastText).toContain("Toast 3");

    const [middleZIndex, newestZIndex] = await Promise.all([
      middle.evaluate((element) =>
        Number(window.getComputedStyle(element).zIndex),
      ),
      newest.evaluate((element) =>
        Number(window.getComputedStyle(element).zIndex),
      ),
    ]);
    expect(newestZIndex).toBeGreaterThan(middleZIndex);
  });

  test("restores each mixed layout's size when the stack expands", async ({
    mount,
    page,
  }) => {
    await mount(<StackedToasts />);
    const oldest = await addStackToast(page, 1);
    const middle = await addStackToast(page, 2);
    const newest = await addStackToast(page, 3);
    const viewport = page.getByRole("region", { name: "Notifications" });
    const collapsedWidth = (await getLayoutSize(newest)).width;

    await newest.hover();
    await expect(viewport).toHaveAttribute("data-expanded", "");
    await expect(oldest).toHaveAttribute("data-expanded", "");
    await expect(oldest).toHaveCSS("pointer-events", "auto");
    await expect(oldest.locator("[data-behind]")).toHaveCSS("opacity", "1");
    await expect(oldest.locator("button", { hasText: "Undo 1" })).toHaveCSS(
      "pointer-events",
      "auto",
    );
    await Promise.all([
      waitForAnimations(oldest),
      waitForAnimations(middle),
      waitForAnimations(newest),
    ]);

    const [expandedOldest, expandedMiddle, expandedNewest] = await Promise.all([
      getVerticalBounds(oldest),
      getVerticalBounds(middle),
      getVerticalBounds(newest),
    ]);
    expect(expandedOldest.height).toBeGreaterThan(36);
    expect(expandedMiddle.height).toBe(36);
    expect(expandedNewest.height).toBe(36);
    expect(expandedNewest.width).toBeLessThan(collapsedWidth);
    expect(expandedOldest.bottom).toBeLessThanOrEqual(expandedMiddle.top);
    expect(expandedMiddle.bottom).toBeLessThanOrEqual(expandedNewest.top);
  });

  test("preserves limited measurements during immediate runtime promotion", async ({
    mount,
    page,
  }) => {
    await mount(<StackedToasts adjustableLimit limit={2} />);

    const oldest = await addStackToast(page, 1);
    await addStackToast(page, 2);
    await addStackToast(page, 3);

    await expect(oldest).toHaveAttribute("data-limited", "");
    await expect(oldest).toHaveAttribute("inert", "");
    await expect(oldest).toHaveCSS("visibility", "hidden");
    await expect(oldest).toHaveCSS("opacity", "0");
    await expect(oldest).toHaveCSS("pointer-events", "none");
    expect(await oldest.evaluate((element) => element.offsetHeight)).toBe(36);
    expect(await getCustomPixelValue(oldest, "--toast-height")).toBeGreaterThan(
      36,
    );

    await oldest.evaluate((element) => {
      const observer = new MutationObserver(() => {
        if (!element.hasAttribute("data-limited")) {
          element.setAttribute(
            "data-height-on-promotion",
            String(element.offsetHeight),
          );
          observer.disconnect();
        }
      });
      observer.observe(element, {
        attributeFilter: ["data-limited"],
        attributes: true,
      });
    });

    await page.getByTestId("increase-limit").click();
    await expect(oldest).not.toHaveAttribute("data-limited", "");
    await expect(oldest).not.toHaveAttribute("inert", "");
    await expect(oldest).toHaveAttribute("data-height-on-promotion", "36");
    await expect(oldest).toBeVisible();
    const viewport = page.getByRole("region", { name: "Notifications" });
    await expect(viewport).not.toHaveAttribute("data-expanded", "");
    await waitForAnimations(oldest);
    await expect(oldest).toHaveCSS("height", "36px");
  });

  test("holds shared collapsed height while a timed Pill promotes Default", async ({
    mount,
    page,
  }) => {
    await mount(<TimedStackedToasts />);
    const trigger = page.getByTestId("timed-stack-trigger");

    await trigger.click();
    const defaultToast = getToast(page, "Tall Default toast");
    await expect(defaultToast).toBeAttached();
    await waitForAnimations(defaultToast);
    const naturalDefaultHeight = (await getLayoutSize(defaultToast)).height;
    expect(naturalDefaultHeight).toBeGreaterThan(0);

    const viewport = page.getByRole("region", { name: "Notifications" });
    await observeTimedCollapsedPromotion(viewport, naturalDefaultHeight);
    await trigger.click();
    const pillToast = getToast(page, "Timed Pill toast");
    await expect(pillToast).toBeAttached();

    await expect(viewport).toHaveAttribute("data-promotion-observation", /.+/);
    const samples = await viewport.evaluate(
      (element) =>
        JSON.parse(element.dataset.promotionObservation ?? "[]") as Array<{
          baseMeasurementCleared: boolean;
          behindHeight: number;
          frontmostHeight: number | null;
          phase: "visible" | "ending" | "promoting";
        }>,
    );
    const visibleSamples = samples.filter(({ phase }) => phase === "visible");
    const endingSamples = samples.filter(({ phase }) => phase === "ending");
    const promotingSamples = samples.filter(
      ({ phase }) => phase === "promoting",
    );
    const sharedHeight = visibleSamples.at(-1)?.frontmostHeight ?? 0;

    expect(visibleSamples.length).toBeGreaterThan(1);
    expect(sharedHeight).toBeGreaterThan(0);
    expect(naturalDefaultHeight).toBeGreaterThan(sharedHeight);
    expect(visibleSamples.at(-1)?.behindHeight).toBe(sharedHeight);
    expect(endingSamples.length).toBeGreaterThan(1);
    expect(
      endingSamples.some(
        ({ baseMeasurementCleared }) => baseMeasurementCleared,
      ),
    ).toBe(true);
    expect(
      new Set(endingSamples.map(({ behindHeight }) => behindHeight)),
    ).toEqual(new Set([sharedHeight]));
    expect(
      new Set(endingSamples.map(({ frontmostHeight }) => frontmostHeight)),
    ).toEqual(new Set([sharedHeight]));
    expect(promotingSamples.length).toBeGreaterThan(1);
    expect(promotingSamples.at(-1)?.behindHeight).toBe(naturalDefaultHeight);

    await expect(pillToast).not.toBeAttached();
    expect((await getLayoutSize(defaultToast)).height).toBe(
      naturalDefaultHeight,
    );
  });

  test("internal layout and variant attributes cannot be overridden", async ({
    mount,
    page,
  }) => {
    await mount(<StateAttributeOverrideToast />);
    await page.getByTestId("trigger").click();

    const toast = page.getByRole("dialog");
    await expect(toast).toHaveAttribute("data-layout", "compact");
    await expect(toast).toHaveAttribute("data-variant", "success");
    await expect(page.getByTestId("semantic-icon")).toHaveCSS("width", "16px");
  });

  test("closes persistent feedback with its rendered control", async ({
    mount,
    page,
  }) => {
    await mount(<NoAutoDismiss />);
    await page.getByTestId("trigger").click();
    const toast = page.getByText("Persistent toast");

    await expect(toast).toBeVisible();
    await page.getByLabel("Close toast").click();
    await expect(toast).toBeHidden();
  });

  test("expands the stack for F6 keyboard focus", async ({ mount, page }) => {
    await mount(<StackedToasts />);
    await addStackToast(page, 1);
    await addStackToast(page, 2);
    const newest = await addStackToast(page, 3);

    const viewport = page.getByRole("region", { name: "Notifications" });
    await page.keyboard.press("F6");
    await expect(viewport).toBeFocused();
    await expect(viewport).toHaveAttribute("data-expanded", "");
    await page.keyboard.press("Tab");
    await expect(newest).toBeFocused();
    await expect(newest).toHaveCSS("outline-style", "solid");
  });

  test("removes stack and content transitions for reduced motion", async ({
    mount,
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mount(<StackedToasts />);
    const oldest = await addStackToast(page, 1);
    await addStackToast(page, 2);
    await addStackToast(page, 3);

    await expect(oldest).toHaveCSS("transition", "none");
    await expect(oldest.locator("[data-behind]")).toHaveCSS(
      "transition",
      "none",
    );
  });

  test("uses directional swipe movement when dismissing", async ({
    mount,
    page,
  }) => {
    await mount(<NoAutoDismiss />);
    await page.getByTestId("trigger").click();
    const toast = page.getByRole("dialog");
    await toast.hover();
    await waitForAnimations(toast);
    const box = await toast.evaluate((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    });

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 10, box.y + box.height / 2, {
      steps: 2,
    });
    await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2, {
      steps: 5,
    });
    await page.mouse.up();
    await expect(toast).toHaveAttribute("data-ending-style", "");
    await page.waitForTimeout(100);

    const translateX = await toast.evaluate((element) => {
      const transform = window.getComputedStyle(element).transform;
      return new DOMMatrixReadOnly(transform).m41;
    });
    expect(translateX).toBeGreaterThan(100);
  });
});
