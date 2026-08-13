import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { DatePickerPreset } from "../DatePicker";
import { FilterBar } from "./";
import { createUrlBackedFiltersHook } from "./createUrlBackedFiltersHook";
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
  initialUrlSearch = DEFAULT_URL_SEARCH;
  latestUrlSearch = DEFAULT_URL_SEARCH;
});

const PRESETS = [
  {
    id: "today",
    label: "Today",
    textValue: "Today",
    resolve: (now) => ({
      value: {
        start: new Date(now),
        end: new Date(now),
      },
      mode: "range",
      granularity: "date-time",
    }),
  },
  {
    id: "window",
    label: "Previous 24 hours with a deliberately long label",
    textValue: "Previous 24 hours with a deliberately long label",
    resolve: (now) => ({
      value: {
        start: new Date(now.getTime() - 60 * 60 * 1000),
        end: new Date(now),
      },
      mode: "range",
      granularity: "date-time",
    }),
  },
  {
    id: "invalid",
    label: "Invalid window",
    textValue: "Invalid window",
    resolve: () => ({
      value: {
        start: new Date(Number.NaN),
        end: new Date(Number.NaN),
      },
      mode: "range",
      granularity: "date-time",
    }),
  },
] as const;

const DESCRIPTORS = [
  {
    type: "date",
    id: "createdAt",
    label: "Created",
    datePicker: {
      mode: "range",
      granularity: "date-time",
      presets: PRESETS,
    },
  },
] as const satisfies readonly FilterDescriptor<"createdAt">[];

const LEGACY_DESCRIPTORS = [
  {
    type: "date",
    id: "createdAt",
    label: "Created",
  },
] as const satisfies readonly FilterDescriptor<"createdAt">[];

const SINGLE_DEFAULT_DESCRIPTORS = [
  {
    type: "date",
    id: "createdAt",
    label: "Created",
    defaultRange: () => ({
      start: new Date("2026-07-29T09:00:00.000Z"),
      end: new Date("2026-07-30T17:00:00.000Z"),
    }),
    datePicker: {
      mode: "single",
      granularity: "date",
    },
  },
] as const satisfies readonly FilterDescriptor<"createdAt">[];

function Harness({
  initialStates = getDefaultFilterStates(DESCRIPTORS),
  onStatesChange = () => undefined,
}: {
  initialStates?: FilterStates<typeof DESCRIPTORS>;
  onStatesChange?: (states: FilterStates<typeof DESCRIPTORS>) => void;
}) {
  const [states, setStates] = useState(initialStates);
  const model = useFilters({
    descriptors: DESCRIPTORS,
    states,
    onStatesChange: (nextStates) => {
      onStatesChange(nextStates);
      setStates(nextStates);
    },
  });
  return (
    <FilterBar.Root model={model}>
      <FilterBar.Pills />
    </FilterBar.Root>
  );
}

function LegacyHarness({
  onStatesChange,
}: {
  onStatesChange: (states: FilterStates<typeof LEGACY_DESCRIPTORS>) => void;
}) {
  const initialStates = getDefaultFilterStates(LEGACY_DESCRIPTORS);
  initialStates.createdAt.isApplied = true;
  const [states, setStates] = useState(initialStates);
  const model = useFilters({
    descriptors: LEGACY_DESCRIPTORS,
    states,
    onStatesChange: (nextStates) => {
      onStatesChange(nextStates);
      setStates(nextStates);
    },
  });
  return (
    <FilterBar.Root model={model}>
      <FilterBar.Pills />
    </FilterBar.Root>
  );
}

function SingleDefaultHarness({
  onStatesChange,
}: {
  onStatesChange: (
    states: FilterStates<typeof SINGLE_DEFAULT_DESCRIPTORS>,
  ) => void;
}) {
  const initialStates = getDefaultFilterStates(SINGLE_DEFAULT_DESCRIPTORS);
  initialStates.createdAt.isApplied = true;
  const [states, setStates] = useState(initialStates);
  const model = useFilters({
    descriptors: SINGLE_DEFAULT_DESCRIPTORS,
    states,
    onStatesChange: (nextStates) => {
      onStatesChange(nextStates);
      setStates(nextStates);
    },
  });
  return (
    <FilterBar.Root model={model}>
      <FilterBar.Pills />
    </FilterBar.Root>
  );
}

