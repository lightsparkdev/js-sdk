import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultMeter,
  ZeroMeter,
  FullMeter,
  LowMeter,
  HighMeter,
  TrackOnlyMeter,
  CustomRangeMeter,
} from "./Meter.test-stories";

test.describe("Meter", () => {
  test.describe("default behavior", () => {
    test("renders with meter role", async ({ mount, page }) => {
      await mount(<DefaultMeter />);
      const meter = page.getByRole("meter");
      await expect(meter).toBeVisible();
    });

    test("displays label text", async ({ mount, page }) => {
      await mount(<DefaultMeter />);
      await expect(page.getByText("Storage used")).toBeVisible();
    });

    test("displays formatted value", async ({ mount, page }) => {
      await mount(<DefaultMeter />);
      await expect(page.getByText("50%")).toBeVisible();
    });
  });

  test.describe("value states", () => {
    test("shows 0% when empty", async ({ mount, page }) => {
      await mount(<ZeroMeter />);
      await expect(page.getByText("0%")).toBeVisible();
    });

    test("shows 100% when full", async ({ mount, page }) => {
      await mount(<FullMeter />);
      await expect(page.getByText("100%")).toBeVisible();
    });

    test("shows low value", async ({ mount, page }) => {
      await mount(<LowMeter />);
      await expect(page.getByText("25%")).toBeVisible();
    });

    test("shows high value", async ({ mount, page }) => {
      await mount(<HighMeter />);
      await expect(page.getByText("90%")).toBeVisible();
    });
  });

  test.describe("without label", () => {
    test("renders track without label", async ({ mount, page }) => {
      await mount(<TrackOnlyMeter />);
      const meter = page.getByRole("meter");
      await expect(meter).toBeVisible();
    });
  });

  test.describe("custom range", () => {
    test("renders with custom min/max", async ({ mount, page }) => {
      await mount(<CustomRangeMeter />);
      const meter = page.getByRole("meter");
      await expect(meter).toHaveAttribute("aria-valuemax", "200");
    });
  });

  test.describe("ARIA attributes", () => {
    test("has aria-valuenow", async ({ mount, page }) => {
      await mount(<DefaultMeter />);
      const meter = page.getByRole("meter");
      await expect(meter).toHaveAttribute("aria-valuenow", "50");
    });

    test("has aria-valuemin", async ({ mount, page }) => {
      await mount(<DefaultMeter />);
      const meter = page.getByRole("meter");
      await expect(meter).toHaveAttribute("aria-valuemin", "0");
    });

    test("has aria-valuemax", async ({ mount, page }) => {
      await mount(<DefaultMeter />);
      const meter = page.getByRole("meter");
      await expect(meter).toHaveAttribute("aria-valuemax", "100");
    });
  });
});
