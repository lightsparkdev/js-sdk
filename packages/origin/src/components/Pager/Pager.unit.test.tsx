import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import * as React from "react";
import { Pager, usePagerContext } from "./";
import { AnalyticsProvider } from "../Analytics";
import type {
  AnalyticsHandler,
  InteractionInfo,
} from "../Analytics/AnalyticsContext";

function captureHandler() {
  const calls: InteractionInfo[] = [];
  const handler: AnalyticsHandler = {
    onInteraction: (info) => {
      calls.push(info);
    },
  };
  return { handler, calls };
}

describe("Pager structure", () => {
  it("renders nav with aria-label and group navigation", () => {
    render(
      <Pager.Root hasPrevious hasNext>
        <Pager.Status>Showing 25 results</Pager.Status>
        <Pager.Navigation>
          <Pager.Previous />
          <Pager.Next />
        </Pager.Navigation>
      </Pager.Root>,
    );

    const nav = screen.getByRole("navigation", { name: "Pager" });
    expect(nav).toBeInTheDocument();

    const group = screen.getByRole("group", { name: "Page navigation" });
    expect(group).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next page" }),
    ).toBeInTheDocument();
  });

  it("renders Status as a polite live region", () => {
    render(
      <Pager.Root hasPrevious hasNext>
        <Pager.Status>Loading more</Pager.Status>
      </Pager.Root>,
    );

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading more");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-atomic", "true");
  });

  it("keeps Status mounted when children are empty", () => {
    render(
      <Pager.Root hasPrevious hasNext>
        <Pager.Status data-testid="status" />
      </Pager.Root>,
    );

    const status = screen.getByTestId("status");
    expect(status.tagName).toBe("SPAN");
    expect(status).toHaveAttribute("role", "status");
  });
});

describe("Pager disabled derivation", () => {
  it("disables Previous when hasPrevious is false", () => {
    render(
      <Pager.Root hasPrevious={false} hasNext>
        <Pager.Navigation>
          <Pager.Previous />
          <Pager.Next />
        </Pager.Navigation>
      </Pager.Root>,
    );

    const prev = screen.getByRole("button", { name: "Previous page" });
    expect(prev).toBeDisabled();
    expect(prev).toHaveAttribute("data-disabled", "");
  });

  it("disables Next when hasNext is false", () => {
    render(
      <Pager.Root hasPrevious hasNext={false}>
        <Pager.Navigation>
          <Pager.Previous />
          <Pager.Next />
        </Pager.Navigation>
      </Pager.Root>,
    );

    const next = screen.getByRole("button", { name: "Next page" });
    expect(next).toBeDisabled();
    expect(next).toHaveAttribute("data-disabled", "");
  });

  it("explicit disabled prop wins over derived state", () => {
    render(
      <Pager.Root hasPrevious={false} hasNext>
        <Pager.Navigation>
          <Pager.Previous disabled={false} />
        </Pager.Navigation>
      </Pager.Root>,
    );

    const prev = screen.getByRole("button", { name: "Previous page" });
    expect(prev).not.toBeDisabled();
    expect(prev).not.toHaveAttribute("data-disabled");
  });
});

