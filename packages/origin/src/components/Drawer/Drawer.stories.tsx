import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Drawer, createHandle } from "./index";
import { Button } from "../Button";
import { CentralIcon } from "../Icon";

const meta: Meta = {
  title: "Components/Drawer",
  component: Drawer.Root,
  argTypes: {
    modal: { control: "boolean" },
    defaultOpen: { control: "boolean" },
  },
};

export default meta;

type NestedStackDirection = "right" | "left" | "up";

function getNestedStackPopupStyle(
  direction: NestedStackDirection,
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

function NestedStackExample({
  direction,
  nestedMotion,
  label,
}: {
  direction: NestedStackDirection;
  nestedMotion?: "stack";
  label: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [childOpen, setChildOpen] = React.useState(false);

  const popupStyle = getNestedStackPopupStyle(direction);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-sm)",
        padding: "var(--spacing-lg)",
        border: "var(--stroke-xs) solid var(--border-primary)",
        borderRadius: "var(--corner-radius-md)",
        backgroundColor: "var(--surface-primary)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-4xs)",
        }}
      >
        <span className="label" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
        <span className="body-sm" style={{ color: "var(--text-secondary)" }}>
          {nestedMotion === "stack"
            ? "Parent recesses when the child drawer opens"
            : "Parent keeps the default nested behavior"}
        </span>
      </div>

      <Drawer.Root
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setChildOpen(false);
          }
        }}
        swipeDirection={direction}
      >
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open {direction} drawer
        </Button>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup nestedMotion={nestedMotion} style={popupStyle}>
              <Drawer.Title>{label}</Drawer.Title>
              <Drawer.Content>
                <Drawer.Description>
                  Open the child drawer to compare default nested behavior with
                  the stacked opt-in.
                </Drawer.Description>
                <div
                  style={{
                    marginTop: "var(--spacing-lg)",
                    display: "flex",
                    gap: "var(--spacing-xs)",
                  }}
                >
                  <Button variant="outline" onClick={() => setChildOpen(true)}>
                    Open child drawer
                  </Button>
                  <Drawer.Close render={<Button variant="outline" />}>
                    Close
                  </Drawer.Close>
                </div>

                <Drawer.Root
                  open={childOpen}
                  onOpenChange={setChildOpen}
                  swipeDirection={direction}
                >
                  <Drawer.Portal>
                    <Drawer.Viewport>
                      <Drawer.Popup style={popupStyle}>
                        <Drawer.Title>Child drawer</Drawer.Title>
                        <Drawer.Content>
                          <Drawer.Description>
                            This child keeps the default frontmost motion while
                            the parent decides whether to recess.
                          </Drawer.Description>
                          <div style={{ marginTop: "var(--spacing-lg)" }}>
                            <Drawer.Close render={<Button variant="outline" />}>
                              Close child
                            </Drawer.Close>
                          </div>
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
    </div>
  );
}

export const BottomSheet: StoryObj = {
  args: {
    modal: true,
    defaultOpen: false,
  },
  render: (args) => (
    <Drawer.Root modal={args.modal} defaultOpen={args.defaultOpen}>
      <Drawer.Trigger render={<Button variant="outline" />}>
        Open bottom sheet
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Title>Notifications</Drawer.Title>
            <Drawer.Content>
              <Drawer.Description>
                You have no new notifications. Check back later for updates on
                your account activity.
              </Drawer.Description>
              <div style={{ marginTop: "var(--spacing-lg)" }}>
                <Drawer.Close render={<Button variant="outline" />}>
                  Dismiss
                </Drawer.Close>
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  ),
};

export const SidePanel: StoryObj = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);

    const details = [
      ["Request ID", "ck8qs-177"],
      ["Method", "GET"],
      ["Path", "/customers"],
      ["Host", "api.example.com"],
      ["Status", "200 OK"],
      ["Duration", "314ms"],
      ["Cache", "HIT"],
    ];

    return (
      <div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          View request details
        </Button>
        <Drawer.Root open={open} onOpenChange={setOpen} swipeDirection="right">
          <Drawer.Portal>
            <Drawer.Backdrop />
            <Drawer.Viewport>
              <Drawer.Popup>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "var(--spacing-md) var(--spacing-xl)",
                    borderBottom:
                      "var(--stroke-xs) solid var(--border-primary)",
                  }}
                >
                  <span
                    className="label"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                  >
                    GET /customers
                  </span>
                  <Drawer.Close
                    render={
                      <Button
                        variant="ghost"
                        size="compact"
                        iconOnly
                        aria-label="Close"
                      />
                    }
                  >
                    <CentralIcon name="IconCrossSmall" size={16} />
                  </Drawer.Close>
                </div>
                <Drawer.Content>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-xs)",
                    }}
                  >
                    {details.map(([label, value]) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "var(--spacing-2xs) 0",
                        }}
                      >
                        <span
                          className="body-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {label}
                        </span>
                        <span
                          className="body-sm"
                          style={{
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-mono, monospace)",
                          }}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    );
  },
};

