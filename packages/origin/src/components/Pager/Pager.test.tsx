import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicPager,
  NoPreviousCursor,
  NoNextCursor,
  BothEdges,
  ControlledPager,
  PagerWithLinkRender,
  PagerWithCustomLabel,
  PagerWithPreventDefault,
  ExplicitDisabledOverride,
  PagerSideBySidePagination,
} from "./Pager.test-stories";

test.describe("Pager", () => {
  test.describe("Structure", () => {
    test("renders nav with Navigation, Previous, and Next", async ({
      mount,
      page,
    }) => {
      await mount(<BasicPager />);

      const nav = page.getByRole("navigation", { name: "Pager" });
      await expect(nav).toBeVisible();

      const group = page.getByRole("group", { name: "Page navigation" });
      await expect(group).toBeVisible();

      await expect(
        page.getByRole("button", { name: "Previous page" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Next page" }),
      ).toBeVisible();
    });

    test("renders Status with polite live region", async ({ mount, page }) => {
      await mount(<BasicPager />);

      const status = page.getByRole("status");
      await expect(status).toHaveText("Showing 25 results");
      await expect(status).toHaveAttribute("aria-live", "polite");
      await expect(status).toHaveAttribute("aria-atomic", "true");
    });
  });

  test.describe("Disabled state derivation", () => {
    test("Previous disabled when hasPrevious is false", async ({
      mount,
      page,
    }) => {
      await mount(<NoPreviousCursor />);

      const prev = page.getByRole("button", { name: "Previous page" });
      await expect(prev).toBeDisabled();
      await expect(prev).toHaveAttribute("data-disabled", "");
    });

    test("Next disabled when hasNext is false", async ({ mount, page }) => {
      await mount(<NoNextCursor />);

      const next = page.getByRole("button", { name: "Next page" });
      await expect(next).toBeDisabled();
      await expect(next).toHaveAttribute("data-disabled", "");
    });

    test("both disabled at empty edges", async ({ mount, page }) => {
      await mount(<BothEdges />);

      await expect(
        page.getByRole("button", { name: "Previous page" }),
      ).toBeDisabled();
      await expect(
        page.getByRole("button", { name: "Next page" }),
      ).toBeDisabled();
    });

    test("both enabled when both cursors present", async ({ mount, page }) => {
      await mount(<BasicPager />);

      await expect(
        page.getByRole("button", { name: "Previous page" }),
      ).toBeEnabled();
      await expect(
        page.getByRole("button", { name: "Next page" }),
      ).toBeEnabled();
    });

    test("explicit disabled prop wins over derived state", async ({
      mount,
      page,
    }) => {
      await mount(<ExplicitDisabledOverride />);

      await expect(
        page.getByRole("button", { name: "Previous page" }),
      ).toBeEnabled();
    });
  });

  test.describe("Interaction", () => {
    test("clicking Previous fires onPrevious", async ({ mount, page }) => {
      await mount(<ControlledPager />);

      await expect(page.getByTestId("cursor")).toHaveText("prev:p1 next:p3");

      await page.getByRole("button", { name: "Previous page" }).click();
      await expect(page.getByTestId("cursor")).toHaveText("prev:null next:p2");
    });

    test("clicking Next fires onNext", async ({ mount, page }) => {
      await mount(<ControlledPager />);

      await page.getByRole("button", { name: "Next page" }).click();
      await expect(page.getByTestId("cursor")).toHaveText("prev:p2 next:null");
    });

    test("preventDefault on consumer onClick suppresses context handler", async ({
      mount,
      page,
    }) => {
      await mount(<PagerWithPreventDefault />);

      await page.getByRole("button", { name: "Previous page" }).click();
      await expect(page.getByTestId("count")).toHaveText("count:0");

      await page.getByRole("button", { name: "Next page" }).click();
      await expect(page.getByTestId("count")).toHaveText("count:1");
    });

    test("Enter and Space activate the buttons", async ({ mount, page }) => {
      await mount(<ControlledPager />);

      const next = page.getByRole("button", { name: "Next page" });
      await next.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("cursor")).toHaveText("prev:p2 next:null");

      const prev = page.getByRole("button", { name: "Previous page" });
      await prev.focus();
      await page.keyboard.press("Space");
      await expect(page.getByTestId("cursor")).toHaveText("prev:p1 next:p3");
    });
  });

  test.describe("Render prop", () => {
    test("swaps Previous and Next to anchor elements", async ({
      mount,
      page,
    }) => {
      await mount(<PagerWithLinkRender />);

      const prev = page.getByRole("link", { name: "Previous page" });
      await expect(prev).toBeVisible();
      await expect(prev).toHaveAttribute("href", "?before=p1");
      await expect(prev).toHaveAttribute("data-direction", "previous");

      const next = page.getByRole("link", { name: "Next page" });
      await expect(next).toBeVisible();
      await expect(next).toHaveAttribute("href", "?after=p2");
      await expect(next).toHaveAttribute("data-direction", "next");
    });

    test("supports custom aria-label and children", async ({ mount, page }) => {
      await mount(<PagerWithCustomLabel />);

      await expect(
        page.getByRole("button", { name: "Older results" }),
      ).toHaveText("Older");
      await expect(
        page.getByRole("button", { name: "Newer results" }),
      ).toHaveText("Newer");
    });
  });

  test.describe("Data attributes", () => {
    test("Root carries data-no-previous and data-no-next on edges", async ({
      mount,
      page,
    }) => {
      await mount(<BothEdges />);

      const root = page.getByRole("navigation", { name: "Pager" });
      await expect(root).toHaveAttribute("data-no-previous", "");
      await expect(root).toHaveAttribute("data-no-next", "");
    });

    test("Root omits data-no-* when both cursors present", async ({
      mount,
      page,
    }) => {
      await mount(<BasicPager />);

      const root = page.getByRole("navigation", { name: "Pager" });
      await expect(root).not.toHaveAttribute("data-no-previous", "");
      await expect(root).not.toHaveAttribute("data-no-next", "");
    });

    test("Previous and Next always carry data-direction", async ({
      mount,
      page,
    }) => {
      await mount(<BasicPager />);

      await expect(
        page.getByRole("button", { name: "Previous page" }),
      ).toHaveAttribute("data-direction", "previous");
      await expect(
        page.getByRole("button", { name: "Next page" }),
      ).toHaveAttribute("data-direction", "next");
    });

    test("data-disabled only when disabled", async ({ mount, page }) => {
      await mount(<BasicPager />);

      const prev = page.getByRole("button", { name: "Previous page" });
      await expect(prev).not.toHaveAttribute("data-disabled", "");
    });
  });

  test.describe("Visual parity with Pagination", () => {
    test("buttons have identical size and border radius", async ({
      mount,
      page,
    }) => {
      await mount(<PagerSideBySidePagination />);

      const pagerButtons = page.getByTestId("pager").getByRole("button");
      const paginationButtons = page
        .getByTestId("pagination")
        .getByRole("button");

      const pagerPrev = pagerButtons.first();
      const pagerNext = pagerButtons.last();
      const paginationPrev = paginationButtons.first();
      const paginationNext = paginationButtons.last();

      const pagerPrevBox = await pagerPrev.boundingBox();
      const pagerNextBox = await pagerNext.boundingBox();
      expect(pagerPrevBox?.width).toBe(24);
      expect(pagerPrevBox?.height).toBe(24);
      expect(pagerNextBox?.width).toBe(24);
      expect(pagerNextBox?.height).toBe(24);

      const pagerPrevRadius = await pagerPrev.evaluate(
        (el) => getComputedStyle(el).borderRadius,
      );
      const pagerNextRadius = await pagerNext.evaluate(
        (el) => getComputedStyle(el).borderRadius,
      );
      expect(pagerPrevRadius).toBe("6px 0px 0px 6px");
      expect(pagerNextRadius).toBe("0px 6px 6px 0px");

      const paginationPrevRadius = await paginationPrev.evaluate(
        (el) => getComputedStyle(el).borderRadius,
      );
      const paginationNextRadius = await paginationNext.evaluate(
        (el) => getComputedStyle(el).borderRadius,
      );
      expect(pagerPrevRadius).toBe(paginationPrevRadius);
      expect(pagerNextRadius).toBe(paginationNextRadius);

      const pagerStyle = await pagerPrev.evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          backgroundColor: cs.backgroundColor,
          borderColor: cs.borderTopColor,
          boxShadow: cs.boxShadow,
        };
      });
      const paginationStyle = await paginationPrev.evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          backgroundColor: cs.backgroundColor,
          borderColor: cs.borderTopColor,
          boxShadow: cs.boxShadow,
        };
      });
      expect(pagerStyle).toEqual(paginationStyle);
    });
  });
});