describe("Pager interaction", () => {
  it("clicking Previous fires onPrevious", () => {
    const onPrevious = vi.fn();
    render(
      <Pager.Root hasPrevious hasNext onPrevious={onPrevious}>
        <Pager.Navigation>
          <Pager.Previous />
          <Pager.Next />
        </Pager.Navigation>
      </Pager.Root>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it("clicking Next fires onNext", () => {
    const onNext = vi.fn();
    render(
      <Pager.Root hasPrevious hasNext onNext={onNext}>
        <Pager.Navigation>
          <Pager.Previous />
          <Pager.Next />
        </Pager.Navigation>
      </Pager.Root>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("preventDefault on consumer onClick suppresses context handler", () => {
    const onPrevious = vi.fn();
    render(
      <Pager.Root hasPrevious hasNext onPrevious={onPrevious}>
        <Pager.Navigation>
          <Pager.Previous
            onClick={(event) => {
              event.preventDefault();
            }}
          />
        </Pager.Navigation>
      </Pager.Root>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPrevious).not.toHaveBeenCalled();
  });
});

describe("Pager data attributes", () => {
  it("Root carries data-no-previous and data-no-next at edges", () => {
    render(
      <Pager.Root hasPrevious={false} hasNext={false} data-testid="root" />,
    );

    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("data-no-previous", "");
    expect(root).toHaveAttribute("data-no-next", "");
  });

  it("Root omits data-no-* when both cursors present", () => {
    render(<Pager.Root hasPrevious hasNext data-testid="root" />);

    const root = screen.getByTestId("root");
    expect(root).not.toHaveAttribute("data-no-previous");
    expect(root).not.toHaveAttribute("data-no-next");
  });

  it("Previous and Next always carry data-direction", () => {
    render(
      <Pager.Root hasPrevious hasNext>
        <Pager.Navigation>
          <Pager.Previous />
          <Pager.Next />
        </Pager.Navigation>
      </Pager.Root>,
    );

    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toHaveAttribute("data-direction", "previous");
    expect(screen.getByRole("button", { name: "Next page" })).toHaveAttribute(
      "data-direction",
      "next",
    );
  });
});

describe("Pager render prop", () => {
  it("swaps Previous and Next to anchors via render prop", () => {
    render(
      <Pager.Root hasPrevious hasNext>
        <Pager.Navigation>
          <Pager.Previous render={<a href="?before=p1" />} />
          <Pager.Next render={<a href="?after=p2" />} />
        </Pager.Navigation>
      </Pager.Root>,
    );

    const prev = screen.getByRole("link", { name: "Previous page" });
    expect(prev.tagName).toBe("A");
    expect(prev).toHaveAttribute("href", "?before=p1");
    expect(prev).toHaveAttribute("data-direction", "previous");

    const next = screen.getByRole("link", { name: "Next page" });
    expect(next).toHaveAttribute("href", "?after=p2");
    expect(next).toHaveAttribute("data-direction", "next");
  });

  it("does not invoke onPrevious when disabled anchor is clicked", () => {
    const onPrevious = vi.fn();
    render(
      <Pager.Root hasPrevious={false} hasNext onPrevious={onPrevious}>
        <Pager.Navigation>
          <Pager.Previous render={<a href="?before=p1" />} />
        </Pager.Navigation>
      </Pager.Root>,
    );

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    fireEvent(screen.getByRole("link", { name: "Previous page" }), event);

    expect(onPrevious).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not invoke onNext when disabled anchor is clicked", () => {
    const onNext = vi.fn();
    render(
      <Pager.Root hasPrevious hasNext={false} onNext={onNext}>
        <Pager.Navigation>
          <Pager.Next render={<a href="?after=p2" />} />
        </Pager.Navigation>
      </Pager.Root>,
    );

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    fireEvent(screen.getByRole("link", { name: "Next page" }), event);

    expect(onNext).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });
});

describe("usePagerContext", () => {
  function ContextProbe() {
    const { hasPrevious, hasNext } = usePagerContext();
    return (
      <span data-testid="probe">
        {String(hasPrevious)}/{String(hasNext)}
      </span>
    );
  }

  it("exposes context inside Root", () => {
    render(
      <Pager.Root hasPrevious hasNext={false}>
        <ContextProbe />
      </Pager.Root>,
    );

    expect(screen.getByTestId("probe")).toHaveTextContent("true/false");
  });

  it("throws when used outside Root", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ContextProbe />)).toThrow(
      /must be placed within <Pager\.Root>/,
    );
    spy.mockRestore();
  });
});

describe("Pager analytics", () => {
  it("emits Pager.click with direction metadata on Previous", () => {
    const { handler, calls } = captureHandler();
    const onPrevious = vi.fn();
    render(
      <AnalyticsProvider value={handler}>
        <Pager.Root
          hasPrevious
          hasNext
          analyticsName="search-pager"
          onPrevious={onPrevious}
        >
          <Pager.Navigation>
            <Pager.Previous />
            <Pager.Next />
          </Pager.Navigation>
        </Pager.Root>
      </AnalyticsProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      name: "search-pager",
      component: "Pager",
      interaction: "click",
      metadata: { direction: "previous" },
    });
    expect(onPrevious).toHaveBeenCalledOnce();
  });

  it("emits Pager.click with direction metadata on Next", () => {
    const { handler, calls } = captureHandler();
    render(
      <AnalyticsProvider value={handler}>
        <Pager.Root
          hasPrevious
          hasNext
          analyticsName="search-pager"
          onNext={() => {}}
        >
          <Pager.Navigation>
            <Pager.Previous />
            <Pager.Next />
          </Pager.Navigation>
        </Pager.Root>
      </AnalyticsProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(calls[0]?.metadata).toEqual({ direction: "next" });
  });

  it("does not emit when analyticsName is omitted", () => {
    const { handler, calls } = captureHandler();
    render(
      <AnalyticsProvider value={handler}>
        <Pager.Root hasPrevious hasNext onPrevious={() => {}}>
          <Pager.Navigation>
            <Pager.Previous />
          </Pager.Navigation>
        </Pager.Root>
      </AnalyticsProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(calls).toHaveLength(0);
  });
});

describe("Pager prop forwarding", () => {
  it("forwards data-* attributes on Root", () => {
    render(
      <Pager.Root hasPrevious hasNext data-testid="root" data-custom="value" />,
    );
    expect(screen.getByTestId("root")).toHaveAttribute("data-custom", "value");
  });

  it("merges custom className on parts", () => {
    render(
      <Pager.Root hasPrevious hasNext className="root-extra" data-testid="root">
        <Pager.Navigation className="nav-extra" data-testid="nav">
          <Pager.Previous className="prev-extra" />
        </Pager.Navigation>
      </Pager.Root>,
    );

    expect(screen.getByTestId("root").className).toContain("root-extra");
    expect(screen.getByTestId("nav").className).toContain("nav-extra");
    expect(
      screen.getByRole("button", { name: "Previous page" }).className,
    ).toContain("prev-extra");
  });
});
