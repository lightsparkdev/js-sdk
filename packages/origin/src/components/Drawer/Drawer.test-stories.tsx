"use client";

import * as React from "react";
import { Drawer } from "./index";

export function TestDefault() {
  return (
    <Drawer.Root defaultOpen>
      <Drawer.Trigger data-testid="trigger">Open drawer</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop data-testid="backdrop" />
        <Drawer.Viewport>
          <Drawer.Popup data-testid="popup">
            <Drawer.Content>
              <Drawer.Title data-testid="title">Drawer title</Drawer.Title>
              <Drawer.Description data-testid="description">
                Drawer description
              </Drawer.Description>
              <Drawer.Close data-testid="close">Close</Drawer.Close>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function TestClosed() {
  return (
    <Drawer.Root>
      <Drawer.Trigger data-testid="trigger">Open drawer</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup data-testid="popup">
            <Drawer.Content>
              <Drawer.Title>Drawer title</Drawer.Title>
              <Drawer.Close data-testid="close">Close</Drawer.Close>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function TestNonModal() {
  const [clicked, setClicked] = React.useState(false);
  return (
    <div>
      <button
        data-testid="background-button"
        onClick={() => setClicked(true)}
        style={{ position: "fixed", top: 10, left: 10, zIndex: 50 }}
      >
        {clicked ? "Clicked" : "Background"}
      </button>
      <Drawer.Root defaultOpen modal={false} disablePointerDismissal>
        <Drawer.Trigger data-testid="trigger">Open drawer</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Viewport data-testid="viewport">
            <Drawer.Popup data-testid="popup">
              <Drawer.Content>
                <Drawer.Title>Non-modal drawer</Drawer.Title>
                <Drawer.Close data-testid="close">Close</Drawer.Close>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

export function TestControlled() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <button data-testid="toggle" onClick={() => setOpen(!open)}>
        Toggle: {open ? "Open" : "Closed"}
      </button>
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup data-testid="popup">
              <Drawer.Content>
                <Drawer.Title>Controlled drawer</Drawer.Title>
                <Drawer.Close data-testid="close">Close</Drawer.Close>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

export function TestSnapPoints() {
  const snapPoints = ["148px", 1];
  const [snapPoint, setSnapPoint] = React.useState<string | number | null>(
    snapPoints[0],
  );

  return (
    <Drawer.Root
      defaultOpen
      snapPoints={snapPoints}
      snapPoint={snapPoint}
      onSnapPointChange={setSnapPoint}
    >
      <Drawer.Trigger data-testid="trigger">Open snap drawer</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup data-testid="popup">
            <Drawer.Content>
              <Drawer.Title>Snap points</Drawer.Title>
              <Drawer.Close data-testid="close">Close</Drawer.Close>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function TestWithHandle() {
  return (
    <Drawer.Root defaultOpen>
      <Drawer.Trigger data-testid="trigger">Open drawer</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup data-testid="popup">
            <Drawer.Handle data-testid="handle" />
            <Drawer.Content>
              <Drawer.Title>Drawer with handle</Drawer.Title>
              <Drawer.Close data-testid="close">Close</Drawer.Close>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function TestSidePanel() {
  return (
    <Drawer.Root defaultOpen swipeDirection="right">
      <Drawer.Trigger data-testid="trigger">Open side panel</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup data-testid="popup">
            <Drawer.Content>
              <Drawer.Title data-testid="title">Side panel</Drawer.Title>
              <Drawer.Close data-testid="close">Close</Drawer.Close>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function TestStackedSidePanel() {
  return (
    <Drawer.Root defaultOpen swipeDirection="right">
      <Drawer.Trigger data-testid="trigger">
        Open stacked side panel
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup nestedMotion="stack" data-testid="popup">
            <Drawer.Content>
              <Drawer.Title data-testid="title">
                Stacked side panel
              </Drawer.Title>
              <Drawer.Close data-testid="close">Close</Drawer.Close>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function TestEndingStackedPanel({
  direction,
}: {
  direction: "right" | "left";
}) {
  return (
    <Drawer.Root defaultOpen swipeDirection={direction}>
      <Drawer.Trigger data-testid="trigger">
        Open stacked side panel
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup
            nestedMotion="stack"
            data-ending-style=""
            data-nested-drawer-open=""
            data-testid="popup"
            style={getNestedPanelStyle(direction)}
          >
            <Drawer.Content>
              <Drawer.Title data-testid="title">
                Stacked side panel
              </Drawer.Title>
              <Drawer.Close data-testid="close">Close</Drawer.Close>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function TestEndingStackedRightPanel() {
  return <TestEndingStackedPanel direction="right" />;
}

export function TestEndingStackedLeftPanel() {
  return <TestEndingStackedPanel direction="left" />;
}

type NestedPanelDirection = "right" | "left" | "up";

interface NestedPanelProps {
  direction: NestedPanelDirection;
  stacked?: boolean;
}

function getNestedPanelStyle(
  direction: NestedPanelDirection,
): React.CSSProperties | undefined {
  if (direction === "up") {
    return undefined;
  }

  return {
    "--drawer-width": "420px",
    "--drawer-margin": "var(--spacing-xs)",
    "--drawer-radius": "var(--corner-radius-md)",
  } as React.CSSProperties;
}

function TestNestedPanel({ direction, stacked = false }: NestedPanelProps) {
  const popupStyle = getNestedPanelStyle(direction);

  return (
    <Drawer.Provider>
      <Drawer.Root defaultOpen swipeDirection={direction}>
        <Drawer.Trigger data-testid="parent-trigger">
          Open parent
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup
              data-testid="parent-popup"
              nestedMotion={stacked ? "stack" : undefined}
              style={popupStyle}
            >
              <Drawer.Content>
                <Drawer.Title>Parent panel</Drawer.Title>
                <Drawer.Root swipeDirection={direction}>
                  <Drawer.Trigger data-testid="child-trigger">
                    Open child
                  </Drawer.Trigger>
                  <Drawer.Portal>
                    <Drawer.Viewport>
                      <Drawer.Popup
                        data-testid="child-popup"
                        style={popupStyle}
                      >
                        <Drawer.Content>
                          <Drawer.Title>Child panel</Drawer.Title>
                          <Drawer.Close data-testid="child-close">
                            Close child
                          </Drawer.Close>
                        </Drawer.Content>
                      </Drawer.Popup>
                    </Drawer.Viewport>
                  </Drawer.Portal>
                </Drawer.Root>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    </Drawer.Provider>
  );
}

export function TestNestedRightPanel() {
  return <TestNestedPanel direction="right" />;
}

export function TestNestedRightPanelStacked() {
  return <TestNestedPanel direction="right" stacked />;
}

export function TestNestedLeftPanel() {
  return <TestNestedPanel direction="left" />;
}

export function TestNestedLeftPanelStacked() {
  return <TestNestedPanel direction="left" stacked />;
}

export function TestNestedTopSheet() {
  return <TestNestedPanel direction="up" />;
}

export function TestNestedTopSheetStacked() {
  return <TestNestedPanel direction="up" stacked />;
}

export function TestNested() {
  return (
    <Drawer.Provider>
      <Drawer.Root defaultOpen>
        <Drawer.Trigger data-testid="parent-trigger">
          Open parent
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup data-testid="parent-popup">
              <Drawer.Content>
                <Drawer.Title>Parent drawer</Drawer.Title>
                <Drawer.Root>
                  <Drawer.Trigger data-testid="child-trigger">
                    Open child
                  </Drawer.Trigger>
                  <Drawer.Portal>
                    <Drawer.Backdrop />
                    <Drawer.Viewport>
                      <Drawer.Popup data-testid="child-popup">
                        <Drawer.Content>
                          <Drawer.Title>Child drawer</Drawer.Title>
                          <Drawer.Close data-testid="child-close">
                            Close child
                          </Drawer.Close>
                        </Drawer.Content>
                      </Drawer.Popup>
                    </Drawer.Viewport>
                  </Drawer.Portal>
                </Drawer.Root>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    </Drawer.Provider>
  );
}

export function TestIndent() {
  return (
    <Drawer.Provider>
      <Drawer.IndentBackground data-testid="indent-bg" />
      <Drawer.Indent data-testid="indent">
        <div style={{ padding: 16, minHeight: 200 }}>
          <Drawer.Root defaultOpen>
            <Drawer.Trigger data-testid="trigger">Open drawer</Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Backdrop />
              <Drawer.Viewport>
                <Drawer.Popup data-testid="popup">
                  <Drawer.Content>
                    <Drawer.Title>Indent effect</Drawer.Title>
                    <Drawer.Close data-testid="close">Close</Drawer.Close>
                  </Drawer.Content>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </Drawer.Indent>
    </Drawer.Provider>
  );
}