export const Panel: StoryObj = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);

    return (
      <div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Send payout
        </Button>
        <Drawer.Root open={open} onOpenChange={setOpen} swipeDirection="right">
          <Drawer.Portal>
            <Drawer.Backdrop />
            <Drawer.Viewport>
              <Drawer.Popup
                style={
                  {
                    "--drawer-margin": "var(--spacing-xs)",
                    "--drawer-surface": "var(--surface-primary)",
                    "--drawer-radius": "var(--corner-radius-md)",
                  } as React.CSSProperties
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "var(--spacing-md) var(--spacing-xl)",
                    borderBottom:
                      "var(--stroke-xs) solid var(--border-primary)",
                  }}
                >
                  <span
                    className="headline-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Send payout
                  </span>
                  <Drawer.Close
                    render={
                      <Button
                        variant="ghost"
                        size="compact"
                        iconOnly
                        aria-label="Close"
                      />
                    }
                  >
                    <CentralIcon name="IconCrossSmall" size={16} />
                  </Drawer.Close>
                </div>
                <Drawer.Content>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-md)",
                    }}
                  >
                    <div>
                      <label
                        className="label"
                        htmlFor="panel-recipient"
                        style={{
                          display: "block",
                          marginBottom: "var(--spacing-2xs)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Recipient
                      </label>
                      <input
                        id="panel-recipient"
                        type="text"
                        placeholder="Name or email"
                        style={{
                          width: "100%",
                          padding: "var(--spacing-sm) var(--spacing-md)",
                          border:
                            "var(--stroke-xs) solid var(--border-primary)",
                          borderRadius: "var(--corner-radius-sm)",
                          fontSize: 14,
                          color: "var(--text-primary)",
                          backgroundColor: "var(--surface-primary)",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="label"
                        htmlFor="panel-amount"
                        style={{
                          display: "block",
                          marginBottom: "var(--spacing-2xs)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Amount
                      </label>
                      <input
                        id="panel-amount"
                        type="text"
                        placeholder="$0.00"
                        style={{
                          width: "100%",
                          padding: "var(--spacing-sm) var(--spacing-md)",
                          border:
                            "var(--stroke-xs) solid var(--border-primary)",
                          borderRadius: "var(--corner-radius-sm)",
                          fontSize: 14,
                          color: "var(--text-primary)",
                          backgroundColor: "var(--surface-primary)",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="label"
                        htmlFor="panel-note"
                        style={{
                          display: "block",
                          marginBottom: "var(--spacing-2xs)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Note
                      </label>
                      <textarea
                        id="panel-note"
                        rows={2}
                        placeholder="Optional"
                        style={{
                          width: "100%",
                          padding: "var(--spacing-sm) var(--spacing-md)",
                          border:
                            "var(--stroke-xs) solid var(--border-primary)",
                          borderRadius: "var(--corner-radius-sm)",
                          fontSize: 14,
                          color: "var(--text-primary)",
                          backgroundColor: "var(--surface-primary)",
                          resize: "vertical",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "var(--spacing-xs)",
                      marginTop: "var(--spacing-lg)",
                    }}
                  >
                    <Drawer.Close render={<Button variant="outline" />}>
                      Cancel
                    </Drawer.Close>
                    <Button variant="filled">Send</Button>
                  </div>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Inset floating panel using CSS custom properties: `--drawer-margin`, `--drawer-surface`, `--drawer-radius`. Side panels default to `auto` height (stretch minus margin). No new props needed — set these on `Drawer.Popup` via `style`.",
      },
    },
  },
};

export const LeftPanel: StoryObj = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);

    const navItems = [
      { icon: "IconHome" as const, label: "Dashboard" },
      { icon: "IconUserDuo" as const, label: "Customers" },
      { icon: "IconArrowsRepeat" as const, label: "Transactions" },
      { icon: "IconSettingsGear1" as const, label: "Settings" },
    ];

    return (
      <div>
        <Button
          variant="outline"
          iconOnly
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <CentralIcon name="IconBarsThree2" size={20} />
        </Button>
        <Drawer.Root open={open} onOpenChange={setOpen} swipeDirection="left">
          <Drawer.Portal>
            <Drawer.Backdrop />
            <Drawer.Viewport>
              <Drawer.Popup>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "var(--spacing-md) var(--spacing-xl)",
                    borderBottom:
                      "var(--stroke-xs) solid var(--border-primary)",
                  }}
                >
                  <span
                    className="headline-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Menu
                  </span>
                  <Drawer.Close
                    render={
                      <Button
                        variant="ghost"
                        size="compact"
                        iconOnly
                        aria-label="Close"
                      />
                    }
                  >
                    <CentralIcon name="IconCrossSmall" size={16} />
                  </Drawer.Close>
                </div>
                <Drawer.Content>
                  <nav
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-2xs)",
                    }}
                  >
                    {navItems.map(({ icon, label }) => (
                      <Button
                        key={label}
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        style={{
                          justifyContent: "flex-start",
                          gap: "var(--spacing-sm)",
                          borderRadius: "var(--corner-radius-sm)",
                        }}
                      >
                        <CentralIcon name={icon} size={20} />
                        {label}
                      </Button>
                    ))}
                  </nav>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    );
  },
};

