import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { FilterBar, type FilterBarConfig } from "./";
import { DATE_PICKER_PRESETS } from "./FilterBar.date-picker.test-fixtures";
import {
  getDefaultFilterStates,
  type FilterDescriptor,
  type FilterStates,
} from "./filter-model";
import { useFilters } from "./useFilters";

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

beforeEach(() => {
  vi.useRealTimers();
});

const SHORTCUT_DESCRIPTORS = [
  {
    type: "date",
    id: "createdAt",
    label: "Created",
    datePicker: {
      mode: "range",
      granularity: "date-time",
      presets: DATE_PICKER_PRESETS,
      showPresetShortcutsInAddMenu: true,
    },
  },
] as const satisfies readonly FilterDescriptor<"createdAt">[];

const UNSAFE_SHORTCUT_DESCRIPTORS = [
  {
    type: "date",
    id: "createdAt",
    label: "Created",
    allowFuture: false,
    datePicker: {
      mode: "range",
      granularity: "date-time",
      showPresetShortcutsInAddMenu: true,
      presets: [
        {
          id: "disabled",
          label: "Disabled",
          textValue: "Disabled",
          disabled: true,
          disabledReason: "Unavailable for this account",
          resolve: DATE_PICKER_PRESETS[0].resolve,
        },
        {
          id: "throwing",
          label: "Throwing",
          textValue: "Throwing",
          resolve: () => {
            throw new Error("resolver failed");
          },
        },
        {
          id: "malformed",
          label: "Malformed",
          textValue: "Malformed",
          resolve: () => null,
        },
        {
          id: "invalid-date",
          label: "Invalid date",
          textValue: "Invalid date",
          resolve: DATE_PICKER_PRESETS[2].resolve,
        },
        {
          id: "future",
          label: "Future",
          textValue: "Future",
          resolve: (now: Date) => ({
            value: {
              start: new Date(now.getTime() + 24 * 60 * 60 * 1000),
              end: new Date(now.getTime() + 48 * 60 * 60 * 1000),
            },
            mode: "range",
            granularity: "date-time",
          }),
        },
        {
          id: "wrong-shape",
          label: "Wrong shape",
          textValue: "Wrong shape",
          resolve: (now: Date) => ({
            value: now,
            mode: "single",
            granularity: "date",
          }),
        },
      ],
    },
  },
] as unknown as readonly FilterDescriptor<"createdAt">[];

function ShortcutHarness({
  config,
  initialStates = getDefaultFilterStates(SHORTCUT_DESCRIPTORS),
  onStatesChange = () => undefined,
}: {
  config?: Partial<FilterBarConfig>;
  initialStates?: FilterStates<typeof SHORTCUT_DESCRIPTORS>;
  onStatesChange?: (states: FilterStates<typeof SHORTCUT_DESCRIPTORS>) => void;
}) {
  const [states, setStates] = useState(initialStates);
  const model = useFilters({
    descriptors: SHORTCUT_DESCRIPTORS,
    states,
    onStatesChange: (nextStates) => {
      onStatesChange(nextStates);
      setStates(nextStates);
    },
  });
  return (
    <>
      <FilterBar.Root model={model} config={config} />
      <div data-testid="signature">{model.signature}</div>
    </>
  );
}

function AddMenuHarness({
  descriptors,
  onStatesChange = () => undefined,
}: {
  descriptors: readonly FilterDescriptor<"createdAt">[];
  onStatesChange?: (states: Record<string, unknown>) => void;
}) {
  const [states, setStates] = useState(() =>
    getDefaultFilterStates(descriptors),
  );
  const model = useFilters({
    descriptors,
    states,
    onStatesChange: (nextStates) => {
      onStatesChange(nextStates);
      setStates(nextStates);
    },
  });
  return <FilterBar.Root model={model} />;
}

