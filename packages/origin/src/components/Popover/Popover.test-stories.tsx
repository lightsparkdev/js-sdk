"use client";

import * as React from "react";
import { Popover } from "./Popover";

export function TestPopoverDefault() {
  return (
    <Popover.Root defaultOpen>
      <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner data-testid="positioner">
          <Popover.Popup data-testid="popup">
            <p>Popover content</p>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function TestPopoverClick() {
  return (
    <Popover.Root>
      <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Popup data-testid="popup">
            <p>Click popover</p>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function TestPopoverControlled() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <button data-testid="open-btn" onClick={() => setOpen(true)}>
        Open
      </button>
      <button data-testid="close-btn" onClick={() => setOpen(false)}>
        Close
      </button>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger data-testid="trigger">Controlled</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Popup data-testid="popup">
              <p>Controlled popover</p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

export function TestPopoverClose() {
  return (
    <Popover.Root defaultOpen>
      <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Popup data-testid="popup">
            <p>With close</p>
            <Popover.Close data-testid="close">Close</Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function TestPopoverAccessibility() {
  return (
    <Popover.Root defaultOpen>
      <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Popup data-testid="popup">
            <Popover.Title data-testid="title">Popover Title</Popover.Title>
            <Popover.Description data-testid="description">
              This is a description
            </Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function TestPopoverBackdrop() {
  return (
    <Popover.Root defaultOpen modal>
      <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
      <Popover.Portal>
        <Popover.Backdrop data-testid="backdrop" />
        <Popover.Positioner>
          <Popover.Popup data-testid="popup">
            <p>Modal popover</p>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function TestPopoverPlacements() {
  return (
    <div style={{ display: "flex", gap: "8rem", padding: "8rem" }}>
      <Popover.Root defaultOpen>
        <Popover.Trigger data-testid="trigger-bottom">Bottom</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="bottom" data-testid="positioner-bottom">
            <Popover.Popup data-testid="popup-bottom">
              <p>Bottom popover</p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>

      <Popover.Root defaultOpen>
        <Popover.Trigger data-testid="trigger-top">Top</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="top" data-testid="positioner-top">
            <Popover.Popup data-testid="popup-top">
              <p>Top popover</p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

export function TestPopoverArrow() {
  return (
    <Popover.Root defaultOpen>
      <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Popup data-testid="popup">
            <Popover.Arrow data-testid="arrow" />
            <p>With arrow</p>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
