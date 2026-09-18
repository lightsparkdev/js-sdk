import { expect, test } from "@playwright/experimental-ct-react";
import {
  TestNativeFormValidation,
  TestOriginFormValidation,
} from "./DatePicker.test-stories";

test.describe("DatePicker form validation", () => {
  test("prevents native Enter submission and validates synchronously", async ({
    mount,
    page,
  }) => {
    await mount(<TestNativeFormValidation />);
    const input = page.getByRole("textbox", { name: "Date" });
    await input.fill("02/31/2026");
    await input.press("Enter");

    await expect(page.getByTestId("submit-count")).toHaveText("0");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toBeFocused();
  });

  test("blocks Origin Form submit and focuses its first invalid field", async ({
    mount,
    page,
  }) => {
    await mount(<TestOriginFormValidation />);
    const start = page.getByRole("textbox", { name: "Start date" });
    const end = page.getByRole("textbox", { name: "End date" });
    await start.fill("02/31/2026");
    await start.press("Enter");
    await end.fill("02/32/2026");
    await end.press("Enter");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByTestId("submit-count")).toHaveText("0");
    await expect(start).toBeFocused();
  });
});