function openAddMenuDateShortcuts() {
  fireEvent.click(screen.getByRole("button", { name: "Filter" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Created" }));
}

describe("FilterBar add-menu date preset shortcuts", () => {
  it("quarantines rejected preset resolution in the public date editor", () => {
    render(<AddMenuHarness descriptors={UNSAFE_SHORTCUT_DESCRIPTORS} />);

    openAddMenuDateShortcuts();
    fireEvent.click(screen.getByRole("menuitem", { name: "Custom" }));
    fireEvent.click(screen.getByRole("combobox", { name: "Date preset" }));
    const option = screen.getByRole("option", { name: "Throwing" });
    expect(() => {
      fireEvent.pointerDown(option, { button: 0 });
      fireEvent.mouseDown(option, { button: 0 });
      fireEvent.pointerUp(option, { button: 0 });
      fireEvent.mouseUp(option, { button: 0 });
      fireEvent.click(option);
    }).not.toThrow();

    expect(
      screen.getByText("This preset contains unavailable dates"),
    ).toBeInTheDocument();
  });

  it("defines the previous 24 hours fixture as a full day", () => {
    const now = new Date("2026-07-31T17:30:45.000Z");

    expect(DATE_PICKER_PRESETS[1].resolve(now)).toEqual({
      value: {
        start: new Date("2026-07-30T17:30:45.000Z"),
        end: now,
      },
      mode: "range",
      granularity: "date-time",
    });
  });

  it("renders descriptor presets in order followed by a divider and Custom", () => {
    render(<ShortcutHarness />);

    openAddMenuDateShortcuts();

    const items = screen
      .getAllByRole("menuitem")
      .filter((item) => item.textContent !== "Created");
    expect(items.map((item) => item.textContent)).toEqual([
      "Today",
      "Previous 24 hours with a deliberately long label",
      "Invalid window",
      "Custom",
    ]);
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(
      items[2]?.compareDocumentPosition(screen.getByRole("separator")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen
        .getByRole("separator")
        .compareDocumentPosition(items[3] as HTMLElement) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("uses the configured custom date preset label", () => {
    render(
      <ShortcutHarness
        config={{ customDatePreset: "Choose specific dates" }}
      />,
    );

    openAddMenuDateShortcuts();

    expect(
      screen.getByRole("menuitem", { name: "Choose specific dates" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Custom" })).toBeNull();
  });

  it("applies a preset immediately with one state update and closes the menu", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:30:45.000Z"));
    const onStatesChange = vi.fn();
    render(<ShortcutHarness onStatesChange={onStatesChange} />);

    openAddMenuDateShortcuts();
    fireEvent.click(screen.getByRole("menuitem", { name: "Today" }));

    expect(onStatesChange).toHaveBeenCalledTimes(1);
    expect(onStatesChange).toHaveBeenLastCalledWith({
      createdAt: {
        type: "date",
        isApplied: true,
        start: new Date("2026-07-31T17:30:45.000Z"),
        end: new Date("2026-07-31T17:30:45.000Z"),
        presetId: "today",
      },
    });
    expect(screen.queryByRole("menuitem", { name: "Today" })).toBeNull();
    expect(
      screen.queryByRole("combobox", { name: "Date preset" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("signature")).toHaveTextContent(
      "createdAt=2026-07-31T17%3A30%3A45.000Z%2C2026-07-31T17%3A30%3A45.000Z&createdAt.__origin=today",
    );
  });

  it("opens the full DatePicker when Custom is chosen", () => {
    const onStatesChange = vi.fn();
    render(<ShortcutHarness onStatesChange={onStatesChange} />);

    openAddMenuDateShortcuts();
    fireEvent.click(screen.getByRole("menuitem", { name: "Custom" }));

    expect(onStatesChange).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("combobox", { name: "Date preset" }),
    ).toHaveTextContent("Custom");
    expect(
      screen.getByRole("textbox", { name: "Start date" }),
    ).toBeInTheDocument();
  });

  it("keeps non-opted-in date descriptors on the existing custom flow", () => {
    const descriptors = [
      {
        type: "date",
        id: "createdAt",
        label: "Created",
        datePicker: {
          mode: "range",
          granularity: "date-time",
          presets: DATE_PICKER_PRESETS,
        },
      },
    ] as const satisfies readonly FilterDescriptor<"createdAt">[];
    render(<AddMenuHarness descriptors={descriptors} />);

    fireEvent.click(screen.getByRole("button", { name: "Filter" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Created" }));

    expect(
      screen.getByRole("combobox", { name: "Date preset" }),
    ).toHaveTextContent("Custom");
    expect(screen.queryByRole("menuitem", { name: "Today" })).toBeNull();
  });

  it("opens an applied shortcut preset in the full DatePicker editor", () => {
    const states = getDefaultFilterStates(SHORTCUT_DESCRIPTORS);
    states.createdAt = {
      type: "date",
      isApplied: true,
      start: new Date("2026-07-31T17:30:45.000Z"),
      end: new Date("2026-07-31T17:30:45.000Z"),
      presetId: "today",
    };
    render(<ShortcutHarness initialStates={states} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Jul 31, 17:30 - Jul 31, 17:30",
      }),
    );

    expect(
      screen.getByRole("combobox", { name: "Date preset" }),
    ).toHaveTextContent("Today");
    expect(
      screen.getByRole("textbox", { name: "Start date" }),
    ).toBeInTheDocument();
  });

  it("disables unavailable shortcuts and quarantines resolver failures", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:30:45.000Z"));
    const onStatesChange = vi.fn();
    render(
      <AddMenuHarness
        descriptors={UNSAFE_SHORTCUT_DESCRIPTORS}
        onStatesChange={onStatesChange}
      />,
    );

    openAddMenuDateShortcuts();
    expect(
      screen.getByRole("menuitem", {
        name: "Disabled — Unavailable for this account",
      }),
    ).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(
      screen.getByRole("menuitem", {
        name: "Disabled — Unavailable for this account",
      }),
    );

    expect(() =>
      fireEvent.click(screen.getByRole("menuitem", { name: "Throwing" })),
    ).not.toThrow();

    expect(onStatesChange).not.toHaveBeenCalled();
  });
});
