"use client";

import * as React from "react";
import { Menu } from "./";
import { Button } from "@/components/Button";
import { CentralIcon } from "@/components/Icon";
import { Shortcut } from "@/components/Shortcut";

export function BasicMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>
        Open Menu
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item>Cut</Menu.Item>
            <Menu.Item>Copy</Menu.Item>
            <Menu.Item>Paste</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function MenuWithIcons() {
  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>Actions</Menu.Trigger>
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
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function MenuWithShortcuts() {
  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>Edit</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
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
  );
}

export function MenuWithCheckboxItems() {
  const [showMinimap, setShowMinimap] = React.useState(true);
  const [showBreadcrumbs, setShowBreadcrumbs] = React.useState(false);

  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>View</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.CheckboxItem
              checked={showMinimap}
              onCheckedChange={setShowMinimap}
            >
              <Menu.CheckboxItemIndicator />
              Show Minimap
            </Menu.CheckboxItem>
            <Menu.CheckboxItem
              checked={showBreadcrumbs}
              onCheckedChange={setShowBreadcrumbs}
            >
              <Menu.CheckboxItemIndicator />
              Show Breadcrumbs
            </Menu.CheckboxItem>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function MenuWithRadioItems() {
  const [sortBy, setSortBy] = React.useState("name");

  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>Sort</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.RadioGroup value={sortBy} onValueChange={setSortBy}>
              <Menu.RadioItem value="name">
                <Menu.RadioItemIndicator />
                Name
              </Menu.RadioItem>
              <Menu.RadioItem value="date">
                <Menu.RadioItemIndicator />
                Date
              </Menu.RadioItem>
              <Menu.RadioItem value="size">
                <Menu.RadioItemIndicator />
                Size
              </Menu.RadioItem>
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function MenuWithSeparator() {
  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>File</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item>New</Menu.Item>
            <Menu.Item>Open</Menu.Item>
            <Menu.Separator />
            <Menu.Item>Save</Menu.Item>
            <Menu.Item>Save As</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function MenuWithGroups() {
  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>Options</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Group>
              <Menu.GroupLabel>Actions</Menu.GroupLabel>
              <Menu.Item>Cut</Menu.Item>
              <Menu.Item>Copy</Menu.Item>
              <Menu.Item>Paste</Menu.Item>
            </Menu.Group>
            <Menu.Separator />
            <Menu.Group>
              <Menu.GroupLabel>View</Menu.GroupLabel>
              <Menu.Item>Zoom In</Menu.Item>
              <Menu.Item>Zoom Out</Menu.Item>
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function MenuWithDisabledItems() {
  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>Edit</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item>Cut</Menu.Item>
            <Menu.Item disabled>Copy</Menu.Item>
            <Menu.Item>Paste</Menu.Item>
            <Menu.Item disabled>Delete</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function MenuWithSubmenu() {
  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="outline" />}>File</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item>New</Menu.Item>
            <Menu.Item>Open</Menu.Item>
            <Menu.Item>Save</Menu.Item>
            <Menu.Item>Save As</Menu.Item>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>
                <span style={{ flex: 1 }}>Share</span>
                <CentralIcon name="IconChevronRightSmall" size={16} />
              </Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner side="right" sideOffset={-4}>
                  <Menu.Popup>
                    <Menu.Item>Email</Menu.Item>
                    <Menu.Item>Messages</Menu.Item>
                    <Menu.Item>AirDrop</Menu.Item>
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
  );
}

export function ControlledMenu() {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <button onClick={() => setOpen(!open)}>
        {open ? "Close" : "Open"} Menu
      </button>
      <Menu.Root open={open} onOpenChange={setOpen}>
        <Menu.Trigger render={<Button variant="outline" />}>
          Controlled Menu
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item onClick={() => setOpen(false)}>Item 1</Menu.Item>
              <Menu.Item onClick={() => setOpen(false)}>Item 2</Menu.Item>
              <Menu.Item onClick={() => setOpen(false)}>Item 3</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