export const SnapPoints: StoryObj = {
  render: function Render() {
    const [snap, setSnap] = React.useState<number | string | null>(0.4);

    return (
      <Drawer.Root
        snapPoints={[0.4, 0.7, 1]}
        snapPoint={snap}
        onSnapPointChange={setSnap}
      >
        <Drawer.Trigger render={<Button variant="outline" />}>
          Open with snap points
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Title>Activity</Drawer.Title>
              <Drawer.Content>
                <p
                  className="body-sm"
                  style={{
                    margin: "0 0 var(--spacing-md)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Drag to resize between 40%, 70%, and full height.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "var(--spacing-xs)",
                    marginBottom: "var(--spacing-lg)",
                  }}
                >
                  <Button
                    variant="outline"
                    size="compact"
                    onClick={() => setSnap(0.4)}
                  >
                    40%
                  </Button>
                  <Button
                    variant="outline"
                    size="compact"
                    onClick={() => setSnap(0.7)}
                  >
                    70%
                  </Button>
                  <Button
                    variant="outline"
                    size="compact"
                    onClick={() => setSnap(1)}
                  >
                    Full
                  </Button>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-sm)",
                  }}
                >
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "var(--spacing-sm)",
                        borderRadius: "var(--corner-radius-sm)",
                        backgroundColor: "var(--surface-secondary)",
                      }}
                    >
                      <span
                        className="body-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Activity item {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    );
  },
};

