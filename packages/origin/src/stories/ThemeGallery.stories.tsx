import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Dialog } from "@/components/Dialog";
import { Drawer, createHandle } from "@/components/Drawer";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Table } from "@/components/Table";
import { Toast } from "@/components/Toast";

const meta: Meta = {
  title: "Theme/Gallery",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj;

function ShellPreview() {
  return (
    <section
      aria-label="Application shell using the secondary surface"
      style={{
        background: "var(--surface-secondary)",
        border: "var(--stroke-xs) solid var(--border-primary)",
        borderRadius: "var(--corner-radius-md)",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          alignItems: "center",
          background: "var(--surface-primary)",
          borderBottom: "var(--stroke-xs) solid var(--border-primary)",
          display: "flex",
          height: 56,
          justifyContent: "space-between",
          padding: "0 var(--spacing-lg)",
        }}
      >
        <strong>Workspace</strong>
        <Button size="compact" variant="outline">
          New transfer
        </Button>
      </header>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "12rem minmax(0, 1fr)",
          minHeight: 280,
        }}
      >
        <nav
          aria-label="Preview navigation"
          style={{
            background: "var(--surface-primary)",
            borderRight: "var(--stroke-xs) solid var(--border-primary)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-3xs)",
            padding: "var(--spacing-md)",
          }}
        >
          {["Overview", "Activity", "Settings"].map((item, index) => (
            <div
              key={item}
              style={{
                background:
                  index === 0 ? "var(--surface-primary)" : "transparent",
                borderRadius: "var(--corner-radius-sm)",
                color:
                  index === 0 ? "var(--text-primary)" : "var(--text-secondary)",
                padding: "var(--spacing-sm) var(--spacing-md)",
              }}
            >
              {item}
            </div>
          ))}
        </nav>
        <main
          style={{
            background: "var(--surface-secondary)",
            padding: "var(--spacing-xl)",
          }}
        >
          <h2 style={{ fontSize: "var(--font-size-lg)", margin: 0 }}>
            Overview
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              margin: "var(--spacing-3xs) 0 var(--spacing-lg)",
            }}
          >
            Primary chrome and cards sit on the global secondary shell floor.
          </p>
          <div
            style={{
              display: "grid",
              gap: "var(--spacing-md)",
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            {["Available balance", "Pending volume"].map((label, index) => (
              <article
                key={label}
                style={{
                  background: "var(--surface-primary)",
                  border: "var(--stroke-xs) solid var(--border-primary)",
                  borderRadius: "var(--corner-radius-md)",
                  padding: "var(--spacing-lg)",
                }}
              >
                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  {label}
                </div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-lg)",
                    marginTop: "var(--spacing-3xs)",
                  }}
                >
                  {index === 0 ? "$48,240.18" : "$3,804.00"}
                </strong>
              </article>
            ))}
          </div>
        </main>
      </div>
    </section>
  );
}

