/**
 * Loader Playwright CT tests.
 *
 * Covers behavior that needs a real browser: rendered geometry, computed
 * token styling, the rotation animation and reduced-motion handling, and
 * axe scans.
 *
 * Static attribute contracts (variant markup, svg attributes, aria-label
 * plumbing) live in Loader.unit.test.tsx.
 */

import { test, expect } from "@playwright/experimental-ct-react";
import AxeBuilder from "@axe-core/playwright";
import {
  DefaultLoader,
  RingLoader,
  RingSmallLoader,
  RingCustomLabel,
} from "./Loader.test-stories";

const axeConfig = {
  rules: {
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
    region: { enabled: false },
  },
};

test.describe("Loader", () => {
  test("dots variant has no accessibility violations", async ({
    mount,
    page,
  }) => {
    await mount(<DefaultLoader />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("ring variant has no accessibility violations", async ({
    mount,
    page,
  }) => {
    await mount(<RingLoader />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("ring resolves its accessible name from the label", async ({
    mount,
    page,
  }) => {
    await mount(<RingCustomLabel />);
    const loader = page.getByRole("status");
    await expect(loader).toHaveAccessibleName("Settling");
  });

  // Size tests emulate reduced motion: boundingBox on a rotating square
  // reports the rotated bounds (up to size * sqrt(2) at 45 degrees).
  test("ring renders at the 24px reference size by default", async ({
    mount,
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mount(<RingLoader />);
    const box = await page.locator("svg").boundingBox();
    expect(box?.width).toBe(24);
    expect(box?.height).toBe(24);
  });

  test("ring scales to a custom size", async ({ mount, page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mount(<RingSmallLoader />);
    const box = await page.locator("svg").boundingBox();
    expect(box?.width).toBe(12);
    expect(box?.height).toBe(12);
  });

  test("track and indicator resolve token strokes", async ({ mount, page }) => {
    await mount(<RingLoader />);

    const track = page.locator("circle");
    const indicator = page.locator("path");

    const trackStyle = await track.evaluate((el) => {
      const style = getComputedStyle(el);
      return { stroke: style.stroke, strokeWidth: style.strokeWidth };
    });
    const indicatorStyle = await indicator.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        stroke: style.stroke,
        strokeWidth: style.strokeWidth,
        strokeLinecap: style.strokeLinecap,
      };
    });

    // Tokens must resolve to real paint values, not fall back to `none`.
    expect(trackStyle.stroke).not.toBe("none");
    expect(indicatorStyle.stroke).not.toBe("none");
    expect(indicatorStyle.stroke).not.toBe(trackStyle.stroke);
    // Both strokes derive from --stroke-lg; compare against the token's
    // resolved value rather than hard-coding it.
    const strokeToken = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--stroke-lg")
        .trim(),
    );
    expect(strokeToken).not.toBe("");
    expect(trackStyle.strokeWidth).toBe(strokeToken);
    expect(indicatorStyle.strokeWidth).toBe(strokeToken);
    expect(indicatorStyle.strokeLinecap).toBe("round");
  });

  test("ring rotates continuously", async ({ mount, page }) => {
    await mount(<RingLoader />);

    const svg = page.locator("svg");
    const animation = await svg.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        name: style.animationName,
        duration: style.animationDuration,
        iterationCount: style.animationIterationCount,
      };
    });

    expect(animation.name).not.toBe("none");
    expect(animation.duration).toBe("0.5s");
    expect(animation.iterationCount).toBe("infinite");
  });

  test("ring respects reduced motion preference", async ({ mount, page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mount(<RingLoader />);

    const animationName = await page
      .locator("svg")
      .evaluate((el) => getComputedStyle(el).animationName);

    expect(animationName).toBe("none");

    // The frozen quarter-arc is hidden; the track renders a static full
    // ring in the indicator color at lowered opacity.
    const indicatorOpacity = await page
      .locator("path")
      .evaluate((el) => getComputedStyle(el).opacity);
    const trackOpacity = await page
      .locator("circle")
      .evaluate((el) => getComputedStyle(el).opacity);

    expect(indicatorOpacity).toBe("0");
    expect(trackOpacity).toBe("0.3");
  });
});
