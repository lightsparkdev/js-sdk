import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicPagination,
  FirstPage,
  LastPage,
  SinglePage,
  MiddlePage,
  EmptyState,
  ControlledPagination,
  CustomRangeFormat,
  AnchorRender,
  AnchorRenderFirstPage,
  WithoutTotals,
  ContextConsumer,
} from "./Pagination.test-stories";

test.describe("Pagination", () => {
  test.describe("Structure", () => {
    test("renders navigation with Previous and Next buttons", async ({
      mount,
      page,
    }) => {
      await mount(<BasicPagination />);

      const nav = page.getByRole("navigation", { name: /pagination/i });
      await expect(nav).toBeVisible();

      const prevButton = page.getByRole("button", { name: /previous/i });
      const nextButton = page.getByRole("button", { name: /next/i });
      await expect(prevButton).toBeVisible();
      await expect(nextButton).toBeVisible();
    });

    test("renders label text", async ({ mount, page }) => {
      await mount(<FirstPage />);

      await expect(page.getByText("Items per page")).toBeVisible();
    });

    test("renders range text", async ({ mount, page }) => {
      await mount(<FirstPage />);

      // Should show "1–100 of 2.5K"
      await expect(page.getByText(/1–100 of 2\.5K/)).toBeVisible();
    });

    test("renders last page range correctly", async ({ mount, page }) => {
      await mount(<LastPage />);

      // Page 25 of 2500 items at 100 per page = items 2401-2500
      await expect(page.getByText(/2401–2500 of 2\.5K/)).toBeVisible();
    });
  });

  test.describe("Navigation States", () => {
    test("Previous is disabled on first page", async ({ mount, page }) => {
      await mount(<FirstPage />);

      const prevButton = page.getByRole("button", { name: /previous/i });
      await expect(prevButton).toBeDisabled();
    });

    test("Next is disabled on last page", async ({ mount, page }) => {
      await mount(<LastPage />);

      const nextButton = page.getByRole("button", { name: /next/i });
      await expect(nextButton).toBeDisabled();
    });

    test("both buttons disabled for single page", async ({ mount, page }) => {
      await mount(<SinglePage />);

      const prevButton = page.getByRole("button", { name: /previous/i });
      const nextButton = page.getByRole("button", { name: /next/i });
      await expect(prevButton).toBeDisabled();
      await expect(nextButton).toBeDisabled();
    });

    test("both buttons enabled for middle pages", async ({ mount, page }) => {
      await mount(<MiddlePage />);

      const prevButton = page.getByRole("button", { name: /previous/i });
      const nextButton = page.getByRole("button", { name: /next/i });
      await expect(prevButton).toBeEnabled();
      await expect(nextButton).toBeEnabled();
    });
  });

  test.describe("Empty State", () => {
    test("shows 0–0 for empty state", async ({ mount, page }) => {
      await mount(<EmptyState />);

      await expect(page.getByText(/0–0 of 0/)).toBeVisible();
    });

    test("both buttons disabled for empty state", async ({ mount, page }) => {
      await mount(<EmptyState />);

      const prevButton = page.getByRole("button", { name: /previous/i });
      const nextButton = page.getByRole("button", { name: /next/i });
      await expect(prevButton).toBeDisabled();
      await expect(nextButton).toBeDisabled();
    });
  });

  test.describe("Interaction", () => {
    test("clicking Previous goes to previous page", async ({ mount, page }) => {
      await mount(<ControlledPagination />);

      await expect(page.getByTestId("current-page")).toHaveText(
        "Current page: 5",
      );

      await page.getByRole("button", { name: /previous/i }).click();
      await expect(page.getByTestId("current-page")).toHaveText(
        "Current page: 4",
      );
    });

    test("clicking Next goes to next page", async ({ mount, page }) => {
      await mount(<ControlledPagination />);

      await expect(page.getByTestId("current-page")).toHaveText(
        "Current page: 5",
      );

      await page.getByRole("button", { name: /next/i }).click();
      await expect(page.getByTestId("current-page")).toHaveText(
        "Current page: 6",
      );
    });
  });

  test.describe("Keyboard Navigation", () => {
    test("nav buttons are focusable", async ({ mount, page }) => {
      await mount(<MiddlePage />);

      const prevButton = page.getByRole("button", { name: /previous/i });
      await prevButton.focus();
      await expect(prevButton).toBeFocused();
    });

    test("Enter activates nav button", async ({ mount, page }) => {
      await mount(<ControlledPagination />);

      const nextButton = page.getByRole("button", { name: /next/i });
      await nextButton.focus();
      await page.keyboard.press("Enter");

      await expect(page.getByTestId("current-page")).toHaveText(
        "Current page: 6",
      );
    });
  });

  test.describe("Custom Render", () => {
    test("supports custom range format", async ({ mount, page }) => {
      await mount(<CustomRangeFormat />);

      await expect(page.getByText(/Showing/)).toBeVisible();
      await expect(page.getByText(/1-100/)).toBeVisible();
      await expect(page.getByText(/of/)).toBeVisible();
      await expect(page.getByText(/2500/)).toBeVisible();
    });
  });

  test.describe("Render Prop", () => {
    test("Previous and Next render as anchors when render prop is set", async ({
      mount,
      page,
    }) => {
      await mount(<AnchorRender />);

      const prev = page.getByTestId("prev");
      const next = page.getByTestId("next");

      await expect(prev).toHaveJSProperty("tagName", "A");
      await expect(next).toHaveJSProperty("tagName", "A");
      await expect(prev).toHaveAttribute("href", "?page=2");
      await expect(next).toHaveAttribute("href", "?page=4");
    });
  });

  test.describe("Data Attributes", () => {
    test("Root exposes data-page and data-first-page on first page", async ({
      mount,
      page,
    }) => {
      await mount(<FirstPage />);

      const nav = page.getByRole("navigation", { name: /pagination/i });
      await expect(nav).toHaveAttribute("data-page", "1");
      await expect(nav).toHaveAttribute("data-first-page", "");
      await expect(nav).not.toHaveAttribute("data-last-page", "");
    });

    test("Root exposes data-last-page on last page", async ({
      mount,
      page,
    }) => {
      await mount(<LastPage />);

      const nav = page.getByRole("navigation", { name: /pagination/i });
      await expect(nav).toHaveAttribute("data-page", "25");
      await expect(nav).toHaveAttribute("data-last-page", "");
      await expect(nav).not.toHaveAttribute("data-first-page", "");
    });

    test("nav buttons expose data-disabled when disabled", async ({
      mount,
      page,
    }) => {
      await mount(<FirstPage />);

      const prev = page.getByRole("button", { name: /previous/i });
      const next = page.getByRole("button", { name: /next/i });
      await expect(prev).toHaveAttribute("data-disabled", "");
      await expect(next).not.toHaveAttribute("data-disabled", "");
    });

    test("disabled anchor renders carry data-disabled and aria-disabled", async ({
      mount,
      page,
    }) => {
      await mount(<AnchorRenderFirstPage />);

      const prev = page.getByTestId("prev");
      await expect(prev).toHaveAttribute("data-disabled", "");
      await expect(prev).toHaveAttribute("aria-disabled", "true");
    });
  });

  test.describe("Optional totals", () => {
    test("Next does not auto-disable when totalItems is omitted", async ({
      mount,
      page,
    }) => {
      await mount(<WithoutTotals />);

      const next = page.getByRole("button", { name: /next/i });
      await expect(next).toBeEnabled();
    });

    test("Previous still auto-disables on first page without totalItems", async ({
      mount,
      page,
    }) => {
      await mount(<WithoutTotals />);

      const prev = page.getByRole("button", { name: /previous/i });
      await expect(prev).toBeDisabled();
    });

    test("Range custom render receives undefined totals", async ({
      mount,
      page,
    }) => {
      await mount(<WithoutTotals />);
      await expect(page.getByText(/Page 1/)).toBeVisible();
    });
  });

  test.describe("Context Hook", () => {
    test("usePaginationContext exposes current page to consumer parts", async ({
      mount,
      page,
    }) => {
      await mount(<ContextConsumer />);
      await expect(page.getByTestId("ctx-page")).toHaveText("7");
    });
  });

  test.describe("Styling", () => {
    test("navigation buttons have correct size", async ({ mount, page }) => {
      await mount(<MiddlePage />);

      const prevButton = page.getByRole("button", { name: /previous/i });
      const box = await prevButton.boundingBox();

      expect(box?.width).toBe(24);
      expect(box?.height).toBe(24);
    });

    test("buttons have correct border radius for joined appearance", async ({
      mount,
      page,
    }) => {
      await mount(<MiddlePage />);

      const prevButton = page.getByRole("button", { name: /previous/i });
      const nextButton = page.getByRole("button", { name: /next/i });

      // Left button: rounded on left, square on right
      const prevRadius = await prevButton.evaluate(
        (el) => getComputedStyle(el).borderRadius,
      );
      expect(prevRadius).toBe("6px 0px 0px 6px");

      // Right button: square on left, rounded on right
      const nextRadius = await nextButton.evaluate(
        (el) => getComputedStyle(el).borderRadius,
      );
      expect(nextRadius).toBe("0px 6px 6px 0px");
    });
  });
});
