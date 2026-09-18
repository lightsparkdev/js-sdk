/**
 * FilterBar jsdom unit tests for pill label derivation. Interactive
 * editor flows live in the Playwright CT suite (`FilterBar.test.tsx`).
 */

import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { FilterBar, type FilterBarConfig, type FiltersModel } from "./";
import { type FilterDescriptor, type FilterStates } from "./filter-model";
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

type TestFilterKey = "status";

const DESCRIPTORS = [
  {
    type: "enum",
    label: "Status",
    id: "status",
    isMulti: true,
    options: [
      // An array-valued option applies as several primitive values.
      { label: "Completed", value: ["SETTLED", "CONFIRMED"] },
      { label: "Failed", value: "FAILED" },
    ],
  },
] as const satisfies readonly FilterDescriptor<TestFilterKey>[];

const STRING_DESCRIPTORS = [
  { type: "string", label: "Reference", id: "reference" },
] as const satisfies readonly FilterDescriptor<"reference">[];

const NORMALIZED_STRING_DESCRIPTORS = [
  {
    type: "string",
    label: "Code",
    id: "code",
    normalizeValue: (value: string) => {
      const normalized = value.trim().toLowerCase();
      return normalized.startsWith("code-") ? normalized : null;
    },
    errorMessage: "Enter a valid code",
  },
] as const satisfies readonly FilterDescriptor<"code">[];

const ORDER_DESCRIPTORS = [
  { type: "string", label: "Alpha", id: "alpha" },
  { type: "string", label: "Beta", id: "beta" },
] as const satisfies readonly FilterDescriptor<"alpha" | "beta">[];

const LEGACY_STRUCTURAL_MODEL = {
  descriptors: ORDER_DESCRIPTORS,
  states: {
    alpha: { type: "string", isApplied: true, value: "one" },
    beta: { type: "string", isApplied: true, value: "two" },
  },
  appliedCount: 2,
  signature: "",
  addFilter: () => undefined,
  updateFilter: () => undefined,
  removeFilter: () => undefined,
  clearFilters: () => undefined,
  openEditorId: null,
  setEditorOpen: () => undefined,
} satisfies FiltersModel<typeof ORDER_DESCRIPTORS>;

function Harness({
  config,
  states,
}: {
  config?: Partial<FilterBarConfig>;
  states: FilterStates<typeof DESCRIPTORS>;
}) {
  const model = useFilters({
    descriptors: DESCRIPTORS,
    states,
    onStatesChange: () => undefined,
  });
  return (
    <FilterBar.Root model={model} config={config}>
      <FilterBar.Pills />
      <FilterBar.AddButton />
      <FilterBar.Clear />
    </FilterBar.Root>
  );
}

function ChildlessHarness({ children }: { children?: ReactNode }) {
  const model = useFilters({
    descriptors: DESCRIPTORS,
    states: {
      status: {
        type: "enum",
        isApplied: true,
        appliedValues: ["FAILED"],
      },
    },
    onStatesChange: () => undefined,
  });
  return <FilterBar.Root model={model}>{children}</FilterBar.Root>;
}

function StringEditorHarness() {
  const model = useFilters({
    descriptors: STRING_DESCRIPTORS,
    states: {
      reference: {
        type: "string",
        isApplied: true,
        value: null,
      },
    },
    onStatesChange: () => undefined,
  });
  return (
    <FilterBar.Root model={model}>
      <FilterBar.Pills />
    </FilterBar.Root>
  );
}

function NormalizedStringEditorHarness({
  onStatesChange = () => undefined,
}: {
  onStatesChange?: (
    states: FilterStates<typeof NORMALIZED_STRING_DESCRIPTORS>,
  ) => void;
}) {
  const model = useFilters({
    descriptors: NORMALIZED_STRING_DESCRIPTORS,
    states: {
      code: {
        type: "string",
        isApplied: true,
        value: null,
      },
    },
    onStatesChange,
  });
  return (
    <FilterBar.Root model={model}>
      <FilterBar.Pills />
    </FilterBar.Root>
  );
}

function OrderedPillsHarness({ orderPolicy }: { orderPolicy?: "application" }) {
  const model = useFilters({
    descriptors: ORDER_DESCRIPTORS,
    states: {
      alpha: { type: "string", isApplied: true, value: "one" },
      beta: { type: "string", isApplied: true, value: "two" },
    },
    ...(orderPolicy
      ? {
          orderPolicy,
          appliedFilterIds: ["beta", "alpha"] as const,
        }
      : {}),
    onStatesChange: () => undefined,
  });
  return (
    <FilterBar.Root model={model}>
      <FilterBar.Pills />
    </FilterBar.Root>
  );
}

