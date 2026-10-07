import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { FilterBar } from "./";
import { type FilterDescriptor } from "./filter-model";
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

const CURRENCY_DESCRIPTORS = [
  {
    type: "enum",
    id: "currency",
    label: "Currency",
    isMulti: true,
    searchable: true,
    options: [
      { label: "MXN", value: "MXN", keywords: ["Mexican Peso"] },
      { label: "USD", value: "USD", keywords: ["US Dollar"] },
      { label: "USDC", value: "USDC" },
    ],
  },
] as const satisfies readonly FilterDescriptor<"currency">[];

function Harness() {
  const model = useFilters({
    descriptors: CURRENCY_DESCRIPTORS,
    discardEmptyFilters: true,
  });
  return (
    <>
      <FilterBar.Root model={model} />
      <div data-testid="signature">{model.signature}</div>
    </>
  );
}

function openCurrencyOptions() {
  fireEvent.click(screen.getByRole("button", { name: "Filter" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Currency" }));
}

function optionLabels() {
  return screen
    .getAllByRole("menuitemcheckbox")
    .map((option) => option.textContent);
}

describe("FilterBar option search", () => {
  it("narrows options by label, value, or keyword", () => {
    render(<Harness />);
    openCurrencyOptions();

    const search = screen.getByRole("textbox", { name: "Search Currency" });
    expect(optionLabels()).toEqual(["MXN", "USD", "USDC"]);

    fireEvent.change(search, { target: { value: "us" } });
    expect(optionLabels()).toEqual(["USD", "USDC"]);

    fireEvent.change(search, { target: { value: "peso" } });
    expect(optionLabels()).toEqual(["MXN"]);

    fireEvent.change(search, { target: { value: "yen" } });
    expect(screen.queryAllByRole("menuitemcheckbox")).toHaveLength(0);
    expect(screen.getByRole("status")).toHaveTextContent("No results");
  });

  it("ignores invisible characters in a pasted search", () => {
    render(<Harness />);
    openCurrencyOptions();

    fireEvent.change(screen.getByRole("textbox", { name: "Search Currency" }), {
      target: { value: "USD\u202c" },
    });

    expect(optionLabels()).toEqual(["USD", "USDC"]);
  });

  it("removes the filter when its last value is unchecked in the add menu", () => {
    render(<Harness />);
    openCurrencyOptions();
    const mxn = () => screen.getByRole("menuitemcheckbox", { name: "MXN" });

    fireEvent.click(mxn());
    expect(screen.getByTestId("signature")).toHaveTextContent("currency=MXN");

    fireEvent.click(mxn());
    expect(screen.getByTestId("signature")).toHaveTextContent("");
    expect(
      screen.queryByRole("button", { name: "Remove filter Currency is Empty" }),
    ).toBeNull();
  });

  it("keeps selections while searching", () => {
    render(<Harness />);
    openCurrencyOptions();
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "MXN" }));

    fireEvent.change(screen.getByRole("textbox", { name: "Search Currency" }), {
      target: { value: "usd" },
    });
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "USD" }));

    expect(screen.getByTestId("signature")).toHaveTextContent(
      "currency=MXN&currency=USD",
    );
  });
});
