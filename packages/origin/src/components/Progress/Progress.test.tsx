import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultProgress,
  ZeroProgress,
  CompleteProgress,
  IndeterminateProgress,
  TrackOnlyProgress,
  ControlledProgress,
} from "./Progress.test-stories";

test.describe("Progress", () => {
  test.describe("default behavior", () => {
    test("renders with progressbar role", async ({ mount, page }) => {
      await mount(<DefaultProgress />);
      const progressbar = page.getByRole("progressbar");
      await expect(progressbar).toBeVisible();
    });

    test("displays label text", async ({ mount, page }) => {
      await mount(<DefaultProgress />);
      await expect(page.getByText("Export data")).toBeVisible();
    });

    test("displays formatted value", async ({ mount, page }) => {
      await mount(<DefaultProgress />);
      await expect(page.getByText("50%")).toBeVisible();
    });
  });

  test.describe("value states", () => {
    test("shows 0% at start", async ({ mount, page }) => {
      await mount(<ZeroProgress />);
      await expect(page.getByText("0%")).toBeVisible();
    });

    test("shows 100% when complete", async ({ mount, page }) => {
      await mount(<CompleteProgress />);
      await expect(page.getByText("100%")).toBeVisible();
    });

    test("has data-complete when value equals max", async ({ mount, page }) => {
      await mount(<CompleteProgress />);
      const progressbar = page.getByRole("progressbar");
      await expect(progressbar).toHaveAttribute("data-complete", "");
    });

    test("has data-progressing when in progress", async ({ mount, page }) => {
      await mount(<DefaultProgress />);
      const progressbar = page.getByRole("progressbar");
      await expect(progressbar).toHaveAttribute("data-progressing", "");
    });
  });

  test.describe("indeterminate state", () => {
    test("has data-indeterminate when value is null", async ({
      mount,
      page,
    }) => {
      await mount(<IndeterminateProgress />);
      const progressbar = page.getByRole("progressbar");
      await expect(progressbar).toHaveAttribute("data-indeterminate", "");
    });
  });

  test.describe("without label", () => {
    test("renders track without label", async ({ mount, page }) => {
      await mount(<TrackOnlyProgress />);
      const progressbar = page.getByRole("progressbar");
      await expect(progressbar).toBeVisible();
    });
  });

  test.describe("controlled mode", () => {
    test("updates when value changes", async ({ mount, page }) => {
      await mount(<ControlledProgress />);
      await expect(page.getByText("25%")).toBeVisible();

      await page.getByRole("button", { name: "Increase" }).click();
      await expect(page.getByText("50%")).toBeVisible();
    });
  });
});