function GallerySurface() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const drawerHandle = React.useMemo(() => createHandle(), []);
  const toastManager = Toast.useToastManager();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--surface-page)",
        color: "var(--text-primary)",
        padding: "var(--spacing-2xl)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-xl)",
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            Origin theme gallery
          </p>
          <h1
            style={{
              margin: "var(--spacing-3xs) 0 0",
              fontSize: "var(--font-size-xl)",
            }}
          >
            Settings
          </h1>
        </div>

        <ShellPreview />

        <Card.Root variant="structured">
          <Card.Header>
            <Card.TitleGroup>
              <Card.Title>Account</Card.Title>
              <Card.Subtitle>
                Stacked labeled card with grouped controls.
              </Card.Subtitle>
            </Card.TitleGroup>
          </Card.Header>
          <Card.Body>
            <div
              style={{
                display: "grid",
                gap: "var(--spacing-md)",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <Input defaultValue="Ada Lovelace" aria-label="Display name" />
              <Select.Root defaultValue="usd">
                <Select.Trigger aria-label="Settlement currency">
                  <Select.Value />
                  <Select.Icon />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Positioner>
                    <Select.Popup>
                      <Select.List>
                        <Select.Item value="usd">
                          <Select.ItemIndicator />
                          <Select.ItemText>USD</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="btc">
                          <Select.ItemIndicator />
                          <Select.ItemText>BTC</Select.ItemText>
                        </Select.Item>
                      </Select.List>
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
            </div>
          </Card.Body>
          <Card.Footer>
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </Card.Footer>
        </Card.Root>

        <Card.Root variant="structured">
          <Card.Header>
            <Card.TitleGroup>
              <Card.Title>Status and ink</Card.Title>
              <Card.Subtitle>
                On-color text stays invariant over strong fills.
              </Card.Subtitle>
            </Card.TitleGroup>
          </Card.Header>
          <Card.Body>
            <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
              <Badge variant="green" vibrant>
                Live
              </Badge>
              <Badge variant="yellow">Pending</Badge>
              <Badge variant="red">Failed</Badge>
              <Badge variant="gray">Neutral</Badge>
            </div>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="structured">
          <Card.Header>
            <Card.TitleGroup>
              <Card.Title>Recent transfers</Card.Title>
              <Card.Subtitle>In-page table on the card surface.</Card.Subtitle>
            </Card.TitleGroup>
          </Card.Header>
          <Card.Body fullwidth>
            <Table.Root clickable={false} caption="Recent transfers">
              <Table.Header>
                <Table.HeaderRow>
                  <Table.HeaderCell>Counterparty</Table.HeaderCell>
                  <Table.HeaderCell>Amount</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                </Table.HeaderRow>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>Acme Clearing</Table.Cell>
                  <Table.Cell>$1,240.00</Table.Cell>
                  <Table.Cell>Settled</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>North Desk</Table.Cell>
                  <Table.Cell>$88.12</Table.Cell>
                  <Table.Cell>Pending</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="structured">
          <Card.Header>
            <Card.TitleGroup>
              <Card.Title>Overlays</Card.Title>
              <Card.Subtitle>
                Dialogs, drawers, and toasts use overlay chrome.
              </Card.Subtitle>
            </Card.TitleGroup>
          </Card.Header>
          <Card.Body>
            <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                Open dialog
              </Button>
              <Drawer.Trigger
                render={<Button variant="outline" />}
                handle={drawerHandle}
              >
                Open drawer
              </Drawer.Trigger>
              <Button
                variant="outline"
                onClick={() =>
                  toastManager.add({
                    title: "Transfer queued",
                    description: "Toast on the overlay surface.",
                  })
                }
              >
                Show toast
              </Button>
              <Button variant="critical">Critical</Button>
            </div>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="structured">
          <Card.Header>
            <Card.TitleGroup>
              <Card.Title>Code-adjacent canvas</Card.Title>
              <Card.Subtitle>
                Quiet surface for payload or log blocks.
              </Card.Subtitle>
            </Card.TitleGroup>
          </Card.Header>
          <Card.Body>
            <pre
              style={{
                margin: 0,
                padding: "var(--spacing-md)",
                background: "var(--surface-neutral-subtle)",
                border: "var(--stroke-xs) solid var(--border-primary)",
                borderRadius: "var(--corner-radius-sm)",
                color: "var(--text-secondary)",
                overflow: "auto",
              }}
            >
              {`{\n  "theme": "resolved-from-tokens",\n  "surface": "page → card → overlay"\n}`}
            </pre>
          </Card.Body>
        </Card.Root>
      </div>

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Viewport>
            <Dialog.Popup>
              <Dialog.Header>
                <Dialog.Title>Confirm payout</Dialog.Title>
                <Dialog.Description>
                  Overlay surface with the overlay hairline.
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>

      <Drawer.Root handle={drawerHandle}>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Title>Transfer details</Drawer.Title>
              <Drawer.Content>
                <p style={{ color: "var(--text-secondary)" }}>
                  Sheet chrome should keep a hairline and elevation shadow.
                </p>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>

      <Toast.Viewport>
        {toastManager.toasts.map((toast) => (
          <Toast.Root key={toast.id} toast={toast}>
            <Toast.Content>
              <Toast.Title>{toast.title}</Toast.Title>
              {toast.description ? (
                <Toast.Description>{toast.description}</Toast.Description>
              ) : null}
            </Toast.Content>
            <Toast.Close aria-label="Close toast" />
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </div>
  );
}

export const Review: Story = {
  render: () => (
    <Toast.Provider>
      <GallerySurface />
    </Toast.Provider>
  ),
};
