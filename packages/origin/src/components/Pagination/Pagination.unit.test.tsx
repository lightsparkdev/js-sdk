import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Pagination, usePaginationContext } from "./Pagination";

describe("Pagination.Root", () => {
  it("exposes data-page and data-first-page on first page", () => {
    render(
      <Pagination.Root page={1} totalItems={500} pageSize={25}>
        <Pagination.Range />
      </Pagination.Root>,
    );

    const nav = screen.getByRole("navigation", { name: /pagination/i });
    expect(nav).toHaveAttribute("data-page", "1");
    expect(nav).toHaveAttribute("data-first-page", "");
    expect(nav).not.toHaveAttribute("data-last-page");
  });

  it("exposes data-last-page on the last page", () => {
    render(
      <Pagination.Root page={20} totalItems={500} pageSize={25}>
        <Pagination.Range />
      </Pagination.Root>,
    );

    const nav = screen.getByRole("navigation", { name: /pagination/i });
    expect(nav).toHaveAttribute("data-page", "20");
    expect(nav).toHaveAttribute("data-last-page", "");
    expect(nav).not.toHaveAttribute("data-first-page");
  });

  it("omits data-last-page when totalItems is not provided", () => {
    render(
      <Pagination.Root page={2} pageSize={25}>
        <Pagination.Navigation>
          <Pagination.Previous />
          <Pagination.Next />
        </Pagination.Navigation>
      </Pagination.Root>,
    );

    const nav = screen.getByRole("navigation", { name: /pagination/i });
    expect(nav).not.toHaveAttribute("data-last-page");
    expect(nav).not.toHaveAttribute("data-first-page");
  });

  it("renders as a custom element via render prop", () => {
    render(
      <Pagination.Root
        page={1}
        totalItems={50}
        pageSize={25}
        render={<section data-testid="root" />}
      >
        <Pagination.Range />
      </Pagination.Root>,
    );

    const root = screen.getByTestId("root");
    expect(root.tagName).toBe("SECTION");
    expect(root).toHaveAttribute("data-page", "1");
  });
});

describe("Pagination.Range", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("renders the default range string when totalItems is provided", () => {
    render(
      <Pagination.Root page={1} totalItems={2500} pageSize={100}>
        <Pagination.Range data-testid="range" />
      </Pagination.Root>,
    );

    expect(screen.getByTestId("range")).toHaveTextContent("1–100 of 2.5K");
  });

  it("warns and renders nothing when totalItems is missing without children", () => {
    render(
      <Pagination.Root page={1} pageSize={25}>
        <Pagination.Range data-testid="range" />
      </Pagination.Root>,
    );

    expect(screen.queryByTestId("range")).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Pagination.Range"),
    );
  });

  it("passes undefined fields to the children render fn when totalItems is missing", () => {
    const childrenFn = vi.fn(() => "custom");

    render(
      <Pagination.Root page={2} pageSize={25}>
        <Pagination.Range>{childrenFn}</Pagination.Range>
      </Pagination.Root>,
    );

    expect(childrenFn).toHaveBeenCalledWith({
      startItem: undefined,
      endItem: undefined,
      totalItems: undefined,
    });
  });
});

describe("Pagination navigation buttons", () => {
  it("Previous auto-disables on first page regardless of totals", () => {
    render(
      <Pagination.Root page={1} pageSize={25}>
        <Pagination.Navigation>
          <Pagination.Previous />
          <Pagination.Next />
        </Pagination.Navigation>
      </Pagination.Root>,
    );

    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
  });

  it("Next does not auto-disable when totalItems is omitted", () => {
    render(
      <Pagination.Root page={5} pageSize={25}>
        <Pagination.Navigation>
          <Pagination.Previous />
          <Pagination.Next />
        </Pagination.Navigation>
      </Pagination.Root>,
    );

    expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
  });

  it("Next auto-disables at the last page when totalItems is known", () => {
    render(
      <Pagination.Root page={4} totalItems={100} pageSize={25}>
        <Pagination.Navigation>
          <Pagination.Previous />
          <Pagination.Next />
        </Pagination.Navigation>
      </Pagination.Root>,
    );

    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("dispatches onPageChange with the next page on Next click", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination.Root
        page={2}
        totalItems={100}
        pageSize={25}
        onPageChange={onPageChange}
      >
        <Pagination.Navigation>
          <Pagination.Previous />
          <Pagination.Next />
        </Pagination.Navigation>
      </Pagination.Root>,
    );

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("renders Previous as an anchor when render is supplied", () => {
    render(
      <Pagination.Root page={3} totalItems={100} pageSize={25}>
        <Pagination.Navigation>
          <Pagination.Previous
            render={<a href="?page=2" data-testid="prev" />}
          />
          <Pagination.Next render={<a href="?page=4" data-testid="next" />} />
        </Pagination.Navigation>
      </Pagination.Root>,
    );

    const prev = screen.getByTestId("prev");
    const next = screen.getByTestId("next");
    expect(prev.tagName).toBe("A");
    expect(prev).toHaveAttribute("href", "?page=2");
    expect(next.tagName).toBe("A");
    expect(next).toHaveAttribute("href", "?page=4");
  });

  it("flags disabled anchor renders with aria-disabled and data-disabled", () => {
    render(
      <Pagination.Root page={1} totalItems={100} pageSize={25}>
        <Pagination.Navigation>
          <Pagination.Previous
            render={<a href="?page=0" data-testid="prev" />}
          />
        </Pagination.Navigation>
      </Pagination.Root>,
    );

    const prev = screen.getByTestId("prev");
    expect(prev).toHaveAttribute("aria-disabled", "true");
    expect(prev).toHaveAttribute("data-disabled", "");
  });
});

describe("usePaginationContext", () => {
  function Probe() {
    const ctx = usePaginationContext();
    return <span data-testid="probe">{ctx.page}</span>;
  }

  it("exposes context values to consumer parts", () => {
    render(
      <Pagination.Root page={4} totalItems={100} pageSize={25}>
        <Probe />
      </Pagination.Root>,
    );

    expect(screen.getByTestId("probe")).toHaveTextContent("4");
  });

  it("throws when called outside Pagination.Root", () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => render(<Probe />)).toThrow(
      /Pagination parts must be placed within/,
    );

    errorSpy.mockRestore();
  });
});
