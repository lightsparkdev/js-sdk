import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ContextMenu } from "./";
import { CentralIcon } from "@/components/Icon";

const meta: Meta = {
  title: "Components/ContextMenu",
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj;

const TriggerArea = ({ children }: { children?: React.ReactNode }) => (
  <div
    style={{
      padding: "60px 80px",
      border: "1px dashed var(--border-secondary)",
      borderRadius: "var(--corner-radius-sm)",
      backgroundColor: "var(--surface-secondary)",
      color: "var(--text-secondary)",
      fontSize: "14px",
    }}
  >
    {children || "Right-click here"}
  </div>
);

export const Default: Story = {
  render: () => (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <TriggerArea />
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.Item>Cut</ContextMenu.Item>
            <ContextMenu.Item>Copy</ContextMenu.Item>
            <ContextMenu.Item>Paste</ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item>Delete</ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <TriggerArea />
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.Item>
              <CentralIcon name="IconPencil" size={16} />
              Edit
            </ContextMenu.Item>
            <ContextMenu.Item>
              <CentralIcon name="IconClipboard2" size={16} />
              Copy
            </ContextMenu.Item>
            <ContextMenu.Item>
              <CentralIcon name="IconTrashCanSimple" size={16} />
              Delete
            </ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  ),
};

function CheckboxDemo() {
  const [showGrid, setShowGrid] = React.useState(true);
  const [showRulers, setShowRulers] = React.useState(false);
  const [showGuides, setShowGuides] = React.useState(true);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <TriggerArea>Right-click to toggle view options</TriggerArea>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.CheckboxItem
              checked={showGrid}
              onCheckedChange={setShowGrid}
            >
              <ContextMenu.CheckboxItemIndicator />
              Show Grid
            </ContextMenu.CheckboxItem>
            <ContextMenu.CheckboxItem
              checked={showRulers}
              onCheckedChange={setShowRulers}
            >
              <ContextMenu.CheckboxItemIndicator />
              Show Rulers
            </ContextMenu.CheckboxItem>
            <ContextMenu.CheckboxItem
              checked={showGuides}
              onCheckedChange={setShowGuides}
            >
              <ContextMenu.CheckboxItemIndicator />
              Show Guides
            </ContextMenu.CheckboxItem>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

export const WithCheckboxItems: Story = {
  render: () => <CheckboxDemo />,
};

function RadioDemo() {
  const [theme, setTheme] = React.useState("system");

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <TriggerArea>Right-click to change theme</TriggerArea>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.RadioGroup value={theme} onValueChange={setTheme}>
              <ContextMenu.RadioItem value="light">
                <ContextMenu.RadioItemIndicator />
                Light
              </ContextMenu.RadioItem>
              <ContextMenu.RadioItem value="dark">
                <ContextMenu.RadioItemIndicator />
                Dark
              </ContextMenu.RadioItem>
              <ContextMenu.RadioItem value="system">
                <ContextMenu.RadioItemIndicator />
                System
              </ContextMenu.RadioItem>
            </ContextMenu.RadioGroup>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

export const WithRadioItems: Story = {
  render: () => <RadioDemo />,
};

export const WithGroups: Story = {
  render: () => (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <TriggerArea />
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.Group>
              <ContextMenu.GroupLabel>Edit</ContextMenu.GroupLabel>
              <ContextMenu.Item>Undo</ContextMenu.Item>
              <ContextMenu.Item>Redo</ContextMenu.Item>
            </ContextMenu.Group>
            <ContextMenu.Separator />
            <ContextMenu.Group>
              <ContextMenu.GroupLabel>Clipboard</ContextMenu.GroupLabel>
              <ContextMenu.Item>Cut</ContextMenu.Item>
              <ContextMenu.Item>Copy</ContextMenu.Item>
              <ContextMenu.Item>Paste</ContextMenu.Item>
            </ContextMenu.Group>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <TriggerArea />
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.Item>Cut</ContextMenu.Item>
            <ContextMenu.Item disabled>Copy</ContextMenu.Item>
            <ContextMenu.Item>Paste</ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item disabled>Delete</ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  ),
};

export const WithSubmenu: Story = {
  render: () => (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <TriggerArea />
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.Item>New</ContextMenu.Item>
            <ContextMenu.Item>Open</ContextMenu.Item>
            <ContextMenu.SubmenuRoot>
              <ContextMenu.SubmenuTrigger>
                <span style={{ flex: 1 }}>Share</span>
                <CentralIcon name="IconChevronRightSmall" size={16} />
              </ContextMenu.SubmenuTrigger>
              <ContextMenu.Portal>
                <ContextMenu.Positioner
                  side="right"
                  sideOffset={-4}
                  alignOffset={-4}
                >
                  <ContextMenu.Popup>
                    <ContextMenu.Item>Email</ContextMenu.Item>
                    <ContextMenu.Item>Messages</ContextMenu.Item>
                    <ContextMenu.Item>AirDrop</ContextMenu.Item>
                    <ContextMenu.Separator />
                    <ContextMenu.Item>Copy Link</ContextMenu.Item>
                  </ContextMenu.Popup>
                </ContextMenu.Positioner>
              </ContextMenu.Portal>
            </ContextMenu.SubmenuRoot>
            <ContextMenu.Separator />
            <ContextMenu.Item>Delete</ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  ),
};

function MixedDemo() {
  const [showMinimap, setShowMinimap] = React.useState(true);
  const [sortBy, setSortBy] = React.useState("name");

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <TriggerArea>Right-click for view options</TriggerArea>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.Item>Zoom In</ContextMenu.Item>
            <ContextMenu.Item>Zoom Out</ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.CheckboxItem
              checked={showMinimap}
              onCheckedChange={setShowMinimap}
            >
              <ContextMenu.CheckboxItemIndicator />
              Show Minimap
            </ContextMenu.CheckboxItem>
            <ContextMenu.Separator />
            <ContextMenu.Group>
              <ContextMenu.GroupLabel>Sort by</ContextMenu.GroupLabel>
              <ContextMenu.RadioGroup value={sortBy} onValueChange={setSortBy}>
                <ContextMenu.RadioItem value="name">
                  <ContextMenu.RadioItemIndicator />
                  Name
                </ContextMenu.RadioItem>
                <ContextMenu.RadioItem value="date">
                  <ContextMenu.RadioItemIndicator />
                  Date Modified
                </ContextMenu.RadioItem>
                <ContextMenu.RadioItem value="size">
                  <ContextMenu.RadioItemIndicator />
                  Size
                </ContextMenu.RadioItem>
              </ContextMenu.RadioGroup>
            </ContextMenu.Group>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

export const MixedItems: Story = {
  render: () => <MixedDemo />,
};
