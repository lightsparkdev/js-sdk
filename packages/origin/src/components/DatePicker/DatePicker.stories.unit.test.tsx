import { composeStories } from "@storybook/react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as storyModule from "./DatePicker.stories";

const stories = composeStories(storyModule);

function appearsBefore(first: Element, second: Element): boolean {
  return Boolean(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
}

describe("DatePicker public stories", () => {
  it("uses the fixed range date-time composition as the primary preset story", () => {
    render(<stories.PresetsAndCustom />);

    const calendar = screen.getByRole("button", { name: "Previous month" });
    const preset = screen.getByRole("combobox", { name: "Date preset" });
    const startDate = screen.getByRole("textbox", { name: "Start date" });
    const startTime = screen.getByRole("textbox", {
      name: "Start time (UTC)",
    });
    const apply = screen.getByRole("button", { name: "Apply" });

    expect(appearsBefore(calendar, preset)).toBe(true);
    expect(appearsBefore(preset, startDate)).toBe(true);
    expect(appearsBefore(startDate, startTime)).toBe(true);
    expect(appearsBefore(startTime, apply)).toBe(true);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    expect(screen.queryByText(/\(UTC\)/)).not.toBeInTheDocument();
    expect(screen.queryByText("Times shown in UTC")).not.toBeInTheDocument();
    for (const suffix of screen.getAllByText("UTC")) {
      expect(suffix).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("keeps the localized story as a complete fixed range date-time example", () => {
    render(<stories.Localized />);

    const calendar = screen.getByRole("button", {
      name: "Vorheriger Monat",
    });
    const preset = screen.getByRole("combobox", { name: "Zeitraum" });
    const startDate = screen.getByRole("textbox", { name: "Startdatum" });
    const endTime = screen.getByRole("textbox", { name: "Endzeit (UTC)" });
    const apply = screen.getByRole("button", { name: "Anwenden" });

    expect(appearsBefore(calendar, preset)).toBe(true);
    expect(appearsBefore(preset, startDate)).toBe(true);
    expect(appearsBefore(startDate, endTime)).toBe(true);
    expect(appearsBefore(endTime, apply)).toBe(true);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    expect(screen.queryByText("Times shown in UTC")).not.toBeInTheDocument();
    expect(screen.getAllByText("UTC")).toHaveLength(2);
  });
});