describe("FilterBar pill labels", () => {
  it("renders pills in descriptor order by default", () => {
    const { container } = render(<OrderedPillsHarness />);

    expect(
      Array.from(container.querySelectorAll("[data-filter-id]")).map((pill) =>
        pill.getAttribute("data-filter-id"),
      ),
    ).toEqual(["alpha", "beta"]);
  });

  it("renders pills in application order when requested", () => {
    const { container } = render(
      <OrderedPillsHarness orderPolicy="application" />,
    );

    expect(
      Array.from(container.querySelectorAll("[data-filter-id]")).map((pill) =>
        pill.getAttribute("data-filter-id"),
      ),
    ).toEqual(["beta", "alpha"]);
  });

  it("renders legacy structural models in descriptor order", () => {
    const { container } = render(
      <FilterBar.Root model={LEGACY_STRUCTURAL_MODEL}>
        <FilterBar.Pills />
      </FilterBar.Root>,
    );

    expect(
      Array.from(container.querySelectorAll("[data-filter-id]")).map((pill) =>
        pill.getAttribute("data-filter-id"),
      ),
    ).toEqual(["alpha", "beta"]);
  });

  it("renders the standard accessible composition when children are omitted", () => {
    render(<ChildlessHarness />);

    expect(screen.getByRole("button", { name: "Failed" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Filter" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
  });

  it("uses explicit children as a complete composition override", () => {
    render(
      <ChildlessHarness>
        <span>Custom filters</span>
      </ChildlessHarness>,
    );

    expect(screen.getByText("Custom filters")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Failed" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Filter" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("uses stable English chrome with zero configuration", () => {
    render(
      <Harness
        states={{
          status: {
            type: "enum",
            isApplied: true,
            appliedValues: [],
          },
        }}
      />,
    );

    expect(screen.getByText("is")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Empty" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Filter" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
  });

  it("accepts cohesive chrome overrides on Root", () => {
    render(
      <Harness
        config={{
          operator: "equals",
          emptyValue: "None",
          apply: "Use",
          addFilter: "Add condition",
          clearFilters: "Reset",
        }}
        states={{
          status: {
            type: "enum",
            isApplied: true,
            appliedValues: [],
          },
        }}
      />,
    );

    expect(screen.getByText("equals")).toBeTruthy();
    expect(screen.getByRole("button", { name: "None" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add condition" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reset" })).toBeTruthy();
  });

  it("labels an applied array-valued enum option by its option label, once", () => {
    render(
      <Harness
        states={{
          status: {
            type: "enum",
            isApplied: true,
            appliedValues: ["SETTLED", "CONFIRMED"],
          },
        }}
      />,
    );

    // The option's label renders once — not two fabricated per-value
    // labels ("Settled, Confirmed").
    expect(screen.getByRole("button", { name: "Completed" })).toBeTruthy();
    expect(screen.queryByText(/Settled/)).toBeNull();
  });

  it("joins array-valued and single-valued option labels in applied order", () => {
    render(
      <Harness
        states={{
          status: {
            type: "enum",
            isApplied: true,
            appliedValues: ["FAILED", "SETTLED", "CONFIRMED"],
          },
        }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Failed, Completed" }),
    ).toBeTruthy();
  });

  it("falls back to a prettified raw value with a dev warning when no option matches", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(
      <Harness
        states={{
          status: {
            type: "enum",
            isApplied: true,
            appliedValues: ["SOME_UNKNOWN_VALUE"],
          },
        }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Some unknown value" }),
    ).toBeTruthy();
    expect(
      warn.mock.calls.some((call) =>
        String(call[0]).includes('"SOME_UNKNOWN_VALUE"'),
      ),
    ).toBe(true);

    warn.mockRestore();
  });
});

describe("FilterBar editor accessible names", () => {
  it("labels a string editor from its descriptor without a placeholder", () => {
    render(<StringEditorHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Empty" }));

    expect(screen.getByRole("textbox", { name: "Reference" })).toBeTruthy();
  });

  it("normalizes string editor values through the descriptor callback", () => {
    const onStatesChange = vi.fn();
    render(<NormalizedStringEditorHarness onStatesChange={onStatesChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Empty" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Code" }), {
      target: { value: " CODE-123 " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onStatesChange).toHaveBeenCalledWith({
      code: {
        type: "string",
        isApplied: true,
        value: "code-123",
      },
    });
  });

  it("announces the consumer error when string normalization rejects", () => {
    const onStatesChange = vi.fn();
    render(<NormalizedStringEditorHarness onStatesChange={onStatesChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Empty" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Code" }), {
      target: { value: "invalid" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid code");
    expect(onStatesChange).not.toHaveBeenCalled();
  });
});