export const NestedDrawers: StoryObj = {
  render: () => (
    <Drawer.Provider>
      <Drawer.IndentBackground />
      <Drawer.Indent>
        <div style={{ padding: "var(--spacing-xl)", minHeight: 200 }}>
          <Drawer.Root>
            <Drawer.Trigger render={<Button variant="outline" />}>
              Open drawer stack
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Backdrop />
              <Drawer.Viewport>
                <Drawer.Popup>
                  <Drawer.Title>Account</Drawer.Title>
                  <Drawer.Content>
                    <Drawer.Description>
                      Manage your account settings and connected devices.
                    </Drawer.Description>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--spacing-xs)",
                        marginTop: "var(--spacing-lg)",
                      }}
                    >
                      {["Personal laptop", "Work desktop", "Phone"].map(
                        (device) => (
                          <div
                            key={device}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "var(--spacing-sm)",
                              borderRadius: "var(--corner-radius-sm)",
                              backgroundColor: "var(--surface-secondary)",
                            }}
                          >
                            <span
                              className="body-sm"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {device}
                            </span>
                            <span
                              className="body-sm"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              Connected
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                    <div style={{ marginTop: "var(--spacing-lg)" }}>
                      <Drawer.Root>
                        <Drawer.Trigger render={<Button variant="outline" />}>
                          Advanced
                        </Drawer.Trigger>
                        <Drawer.Portal>
                          <Drawer.Backdrop />
                          <Drawer.Viewport>
                            <Drawer.Popup>
                              <Drawer.Title>Advanced</Drawer.Title>
                              <Drawer.Content>
                                <Drawer.Description>
                                  This drawer is taller to demonstrate
                                  variable-height stacking.
                                </Drawer.Description>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "var(--spacing-md)",
                                    marginTop: "var(--spacing-lg)",
                                  }}
                                >
                                  <div>
                                    <label
                                      className="label"
                                      htmlFor="nested-device"
                                      style={{
                                        display: "block",
                                        marginBottom: "var(--spacing-2xs)",
                                        color: "var(--text-secondary)",
                                      }}
                                    >
                                      Device name
                                    </label>
                                    <input
                                      id="nested-device"
                                      type="text"
                                      defaultValue="Personal laptop"
                                      style={{
                                        width: "100%",
                                        padding:
                                          "var(--spacing-sm) var(--spacing-md)",
                                        border:
                                          "var(--stroke-xs) solid var(--border-primary)",
                                        borderRadius: "var(--corner-radius-sm)",
                                        fontSize: 14,
                                        color: "var(--text-primary)",
                                        backgroundColor:
                                          "var(--surface-primary)",
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label
                                      className="label"
                                      htmlFor="nested-notes"
                                      style={{
                                        display: "block",
                                        marginBottom: "var(--spacing-2xs)",
                                        color: "var(--text-secondary)",
                                      }}
                                    >
                                      Notes
                                    </label>
                                    <textarea
                                      id="nested-notes"
                                      rows={3}
                                      defaultValue="Rotate recovery codes and revoke older sessions."
                                      style={{
                                        width: "100%",
                                        padding:
                                          "var(--spacing-sm) var(--spacing-md)",
                                        border:
                                          "var(--stroke-xs) solid var(--border-primary)",
                                        borderRadius: "var(--corner-radius-sm)",
                                        fontSize: 14,
                                        color: "var(--text-primary)",
                                        backgroundColor:
                                          "var(--surface-primary)",
                                        resize: "vertical",
                                      }}
                                    />
                                  </div>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    marginTop: "var(--spacing-lg)",
                                  }}
                                >
                                  <Drawer.Close
                                    render={<Button variant="outline" />}
                                  >
                                    Done
                                  </Drawer.Close>
                                </div>
                              </Drawer.Content>
                            </Drawer.Popup>
                          </Drawer.Viewport>
                        </Drawer.Portal>
                      </Drawer.Root>
                    </div>
                  </Drawer.Content>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </Drawer.Indent>
    </Drawer.Provider>
  ),
};

export const NestedDirectionalStacking: StoryObj = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-xl)",
        padding: "var(--spacing-xl)",
      }}
    >
      {(["right", "left", "up"] as const).map((direction) => (
        <section
          key={direction}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-md)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-4xs)",
            }}
          >
            <h3
              className="headline-sm"
              style={{ margin: 0, color: "var(--text-primary)" }}
            >
              {direction === "up"
                ? "Top sheets"
                : `${direction[0].toUpperCase()}${direction.slice(1)} panels`}
            </h3>
            <p
              className="body-sm"
              style={{ margin: 0, color: "var(--text-secondary)" }}
            >
              Compare the default nested behavior with the popup-level stacked
              opt-in.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: "var(--spacing-md)",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            <NestedStackExample
              direction={direction}
              label={`${
                direction === "up" ? "Top sheet" : "Panel"
              } without nestedMotion`}
            />
            <NestedStackExample
              direction={direction}
              nestedMotion="stack"
              label={`${
                direction === "up" ? "Top sheet" : "Panel"
              } with nestedMotion="stack"`}
            />
          </div>
        </section>
      ))}
    </div>
  ),
};

