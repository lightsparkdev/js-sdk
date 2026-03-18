import * as React from "react";
import { Tooltip } from "./Tooltip";

export function TestTooltipDefault() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger data-testid="trigger">
          <button>Trigger</button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={8}>
            <Tooltip.Popup data-testid="popup">
              Tooltip content
              <Tooltip.Arrow data-testid="arrow" />
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export function TestTooltipHover() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger data-testid="trigger">
          <button>Hover me</button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={8}>
            <Tooltip.Popup data-testid="popup">
              Tooltip content
              <Tooltip.Arrow />
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export function TestTooltipFocus() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger data-testid="trigger">
          <button>Focus me</button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={8}>
            <Tooltip.Popup data-testid="popup">
              Tooltip on focus
              <Tooltip.Arrow />
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export function TestTooltipPlacements() {
  return (
    <Tooltip.Provider>
      <div style={{ display: "flex", gap: "4rem", padding: "4rem" }}>
        <Tooltip.Root defaultOpen>
          <Tooltip.Trigger data-testid="trigger-top">
            <button>Top</button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner side="top" sideOffset={8}>
              <Tooltip.Popup data-testid="popup-top">
                Top tooltip
                <Tooltip.Arrow />
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root defaultOpen>
          <Tooltip.Trigger data-testid="trigger-bottom">
            <button>Bottom</button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner side="bottom" sideOffset={8}>
              <Tooltip.Popup data-testid="popup-bottom">
                Bottom tooltip
                <Tooltip.Arrow />
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </Tooltip.Provider>
  );
}

export function TestTooltipControlled() {
  const [open, setOpen] = React.useState(false);
  return (
    <Tooltip.Provider>
      <div style={{ display: "flex", gap: "4rem" }}>
        <button data-testid="toggle" onClick={() => setOpen(!open)}>
          Toggle: {open ? "Open" : "Closed"}
        </button>
        <Tooltip.Root open={open}>
          <Tooltip.Trigger data-testid="trigger">
            <button>Controlled</button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={8}>
              <Tooltip.Popup data-testid="popup">
                Controlled tooltip
                <Tooltip.Arrow />
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </Tooltip.Provider>
  );
}

export function TestTooltipDelay() {
  return (
    <Tooltip.Provider delay={100}>
      <Tooltip.Root>
        <Tooltip.Trigger data-testid="trigger">
          <button>Delayed</button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={8}>
            <Tooltip.Popup data-testid="popup">
              Delayed tooltip
              <Tooltip.Arrow />
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export function TestTooltipLongText() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger data-testid="trigger">
          <button>Long text</button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={8}>
            <Tooltip.Popup data-testid="popup">
              This is a longer tooltip that demonstrates text wrapping behavior
              within the max-width constraint of 240 pixels.
              <Tooltip.Arrow />
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
