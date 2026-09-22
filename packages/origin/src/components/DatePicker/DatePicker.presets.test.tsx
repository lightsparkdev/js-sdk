import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator } from "@playwright/experimental-ct-react";
import {
  TestCompactUtcPresetLayout,
  TestLocaleDE,
  TestPresets,
  TestRangeDateLayout,
  TestSingleDateLayout,
} from "./DatePicker.test-stories";

const axeConfig = {
  rules: {
    // Canonical DatePicker tokens intentionally use secondary text and 50%
    // outside-month numerals; keep this suite focused on structural a11y.
    "color-contrast": { enabled: false },
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
    region: { enabled: false },
  },
};

const LONG_PRESET_LABEL = "Previous 24 hours with a deliberately long label";

async function getVisibleBox(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  if (!box) {
    throw new Error("Expected element to be visible");
  }
  return box;
}

test.describe("DatePicker presets", () => {
  test("keeps compact sections ordered and contained", async ({
    mount,
    page,
  }) => {
    const component = await mount(<TestCompactUtcPresetLayout />);
    const preset = page.getByRole("combobox", { name: "Date preset" });
    const startDate = page.getByRole("textbox", { name: "Start date" });
    const startTime = page.getByRole("textbox", { name: "Start time (UTC)" });
    const endDate = page.getByRole("textbox", { name: "End date" });
    const endTime = page.getByRole("textbox", { name: "End time (UTC)" });
    const startTimeGroup = page.locator("[data-input-group]").filter({
      has: startTime,
    });
    const endTimeGroup = page.locator("[data-input-group]").filter({
      has: endTime,
    });
    const apply = page.getByRole("button", { name: "Apply" });
    const calendar = page.getByRole("grid");

    const [
      presetBox,
      startBox,
      startTimeGroupBox,
      endBox,
      endTimeGroupBox,
      applyBox,
      calendarBox,
    ] = await Promise.all([
      getVisibleBox(preset),
      getVisibleBox(startDate),
      getVisibleBox(startTimeGroup),
      getVisibleBox(endDate),
      getVisibleBox(endTimeGroup),
      getVisibleBox(apply),
      getVisibleBox(calendar),
    ]);

    expect(presetBox.y).toBeGreaterThanOrEqual(
      calendarBox.y + calendarBox.height,
    );
    expect(startBox.y).toBeGreaterThanOrEqual(presetBox.y + presetBox.height);
    expect(endBox.y).toBeGreaterThanOrEqual(startBox.y + startBox.height);
    expect(applyBox.y).toBeGreaterThanOrEqual(endBox.y + endBox.height);
    expect(Math.abs(startBox.x - applyBox.x)).toBeLessThan(2);
    expect(
      Math.abs(
        endTimeGroupBox.x +
          endTimeGroupBox.width -
          (applyBox.x + applyBox.width),
      ),
    ).toBeLessThan(2);
    expect(startTimeGroupBox.x).toBeGreaterThan(startBox.x + startBox.width);
    await expect(endTime).not.toHaveValue(/UTC/);
    expect(
      await startTime.evaluate((input) => {
        const measurement = document.createElement("span");
        const inputStyles = getComputedStyle(input);
        Object.assign(measurement.style, {
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "pre",
          font: inputStyles.font,
        });
        measurement.textContent = input.placeholder;
        document.body.append(measurement);
        const fits =
          measurement.getBoundingClientRect().width <= input.clientWidth;
        measurement.remove();
        return fits;
      }),
    ).toBe(true);
    expect(
      await endTimeGroup.evaluate(
        (group) => group.scrollWidth <= group.clientWidth,
      ),
    ).toBe(true);
    expect(
      await component.evaluate((root) => root.scrollWidth <= root.clientWidth),
    ).toBe(true);

    await startDate.focus();
    expect(
      await startDate.evaluate((input) => getComputedStyle(input).boxShadow),
    ).not.toBe("none");
    await endDate.focus();
    expect(
      await endDate.evaluate((input) => getComputedStyle(input).boxShadow),
    ).not.toBe("none");
  });

  test("aligns navigation controls to calendar columns", async ({
    mount,
    page,
  }) => {
    const component = await mount(<TestCompactUtcPresetLayout />);
    const monthTitle = page.getByText("July 2026", { exact: true });
    const firstWeekday = page.getByRole("columnheader", { name: "Sunday" });
    const previousWeekday = page.getByRole("columnheader", { name: "Friday" });
    const nextWeekday = page.getByRole("columnheader", { name: "Saturday" });
    const previousMonth = page.getByRole("button", {
      name: "Previous month",
    });
    const nextMonth = page.getByRole("button", { name: "Next month" });

    const [
      firstWeekdayBox,
      previousWeekdayBox,
      nextWeekdayBox,
      previousMonthBox,
      nextMonthBox,
    ] = await Promise.all([
      getVisibleBox(firstWeekday),
      getVisibleBox(previousWeekday),
      getVisibleBox(nextWeekday),
      getVisibleBox(previousMonth),
      getVisibleBox(nextMonth),
    ]);
    const monthTitleTextLeft = await monthTitle.evaluate((title) => {
      const range = document.createRange();
      range.selectNodeContents(title);
      return range.getBoundingClientRect().left;
    });
    const opticalNudge = await component.evaluate((root) =>
      parseFloat(getComputedStyle(root).getPropertyValue("--spacing-3xs")),
    );
    const firstWeekdayCenter = firstWeekdayBox.x + firstWeekdayBox.width / 2;

    expect(firstWeekdayCenter - monthTitleTextLeft).toBeGreaterThan(0);
    expect(firstWeekdayCenter - monthTitleTextLeft).toBeLessThanOrEqual(
      opticalNudge + 2,
    );
    expect(
      Math.abs(
        previousMonthBox.x +
          previousMonthBox.width / 2 -
          (previousWeekdayBox.x + previousWeekdayBox.width / 2),
      ),
    ).toBeLessThan(2);
    expect(
      Math.abs(
        nextMonthBox.x +
          nextMonthBox.width / 2 -
          (nextWeekdayBox.x + nextWeekdayBox.width / 2),
      ),
    ).toBeLessThan(2);
  });

  test("keeps a localized month heading clear of navigation", async ({
    mount,
    page,
  }) => {
    const component = await mount(<TestLocaleDE />);
    const title = page.getByText("Februar 2026", { exact: true });
    const previousMonth = page.getByRole("button", {
      name: "Previous month",
    });

    const previousMonthBox = await getVisibleBox(previousMonth);
    const titleRight = await title.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect().right;
    });

    expect(titleRight).toBeLessThan(previousMonthBox.x);
    expect(
      await component.evaluate((root) => root.scrollWidth <= root.clientWidth),
    ).toBe(true);
  });

  test("truncates long labels and preserves the Custom transition", async ({
    mount,
    page,
  }) => {
    await page.clock.setFixedTime(new Date("2026-07-31T17:30:45.000Z"));
    const component = await mount(<TestPresets />);

    const trigger = page.getByRole("combobox", { name: "Date preset" });
    await expect(trigger).toContainText("Custom");
    await trigger.click();
    await page
      .getByRole("option", {
        name: LONG_PRESET_LABEL,
      })
      .click();

    const selectedValue = trigger.getByText(LONG_PRESET_LABEL, { exact: true });
    await expect(selectedValue).toHaveText(LONG_PRESET_LABEL);
    await expect(selectedValue).toHaveCSS("white-space", "nowrap");
    await expect(selectedValue).toHaveCSS("overflow", "hidden");
    await expect(selectedValue).toHaveCSS("text-overflow", "ellipsis");
    expect(
      await selectedValue.evaluate(
        (element) => element.scrollWidth > element.clientWidth,
      ),
    ).toBe(true);

    await trigger.click();
    const longOption = page.getByRole("option", { name: LONG_PRESET_LABEL });
    const optionText = longOption.getByText(LONG_PRESET_LABEL, { exact: true });
    await expect(longOption).toContainText(LONG_PRESET_LABEL);
    await expect(optionText).toHaveCSS("white-space", "nowrap");
    await expect(optionText).toHaveCSS("overflow", "hidden");
    await expect(optionText).toHaveCSS("text-overflow", "ellipsis");
    expect(
      await optionText.evaluate(
        (element) => element.scrollWidth > element.clientWidth,
      ),
    ).toBe(true);
    expect(
      await component.evaluate((root) => root.scrollWidth <= root.clientWidth),
    ).toBe(true);

    await expect(page.getByTestId("preset-id")).toHaveText("long-window");
    await expect(page.getByTestId("mode")).toHaveText("range");
    await expect(page.getByTestId("granularity")).toHaveText("date-time");

    const startDate = page.getByRole("textbox", { name: "Start date" });
    await startDate.fill("07/29/2026");
    await startDate.blur();
    await expect(trigger).toContainText("Custom");
  });

  test("keeps calendar-first tab order and lets dates fill while times hug", async ({
    mount,
    page,
  }) => {
    await mount(<TestPresets />);

    const previousMonth = page.getByRole("button", { name: "Previous month" });
    const preset = page.getByRole("combobox", { name: "Date preset" });
    const startDate = page.getByRole("textbox", { name: "Start date" });
    const startTime = page.getByRole("textbox", { name: "Start time" });
    const endDate = page.getByRole("textbox", { name: "End date" });
    const endTime = page.getByRole("textbox", { name: "End time" });
    await previousMonth.focus();
    for (let attempts = 0; attempts < 50; attempts += 1) {
      await page.keyboard.press("Tab");
      if (
        await preset.evaluate((element) => element === document.activeElement)
      ) {
        break;
      }
      await expect(startDate).not.toBeFocused();
    }
    await expect(preset).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(startDate).toBeFocused();

    const [startDateBox, startTimeBox, endDateBox, endTimeBox] =
      await Promise.all([
        getVisibleBox(startDate),
        getVisibleBox(startTime),
        getVisibleBox(endDate),
        getVisibleBox(endTime),
      ]);
    expect(startDateBox.width).toBeGreaterThan(startTimeBox.width);
    expect(endDateBox.width).toBeGreaterThan(endTimeBox.width);
    expect(Math.abs(startDateBox.y - startTimeBox.y)).toBeLessThan(2);
    expect(Math.abs(endDateBox.y - endTimeBox.y)).toBeLessThan(2);
    expect(
      await startTime.evaluate(
        (input) => input.scrollWidth <= input.clientWidth,
      ),
    ).toBe(true);
  });

  test("keeps date-only range fields balanced", async ({ mount, page }) => {
    await mount(<TestRangeDateLayout />);

    const startBox = await getVisibleBox(
      page.getByRole("textbox", { name: "Start date" }),
    );
    const endBox = await getVisibleBox(
      page.getByRole("textbox", { name: "End date" }),
    );
    expect(Math.abs(startBox.width - endBox.width)).toBeLessThan(2);
    expect(Math.abs(startBox.y - endBox.y)).toBeLessThan(2);
  });

  test("keeps a single date field full width", async ({ mount, page }) => {
    await mount(<TestSingleDateLayout />);

    const date = page.getByRole("textbox", { name: "Date" });
    expect(
      await date.evaluate((input) => {
        const layout = input.closest("[data-orientation]");
        if (!layout) return false;
        return (
          Math.abs(
            input.getBoundingClientRect().width -
              layout.getBoundingClientRect().width,
          ) < 2
        );
      }),
    ).toBe(true);
    await expect(page.getByRole("textbox")).toHaveCount(1);
  });

  test("has no axe violations with the preset menu open", async ({
    mount,
    page,
  }) => {
    await mount(<TestPresets />);
    await page.getByRole("combobox", { name: "Date preset" }).click();
    await expect(page.getByRole("listbox")).toBeVisible();

    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("fades input slots in while removing exits immediately", async ({
    mount,
    page,
  }) => {
    await mount(<TestPresets />);
    const preset = page.getByRole("combobox", { name: "Date preset" });
    const startTime = page.getByRole("textbox", { name: "Start time" });
    const slot = page.locator("[data-input-slot]").filter({ has: startTime });

    await expect(slot).toHaveCSS("transition-property", "opacity");
    expect(
      await slot.evaluate((element) =>
        parseFloat(getComputedStyle(element).transitionDuration),
      ),
    ).toBeGreaterThan(0);
    await preset.click();
    await page.getByRole("option", { name: "Today" }).click();

    const exitingInput = page.locator('input[aria-label="Start time"]');
    expect(await exitingInput.count()).toBe(0);

    await preset.click();
    await page.getByRole("option", { name: LONG_PRESET_LABEL }).click();
    const enteredTime = page.getByRole("textbox", { name: "Start time" });
    const enteredSlot = page
      .locator("[data-input-slot]")
      .filter({ has: enteredTime });
    await expect(enteredSlot).toHaveCSS("transition-property", "opacity");
    expect(
      await enteredSlot.evaluate((element) =>
        parseFloat(getComputedStyle(element).transitionDuration),
      ),
    ).toBeGreaterThan(0);
  });

  test("removes input motion for reduced-motion users", async ({
    mount,
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mount(<TestPresets />);

    const startTime = page.getByRole("textbox", { name: "Start time" });
    const slot = page.locator("[data-input-slot]").filter({ has: startTime });
    await expect(slot).toHaveCSS("transition-duration", "0s");

    const preset = page.getByRole("combobox", { name: "Date preset" });
    await preset.click();
    await page.getByRole("option", { name: "Today" }).click();
    await expect(page.getByRole("textbox", { name: "Start time" })).toHaveCount(
      0,
    );

    await preset.click();
    await page.getByRole("option", { name: LONG_PRESET_LABEL }).click();
    const enteredTime = page.getByRole("textbox", { name: "Start time" });
    const enteredSlot = page
      .locator("[data-input-slot]")
      .filter({ has: enteredTime });
    await expect(enteredSlot).toHaveCSS("transition-duration", "0s");
  });

  test("explains disabled presets while keyboard typeahead skips them", async ({
    mount,
    page,
  }) => {
    await mount(<TestPresets />);
    const trigger = page.getByRole("combobox", { name: "Date preset" });
    await trigger.click();
    const disabledOption = page.getByRole("option", {
      name: "Unavailable period — Requires historical data access",
    });
    await expect(disabledOption).toHaveAttribute("aria-disabled", "true");
    const disabledText = disabledOption.getByText(
      "Unavailable period — Requires historical data access",
      { exact: true },
    );
    await expect(disabledText).toHaveCSS("white-space", "nowrap");
    await expect(disabledText).toHaveCSS("overflow", "hidden");
    await expect(disabledText).toHaveCSS("text-overflow", "ellipsis");

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(disabledOption).toHaveAttribute("data-highlighted");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("preset-id")).toHaveText("custom");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(
      page.getByText("This preset contains unavailable dates"),
    ).toHaveCount(0);

    await page.keyboard.press("u");
    await expect(
      page.getByRole("option", { name: "Upcoming period" }),
    ).toHaveAttribute("data-highlighted");
    await expect(disabledOption).not.toHaveAttribute("data-highlighted");
  });
});