export const CustomWidth: StoryObj = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);

    return (
      <div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open wide panel
        </Button>
        <Drawer.Root open={open} onOpenChange={setOpen} swipeDirection="right">
          <Drawer.Portal>
            <Drawer.Backdrop />
            <Drawer.Viewport>
              <Drawer.Popup
                style={{ "--drawer-width": "600px" } as React.CSSProperties}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "var(--spacing-md) var(--spacing-xl)",
                    borderBottom:
                      "var(--stroke-xs) solid var(--border-primary)",
                  }}
                >
                  <span
                    className="headline-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Event log
                  </span>
                  <Drawer.Close
                    render={
                      <Button
                        variant="ghost"
                        size="compact"
                        iconOnly
                        aria-label="Close"
                      />
                    }
                  >
                    <CentralIcon name="IconCrossSmall" size={16} />
                  </Drawer.Close>
                </div>
                <Drawer.Content>
                  <p
                    className="body-sm"
                    style={{
                      margin: "0 0 var(--spacing-md)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    This panel uses{" "}
                    <code style={{ fontSize: 12 }}>--drawer-width: 600px</code>{" "}
                    instead of the default 420px.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-xs)",
                    }}
                  >
                    {[
                      {
                        time: "14:32:01",
                        event: "payment.created",
                        id: "evt_01",
                      },
                      {
                        time: "14:32:04",
                        event: "payment.processing",
                        id: "evt_02",
                      },
                      {
                        time: "14:32:09",
                        event: "payment.completed",
                        id: "evt_03",
                      },
                      { time: "14:33:15", event: "webhook.sent", id: "evt_04" },
                      {
                        time: "14:33:16",
                        event: "webhook.delivered",
                        id: "evt_05",
                      },
                    ].map((row) => (
                      <div
                        key={row.id}
                        style={{
                          display: "flex",
                          gap: "var(--spacing-md)",
                          padding: "var(--spacing-xs) 0",
                          borderBottom:
                            "var(--stroke-xs) solid var(--border-secondary)",
                        }}
                      >
                        <span
                          className="body-sm"
                          style={{
                            color: "var(--text-tertiary)",
                            fontFamily: "var(--font-mono, monospace)",
                            minWidth: 72,
                          }}
                        >
                          {row.time}
                        </span>
                        <span
                          className="body-sm"
                          style={{
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-mono, monospace)",
                            flex: 1,
                          }}
                        >
                          {row.event}
                        </span>
                        <span
                          className="body-sm"
                          style={{
                            color: "var(--text-tertiary)",
                            fontFamily: "var(--font-mono, monospace)",
                          }}
                        >
                          {row.id}
                        </span>
                      </div>
                    ))}
                  </div>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    );
  },
};

export const Controlled: StoryObj = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const actionsRef = React.useRef<{ unmount: () => void; close: () => void }>(
      null,
    );

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-md)",
        }}
      >
        <p
          className="body"
          style={{ margin: 0, color: "var(--text-secondary)" }}
        >
          State:{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {open ? "Open" : "Closed"}
          </strong>
        </p>
        <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
          <Button variant="outline" onClick={() => setOpen(true)}>
            Open drawer
          </Button>
          <Button variant="outline" onClick={() => actionsRef.current?.close()}>
            Close imperatively
          </Button>
        </div>
        <Drawer.Root open={open} onOpenChange={setOpen} actionsRef={actionsRef}>
          <Drawer.Portal>
            <Drawer.Backdrop />
            <Drawer.Viewport>
              <Drawer.Popup>
                <Drawer.Title>Controlled drawer</Drawer.Title>
                <Drawer.Content>
                  <Drawer.Description>
                    This drawer is controlled via React state and exposes an
                    imperative close action. Try the "Close imperatively" button
                    outside.
                  </Drawer.Description>
                  <div style={{ marginTop: "var(--spacing-lg)" }}>
                    <Drawer.Close render={<Button variant="outline" />}>
                      Close from inside
                    </Drawer.Close>
                  </div>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    );
  },
};

export const InitialFocus: StoryObj = {
  render: function Render() {
    const inputRef = React.useRef<HTMLInputElement>(null);

    return (
      <Drawer.Root>
        <Drawer.Trigger render={<Button variant="outline" />}>
          Add a note
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup initialFocus={inputRef}>
              <Drawer.Title>New note</Drawer.Title>
              <Drawer.Content>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-sm)",
                  }}
                >
                  <label
                    className="label"
                    htmlFor="note-input"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Note
                  </label>
                  <input
                    ref={inputRef}
                    id="note-input"
                    type="text"
                    placeholder="Start typing..."
                    style={{
                      padding: "var(--spacing-sm) var(--spacing-md)",
                      border: "var(--stroke-xs) solid var(--border-primary)",
                      borderRadius: "var(--corner-radius-sm)",
                      fontSize: 14,
                      color: "var(--text-primary)",
                      backgroundColor: "var(--surface-primary)",
                      outline: "none",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "var(--spacing-xs)",
                    marginTop: "var(--spacing-lg)",
                  }}
                >
                  <Drawer.Close render={<Button variant="outline" />}>
                    Cancel
                  </Drawer.Close>
                  <Button variant="filled">Save</Button>
                </div>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    );
  },
};

