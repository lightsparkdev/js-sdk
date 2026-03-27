import { describe, it, expect, vi } from "vitest";
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

describe("Table.Row keyboard accessibility", () => {
  it("fires onClick on Enter when row is focused", () => {
    const onClick = vi.fn();
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
    fireEvent.keyDown(row, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("fires onClick on Space when row is focused", () => {
    const onClick = vi.fn();
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
    fireEvent.keyDown(row, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when keydown target is a child element", () => {
    const onClick = vi.fn();
    const { container } = render(
      <table>
        <tbody>
          <Table.Row onClick={onClick}>
            <Table.Cell>
              <button data-testid="child-btn">Action</button>
            </Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );

    const button = container.querySelector("button")!;
    fireEvent.keyDown(button, { key: "Enter", bubbles: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("respects consumer onKeyDown that calls preventDefault", () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn((e: React.KeyboardEvent) => {
      if (e.key === " ") e.preventDefault();
    });

    const { container } = render(
      <table>
        <tbody>
          <Table.Row onClick={onClick} onKeyDown={onKeyDown}>
            <Table.Cell>Content</Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );

    const row = container.querySelector("tr")!;

    // Space — consumer prevents default, row onClick should not fire
    fireEvent.keyDown(row, { key: " " });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();

    // Enter — consumer does not prevent, row onClick should fire
    fireEvent.keyDown(row, { key: "Enter" });
    expect(onKeyDown).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("sets tabIndex={0} when onClick is present", () => {
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

  it("does not set tabIndex when onClick is absent", () => {
    const { container } = render(
      <table>
        <tbody>
          <Table.Row>
            <Table.Cell>Content</Table.Cell>
          </Table.Row>
        </tbody>
      </table>,
    );

    const row = container.querySelector("tr")!;
    expect(row.hasAttribute("tabindex")).toBe(false);
  });

  it("ignores non-activation keys", () => {
    const onClick = vi.fn();
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
    fireEvent.keyDown(row, { key: "Tab" });
    fireEvent.keyDown(row, { key: "Escape" });
    fireEvent.keyDown(row, { key: "ArrowDown" });
    expect(onClick).not.toHaveBeenCalled();
  });
});
