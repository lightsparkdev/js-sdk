import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { FilterBar } from "./";
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

afterEach(() => {
  vi.useRealTimers();
});

const DESCRIPTORS = [
  { type: "string", id: "reference", label: "Reference" },
  { type: "string", id: "customer", label: "Customer" },
  {
    type: "enum",
    id: "currency",
    label: "Currency",
    isMulti: true,
    options: [
      { label: "USD", value: "USD" },
      { label: "MXN", value: "MXN" },
    ],
  },
] as const satisfies readonly FilterDescriptor<string>[];

type States = FilterStates<typeof DESCRIPTORS>;

/** Store that applies each change a tick late, like a deferred URL update. */
function DeferredStoreHarness({
  initialStates = getDefaultFilterStates(DESCRIPTORS),
}: {
  initialStates?: States;
}) {
  const [states, setStates] = useState(initialStates);
  const model = useFilters({
    descriptors: DESCRIPTORS,
    discardEmptyFilters: true,
    states,
    onStatesChange: (next) => {
      setTimeout(() => setStates(next), 0);
    },
  });
  return (
    <>
      <FilterBar.Root model={model} />
      <div data-testid="signature">{model.signature}</div>
      <button
        type="button"
        onClick={() => model.setEditorOpen("customer", true)}
      >
        Open customer editor
      </button>
    </>
  );
}

function flushStore() {
  act(() => {
    vi.runAllTimers();
  });
}

function addFilter(label: string) {
  fireEvent.click(screen.getByRole("button", { name: "Filter" }));
  fireEvent.click(screen.getByRole("menuitem", { name: label }));
  flushStore();
}

describe("FilterBar discardEmptyFilters", () => {
  it("keeps a value applied right before its editor closes", () => {
    vi.useFakeTimers();
    render(<DeferredStoreHarness />);
    addFilter("Reference");

    fireEvent.change(screen.getByRole("textbox", { name: "Reference" }), {
      target: { value: "INV-42" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    flushStore();

    expect(screen.getByTestId("signature")).toHaveTextContent(
      "reference=INV-42",
    );
  });

  it("removes a filter dismissed without a value", () => {
    vi.useFakeTimers();
    render(<DeferredStoreHarness />);
    addFilter("Reference");

    fireEvent.click(screen.getByRole("button", { name: "Empty" }));
    flushStore();

    expect(
      screen.queryByRole("button", {
        name: "Remove filter Reference is Empty",
      }),
    ).toBeNull();
  });

  it("removes an empty filter when another editor opens", () => {
    vi.useFakeTimers();
    render(<DeferredStoreHarness />);
    addFilter("Reference");

    fireEvent.click(
      screen.getByRole("button", { name: "Open customer editor" }),
    );
    flushStore();

    expect(
      screen.queryByRole("button", {
        name: "Remove filter Reference is Empty",
      }),
    ).toBeNull();
  });

  it("removes a multi-select filter emptied in its editor once it closes", () => {
    vi.useFakeTimers();
    const initialStates = getDefaultFilterStates(DESCRIPTORS);
    render(
      <DeferredStoreHarness
        initialStates={{
          ...initialStates,
          currency: { type: "enum", isApplied: true, appliedValues: ["USD"] },
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "USD" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "USD" }));
    flushStore();
    expect(
      screen.getByRole("button", { name: "Remove filter Currency is Empty" }),
    ).toBeTruthy();

    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    flushStore();

    expect(
      screen.queryByRole("button", { name: "Remove filter Currency is Empty" }),
    ).toBeNull();
  });

  it("removes a cleared text filter in a single change", () => {
    vi.useFakeTimers();
    const onStatesChange = vi.fn();
    function Harness() {
      const [states, setStates] = useState(getDefaultFilterStates(DESCRIPTORS));
      const model = useFilters({
        descriptors: DESCRIPTORS,
        discardEmptyFilters: true,
        states,
        onStatesChange: (next) => {
          onStatesChange(next);
          setStates(next);
        },
      });
      return <FilterBar.Root model={model} />;
    }
    render(<Harness />);
    addFilter("Reference");
    onStatesChange.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onStatesChange).toHaveBeenCalledTimes(1);
    expect(onStatesChange.mock.calls[0]?.[0].reference.isApplied).toBe(false);
  });
});