export const HandleBar: StoryObj = {
  render: () => (
    <Drawer.Root>
      <Drawer.Trigger render={<Button variant="outline" />}>
        Open with handle
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Handle />
            <Drawer.Title>Bottom sheet</Drawer.Title>
            <Drawer.Content>
              <Drawer.Description>
                Drag the handle bar at the top to swipe this drawer closed.
              </Drawer.Description>
              <div style={{ marginTop: "var(--spacing-lg)" }}>
                <Drawer.Close render={<Button variant="outline" />}>
                  Dismiss
                </Drawer.Close>
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  ),
};

export const NonModal: StoryObj = {
  render: function Render() {
    const [count, setCount] = React.useState(0);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-md)",
          padding: "var(--spacing-xl)",
        }}
      >
        <p
          className="body"
          style={{ margin: 0, color: "var(--text-secondary)" }}
        >
          Background clicks:{" "}
          <strong style={{ color: "var(--text-primary)" }}>{count}</strong>
        </p>
        <Button variant="outline" onClick={() => setCount((c) => c + 1)}>
          Increment (behind drawer)
        </Button>
        <Drawer.Root defaultOpen modal={false} disablePointerDismissal>
          <Drawer.Trigger render={<Button variant="outline" />}>
            Open non-modal drawer
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Viewport>
              <Drawer.Popup>
                <Drawer.Handle />
                <Drawer.Title>Player</Drawer.Title>
                <Drawer.Content>
                  <Drawer.Description>
                    This non-modal drawer allows interaction with the page
                    behind it. Try clicking the increment button.
                  </Drawer.Description>
                  <div style={{ marginTop: "var(--spacing-lg)" }}>
                    <Drawer.Close render={<Button variant="outline" />}>
                      Close
                    </Drawer.Close>
                  </div>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    );
  },
};

export const ActionSheet: StoryObj = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);

    const actions = [
      "Unfollow",
      "Mute",
      "Add to Favourites",
      "Add to Close Friends",
      "Restrict",
    ];

    return (
      <div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open action sheet
        </Button>
        <Drawer.Root open={open} onOpenChange={setOpen}>
          <Drawer.Portal>
            <Drawer.Backdrop />
            <Drawer.Viewport>
              <Drawer.Popup
                style={{
                  background: "none",
                  outline: "none",
                  boxShadow: "none",
                }}
              >
                <Drawer.Title className="visually-hidden">
                  User actions
                </Drawer.Title>
                <Drawer.Description className="visually-hidden">
                  Choose an action.
                </Drawer.Description>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-sm)",
                    padding:
                      "var(--spacing-sm) var(--spacing-xl) var(--spacing-xl)",
                    maxWidth: 360,
                    margin: "0 auto",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: "var(--corner-radius-sm)",
                      overflow: "hidden",
                      outline: "var(--stroke-xs) solid var(--border-secondary)",
                      backgroundColor: "var(--surface-primary)",
                    }}
                  >
                    {actions.map((label, i) => (
                      <Button
                        key={label}
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        style={{
                          borderRadius: 0,
                          borderTop:
                            i > 0
                              ? "var(--stroke-xs) solid var(--border-primary)"
                              : "none",
                          justifyContent: "center",
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="critical"
                    onClick={() => setOpen(false)}
                    style={{
                      justifyContent: "center",
                      borderRadius: "var(--corner-radius-sm)",
                      outline: "var(--stroke-xs) solid var(--border-secondary)",
                    }}
                  >
                    Block User
                  </Button>
                </div>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    );
  },
};

export const DetachedTrigger: StoryObj = {
  render: function Render() {
    const handle = React.useMemo(() => createHandle(), []);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-md)",
        }}
      >
        <p
          className="body"
          style={{ margin: 0, color: "var(--text-secondary)" }}
        >
          The trigger below is not nested inside{" "}
          <code style={{ fontSize: 12 }}>Drawer.Root</code> — it uses{" "}
          <code style={{ fontSize: 12 }}>createHandle</code> to control the
          drawer imperatively.
        </p>
        <Drawer.Trigger render={<Button variant="outline" />} handle={handle}>
          Open from detached trigger
        </Drawer.Trigger>
        <Drawer.Root handle={handle}>
          <Drawer.Portal>
            <Drawer.Backdrop />
            <Drawer.Viewport>
              <Drawer.Popup>
                <Drawer.Title>Detached trigger</Drawer.Title>
                <Drawer.Content>
                  <Drawer.Description>
                    This drawer was opened by a trigger outside its component
                    tree using the handle pattern.
                  </Drawer.Description>
                  <div style={{ marginTop: "var(--spacing-lg)" }}>
                    <Drawer.Close render={<Button variant="outline" />}>
                      Close
                    </Drawer.Close>
                  </div>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    );
  },
};

