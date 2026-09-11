import { describe, it, expect, expectTypeOf, vi } from "vitest";
import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Table } from "./index";

describe("Table.Root caption", () => {
  it("renders a visually hidden caption when provided", () => {
    const { container } = render(
      <Table.Root caption="Transactions">
        <Table.Body>
          <Table.Row>
            <Table.Cell>Data</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>,
    );

    const caption = container.querySelector("caption");
    expect(caption).not.toBeNull();
    expect(caption!.textContent).toBe("Transactions");
  });

  it("does not render caption when omitted", () => {
    const { container } = render(
      <Table.Root>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Data</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>,
    );

    expect(container.querySelector("caption")).toBeNull();
  });
});

describe("Table.HeaderCell loading", () => {
  it("preserves an explicit accessible name over textual children", () => {
    const { container } = render(
      <table>
        <thead>
          <tr>
            <Table.HeaderCell loading aria-label="Account actions">
              Actions
            </Table.HeaderCell>
          </tr>
        </thead>
      </table>,
    );

    expect(container.querySelector("th")).toHaveAccessibleName(
      "Account actions",
    );
  });

  it.each(["Enter", " "])(
    "suppresses sortable interaction and semantics for %j",
    (key) => {
      const onSort = vi.fn();
      const { container } = render(
        <table>
          <thead>
            <tr>
              <Table.HeaderCell
                loading
                sortable
                sortDirection="asc"
                onSort={onSort}
              >
                Name
              </Table.HeaderCell>
            </tr>
          </thead>
        </table>,
      );
      const header = container.querySelector("th")!;

      expect(header).not.toHaveAttribute("tabindex");
      expect(header).not.toHaveAttribute("aria-sort");
      expect(header).not.toHaveAttribute("data-sortable");
      expect(header).not.toHaveAttribute("data-sorted");

      fireEvent.click(header);
      fireEvent.keyDown(header, { key });

      expect(onSort).not.toHaveBeenCalled();
    },
  );

  it("cannot be made interactive or sortable by conflicting native props", () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    const { container } = render(
      <table>
        <thead>
          <tr>
            <Table.HeaderCell
              loading
              sortable
              sortDirection="desc"
              onClick={onClick}
              onKeyDown={onKeyDown}
              tabIndex={0}
              aria-sort="ascending"
              {...{
                "data-sortable": "true",
                "data-sorted": "asc",
              }}
            >
              Name
            </Table.HeaderCell>
          </tr>
        </thead>
      </table>,
    );
    const header = container.querySelector("th")!;

    expect(header).not.toHaveAttribute("tabindex");
    expect(header).not.toHaveAttribute("aria-sort");
    expect(header).not.toHaveAttribute("data-sortable");
    expect(header).not.toHaveAttribute("data-sorted");

    fireEvent.click(header);
    fireEvent.keyDown(header, { key: "Enter" });

    expect(onClick).not.toHaveBeenCalled();
    expect(onKeyDown).not.toHaveBeenCalled();
  });
});

