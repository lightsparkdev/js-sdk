import { test, expect } from "@playwright/experimental-ct-react";
import {
  BasicCommand,
  CommandWithTrigger,
  AbandonedReopenCommand,
  CommandWithCustomInputLabel,
  CommandWithEmptyPlaceholder,
  CommandWithGroups,
  CustomControlsExitCommand,
  ControlledCommandWithAnalytics,
  ExitFreezeCommand,
  FrozenExitBackCommand,
  FrozenExitSelectionCommand,
  FunctionalClassNameInput,
  SlowExitCommand,
  UncontrolledInputListenerCommand,
  UncontrolledInputReopenCommand,
  UnmountOnCloseAnalyticsCommand,
  CommandWithIcons,
  CommandWithDisabledItems,
  ControlledCommand,
  ControlledCommandDefaultClose,
  CommandWithCallback,
  FigmaDesignCommand,
  CommandWithKeywords,
  CommandOverStickyContent,
  CommandWithSubViewDrillIn,
  CommandEscapePopsSubView,
  CommandWithBackButton,
  EmptyItemsCommand,
  LoadingCommand,
  LoadingToggleCommand,
  LoadingCommandWithCustomIndicator,
  CommandWithCustomEmpty,
  CommandWithNullEmpty,
  CommandWithCustomContainer,
  CommandWithFooterRender,
  CommandWithDefaultFooter,
  CommandWithCustomFooterContent,
} from "./Command.test-stories";

