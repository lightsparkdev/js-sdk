"use client";

import * as React from "react";
import { ContextMenu } from "./";
import { CentralIcon } from "@/components/Icon";

// Basic context menu with items
export function BasicContextMenu() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          style={{
            padding: "40px",
            border: "1px dashed #ccc",
            borderRadius: "8px",
          }}
        >
          Right-click here
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.Item>Cut</ContextMenu.Item>
            <ContextMenu.Item>Copy</ContextMenu.Item>
            <ContextMenu.Item>Paste</ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

// Context menu with icons
export function ContextMenuWithIcons() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          style={{
            padding: "40px",
            border: "1px dashed #ccc",
            borderRadius: "8px",
          }}
        >
          Right-click here
        </div>
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
  );
}

// Context menu with checkbox items
export function ContextMenuWithCheckboxItems() {
  const [showMinimap, setShowMinimap] = React.useState(true);
  const [showBreadcrumbs, setShowBreadcrumbs] = React.useState(false);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          style={{
            padding: "40px",
            border: "1px dashed #ccc",
            borderRadius: "8px",
          }}
        >
          Right-click here
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.CheckboxItem
              checked={showMinimap}
              onCheckedChange={setShowMinimap}
            >
              <ContextMenu.CheckboxItemIndicator />
              Show Minimap
            </ContextMenu.CheckboxItem>
            <ContextMenu.CheckboxItem
              checked={showBreadcrumbs}
              onCheckedChange={setShowBreadcrumbs}
            >
              <ContextMenu.CheckboxItemIndicator />
              Show Breadcrumbs
            </ContextMenu.CheckboxItem>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

// Context menu with radio items
export function ContextMenuWithRadioItems() {
  const [sortBy, setSortBy] = React.useState("name");

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          style={{
            padding: "40px",
            border: "1px dashed #ccc",
            borderRadius: "8px",
          }}
        >
          Right-click here
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.RadioGroup value={sortBy} onValueChange={setSortBy}>
              <ContextMenu.RadioItem value="name">
                <ContextMenu.RadioItemIndicator />
                Name
              </ContextMenu.RadioItem>
              <ContextMenu.RadioItem value="date">
                <ContextMenu.RadioItemIndicator />
                Date
              </ContextMenu.RadioItem>
              <ContextMenu.RadioItem value="size">
                <ContextMenu.RadioItemIndicator />
                Size
              </ContextMenu.RadioItem>
            </ContextMenu.RadioGroup>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

// Context menu with separator
export function ContextMenuWithSeparator() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          style={{
            padding: "40px",
            border: "1px dashed #ccc",
            borderRadius: "8px",
          }}
        >
          Right-click here
        </div>
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
  );
}

// Context menu with groups
export function ContextMenuWithGroups() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          style={{
            padding: "40px",
            border: "1px dashed #ccc",
            borderRadius: "8px",
          }}
        >
          Right-click here
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.Group>
              <ContextMenu.GroupLabel>Edit</ContextMenu.GroupLabel>
              <ContextMenu.Item>Cut</ContextMenu.Item>
              <ContextMenu.Item>Copy</ContextMenu.Item>
              <ContextMenu.Item>Paste</ContextMenu.Item>
            </ContextMenu.Group>
            <ContextMenu.Separator />
            <ContextMenu.Group>
              <ContextMenu.GroupLabel>View</ContextMenu.GroupLabel>
              <ContextMenu.Item>Zoom In</ContextMenu.Item>
              <ContextMenu.Item>Zoom Out</ContextMenu.Item>
            </ContextMenu.Group>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

// Context menu with disabled items
export function ContextMenuWithDisabledItems() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          style={{
            padding: "40px",
            border: "1px dashed #ccc",
            borderRadius: "8px",
          }}
        >
          Right-click here
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.Item>Cut</ContextMenu.Item>
            <ContextMenu.Item disabled>Copy</ContextMenu.Item>
            <ContextMenu.Item>Paste</ContextMenu.Item>
            <ContextMenu.Item disabled>Delete</ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

// Context menu with submenu
export function ContextMenuWithSubmenu() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          style={{
            padding: "40px",
            border: "1px dashed #ccc",
            borderRadius: "8px",
          }}
        >
          Right-click here
        </div>
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
                <ContextMenu.Positioner side="right" sideOffset={-4}>
                  <ContextMenu.Popup>
                    <ContextMenu.Item>Email</ContextMenu.Item>
                    <ContextMenu.Item>Messages</ContextMenu.Item>
                    <ContextMenu.Item>AirDrop</ContextMenu.Item>
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
  );
}