const DEFAULT_URL_SEARCH =
  "createdAt=2026-07-29T09%3A00%3A00.000Z%2C2026-07-30T17%3A00%3A00.000Z";
let initialUrlSearch = DEFAULT_URL_SEARCH;
let latestUrlSearch = DEFAULT_URL_SEARCH;

function useStatefulSearchParams() {
  const [search, setSearch] = useState(initialUrlSearch);
  return {
    search,
    updateSearchParams(update: (current: URLSearchParams) => URLSearchParams) {
      setSearch((current) => {
        latestUrlSearch = update(new URLSearchParams(current)).toString();
        return latestUrlSearch;
      });
    },
  };
}

const useUrlBackedDateFilters = createUrlBackedFiltersHook({
  useSearchParamsAdapter: useStatefulSearchParams,
  history: "replace",
});

function UrlBackedHarness() {
  const model = useUrlBackedDateFilters({
    descriptors: DESCRIPTORS,
    registerFilterActions: false,
  });
  const state = model.states.createdAt;
  return (
    <>
      <FilterBar.Root model={model}>
        <FilterBar.Pills />
      </FilterBar.Root>
      <div data-testid="query-semantics">
        {[
          state.presetId,
          state.start?.toISOString(),
          state.end?.toISOString(),
        ].join("|")}
      </div>
    </>
  );
}

function openEditor() {
  fireEvent.click(screen.getByRole("button", { name: "Empty" }));
}

function choosePreset(label: string) {
  fireEvent.click(screen.getByRole("combobox", { name: "Date preset" }));
  const option = screen.getByRole("option", { name: label });
  fireEvent.pointerDown(option, { button: 0 });
  fireEvent.mouseDown(option, { button: 0 });
  fireEvent.pointerUp(option, { button: 0 });
  fireEvent.mouseUp(option, { button: 0 });
  fireEvent.click(option);
}