test.describe("Command", () => {
  test.describe("basic rendering", () => {
    test("renders command popup when open", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const popup = page.getByRole("dialog");
      await expect(popup).toBeVisible();
    });

    test("renders input with placeholder", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const input = page.getByPlaceholder("Run a command or search");
      await expect(input).toBeVisible();
    });

    test("renders command items", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      await expect(page.getByRole("option", { name: "Copy" })).toBeVisible();
      await expect(page.getByRole("option", { name: "Paste" })).toBeVisible();
      await expect(page.getByRole("option", { name: "Cut" })).toBeVisible();
    });
  });

  test.describe("trigger behavior", () => {
    test("opens command when trigger is clicked", async ({ mount, page }) => {
      await mount(<CommandWithTrigger />);
      const trigger = page.getByText("Open Command");
      await trigger.click();
      const popup = page.getByRole("dialog");
      await expect(popup).toBeVisible();
    });
  });

  test.describe("analytics", () => {
    test("pairs controlled opens and closes with a duration", async ({
      mount,
      page,
    }) => {
      await mount(<ControlledCommandWithAnalytics />);
      await page.getByRole("button", { name: "Toggle" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).not.toBeVisible();

      const log = JSON.parse(
        (await page.getByTestId("analytics-log").textContent()) ?? "[]",
      ) as {
        interaction: string;
        name: string;
        component: string;
        metadata?: { duration_ms?: number };
      }[];
      expect(log).toHaveLength(2);
      expect(log[0]).toMatchObject({
        name: "test_palette",
        component: "Command",
        interaction: "open",
      });
      expect(log[1]).toMatchObject({ interaction: "close" });
      expect(log[1].metadata?.duration_ms).toBeGreaterThanOrEqual(0);
    });

    test("tracks the close when an accepted close unmounts the palette", async ({
      mount,
      page,
    }) => {
      await mount(<UnmountOnCloseAnalyticsCommand />);
      await page.getByRole("button", { name: "Open Command" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();

      // The consumer unmounts Command synchronously inside the accepted
      // close handler; the close event must not be lost.
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).not.toBeVisible();

      await expect(page.getByTestId("analytics-log")).toContainText("close");
      const log = JSON.parse(
        (await page.getByTestId("analytics-log").textContent()) ?? "[]",
      ) as {
        interaction: string;
        metadata?: { duration_ms?: number };
      }[];
      expect(log).toHaveLength(2);
      expect(log[0]).toMatchObject({ interaction: "open" });
      expect(log[1]).toMatchObject({ interaction: "close" });
      expect(log[1].metadata?.duration_ms).toBeGreaterThanOrEqual(0);
    });

    test("a canceled escape logs no analytics", async ({ mount, page }) => {
      await mount(<CommandEscapePopsSubView />);
      await expect(page.getByTestId("analytics-log")).toContainText("open");

      await page.getByText("Filter...").click();
      await expect(page.getByText("Status")).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(page.getByText("Go home")).toBeVisible();

      const log = JSON.parse(
        (await page.getByTestId("analytics-log").textContent()) ?? "[]",
      ) as { interaction: string }[];
      expect(log).toHaveLength(1);
      expect(log[0]).toMatchObject({ interaction: "open" });
    });
  });

  test.describe("custom input", () => {
    test("functional className receives state and keeps the base class", async ({
      mount,
      page,
    }) => {
      await mount(<FunctionalClassNameInput />);
      const input = page.getByPlaceholder("Custom input");
      await expect(input).toHaveClass(/is-enabled/);
      await expect(input).toHaveClass(/input/);
    });
  });

  test.describe("groups", () => {
    test("renders groups with headings", async ({ mount, page }) => {
      await mount(<CommandWithGroups />);
      await expect(page.getByText("Suggestions")).toBeVisible();
      await expect(page.getByText("Settings")).toBeVisible();
    });
  });

  test.describe("icons", () => {
    test("renders items with icons", async ({ mount, page }) => {
      await mount(<CommandWithIcons />);
      await expect(page.getByRole("option", { name: "Copy" })).toBeVisible();
      await expect(page.getByRole("option", { name: "Paste" })).toBeVisible();
    });
  });

  test.describe("disabled state", () => {
    test("renders disabled items with data-disabled", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithDisabledItems />);
      const disabledItem = page.getByRole("option", { name: "Disabled Item" });
      await expect(disabledItem).toHaveAttribute("data-disabled");
    });

    test("skips disabled items during keyboard navigation", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithDisabledItems />);
      const input = page.getByPlaceholder("Run a command or search");
      await input.focus();

      // Wait for auto-highlight
      await page.waitForTimeout(200);

      // First item (Enabled Item) is auto-highlighted, ArrowDown twice should skip disabled
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(100);
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(100);

      // Should have skipped the disabled item and gone to Another Item
      const anotherItem = page.getByRole("option", { name: "Another Item" });
      await expect(anotherItem).toHaveAttribute("data-highlighted");
    });
  });

  test.describe("empty state", () => {
    test("echoes the query when no results match", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const input = page.getByPlaceholder("Run a command or search");
      // Type something that won't match
      await input.fill("xyz123");
      await expect(
        page.getByText('No results found for "xyz123"'),
      ).toBeVisible();
    });

    test("falls back to plain copy while the input is empty", async ({
      mount,
      page,
    }) => {
      await mount(<EmptyItemsCommand />);
      await expect(page.getByText("No results.")).toBeVisible();
    });
  });

  test.describe("filtering", () => {
    test("filters items based on search input", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const input = page.getByPlaceholder("Run a command or search");
      await input.fill("cop");
      await expect(page.getByRole("option", { name: "Copy" })).toBeVisible();
      await expect(
        page.getByRole("option", { name: "Paste" }),
      ).not.toBeVisible();
    });

    test("filters by keywords", async ({ mount, page }) => {
      await mount(<CommandWithKeywords />);
      const input = page.getByPlaceholder("Try searching 'duplicate'...");
      await input.fill("duplicate");
      // "Copy" has keyword "duplicate"
      await expect(page.getByRole("option", { name: "Copy" })).toBeVisible();
      // Others should be hidden
      await expect(
        page.getByRole("option", { name: "Paste" }),
      ).not.toBeVisible();
    });
  });

  test.describe("keyboard navigation", () => {
    test("auto-highlights first item", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      // Wait for auto-highlight
      await page.waitForTimeout(50);
      const firstItem = page.getByRole("option", { name: "Copy" });
      await expect(firstItem).toHaveAttribute("data-highlighted", "");
    });

    test("navigates through items with arrow keys", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const input = page.getByPlaceholder("Run a command or search");
      await input.focus();

      // Wait for auto-highlight
      await page.waitForTimeout(100);

      // First item is already highlighted, ArrowDown moves to second
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(50);

      const secondItem = page.getByRole("option", { name: "Paste" });
      await expect(secondItem).toHaveAttribute("data-highlighted", "");
    });

    test("selects item on Enter", async ({ mount, page }) => {
      await mount(<CommandWithCallback />);
      const input = page.getByPlaceholder("Run a command or search");
      await input.focus();

      // Wait for auto-highlight
      await page.waitForTimeout(100);

      // First item is auto-highlighted, just press Enter
      await page.keyboard.press("Enter");
      await page.waitForTimeout(50);

      const selected = page.getByTestId("selected");
      await expect(selected).toHaveText("copy");
    });

    test("closes on backdrop click", async ({ mount, page }) => {
      await mount(<ControlledCommand />);
      // Click on backdrop to close
      const backdrop = page.locator('[class*="backdrop"]');
      await backdrop.click({ force: true });

      const popup = page.getByRole("dialog");
      await expect(popup).not.toBeVisible();
    });

    test("loops navigation by default", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const input = page.getByPlaceholder("Run a command or search");
      await input.focus();

      // Wait for auto-highlight
      await page.waitForTimeout(100);

      // Go up from first item - should loop to last
      await page.keyboard.press("ArrowUp");
      await page.waitForTimeout(50);

      const lastItem = page.getByRole("option", { name: "Cut" });
      await expect(lastItem).toHaveAttribute("data-highlighted", "");
    });
  });

  test.describe("selection", () => {
    test("calls onSelect when item is clicked", async ({ mount, page }) => {
      await mount(<CommandWithCallback />);
      const item = page.getByRole("option", { name: "Copy" });
      await item.click();

      const selected = page.getByTestId("selected");
      await expect(selected).toHaveText("copy");
    });
  });

  test.describe("accessibility", () => {
    test("has proper ARIA attributes on input", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const input = page.getByPlaceholder("Run a command or search");
      await expect(input).toHaveAttribute("role", "combobox");
      await expect(input).toHaveAttribute("aria-autocomplete", "list");
    });

    test("has proper ARIA attributes on list", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const list = page.getByRole("listbox");
      await expect(list).toBeVisible();
    });

    test("items have option role", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      const items = page.getByRole("option");
      await expect(items).toHaveCount(3);
    });
  });

  test.describe("closeOnSelect", () => {
    test("closes a controlled dialog when selecting a plain item", async ({
      mount,
      page,
    }) => {
      await mount(<ControlledCommandDefaultClose />);
      await page.getByRole("option", { name: "Copy" }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });

    test("closes an uncontrolled dialog when selecting a plain item", async ({
      mount,
      page,
    }) => {
      await mount(<BasicCommand />);
      await page.getByRole("option", { name: "Copy" }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });

    test("keeps dialog open and fires onSelect when closeOnSelect is false", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithSubViewDrillIn />);
      const item = page.getByRole("option", { name: "Filter..." });
      await item.click();

      await expect(page.getByTestId("view")).toHaveText("filters");
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByRole("option", { name: "Status" })).toBeVisible();
    });
  });

  test.describe("exit transition", () => {
    test("popup content stays frozen after selecting with a query typed", async ({
      mount,
      page,
    }) => {
      await mount(<SlowExitCommand />);
      const input = page.getByPlaceholder("Run a command or search");
      await input.fill("cop");
      await expect(page.getByRole("option")).toHaveCount(1);

      await page.getByRole("option", { name: "Copy" }).click();

      // Mid-exit the popup must still show the query and filtered list,
      // not a repainted default state.
      const dialog = page.locator('[role="dialog"][data-ending-style]');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("combobox")).toHaveValue("cop");
      await expect(dialog.getByRole("option")).toHaveCount(1);
    });

    test("keeps a contextual row rendered when items change mid-exit", async ({
      mount,
      page,
    }) => {
      await mount(<ExitFreezeCommand />);
      await expect(
        page.getByRole("option", { name: "Filter..." }),
      ).toBeVisible();

      // Selecting the nav item unmounts the registering screen, which
      // drops the contextual row from the live items during the exit.
      await page.getByRole("option", { name: "Go to customers" }).click();

      const dialog = page.locator('[role="dialog"][data-ending-style]');
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole("option", { name: "Filter..." }),
      ).toBeVisible();

      // Still frozen well into the fade.
      await page.waitForTimeout(400);
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole("option", { name: "Filter..." }),
      ).toBeVisible();
    });

    test("an abandoned reopen render never emits a reset notification", async ({
      mount,
      page,
    }) => {
      await mount(<AbandonedReopenCommand />);
      const log = page.getByTestId("input-log");
      await page.getByPlaceholder("Run a command or search").fill("cop");
      await expect(log).toHaveText(JSON.stringify(["cop"]));

      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).not.toBeVisible();

      // The reopen suspends and never commits; committing a closed state
      // afterwards must not surface the abandoned render's reset.
      await page.getByRole("button", { name: "Attempt reopen" }).click();
      await page.waitForFunction(() => (window.__suspendedRenders ?? 0) >= 1);
      await expect(page.getByRole("dialog")).not.toBeVisible();
      await page.getByRole("button", { name: "Abandon reopen" }).click();
      await expect(page.getByTestId("attempts")).toHaveText("1");

      // A committed reopen resets exactly once; typing afterwards seals
      // the log so a leaked notification from the abandoned render would
      // surface as an extra "" entry.
      await page.getByRole("button", { name: "Reopen", exact: true }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.getByPlaceholder("Run a command or search").fill("x");
      await expect(log).toHaveText(JSON.stringify(["cop", "", "x"]));
    });

    test("reopening notifies listeners exactly once about the reset query", async ({
      mount,
      page,
    }) => {
      await mount(<UncontrolledInputListenerCommand />);
      const log = page.getByTestId("input-log");
      await page.getByPlaceholder("Run a command or search").fill("cop");
      await expect(log).toHaveText(JSON.stringify(["cop"]));

      // Origin clears the uncontrolled query on reopen; listeners
      // mirroring the query must hear that reset exactly once.
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).not.toBeVisible();
      await page.getByRole("button", { name: "Open Command" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();

      await expect(page.getByRole("combobox")).toHaveValue("");
      await expect(log).toHaveText(JSON.stringify(["cop", ""]));
    });

    test("frozen items are inert to clicks and Enter during the exit", async ({
      mount,
      page,
    }) => {
      await mount(<FrozenExitSelectionCommand />);
      await page.getByRole("option", { name: "Copy" }).click();

      const dialog = page.locator('[role="dialog"][data-ending-style]');
      await expect(dialog).toBeVisible();
      await expect(page.getByTestId("select-count")).toHaveText("1");
      await expect(page.getByTestId("select-event-count")).toHaveText("1");

      // The frozen popup still renders the rows; activating them again
      // mid-exit must not re-fire the callback or select analytics.
      await dialog.getByRole("option", { name: "Copy" }).click({ force: true });
      await dialog.getByRole("combobox").press("Enter");

      await expect(page.getByTestId("select-count")).toHaveText("1");
      await expect(page.getByTestId("select-event-count")).toHaveText("1");
    });

    test("an interrupted exit reopens an uncontrolled input clean", async ({
      mount,
      page,
    }) => {
      await mount(<UncontrolledInputReopenCommand />);
      const input = page.getByPlaceholder("Run a command or search");
      await input.fill("cop");
      await expect(page.getByRole("option")).toHaveCount(1);

      // Close, then let the scheduled reopen interrupt the exit; the
      // popup never unmounts, so the input must be reset explicitly.
      await page.keyboard.press("Escape");
      await expect(
        page.locator('[role="dialog"][data-ending-style]'),
      ).toBeVisible();

      const dialog = page.locator('[role="dialog"]:not([data-ending-style])');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("combobox")).toHaveValue("");
      await expect(dialog.getByRole("option")).toHaveCount(2);
      await expect(dialog.getByText(/No results found/)).not.toBeVisible();
    });

    test("a reopen that interrupts the exit shows live state", async ({
      mount,
      page,
    }) => {
      await mount(<ExitFreezeCommand reopenDelayMs={300} />);
      await expect(
        page.getByRole("option", { name: "Filter..." }),
      ).toBeVisible();

      await page.getByRole("option", { name: "Go to customers" }).click();
      await expect(
        page.locator('[role="dialog"][data-ending-style]'),
      ).toBeVisible();

      // The scheduled reopen interrupts the exit; the palette must show
      // live state (no contextual row), not the stale snapshot.
      const dialog = page.locator('[role="dialog"]:not([data-ending-style])');
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole("option", { name: "Go to transactions" }),
      ).toBeVisible();
      await expect(
        dialog.getByRole("option", { name: "Filter..." }),
      ).toHaveCount(0);
    });

    test("default empty copy stays frozen while closing", async ({
      mount,
      page,
    }) => {
      await mount(<SlowExitCommand />);
      const input = page.getByPlaceholder("Run a command or search");
      await input.fill("zzz");
      await expect(page.getByText('No results found for "zzz"')).toBeVisible();

      await page.keyboard.press("Escape");

      const dialog = page.locator('[role="dialog"][data-ending-style]');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText('No results found for "zzz"');
    });
  });

  test.describe("back affordance during exit", () => {
    test("back affordances are inert during the exit", async ({
      mount,
      page,
    }) => {
      await mount(<FrozenExitBackCommand />);
      await expect(page.getByRole("button", { name: "Back" })).toBeVisible();

      // The frozen popup keeps the back button visible, but like the
      // rows it must be inert: neither a click nor Backspace on the
      // empty input may fire onBack once the exit begins.
      await page.keyboard.press("Escape");
      const dialog = page.locator('[role="dialog"][data-ending-style]');
      await expect(dialog).toBeVisible();
      const backButton = dialog.getByRole("button", { name: "Back" });
      await expect(backButton).toBeVisible();

      await backButton.click({ force: true });
      await dialog.getByRole("combobox").press("Backspace");
      await expect(page.getByTestId("back-count")).toHaveText("0");
    });

    test("custom controls nested in the popup are inert during the exit", async ({
      mount,
      page,
    }) => {
      await mount(<CustomControlsExitCommand />);
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      // Sanity: both custom controls fire while the palette is open.
      await dialog.locator("button", { hasText: "Pin Copy" }).click();
      await expect(page.getByTestId("item-action-count")).toHaveText("1");
      await dialog.locator("button", { hasText: "Footer action" }).click();
      await expect(page.getByTestId("footer-action-count")).toHaveText("1");

      await page.keyboard.press("Escape");
      await expect(
        page.locator('[role="dialog"][data-ending-style]'),
      ).toBeVisible();

      await dialog
        .locator("button", { hasText: "Pin Paste" })
        .click({ force: true });
      await dialog
        .locator("button", { hasText: "Footer action" })
        .click({ force: true });

      await expect(page.getByTestId("item-action-count")).toHaveText("1");
      await expect(page.getByTestId("footer-action-count")).toHaveText("1");
      await expect(dialog).not.toBeVisible();
    });
  });

  test.describe("escape behavior", () => {
    test("escape closes an uncontrolled palette", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      // Wait for autofocus so the key press reaches the dialog.
      await expect(
        page.getByPlaceholder("Run a command or search"),
      ).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });

    test("escape pops a sub-view without closing when the close is canceled", async ({
      mount,
      page,
    }) => {
      await mount(<CommandEscapePopsSubView />);
      await page.getByRole("option", { name: "Filter..." }).click();
      await expect(page.getByTestId("view")).toHaveText("filters");

      await page.keyboard.press("Escape");

      await expect(page.getByTestId("view")).toHaveText("root");
      await expect(page.getByTestId("open")).toHaveText("true");
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(
        page.getByRole("option", { name: "Filter..." }),
      ).toBeVisible();
    });

    test("escape at the top level closes the palette", async ({
      mount,
      page,
    }) => {
      await mount(<CommandEscapePopsSubView />);
      // Wait for autofocus so the key press reaches the dialog.
      await expect(
        page.getByPlaceholder("Run a command or search"),
      ).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("open")).toHaveText("false");
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });
  });

  test.describe("back affordance", () => {
    test("renders a leading back button only when onBack is provided", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithBackButton />);
      await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
      // Autofocus must stay on the input, not the leading button.
      await expect(
        page.getByPlaceholder("Run a command or search"),
      ).toBeFocused();
    });

    test("backspace during IME composition does not navigate back", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithBackButton />);
      const input = page.getByPlaceholder("Run a command or search");
      await expect(input).toBeFocused();

      const dispatchBackspace = (isComposing: boolean) =>
        input.evaluate((element, composing) => {
          const event = new KeyboardEvent("keydown", {
            key: "Backspace",
            bubbles: true,
            cancelable: true,
          });
          Object.defineProperty(event, "isComposing", { value: composing });
          element.dispatchEvent(event);
        }, isComposing);

      await dispatchBackspace(true);
      await expect(page.getByTestId("back-count")).toHaveText("0");

      // The same dispatch without composition proves the harness reaches
      // the handler.
      await dispatchBackspace(false);
      await expect(page.getByTestId("back-count")).toHaveText("1");
    });

    test("keeps drilled-in rows and hints inside the popup", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithBackButton />);
      await expect(page.getByRole("button", { name: "Back" })).toBeVisible();

      const popup = await page.getByRole("dialog").boundingBox();
      const item = await page
        .getByRole("option", { name: "Status" })
        .boundingBox();
      if (!popup || !item) {
        throw new Error("popup and item must both render");
      }
      expect(item.x).toBeGreaterThanOrEqual(popup.x);
      expect(item.x + item.width).toBeLessThanOrEqual(
        popup.x + popup.width + 1,
      );
    });

    test("renders no back button without onBack", async ({ mount, page }) => {
      await mount(<BasicCommand />);
      await expect(page.getByRole("button", { name: "Back" })).toHaveCount(0);
    });

    test("clicking the back button fires onBack", async ({ mount, page }) => {
      await mount(<CommandWithBackButton />);
      await page.getByRole("button", { name: "Back" }).click();
      await expect(page.getByTestId("back-count")).toHaveText("1");
    });

    test("backspace on an empty input fires onBack", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithBackButton />);
      const input = page.getByPlaceholder("Run a command or search");
      await input.focus();
      await page.keyboard.press("Backspace");
      await expect(page.getByTestId("back-count")).toHaveText("1");
    });

    test("backspace with text edits normally without firing onBack", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithBackButton />);
      const input = page.getByPlaceholder("Run a command or search");
      await input.fill("st");
      await page.keyboard.press("Backspace");
      await expect(input).toHaveValue("s");
      await expect(page.getByTestId("back-count")).toHaveText("0");
    });
  });

  test.describe("controlled input", () => {
    test("resets input value when swapping to a sub-view", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithSubViewDrillIn />);
      const input = page.getByPlaceholder("Run a command or search");
      await input.fill("fil");
      await expect(page.getByTestId("input-value")).toHaveText("fil");

      await page.getByRole("option", { name: "Filter..." }).click();

      await expect(page.getByTestId("input-value")).toHaveText("");
      const subInput = page.getByPlaceholder("Filter by...");
      await expect(subInput).toHaveValue("");
    });
  });

  test.describe("loading state", () => {
    test("shows default loader and hides empty state while loading", async ({
      mount,
      page,
    }) => {
      await mount(<LoadingCommand />);
      await expect(page.locator('[class*="loading"]')).toBeVisible();
      await expect(page.getByText("No results.")).not.toBeVisible();
    });

    test("shows custom loading indicator", async ({ mount, page }) => {
      await mount(<LoadingCommandWithCustomIndicator />);
      await expect(page.getByText("Searching records...")).toBeVisible();
      await expect(page.getByText("No results.")).not.toBeVisible();
      // The custom indicator is presentation only; the status region owns
      // the announcement.
      await expect(
        page.getByRole("status").filter({ hasText: "Loading" }),
      ).toHaveCount(1);
    });
  });

  test.describe("custom empty state", () => {
    test("shows custom empty content when no items match", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithCustomEmpty />);
      const input = page.getByPlaceholder("Run a command or search");
      await input.fill("xyz123");
      await expect(page.getByText("Nothing matched your search")).toBeVisible();
      await expect(page.getByText(/No results found/)).not.toBeVisible();
    });

    test("keeps the empty region mounted but collapsed when empty is null", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithNullEmpty />);
      const input = page.getByPlaceholder("Run a command or search");
      await input.fill("xyz123");
      await expect(page.getByText("No results.")).toHaveCount(0);

      // The live region must stay in the DOM without display:none so
      // screen readers keep announcing its changes; with null content it
      // occupies no space.
      const empty = page.locator('[class*="empty"]');
      await expect(empty).toHaveCount(1);
      expect(
        await empty.evaluate((el) => getComputedStyle(el).display),
      ).not.toBe("none");
      expect((await empty.boundingBox())?.height ?? 0).toBe(0);
    });

    test("keeps the empty region mounted while results are showing", async ({
      mount,
      page,
    }) => {
      await mount(<BasicCommand />);
      await expect(page.getByRole("option", { name: "Copy" })).toBeVisible();

      const empty = page.locator('[class*="empty"]');
      await expect(empty).toHaveCount(1);
      expect(
        await empty.evaluate((el) => getComputedStyle(el).display),
      ).not.toBe("none");
      expect((await empty.boundingBox())?.height ?? 0).toBe(0);
    });
  });

  test.describe("status region", () => {
    test("announces loading through a persistent status region", async ({
      mount,
      page,
    }) => {
      await mount(<LoadingToggleCommand />);

      // Exactly one live region announces the async state; the visual
      // indicator is presentation only.
      await expect(
        page.getByRole("status").filter({ hasText: "Loading" }),
      ).toHaveCount(1);
      await expect(page.locator('[class*="loading"]')).toHaveAttribute(
        "aria-hidden",
        "true",
      );

      // The region itself must survive the transition; only its content
      // empties out.
      await page.getByRole("button", { name: "Finish loading" }).click();
      await expect(
        page.getByRole("status").filter({ hasText: "Loading" }),
      ).toHaveCount(0);
      await expect(page.locator('[class*="status"]')).toHaveCount(1);
      await expect(page.locator('[class*="status"]')).toHaveText("");
    });
  });

  test.describe("accessible names and close control", () => {
    test("the dialog and input expose stable accessible names", async ({
      mount,
      page,
    }) => {
      await mount(<BasicCommand />);
      await expect(
        page.getByRole("dialog", { name: "Command palette" }),
      ).toBeVisible();
      // The default name is stable copy, not derived from the visual
      // placeholder.
      await expect(page.getByRole("combobox")).toHaveAttribute(
        "aria-label",
        "Command or search",
      );
    });

    test("a custom input label is independent of the placeholder", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithCustomInputLabel />);
      const input = page.getByRole("combobox");
      await expect(input).toHaveAttribute(
        "placeholder",
        "Type to search across commands, settings, and documentation",
      );
      await expect(input).toHaveAttribute("aria-label", "Search commands");
    });

    test("an empty placeholder still leaves the input named", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithEmptyPlaceholder />);
      const input = page.getByRole("combobox");
      await expect(input).toHaveAttribute("placeholder", "");
      await expect(input).toHaveAttribute("aria-label", "Command or search");
    });

    test("a screen-reader close control closes the palette from a drill-in", async ({
      mount,
      page,
    }) => {
      await mount(<CommandEscapePopsSubView />);
      await page.getByRole("option", { name: "Filter..." }).click();
      await expect(page.getByTestId("view")).toHaveText("filters");

      // Unlike Escape (which pops the sub-view), the close control always
      // dismisses the whole palette.
      await page
        .getByRole("button", { name: "Close command palette" })
        .press("Enter");
      await expect(page.getByRole("dialog")).not.toBeVisible();
      await expect(page.getByTestId("open")).toHaveText("false");
    });
  });

  test.describe("portal container", () => {
    test("renders the popup into a custom container", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithCustomContainer />);
      const container = page.getByTestId("portal-container");
      const popup = container.getByRole("dialog");
      await expect(popup).toBeVisible();
      await expect(popup.getByRole("option", { name: "Copy" })).toBeVisible();
    });
  });

  test.describe("footer render prop", () => {
    test("renders a custom element with footer content", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithFooterRender />);
      const footer = page.getByTestId("custom-footer");
      await expect(footer).toBeVisible();
      await expect(footer).toHaveText("Footer content");
      const tagName = await footer.evaluate((el) => el.tagName);
      expect(tagName).toBe("FOOTER");
    });
  });

  test.describe("footer default hints", () => {
    test("renders the default hint bar when footer has no children", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithDefaultFooter />);
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByText("Navigate")).toBeVisible();
      await expect(dialog.getByText("Select")).toBeVisible();
      // No Close hint in the footer; the screen-reader close control
      // outside it is expected.
      await expect(dialog.locator("footer").getByText("Close")).toHaveCount(0);
      const keycaps = dialog.locator("kbd");
      await expect(keycaps).toHaveCount(3);
      await expect(dialog.getByRole("img", { name: "Arrow up" })).toBeVisible();
      await expect(
        dialog.getByRole("img", { name: "Arrow down" }),
      ).toBeVisible();
      await expect(dialog.getByRole("img", { name: "Enter" })).toBeVisible();
    });

    test("custom children replace the default hint bar", async ({
      mount,
      page,
    }) => {
      await mount(<CommandWithCustomFooterContent />);
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByText("Custom footer content")).toBeVisible();
      await expect(dialog.getByText("Navigate")).toHaveCount(0);
      await expect(dialog.locator("kbd")).toHaveCount(0);
    });
  });

  test.describe("Figma design", () => {
    test("renders matching Figma design structure", async ({ mount, page }) => {
      await mount(<FigmaDesignCommand />);
      const popup = page.getByRole("dialog");
      await expect(popup).toBeVisible();
      await expect(page.getByText("Title")).toBeVisible();
      const items = page.getByRole("option");
      await expect(items).toHaveCount(4);
    });
  });

  test.describe("stacking", () => {
    test("popup and backdrop layer above page content with its own z-index", async ({
      mount,
      page,
    }) => {
      await mount(<CommandOverStickyContent />);
      const input = page.getByPlaceholder("Run a command or search");
      await expect(input).toBeVisible();
      await input.click();
      await input.fill("cop");
      await expect(page.getByRole("option", { name: "Copy" })).toBeVisible();

      const topElementClass = await page.evaluate(() => {
        const backdrop = document.querySelector('[class*="backdrop"]');
        if (!backdrop) return null;
        const rect = backdrop.getBoundingClientRect();
        const el = document.elementFromPoint(rect.left + 10, rect.top + 10);
        return el?.getAttribute("class") ?? null;
      });
      expect(topElementClass).toContain("backdrop");
    });
  });

  test.describe("small viewports", () => {
    test("popup fills the viewport below the small-screen breakpoint", async ({
      mount,
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await mount(<BasicCommand />);
      const popup = page.getByRole("dialog");
      await expect(popup).toBeVisible();
      const box = await popup.boundingBox();
      expect(box?.x).toBe(0);
      expect(box?.y).toBe(0);
      expect(box?.width).toBe(375);
      expect(box?.height).toBe(667);
    });

    test("popup stays a floating dialog on desktop viewports", async ({
      mount,
      page,
    }) => {
      await mount(<BasicCommand />);
      const popup = page.getByRole("dialog");
      await expect(popup).toBeVisible();
      const box = await popup.boundingBox();
      const viewport = page.viewportSize();
      expect(box).not.toBeNull();
      expect(viewport).not.toBeNull();
      expect(box!.x).toBeGreaterThan(0);
      expect(box!.y).toBeGreaterThan(0);
      expect(box!.width).toBeLessThan(viewport!.width);
      expect(box!.height).toBeLessThan(viewport!.height);
    });
  });
});
