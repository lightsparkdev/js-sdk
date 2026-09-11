import { test, expect } from "@playwright/experimental-ct-react";
import {
  TriggerEnabled,
  TriggerNoMore,
  TriggerLoading,
  TriggerCustomRender,
  SentinelTriggersOnScroll,
  SentinelDoesNotRefireWhileLoading,
  SentinelDisabled,
  StatusAnnouncements,
  StatusLoading,
  StatusEnd,
  ContextOutsideRoot,
  AnalyticsTrigger,
  HookIntegration,
} from "./LoadMore.test-stories";

test.describe("LoadMore.Trigger", () => {
  test("calls onLoadMore on click and increments the counter", async ({
    mount,
    page,
  }) => {
    await mount(<TriggerEnabled />);
    const trigger = page.getByRole("button", { name: /load more/i });
    await expect(trigger).toBeEnabled();
    await expect(trigger).toHaveAttribute("data-has-more", "true");
    await trigger.click();
    await expect(page.getByTestId("load-count")).toHaveText("Loads: 1");
  });

  test("is disabled when hasMore is false", async ({ mount, page }) => {
    await mount(<TriggerNoMore />);
    const trigger = page.getByRole("button", { name: /load more/i });
    await expect(trigger).toBeDisabled();
    await expect(trigger).toHaveAttribute("data-disabled", "true");
    await expect(trigger).not.toHaveAttribute("data-has-more", "true");
  });

  test("is disabled and aria-busy while loading", async ({ mount, page }) => {
    await mount(<TriggerLoading />);
    const trigger = page.getByRole("button");
    await expect(trigger).toBeDisabled();
    await expect(trigger).toHaveAttribute("aria-busy", "true");
    await expect(trigger).toHaveAttribute("data-loading", "true");
  });

  test("render prop swaps the underlying element and still tracks clicks", async ({
    mount,
    page,
  }) => {
    await mount(<TriggerCustomRender />);
    const trigger = page.getByRole("button", { name: /show more/i });
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.getByTestId("load-count")).toHaveText("Loads: 1");
  });
});

test.describe("LoadMore.Sentinel", () => {
  test("calls onLoadMore when scrolled into view", async ({ mount, page }) => {
    await mount(<SentinelTriggersOnScroll />);
    await expect(page.getByTestId("load-count")).toHaveText("Loads: 0");
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    );
    await expect(page.getByTestId("load-count")).toHaveText("Loads: 1");
    // Stays at 1 — hasMore is now false after the timeout completes.
    await page.waitForTimeout(150);
    await expect(page.getByTestId("load-count")).toHaveText("Loads: 1");
  });

  test("does not refire while loading is held true", async ({
    mount,
    page,
  }) => {
    await mount(<SentinelDoesNotRefireWhileLoading />);
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    );
    await expect(page.getByTestId("load-count")).toHaveText("Loads: 1");
    await page.waitForTimeout(200);
    await expect(page.getByTestId("load-count")).toHaveText("Loads: 1");
  });

  test("renders no DOM when disabled", async ({ mount, page }) => {
    await mount(<SentinelDisabled />);
    await expect(page.getByTestId("sentinel")).toHaveCount(0);
  });
});

test.describe("LoadMore.Status", () => {
  test("renders 'More available' by default with aria-live polite", async ({
    mount,
    page,
  }) => {
    await mount(<StatusAnnouncements />);
    const status = page.getByTestId("status");
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(status).toHaveAttribute("aria-atomic", "true");
    await expect(status).toHaveText("More available");
  });

  test("announces loading text", async ({ mount, page }) => {
    await mount(<StatusLoading />);
    await expect(page.getByTestId("status")).toHaveText("Loading more results");
    await expect(page.getByTestId("status")).toHaveAttribute(
      "data-loading",
      "true",
    );
  });

  test("announces end-of-results text", async ({ mount, page }) => {
    await mount(<StatusEnd />);
    await expect(page.getByTestId("status")).toHaveText("End of results");
    await expect(page.getByTestId("status")).toHaveAttribute(
      "data-end",
      "true",
    );
  });
});

test.describe("Context safety", () => {
  test("Trigger throws when used outside Root", async ({ mount, page }) => {
    await mount(<ContextOutsideRoot />);
    await expect(page.getByTestId("error")).toHaveText(
      /must be placed within <LoadMore.Root>/,
    );
  });
});

test.describe("Analytics", () => {
  test("emits LoadMore.click with part metadata when analyticsName is set", async ({
    mount,
    page,
  }) => {
    await mount(<AnalyticsTrigger />);
    await page.getByRole("button", { name: /load more/i }).click();
    const log = await page.getByTestId("analytics-log").textContent();
    expect(log).toBeTruthy();
    const events = JSON.parse(log ?? "[]");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      name: "results",
      component: "LoadMore",
      interaction: "click",
      metadata: { part: "trigger" },
    });
  });
});

test.describe("Hook integration", () => {
  test("paginates via useLoadMore until hasMore is false", async ({
    mount,
    page,
  }) => {
    await mount(<HookIntegration />);
    await expect(page.getByTestId("items").locator("li")).toHaveCount(5);

    const trigger = page.getByRole("button", { name: /load more/i });
    await trigger.click();
    await expect(page.getByTestId("items").locator("li")).toHaveCount(10);

    await trigger.click();
    await expect(page.getByTestId("items").locator("li")).toHaveCount(15);
    await expect(trigger).toBeDisabled();
  });
});