describe("FilterBar DatePicker draft boundary", () => {
  it("canonicalizes a configured two-date default in single mode", () => {
    const onStatesChange = vi.fn();
    render(<SingleDefaultHarness onStatesChange={onStatesChange} />);

    openEditor();
    expect(screen.getByRole("textbox", { name: "Date" })).toHaveValue(
      "07/29/2026",
    );
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onStatesChange).toHaveBeenLastCalledWith({
      createdAt: {
        type: "date",
        isApplied: true,
        start: new Date("2026-07-29T09:00:00.000Z"),
        end: new Date("2026-07-29T09:00:00.000Z"),
        presetId: null,
      },
    });
  });

  it("derives the fixed range shape from the descriptor", () => {
    const onStatesChange = vi.fn();
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    initialStates.createdAt = {
      type: "date",
      isApplied: true,
      start: new Date("2026-07-29T09:00:00.000Z"),
      end: new Date("2026-07-30T17:00:00.000Z"),
      presetId: null,
    };
    render(
      <Harness initialStates={initialStates} onStatesChange={onStatesChange} />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Jul 29, 09:00 - Jul 30, 17:00",
      }),
    );
    expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "07/29/2026",
    );
    expect(screen.getByRole("textbox", { name: "End date" })).toHaveValue(
      "07/30/2026",
    );
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onStatesChange).toHaveBeenLastCalledWith({
      createdAt: initialStates.createdAt,
    });
  });

  it("does not render runtime shape controls for an opted-in descriptor", () => {
    const onStatesChange = vi.fn();
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    initialStates.createdAt = {
      type: "date",
      isApplied: true,
      start: new Date("2026-07-29T09:00:00.000Z"),
      end: new Date("2026-07-30T17:00:00.000Z"),
      presetId: null,
    };
    render(
      <Harness initialStates={initialStates} onStatesChange={onStatesChange} />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Jul 29, 09:00 - Jul 30, 17:00",
      }),
    );
    expect(
      screen.queryByRole("switch", { name: "Use end date" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("switch", { name: "Include time (UTC)" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    const applied = onStatesChange.mock.calls.at(-1)?.[0].createdAt;
    expect(applied).not.toHaveProperty("mode");
    expect(applied).not.toHaveProperty("granularity");
    expect(applied.end).toEqual(initialStates.createdAt.end);
  });

  it("keeps the fixed range shape after calendar edits", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:30:45.000Z"));
    const onStatesChange = vi.fn();
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    initialStates.createdAt = {
      type: "date",
      isApplied: true,
      start: null,
      end: null,
      presetId: null,
    };
    render(
      <Harness initialStates={initialStates} onStatesChange={onStatesChange} />,
    );

    openEditor();
    fireEvent.click(
      screen.getByRole("button", { name: "Wednesday, July 29, 2026" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Thursday, July 30, 2026" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    const applied = onStatesChange.mock.calls.at(-1)?.[0].createdAt;
    expect(applied.start).not.toBeNull();
    expect(applied.end).not.toEqual(applied.start);
    expect(applied).not.toHaveProperty("mode");
    expect(applied).not.toHaveProperty("granularity");
  });

  it("keeps DatePicker metadata after URL reconstruction and reopen", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:30:45.000Z"));
    render(<UrlBackedHarness />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Jul 29, 09:00 - Jul 30, 17:00",
      }),
    );
    choosePreset("Today");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.getByTestId("query-semantics")).toHaveTextContent(
      "today|2026-07-31T17:30:45.000Z|2026-07-31T17:30:45.000Z",
    );
    expect(new URLSearchParams(latestUrlSearch).get("createdAt.__origin")).toBe(
      "today",
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Jul 31, 17:30 - Jul 31, 17:30",
      }),
    );
    expect(
      screen.getByRole("textbox", { name: "Start time (UTC)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "End time (UTC)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Date preset" }),
    ).toHaveTextContent("Today");
  });

  it("rehydrates semantic preset identity after time advances", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:30:45.000Z"));
    const firstRender = render(<UrlBackedHarness />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Jul 29, 09:00 - Jul 30, 17:00",
      }),
    );
    choosePreset("Today");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    const persistedSearch = latestUrlSearch;
    firstRender.unmount();

    vi.setSystemTime(new Date("2026-08-01T17:30:45.000Z"));
    initialUrlSearch = persistedSearch;
    render(<UrlBackedHarness />);

    expect(screen.getByTestId("query-semantics")).toHaveTextContent(
      "today|2026-07-31T17:30:45.000Z|2026-07-31T17:30:45.000Z",
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Jul 31, 17:30 - Jul 31, 17:30",
      }),
    );
    expect(
      screen.getByRole("combobox", { name: "Date preset" }),
    ).toHaveTextContent("Today");
  });

  it("keeps legacy descriptors on the existing date-time range editor", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:30:45.000Z"));
    const onStatesChange = vi.fn();
    render(<LegacyHarness onStatesChange={onStatesChange} />);

    openEditor();
    expect(
      screen.queryByRole("combobox", { name: "Date preset" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("switch", { name: "Use end date" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("switch", { name: "Include time (UTC)" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Start time (UTC)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "End time (UTC)" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Wednesday, July 29, 2026" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Thursday, July 30, 2026" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onStatesChange).toHaveBeenLastCalledWith({
      createdAt: {
        type: "date",
        isApplied: true,
        start: new Date("2026-07-29T17:30:00.000Z"),
        end: new Date("2026-07-30T17:30:00.000Z"),
      },
    });
  });

  it("renders presets without auto-rendering optional shape controls", () => {
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    initialStates.createdAt.isApplied = true;
    render(<Harness initialStates={initialStates} />);

    openEditor();

    expect(
      screen.getByRole("combobox", { name: "Date preset" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("switch", { name: "Use end date" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("switch", { name: "Include time (UTC)" }),
    ).not.toBeInTheDocument();
  });

  it("places the calendar before presets, manual inputs, and Apply", () => {
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    initialStates.createdAt.isApplied = true;
    render(<Harness initialStates={initialStates} />);

    openEditor();

    const previousMonth = screen.getByRole("button", {
      name: "Previous month",
    });
    const preset = screen.getByRole("combobox", { name: "Date preset" });
    const startDate = screen.getByRole("textbox", { name: "Start date" });
    const apply = screen.getByRole("button", { name: "Apply" });
    expect(
      previousMonth.compareDocumentPosition(preset) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      preset.compareDocumentPosition(startDate) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      startDate.compareDocumentPosition(apply) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("blocks Apply and focuses the preset after an invalid resolution", () => {
    const onStatesChange = vi.fn();
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    initialStates.createdAt = {
      type: "date",
      isApplied: true,
      start: new Date("2026-07-29T09:00:00.000Z"),
      end: new Date("2026-07-30T17:00:00.000Z"),
    };
    render(
      <Harness initialStates={initialStates} onStatesChange={onStatesChange} />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Jul 29, 09:00 - Jul 30, 17:00",
      }),
    );
    choosePreset("Invalid window");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    const presetTrigger = screen.getByRole("combobox", {
      name: "Date preset",
    });
    expect(
      screen.getByText("This preset contains unavailable dates"),
    ).toBeInTheDocument();
    expect(presetTrigger).toHaveFocus();
    expect(onStatesChange).not.toHaveBeenCalled();
  });

  it("reports an unavailable preset for a runtime fixed-shape mismatch", () => {
    const preset: DatePickerPreset = {
      id: "dynamic",
      label: "Dynamic window",
      textValue: "Dynamic window",
      resolve: () => ({
        value: new Date("2026-07-31T17:30:45.000Z"),
        mode: "single",
        granularity: "date",
      }),
    };
    const descriptors = [
      {
        type: "date",
        id: "createdAt",
        label: "Created",
        datePicker: {
          mode: "range",
          granularity: "date-time",
          presets: [preset],
        },
      },
    ] as unknown as typeof DESCRIPTORS;
    const initialStates = getDefaultFilterStates(descriptors);
    initialStates.createdAt = {
      type: "date",
      isApplied: true,
      start: new Date("2026-07-29T09:00:00.000Z"),
      end: new Date("2026-07-30T17:00:00.000Z"),
      presetId: null,
    };
    const onStatesChange = vi.fn();

    function ShapeMismatchHarness() {
      const [states, setStates] = useState(initialStates);
      const model = useFilters({
        descriptors,
        states,
        onStatesChange: (nextStates) => {
          onStatesChange(nextStates);
          setStates(nextStates);
        },
      });
      return (
        <FilterBar.Root model={model}>
          <FilterBar.Pills />
        </FilterBar.Root>
      );
    }

    render(<ShapeMismatchHarness />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Jul 29, 09:00 - Jul 30, 17:00",
      }),
    );
    choosePreset("Dynamic window");

    expect(
      screen.getByText("This preset contains unavailable dates"),
    ).toBeInTheDocument();
    expect(onStatesChange).not.toHaveBeenCalled();
  });

  it("shows a field error and focuses the first date for blank Custom Apply", () => {
    const onStatesChange = vi.fn();
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    initialStates.createdAt.isApplied = true;
    render(
      <Harness initialStates={initialStates} onStatesChange={onStatesChange} />,
    );

    openEditor();
    const apply = screen.getByRole("button", { name: "Apply" });
    expect(apply).toBeEnabled();
    fireEvent.click(apply);

    const startDate = screen.getByRole("textbox", { name: "Start date" });
    const error = screen.getByText("Select a date range");
    expect(error.tagName).toBe("DIV");
    expect(error).not.toHaveAttribute("role");
    expect(error.parentElement).toHaveAttribute("data-invalid", "");
    expect(startDate).toHaveFocus();
    expect(startDate).toHaveAttribute("aria-describedby", error.id);
    expect(screen.getAllByText("Select a date range")).toHaveLength(1);
    expect(onStatesChange).not.toHaveBeenCalled();
  });

  it("clears the required range error when the user selects a date", () => {
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    initialStates.createdAt.isApplied = true;
    render(<Harness initialStates={initialStates} />);

    openEditor();
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByText("Select a date range")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Wednesday, July 29, 2026" }),
    );

    expect(screen.queryByText("Select a date range")).not.toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Start date" }),
    ).not.toHaveAttribute("aria-invalid");
  });

  it("resolves and applies a named preset as one draft snapshot", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:30:45.000Z"));
    const onStatesChange = vi.fn();
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    initialStates.createdAt = {
      type: "date",
      isApplied: true,
      start: null,
      end: null,
    };
    render(
      <Harness initialStates={initialStates} onStatesChange={onStatesChange} />,
    );

    openEditor();
    choosePreset("Today");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onStatesChange).toHaveBeenLastCalledWith({
      createdAt: {
        type: "date",
        isApplied: true,
        start: new Date("2026-07-31T17:30:45.000Z"),
        end: new Date("2026-07-31T17:30:45.000Z"),
        presetId: "today",
      },
    });
  });

  it("discards preset and value changes on cancel", () => {
    const onStatesChange = vi.fn();
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    initialStates.createdAt = {
      type: "date",
      isApplied: true,
      start: null,
      end: null,
    };
    render(
      <Harness initialStates={initialStates} onStatesChange={onStatesChange} />,
    );

    openEditor();
    choosePreset("Previous 24 hours with a deliberately long label");
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });

    expect(onStatesChange).not.toHaveBeenCalled();
  });

  it("keeps the fixed shape through preset, Custom, edit, and Apply", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:30:45.000Z"));
    const onStatesChange = vi.fn();
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    initialStates.createdAt.isApplied = true;
    render(
      <Harness initialStates={initialStates} onStatesChange={onStatesChange} />,
    );

    openEditor();
    choosePreset("Today");
    choosePreset("Custom");
    const startTime = screen.getByRole("textbox", {
      name: "Start time (UTC)",
    });
    fireEvent.change(startTime, { target: { value: "9:15 AM" } });
    fireEvent.blur(startTime);
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    const applied = onStatesChange.mock.calls.at(-1)?.[0].createdAt;
    expect(applied.presetId).toBeNull();
    expect(applied).not.toHaveProperty("mode");
    expect(applied).not.toHaveProperty("granularity");
  });

  it("keeps an invalid typed draft open and prevents Apply", () => {
    const onStatesChange = vi.fn();
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    initialStates.createdAt = {
      type: "date",
      isApplied: true,
      start: null,
      end: null,
    };
    render(
      <Harness initialStates={initialStates} onStatesChange={onStatesChange} />,
    );
    openEditor();

    const startDate = screen.getByRole("textbox", { name: "Start date" });
    fireEvent.focus(startDate);
    fireEvent.change(startDate, { target: { value: "02/31/2026" } });
    fireEvent.blur(startDate);
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(startDate).toHaveValue("02/31/2026");
    const error = screen.getByText("Enter a valid date");
    expect(error.tagName).toBe("DIV");
    expect(error).not.toHaveAttribute("role");
    expect(startDate).toHaveFocus();
    expect(startDate).toHaveAttribute("aria-describedby", error.id);
    expect(screen.getAllByText("Enter a valid date")).toHaveLength(1);
    expect(onStatesChange).not.toHaveBeenCalled();
  });

  it("allows Apply after a preset replaces an invalid typed draft", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:30:45.000Z"));
    const onStatesChange = vi.fn();
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    initialStates.createdAt = {
      type: "date",
      isApplied: true,
      start: null,
      end: null,
    };
    render(
      <Harness initialStates={initialStates} onStatesChange={onStatesChange} />,
    );
    openEditor();

    const startDate = screen.getByRole("textbox", { name: "Start date" });
    fireEvent.change(startDate, { target: { value: "02/31/2026" } });
    fireEvent.blur(startDate);
    choosePreset("Today");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onStatesChange).toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("allows Apply after a calendar selection replaces an invalid typed draft", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:30:45.000Z"));
    const onStatesChange = vi.fn();
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    initialStates.createdAt = {
      type: "date",
      isApplied: true,
      start: null,
      end: null,
    };
    render(
      <Harness initialStates={initialStates} onStatesChange={onStatesChange} />,
    );
    openEditor();

    const startDate = screen.getByRole("textbox", { name: "Start date" });
    fireEvent.change(startDate, { target: { value: "02/31/2026" } });
    fireEvent.blur(startDate);
    fireEvent.click(
      screen.getByRole("button", { name: "Wednesday, July 29, 2026" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Thursday, July 30, 2026" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onStatesChange).toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
