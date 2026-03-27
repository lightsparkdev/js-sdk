import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Menu } from "./";
import { Button } from "@/components/Button";
import { CentralIcon } from "@/components/Icon";

const meta: Meta = {
  title: "Components/Menu",
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>
        Open Menu
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item>New File</Menu.Item>
            <Menu.Item>Open File</Menu.Item>
            <Menu.Item>Save</Menu.Item>
            <Menu.Separator />
            <Menu.Item>Export</Menu.Item>
            <Menu.Item>Print</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>Edit</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item>
              <CentralIcon name="IconCut" size={16} />
              Cut
            </Menu.Item>
            <Menu.Item>
              <CentralIcon name="IconSquareBehindSquare1" size={16} />
              Copy
            </Menu.Item>
            <Menu.Item>
              <CentralIcon name="IconClipboard2" size={16} />
              Paste
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item>
              <CentralIcon name="IconTrash" size={16} />
              Delete
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  ),
};

function CheckboxDemo() {
  const [showGrid, setShowGrid] = React.useState(true);
  const [showRulers, setShowRulers] = React.useState(false);
  const [showGuides, setShowGuides] = React.useState(true);

  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>
        View Options
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.CheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
              <Menu.CheckboxItemIndicator />
              Show Grid
            </Menu.CheckboxItem>
            <Menu.CheckboxItem
              checked={showRulers}
              onCheckedChange={setShowRulers}
            >
              <Menu.CheckboxItemIndicator />
              Show Rulers
            </Menu.CheckboxItem>
            <Menu.CheckboxItem
              checked={showGuides}
              onCheckedChange={setShowGuides}
            >
              <Menu.CheckboxItemIndicator />
              Show Guides
            </Menu.CheckboxItem>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export const WithCheckboxItems: Story = {
  render: () => <CheckboxDemo />,
};

function RadioDemo() {
  const [theme, setTheme] = React.useState("system");

  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>Theme</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.RadioGroup value={theme} onValueChange={setTheme}>
              <Menu.RadioItem value="light">
                <Menu.RadioItemIndicator />
                Light
              </Menu.RadioItem>
              <Menu.RadioItem value="dark">
                <Menu.RadioItemIndicator />
                Dark
              </Menu.RadioItem>
              <Menu.RadioItem value="system">
                <Menu.RadioItemIndicator />
                System
              </Menu.RadioItem>
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export const WithRadioItems: Story = {
  render: () => <RadioDemo />,
};

export const WithGroups: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>
        Preferences
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Group>
              <Menu.GroupLabel>Account</Menu.GroupLabel>
              <Menu.Item>Profile</Menu.Item>
              <Menu.Item>Settings</Menu.Item>
              <Menu.Item>Billing</Menu.Item>
            </Menu.Group>
            <Menu.Separator />
            <Menu.Group>
              <Menu.GroupLabel>Help</Menu.GroupLabel>
              <Menu.Item>Documentation</Menu.Item>
              <Menu.Item>Support</Menu.Item>
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>Actions</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item>Edit</Menu.Item>
            <Menu.Item>Duplicate</Menu.Item>
            <Menu.Item disabled>Archive</Menu.Item>
            <Menu.Separator />
            <Menu.Item disabled>Delete</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  ),
};

export const WithSubmenu: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>File</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item>New</Menu.Item>
            <Menu.Item>Open</Menu.Item>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>
                <span style={{ flex: 1 }}>Share</span>
                <CentralIcon name="IconChevronRightSmall" size={16} />
              </Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner side="right" sideOffset={-4} alignOffset={-4}>
                  <Menu.Popup>
                    <Menu.Item>Email</Menu.Item>
                    <Menu.Item>Messages</Menu.Item>
                    <Menu.Item>AirDrop</Menu.Item>
                    <Menu.Separator />
                    <Menu.Item>Copy Link</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>
                <span style={{ flex: 1 }}>Export As</span>
                <CentralIcon name="IconChevronRightSmall" size={16} />
              </Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner side="right" sideOffset={-4} alignOffset={-4}>
                  <Menu.Popup>
                    <Menu.Item>PDF</Menu.Item>
                    <Menu.Item>PNG</Menu.Item>
                    <Menu.Item>SVG</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
            <Menu.Separator />
            <Menu.Item>Close</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  ),
};

function MixedDemo() {
  const [showMinimap, setShowMinimap] = React.useState(true);
  const [sortBy, setSortBy] = React.useState("name");

  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>View</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item>Zoom In</Menu.Item>
            <Menu.Item>Zoom Out</Menu.Item>
            <Menu.Item>Reset Zoom</Menu.Item>
            <Menu.Separator />
            <Menu.CheckboxItem
              checked={showMinimap}
              onCheckedChange={setShowMinimap}
            >
              <Menu.CheckboxItemIndicator />
              Show Minimap
            </Menu.CheckboxItem>
            <Menu.Separator />
            <Menu.Group>
              <Menu.GroupLabel>Sort by</Menu.GroupLabel>
              <Menu.RadioGroup value={sortBy} onValueChange={setSortBy}>
                <Menu.RadioItem value="name">
                  <Menu.RadioItemIndicator />
                  Name
                </Menu.RadioItem>
                <Menu.RadioItem value="date">
                  <Menu.RadioItemIndicator />
                  Date Modified
                </Menu.RadioItem>
                <Menu.RadioItem value="size">
                  <Menu.RadioItemIndicator />
                  Size
                </Menu.RadioItem>
              </Menu.RadioGroup>
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export const MixedItems: Story = {
  render: () => <MixedDemo />,
};
