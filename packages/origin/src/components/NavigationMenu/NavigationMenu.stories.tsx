import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { NavigationMenu } from "./parts";
import { CentralIcon } from "@/components/Icon";

const meta: Meta = {
  title: "Components/NavigationMenu",
  parameters: {
    layout: "padded",
  },
};

export default meta;

// Basic navigation with links
export const LinksOnly: StoryObj = {
  render: () => (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">Home</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">About</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">Contact</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  ),
};

// With dropdown menus
export const WithDropdown: StoryObj = {
  render: () => (
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
          <NavigationMenu.Trigger>
            Resources
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
            <NavigationMenu.PopupItem>Documentation</NavigationMenu.PopupItem>
            <NavigationMenu.PopupItem>API Reference</NavigationMenu.PopupItem>
            <NavigationMenu.PopupItem>Blog</NavigationMenu.PopupItem>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  ),
};

// With group labels
export const WithGroupLabels: StoryObj = {
  render: () => (
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
              <NavigationMenu.PopupItem>
                <CentralIcon name="IconGlobe2" size={16} />
                Dashboard
              </NavigationMenu.PopupItem>
              <NavigationMenu.PopupItem>
                <CentralIcon name="IconGlobe2" size={16} />
                Reports
              </NavigationMenu.PopupItem>
            </NavigationMenu.Group>
            <NavigationMenu.Separator />
            <NavigationMenu.Group>
              <NavigationMenu.GroupLabel>Settings</NavigationMenu.GroupLabel>
              <NavigationMenu.PopupItem>
                <CentralIcon name="IconSettingsGear1" size={16} />
                Preferences
              </NavigationMenu.PopupItem>
              <NavigationMenu.PopupItem>
                <CentralIcon name="IconSettingsGear1" size={16} />
                Account
              </NavigationMenu.PopupItem>
            </NavigationMenu.Group>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  ),
};

// Active link state
export const ActiveLink: StoryObj = {
  render: () => (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">Home</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#" active>
            About
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">Contact</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  ),
};

// With action buttons (text actions like Sign Out)
export const WithActions: StoryObj = {
  render: () => (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">Home</NavigationMenu.Link>
        </NavigationMenu.Item>
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
            <NavigationMenu.PopupItem>Analytics</NavigationMenu.PopupItem>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Action onClick={() => alert("Signed out!")}>
            Sign Out
          </NavigationMenu.Action>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  ),
};

// With icon actions (settings, notifications, etc.)
export const WithActionIcons: StoryObj = {
  render: () => (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">Home</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">About</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.ActionIcon aria-label="Notifications">
            <CentralIcon name="IconBell" size={20} />
          </NavigationMenu.ActionIcon>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.ActionIcon aria-label="Settings">
            <CentralIcon name="IconSettingsGear1" size={20} />
          </NavigationMenu.ActionIcon>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  ),
};

// Complete navigation bar example
export const CompleteNavBar: StoryObj = {
  render: () => (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#" active>
            Dashboard
          </NavigationMenu.Link>
        </NavigationMenu.Item>
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
              Analytics
            </NavigationMenu.PopupItem>
            <NavigationMenu.PopupItem>
              <CentralIcon name="IconGlobe2" size={16} />
              Reports
            </NavigationMenu.PopupItem>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.ActionIcon aria-label="Notifications">
            <CentralIcon name="IconBell" size={20} />
          </NavigationMenu.ActionIcon>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.ActionIcon aria-label="Settings">
            <CentralIcon name="IconSettingsGear1" size={20} />
          </NavigationMenu.ActionIcon>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Action onClick={() => alert("Signed out!")}>
            Sign Out
          </NavigationMenu.Action>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  ),
};