describe("Table.Row activation", () => {
  it("preserves the native onClick handler type", () => {
    expectTypeOf<
      React.ComponentProps<typeof Table.Row>["onClick"]
    >().toEqualTypeOf<
      React.MouseEventHandler<HTMLTableRowElement> | undefined
    >();
  });

  it("passes a real mouse event to onClick", () => {
    const onClick: React.MouseEventHandler<HTMLTableRowElement> = vi.fn(
      (event) => {
        event.currentTarget.dataset.clicked = "true";
        event.preventDefault();
      },
    );
    const { container } = render(
      <table>
        <tbody>
          <Table.Row onClick={onClick}>
            <Table.Cell>Content</Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );
    const row = container.querySelector("tr")!;

    fireEvent.click(row);

    expect(onClick).toHaveBeenCalledOnce();
    expect(row.dataset.clicked).toBe("true");
  });

  it("passes only activation modifiers to pointer and keyboard callbacks", () => {
    const onActivate = vi.fn();
    const { container } = render(
      <table>
        <tbody>
          <Table.Row activationLabel="Activate row" onActivate={onActivate}>
            <Table.Cell>Content</Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );
    const row = container.querySelector("tr")!;

    fireEvent.click(row, { metaKey: true });
    fireEvent.keyDown(row, { key: "Enter", ctrlKey: true });

    expect(onActivate.mock.calls).toEqual([
      [{ metaKey: true, ctrlKey: false }],
      [{ metaKey: false, ctrlKey: true }],
    ]);
  });

  it("keeps native clicks while suppressing nested activation", () => {
    const onClick = vi.fn();
    const onActivate = vi.fn();
    const { container } = render(
      <table>
        <tbody>
          <Table.Row
            activationLabel="Activate row"
            onClick={onClick}
            onActivate={onActivate}
          >
            <Table.Cell>
              <button type="button">Action</button>
            </Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );

    fireEvent.click(container.querySelector("button")!);

    expect(onClick).toHaveBeenCalledOnce();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("fires onActivate on Enter when row is focused", () => {
    const onActivate = vi.fn();
    const { container } = render(
      <table>
        <tbody>
          <Table.Row activationLabel="Activate row" onActivate={onActivate}>
            <Table.Cell>Content</Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );

    const row = container.querySelector("tr")!;
    fireEvent.keyDown(row, { key: "Enter" });
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("fires onActivate on Space when row is focused", () => {
    const onActivate = vi.fn();
    const { container } = render(
      <table>
        <tbody>
          <Table.Row activationLabel="Activate row" onActivate={onActivate}>
            <Table.Cell>Content</Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );

    const row = container.querySelector("tr")!;
    fireEvent.keyDown(row, { key: " " });
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it.each(["Enter", " "])(
    "preserves keyboard activation for an onClick-only row with %j",
    (key) => {
      const onClick = vi.fn((event: React.MouseEvent<HTMLTableRowElement>) => {
        event.currentTarget.dataset.activated = "true";
        event.preventDefault();
      });
      const { container } = render(
        <table>
          <tbody>
            <Table.Row onClick={onClick}>
              <Table.Cell>Content</Table.Cell>
            </Table.Row>
          </tbody>
        </table>,
      );
      const row = container.querySelector("tr")!;

      fireEvent.keyDown(row, { key });

      expect(onClick).toHaveBeenCalledOnce();
      expect(onClick.mock.calls[0]?.[0].nativeEvent).toBeInstanceOf(MouseEvent);
      expect(row.dataset.activated).toBe("true");
    },
  );

  it("does not activate when keydown target is a child element", () => {
    const onActivate = vi.fn();
    const { container } = render(
      <table>
        <tbody>
          <Table.Row activationLabel="Activate row" onActivate={onActivate}>
            <Table.Cell>
              <button data-testid="child-btn">Action</button>
            </Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );

    const button = container.querySelector("button")!;
    fireEvent.keyDown(button, { key: "Enter", bubbles: true });
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("respects consumer onKeyDown that calls preventDefault", () => {
    const onActivate = vi.fn();
    const onKeyDown = vi.fn((e: React.KeyboardEvent) => {
      if (e.key === " ") e.preventDefault();
    });

    const { container } = render(
      <table>
        <tbody>
          <Table.Row
            activationLabel="Activate row"
            onActivate={onActivate}
            onKeyDown={onKeyDown}
          >
            <Table.Cell>Content</Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );

    const row = container.querySelector("tr")!;

    // Space — consumer prevents default, row activation should not fire
    fireEvent.keyDown(row, { key: " " });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onActivate).not.toHaveBeenCalled();

    // Enter — consumer does not prevent, row activation should fire
    fireEvent.keyDown(row, { key: "Enter" });
    expect(onKeyDown).toHaveBeenCalledTimes(2);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("calls onClick then onActivate once for pointer activation", () => {
    const calls: string[] = [];
    const { container } = render(
      <table>
        <tbody>
          <Table.Row
            activationLabel="Activate row"
            onClick={() => calls.push("click")}
            onActivate={() => calls.push("activate")}
          >
            <Table.Cell>Content</Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );

    const row = container.querySelector("tr")!;
    fireEvent.click(row);
    expect(calls).toEqual(["click", "activate"]);

    fireEvent.keyDown(row, { key: "Enter" });
    expect(calls).toEqual(["click", "activate", "activate"]);
  });

  it("lets native onClick prevent normalized pointer activation", () => {
    const onActivate = vi.fn();
    const { container } = render(
      <table>
        <tbody>
          <Table.Row
            activationLabel="Activate row"
            onClick={(event) => event.preventDefault()}
            onActivate={onActivate}
          >
            <Table.Cell>Content</Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );

    fireEvent.click(container.querySelector("tr")!);

    expect(onActivate).not.toHaveBeenCalled();
  });

  it("sets tabIndex={0} when onActivate is present", () => {
    const { container } = render(
      <table>
        <tbody>
          <Table.Row activationLabel="Activate row" onActivate={() => {}}>
            <Table.Cell>Content</Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );

    const row = container.querySelector("tr")!;
    expect(row.getAttribute("tabindex")).toBe("0");
  });

  it("sets tabIndex={0} for a native onClick alone", () => {
    const { container } = render(
      <table>
        <tbody>
          <Table.Row onClick={() => {}}>
            <Table.Cell>Content</Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );

    const row = container.querySelector("tr")!;
    expect(row.getAttribute("tabindex")).toBe("0");
  });

  it("ignores non-activation keys", () => {
    const onActivate = vi.fn();
    const { container } = render(
      <table>
        <tbody>
          <Table.Row activationLabel="Activate row" onActivate={onActivate}>
            <Table.Cell>Content</Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );

    const row = container.querySelector("tr")!;
    fireEvent.keyDown(row, { key: "Tab" });
    fireEvent.keyDown(row, { key: "Escape" });
    fireEvent.keyDown(row, { key: "ArrowDown" });
    expect(onActivate).not.toHaveBeenCalled();
  });
});
