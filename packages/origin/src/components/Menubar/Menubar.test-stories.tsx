"use client";

import * as React from "react";
import { Menubar } from "./";
import { Menu } from "@/components/Menu";
import { CentralIcon } from "@/components/Icon";
import { Shortcut } from "@/components/Shortcut";

export function BasicMenubar() {
  return (
    <Menubar.Root>
      <Menu.Root>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item>New</Menu.Item>
              <Menu.Item>Open</Menu.Item>
              <Menu.Item>Save</Menu.Item>
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
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </Menubar.Root>
  );
}

export function MenubarWithShortcuts() {
  return (
    <Menubar.Root>
      <Menu.Root>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item style={{ justifyContent: "space-between" }}>
                <span>New</span>
                <Shortcut keys={["⌘", "N"]} />
              </Menu.Item>
              <Menu.Item style={{ justifyContent: "space-between" }}>
                <span>Open</span>
                <Shortcut keys={["⌘", "O"]} />
              </Menu.Item>
              <Menu.Item style={{ justifyContent: "space-between" }}>
                <span>Save</span>
                <Shortcut keys={["⌘", "S"]} />
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </Menubar.Root>
  );
}

export function MenubarWithSubmenu() {
  return (
    <Menubar.Root>
      <Menu.Root>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item>New</Menu.Item>
              <Menu.Item>Open</Menu.Item>
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
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </Menubar.Root>
  );
}

export function MenubarDisabled() {
  return (
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
    </Menubar.Root>
  );
}

export function MenubarKeyboardNavigation() {
  return (
    <Menubar.Root>
      <Menu.Root>
        <Menubar.Trigger>First</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item>Item A</Menu.Item>
              <Menu.Item>Item B</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Menu.Root>
        <Menubar.Trigger>Second</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item>Item C</Menu.Item>
              <Menu.Item>Item D</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Menu.Root>
        <Menubar.Trigger>Third</Menubar.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={2}>
            <Menu.Popup>
              <Menu.Item>Item E</Menu.Item>
              <Menu.Item>Item F</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </Menubar.Root>
  );
}
