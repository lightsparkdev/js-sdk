import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicSkeleton,
  CircleSkeleton,
  CustomClassSkeleton,
  GroupedSkeletons,
  RefSkeleton,
} from "./Skeleton.test-stories";

test.describe("Skeleton", () => {
  test("renders as a div with skeleton styles", async ({ mount, page }) => {
    await mount(<BasicSkeleton />);
    const skeleton = page.getByTestId("skeleton");
    await expect(skeleton).toBeVisible();

    const tagName = await skeleton.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe("div");
  });

  test("standalone skeleton has ::before pseudo-element with animation", async ({
    mount,
    page,
  }) => {
    await mount(<BasicSkeleton />);
    const skeleton = page.getByTestId("skeleton");
    const animation = await skeleton.evaluate(
      (el) => getComputedStyle(el, "::before").animationName,
    );
    expect(animation).not.toBe("none");
  });

  test("merges custom className", async ({ mount, page }) => {
    await mount(<CustomClassSkeleton />);
    const skeleton = page.getByTestId("skeleton");
    const classes = await skeleton.evaluate((el) => el.className);
    expect(classes).toContain("custom-class");
  });

  test("accepts inline styles for shape control", async ({ mount, page }) => {
    await mount(<CircleSkeleton />);
    const skeleton = page.getByTestId("skeleton");
    const width = await skeleton.evaluate((el) => getComputedStyle(el).width);
    expect(width).toBe("48px");
  });

  test("forwards ref", async ({ mount, page }) => {
    await mount(<RefSkeleton />);
    const tag = page.getByTestId("tag");
    await expect(tag).toHaveText("DIV");
  });
});

test.describe("Skeleton.Group", () => {
  test("group wrapper renders with position relative", async ({
    mount,
    page,
  }) => {
    await mount(<GroupedSkeletons />);
    const group = page.getByTestId("group");
    await expect(group).toBeVisible();
    const position = await group.evaluate(
      (el) => getComputedStyle(el).position,
    );
    expect(position).toBe("relative");
  });

  test("grouped skeletons have mask applied", async ({ mount, page }) => {
    await mount(<GroupedSkeletons />);
    const skeleton = page.getByTestId("skeleton-circle");
    const mask = await skeleton.evaluate((el) => {
      const style = getComputedStyle(el);
      return style.maskImage || style.webkitMaskImage || "";
    });
    expect(mask).not.toBe("none");
    expect(mask).not.toBe("");
  });

  test("grouped skeletons have ::before with animation", async ({
    mount,
    page,
  }) => {
    await mount(<GroupedSkeletons />);
    const skeleton = page.getByTestId("skeleton-line1");
    const animation = await skeleton.evaluate(
      (el) => getComputedStyle(el, "::before").animationName,
    );
    expect(animation).not.toBe("none");
  });

  test("all grouped elements share the same animation", async ({
    mount,
    page,
  }) => {
    await mount(<GroupedSkeletons />);
    const circle = page.getByTestId("skeleton-circle");
    const line1 = page.getByTestId("skeleton-line1");
    const line2 = page.getByTestId("skeleton-line2");

    const [anim1, anim2, anim3] = await Promise.all([
      circle.evaluate((el) => getComputedStyle(el, "::before").animationName),
      line1.evaluate((el) => getComputedStyle(el, "::before").animationName),
      line2.evaluate((el) => getComputedStyle(el, "::before").animationName),
    ]);

    expect(anim1).toBe(anim2);
    expect(anim2).toBe(anim3);
  });
});