export const SequentialSnapPoints: StoryObj = {
  render: function Render() {
    const snapPoints = ["148px", "60%", 1] as const;
    const [snap, setSnap] = React.useState<number | string | null>(
      snapPoints[0],
    );

    return (
      <Drawer.Root
        snapPoints={[...snapPoints]}
        snapPoint={snap}
        onSnapPointChange={setSnap}
        snapToSequentialPoints
      >
        <Drawer.Trigger render={<Button variant="outline" />}>
          Open sequential snap
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Handle />
              <Drawer.Title>Sequential snapping</Drawer.Title>
              <Drawer.Content>
                <p
                  className="body-sm"
                  style={{
                    margin: "0 0 var(--spacing-md)",
                    color: "var(--text-secondary)",
                  }}
                >
                  With{" "}
                  <code style={{ fontSize: 12 }}>snapToSequentialPoints</code>{" "}
                  enabled, the drawer always snaps to the nearest adjacent point
                  based on drag distance, ignoring velocity. Try dragging slowly
                  and quickly — the result is the same.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-sm)",
                  }}
                >
                  {Array.from({ length: 15 }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "var(--spacing-sm)",
                        borderRadius: "var(--corner-radius-sm)",
                        backgroundColor: "var(--surface-secondary)",
                      }}
                    >
                      <span
                        className="body-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Item {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    );
  },
};

export const OpenChangeComplete: StoryObj = {
  render: function Render() {
    const [log, setLog] = React.useState<string[]>([]);

    const addEntry = (open: boolean) => {
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLog((prev) =>
        [
          `${time} — ${open ? "Open" : "Close"} animation finished`,
          ...prev,
        ].slice(0, 8),
      );
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-md)",
        }}
      >
        <Drawer.Root onOpenChangeComplete={addEntry}>
          <Drawer.Trigger render={<Button variant="outline" />}>
            Open drawer
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Backdrop />
            <Drawer.Viewport>
              <Drawer.Popup>
                <Drawer.Title>Transition callback</Drawer.Title>
                <Drawer.Content>
                  <Drawer.Description>
                    Close this drawer to see the callback fire after the
                    animation completes.
                  </Drawer.Description>
                  <div style={{ marginTop: "var(--spacing-lg)" }}>
                    <Drawer.Close render={<Button variant="outline" />}>
                      Close
                    </Drawer.Close>
                  </div>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
        {log.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-2xs)",
            }}
          >
            <span className="label" style={{ color: "var(--text-secondary)" }}>
              Callback log
            </span>
            {log.map((entry, i) => (
              <span
                key={i}
                className="body-sm"
                style={{
                  color: "var(--text-tertiary)",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {entry}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  },
};

export const IndentEffect: StoryObj = {
  render: () => (
    <Drawer.Provider>
      <Drawer.IndentBackground />
      <Drawer.Indent>
        <div style={{ padding: "var(--spacing-xl)", minHeight: 200 }}>
          <p
            className="body"
            style={{
              margin: "0 0 var(--spacing-md)",
              color: "var(--text-secondary)",
            }}
          >
            Open the drawer to see the page content scale and round behind it.
          </p>
          <Drawer.Root>
            <Drawer.Trigger render={<Button variant="outline" />}>
              Open drawer
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Backdrop />
              <Drawer.Viewport>
                <Drawer.Popup>
                  <Drawer.Title>Indent effect</Drawer.Title>
                  <Drawer.Content>
                    <Drawer.Description>
                      The page behind this drawer scales down and rounds its
                      corners to create a layered depth effect.
                    </Drawer.Description>
                    <div style={{ marginTop: "var(--spacing-lg)" }}>
                      <Drawer.Close render={<Button variant="outline" />}>
                        Close
                      </Drawer.Close>
                    </div>
                  </Drawer.Content>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </Drawer.Indent>
    </Drawer.Provider>
  ),
};
