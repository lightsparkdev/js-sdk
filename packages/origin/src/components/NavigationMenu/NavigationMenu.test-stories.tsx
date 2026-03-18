"use client";

import * as React from "react";
import { NavigationMenu } from "./parts";
import { CentralIcon } from "@/components/Icon";

// Basic navigation menu with links only
export function LinksOnly() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/home">Home</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/about">About</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/contact">Contact</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

// Navigation menu with trigger and dropdown
export function WithDropdown() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>
            Products
            <NavigationMenu.Icon>
              <CentralIcon name="IconChevronDownSmall" size={16} />
            </NavigationMenu.Icon>
          </NavigationMenu.Trigger>
          <NavigationMenu.Portal>
            <NavigationMenu.Positioner>
              <NavigationMenu.Popup>
                <NavigationMenu.Viewport />
              </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
          </NavigationMenu.Portal>
          <NavigationMenu.Content>
            <NavigationMenu.PopupItem>
              <CentralIcon name="IconGlobe2" size={16} />
              Dashboard
            </NavigationMenu.PopupItem>
            <NavigationMenu.PopupItem>
              <CentralIcon name="IconGlobe2" size={16} />
              Analytics
            </NavigationMenu.PopupItem>
            <NavigationMenu.PopupItem>
              <CentralIcon name="IconGlobe2" size={16} />
              Reports
            </NavigationMenu.PopupItem>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

// Navigation menu with submenu
export function WithSubmenu() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>
            Products
            <NavigationMenu.Icon>
              <CentralIcon name="IconChevronDownSmall" size={16} />
            </NavigationMenu.Icon>
          </NavigationMenu.Trigger>
          <NavigationMenu.Portal>
            <NavigationMenu.Positioner>
              <NavigationMenu.Popup>
                <NavigationMenu.Viewport />
              </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
          </NavigationMenu.Portal>
          <NavigationMenu.Content>
            <NavigationMenu.PopupItem>Dashboard</NavigationMenu.PopupItem>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

// Active link state
export function ActiveLink() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/home">Home</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/about" active>
            About
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/contact">Contact</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

// Disabled states
export function DisabledStates() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/home" disabled>
            Disabled Link
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger disabled>
            Disabled Trigger
            <NavigationMenu.Icon>
              <CentralIcon name="IconChevronDownSmall" size={16} />
            </NavigationMenu.Icon>
          </NavigationMenu.Trigger>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

// PopupItem with leading and trailing icons
export function PopupItemVariants() {
  return (
    <div
      style={{
        padding: 16,
        background: "var(--surface-primary)",
        borderRadius: 6,
      }}
    >
      <NavigationMenu.PopupItem>
        <CentralIcon name="IconGlobe2" size={16} />
        With Leading Icon
      </NavigationMenu.PopupItem>
      <NavigationMenu.PopupItem>Label Only</NavigationMenu.PopupItem>
      <NavigationMenu.PopupItem
        trailing={<CentralIcon name="IconSettingsGear1" size={16} />}
      >
        <CentralIcon name="IconGlobe2" size={16} />
        With Both Icons
      </NavigationMenu.PopupItem>
      <NavigationMenu.PopupItem disabled>
        <CentralIcon name="IconGlobe2" size={16} />
        Disabled Item
      </NavigationMenu.PopupItem>
    </div>
  );
}

// Group labels in popup
export function WithGroupLabels() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>
            Products
            <NavigationMenu.Icon>
              <CentralIcon name="IconChevronDownSmall" size={16} />
            </NavigationMenu.Icon>
          </NavigationMenu.Trigger>
          <NavigationMenu.Portal>
            <NavigationMenu.Positioner>
              <NavigationMenu.Popup>
                <NavigationMenu.Viewport />
              </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
          </NavigationMenu.Portal>
          <NavigationMenu.Content>
            <NavigationMenu.Group>
              <NavigationMenu.GroupLabel>Analytics</NavigationMenu.GroupLabel>
              <NavigationMenu.PopupItem>Dashboard</NavigationMenu.PopupItem>
              <NavigationMenu.PopupItem>Reports</NavigationMenu.PopupItem>
            </NavigationMenu.Group>
            <NavigationMenu.Separator />
            <NavigationMenu.Group>
              <NavigationMenu.GroupLabel>Settings</NavigationMenu.GroupLabel>
              <NavigationMenu.PopupItem>Preferences</NavigationMenu.PopupItem>
              <NavigationMenu.PopupItem>Account</NavigationMenu.PopupItem>
            </NavigationMenu.Group>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

// Action variant - text button for actions
export function ActionVariant() {
  const [clicked, setClicked] = React.useState(false);
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/home">Home</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Action onClick={() => setClicked(true)}>
            {clicked ? "Clicked!" : "Sign Out"}
          </NavigationMenu.Action>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

// Action with active state
export function ActionActive() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Action>Default</NavigationMenu.Action>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Action active>Active</NavigationMenu.Action>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

// Disabled Action
export function ActionDisabled() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Action disabled>
            Disabled Action
          </NavigationMenu.Action>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

// ActionIcon variant - icon-only button
export function ActionIconVariant() {
  const [clicked, setClicked] = React.useState(false);
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/home">Home</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.ActionIcon
            aria-label="Settings"
            onClick={() => setClicked(true)}
            data-testid="settings-action"
          >
            <CentralIcon
              name={clicked ? "IconCheck1" : "IconSettingsGear1"}
              size={20}
            />
          </NavigationMenu.ActionIcon>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.ActionIcon aria-label="Notifications">
            <CentralIcon name="IconBell" size={20} />
          </NavigationMenu.ActionIcon>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

// ActionIcon with active state
export function ActionIconActive() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.ActionIcon aria-label="Settings">
            <CentralIcon name="IconSettingsGear1" size={20} />
          </NavigationMenu.ActionIcon>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.ActionIcon aria-label="Notifications" active>
            <CentralIcon name="IconBell" size={20} />
          </NavigationMenu.ActionIcon>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

// Disabled ActionIcon
export function ActionIconDisabled() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.ActionIcon aria-label="Settings" disabled>
            <CentralIcon name="IconSettingsGear1" size={20} />
          </NavigationMenu.ActionIcon>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
