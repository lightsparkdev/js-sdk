import { test, expect } from "@playwright/experimental-ct-react";

test.describe("global styles", () => {
  test("text-wrap: pretty is inherited from body", async ({ mount, page }) => {
    await mount(<p>Origin typography default</p>);

    await expect(page.locator("body")).toHaveCSS("text-wrap", "pretty");
    await expect(page.locator("p")).toHaveCSS("text-wrap", "pretty");
  });
});
