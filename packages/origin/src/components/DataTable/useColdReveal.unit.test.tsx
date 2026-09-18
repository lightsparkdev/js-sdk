import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useColdReveal } from "./useColdReveal";

type ColdRevealInput = Parameters<typeof useColdReveal>[0];

const STATES = {
  cold: { coldLoading: true, loading: true, hasRows: false },
  rowsLoading: { coldLoading: false, loading: true, hasRows: true },
  rows: { coldLoading: false, loading: false, hasRows: true },
  empty: { coldLoading: false, loading: false, hasRows: false },
  warm: { coldLoading: false, loading: true, hasRows: true },
} satisfies Record<string, ColdRevealInput>;
type StateName = keyof typeof STATES;
type Action = StateName | "descendant-animation" | "table-animation";

const SCENARIOS: {
  name: string;
  initial: StateName;
  reducedMotion?: boolean;
  steps: [Action, boolean][];
}[] = [
  { name: "already loaded", initial: "rows", steps: [] },
  {
    name: "cold rows complete once",
    initial: "cold",
    steps: [
      ["rows", true],
      ["descendant-animation", true],
      ["table-animation", false],
      ["warm", false],
      ["rows", false],
    ],
  },
  {
    name: "cold rows arrive before loading settles",
    initial: "cold",
    steps: [
      ["rowsLoading", true],
      ["table-animation", false],
      ["rows", false],
      ["warm", false],
      ["rows", false],
    ],
  },
  {
    name: "cold error retry rows",
    initial: "cold",
    steps: [
      ["empty", false],
      ["cold", false],
      ["rows", false],
    ],
  },
  {
    name: "warm loading",
    initial: "warm",
    steps: [["rows", false]],
  },
  {
    name: "reduced motion",
    initial: "cold",
    reducedMotion: true,
    steps: [["rows", false]],
  },
];

function HookHarness({ state }: { state: StateName }) {
  const { coldReveal, tableRef } = useColdReveal(STATES[state]);
  return (
    <table ref={tableRef} data-cold-reveal={coldReveal || undefined}>
      <tbody>
        <tr>
          <td data-testid="descendant" />
        </tr>
      </tbody>
    </table>
  );
}

describe("useColdReveal", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", vi.fn());
  });

  afterEach(() => vi.unstubAllGlobals());

  it.each(SCENARIOS)("$name", ({ initial, reducedMotion = false, steps }) => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: reducedMotion,
    } as MediaQueryList);
    const { rerender } = render(<HookHarness state={initial} />);
    const table = screen.getByRole("table");

    expect(table).not.toHaveAttribute("data-cold-reveal");
    for (const [action, reveal] of steps) {
      if (action === "descendant-animation" || action === "table-animation") {
        fireEvent.animationEnd(
          action === "table-animation"
            ? table
            : screen.getByTestId("descendant"),
        );
      } else {
        rerender(<HookHarness state={action} />);
      }
      if (reveal) {
        expect(table).toHaveAttribute("data-cold-reveal", "true");
      } else {
        expect(table).not.toHaveAttribute("data-cold-reveal");
      }
    }
  });

  it("returns only production state and its table ref", () => {
    const { result } = renderHook(() => useColdReveal(STATES.rows));
    expect(Object.keys(result.current).sort()).toEqual([
      "coldReveal",
      "tableRef",
    ]);
  });
});
