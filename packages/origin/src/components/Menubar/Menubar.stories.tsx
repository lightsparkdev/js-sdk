import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Menubar } from "./";
import { Menu } from "@/components/Menu";
import { CentralIcon } from "@/components/Icon";
import { Shortcut } from "@/components/Shortcut";

const meta: Meta = {
  title: "Components/Menubar",
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Menubar.Root>
      <Menu.Root>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item>New</Menu.Item>
              <Menu.Item>Open</Menu.Item>
              <Menu.Item>Save</Menu.Item>
              <Menu.Separator />
              <Menu.Item>Export</Menu.Item>
              <Menu.Item>Print</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Menu.Root>
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item>Undo</Menu.Item>
              <Menu.Item>Redo</Menu.Item>
              <Menu.Separator />
              <Menu.Item>Cut</Menu.Item>
              <Menu.Item>Copy</Menu.Item>
              <Menu.Item>Paste</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Menu.Root>
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item>Zoom In</Menu.Item>
              <Menu.Item>Zoom Out</Menu.Item>
              <Menu.Separator />
              <Menu.Item>Full Screen</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Menu.Root>
        <Menubar.Trigger>Help</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item>Documentation</Menu.Item>
              <Menu.Item>About</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </Menubar.Root>
  ),
};

export const WithShortcuts: Story = {
  render: () => (
    <Menubar.Root>
      <Menu.Root>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item style={{ justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CentralIcon name="IconFileBend" size={16} />
                  New
                </span>
                <Shortcut keys={["⌘", "N"]} />
              </Menu.Item>
              <Menu.Item style={{ justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CentralIcon name="IconFolderOpen" size={16} />
                  Open
                </span>
                <Shortcut keys={["⌘", "O"]} />
              </Menu.Item>
              <Menu.Item style={{ justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CentralIcon name="IconSave" size={16} />
                  Save
                </span>
                <Shortcut keys={["⌘", "S"]} />
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Menu.Root>
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item style={{ justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CentralIcon name="IconCut" size={16} />
                  Cut
                </span>
                <Shortcut keys={["⌘", "X"]} />
              </Menu.Item>
              <Menu.Item style={{ justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CentralIcon name="IconSquareBehindSquare1" size={16} />
                  Copy
                </span>
                <Shortcut keys={["⌘", "C"]} />
              </Menu.Item>
              <Menu.Item style={{ justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CentralIcon name="IconClipboard2" size={16} />
                  Paste
                </span>
                <Shortcut keys={["⌘", "V"]} />
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </Menubar.Root>
  ),
};

export const WithSubmenus: Story = {
  render: () => (
    <Menubar.Root>
      <Menu.Root>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item>New</Menu.Item>
              <Menu.Item>Open</Menu.Item>
              <Menu.Item>Save</Menu.Item>
              <Menu.SubmenuRoot>
                <Menu.SubmenuTrigger>
                  <span style={{ flex: 1 }}>Export</span>
                  <CentralIcon name="IconChevronRightSmall" size={16} />
                </Menu.SubmenuTrigger>
                <Menu.Portal>
                  <Menu.Positioner side="right" sideOffset={-4}>
                    <Menu.Popup>
                      <Menu.Item>PDF</Menu.Item>
                      <Menu.Item>PNG</Menu.Item>
                      <Menu.Item>SVG</Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.SubmenuRoot>
              <Menu.Separator />
              <Menu.Item>Print</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Menu.Root>
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item>Zoom In</Menu.Item>
              <Menu.Item>Zoom Out</Menu.Item>
              <Menu.SubmenuRoot>
                <Menu.SubmenuTrigger>
                  <span style={{ flex: 1 }}>Layout</span>
                  <CentralIcon name="IconChevronRightSmall" size={16} />
                </Menu.SubmenuTrigger>
                <Menu.Portal>
                  <Menu.Positioner side="right" sideOffset={-4}>
                    <Menu.Popup>
                      <Menu.Item>Single Page</Menu.Item>
                      <Menu.Item>Two Pages</Menu.Item>
                      <Menu.Item>Continuous</Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.SubmenuRoot>
              <Menu.Separator />
              <Menu.Item>Full Screen</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </Menubar.Root>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Menubar.Root disabled>
      <Menu.Root>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item>New</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Menu.Root>
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item>Cut</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Menu.Root>
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item>Zoom</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </Menubar.Root>
  ),
};
