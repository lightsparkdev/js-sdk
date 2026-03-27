"use client";

import * as React from "react";
import { Item } from "./Item";
import { CentralIcon } from "@/components/Icon";

// Basic rendering
export function BasicItem() {
  return <Item title="Settings" />;
}

export function ItemWithDescription() {
  return <Item title="Dark mode" description="Use system setting" />;
}

// Slots
export function ItemWithLeading() {
  return (
    <Item
      title="Settings"
      leading={<CentralIcon name="IconSettingsGear1" size={24} />}
    />
  );
}

export function ItemWithTrailing() {
  return (
    <Item
      title="Settings"
      trailing={<CentralIcon name="IconChevronRightSmall" size={20} />}
    />
  );
}

export function ItemWithBothSlots() {
  return (
    <Item
      title="Settings"
      description="Manage your preferences"
      leading={<CentralIcon name="IconSettingsGear1" size={24} />}
      trailing={<CentralIcon name="IconChevronRightSmall" size={20} />}
    />
  );
}

// Clickable behavior
export function ClickableItem() {
  const [clicked, setClicked] = React.useState(false);
  return (
    <Item
      title={clicked ? "Clicked!" : "Click me"}
      onClick={() => setClicked(true)}
    />
  );
}

export function NonClickableItem() {
  return <Item title="Static item" clickable={false} />;
}

// States
export function SelectedItem() {
  return (
    <Item
      title="Selected option"
      selected
      trailing={<CentralIcon name="IconCheckmark2Small" size={24} />}
    />
  );
}

export function DisabledItem() {
  return <Item title="Disabled item" disabled />;
}

export function DisabledClickableItem() {
  const [clicked, setClicked] = React.useState(false);
  return (
    <Item
      title={clicked ? "Should not change" : "Disabled clickable"}
      disabled
      onClick={() => setClicked(true)}
    />
  );
}

// Custom render
export function ItemAsButton() {
  return (
    <Item
      title="Button item"
      render={<button type="button" />}
      onClick={() => {}}
    />
  );
}

export function ItemAsListItem() {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      <Item title="List item" render={<li />} />
    </ul>
  );
}

// Navigation example
export function NavigationItem() {
  return (
    <Item
      title="Account settings"
      description="Manage your account"
      leading={<CentralIcon name="IconHome" size={24} />}
      trailing={<CentralIcon name="IconChevronRightSmall" size={20} />}
      onClick={() => {}}
    />
  );
}

// Selectable list
export function SelectableItems() {
  const [selected, setSelected] = React.useState<string>("item-1");
  return (
    <div>
      <Item
        title="Option 1"
        selected={selected === "item-1"}
        onClick={() => setSelected("item-1")}
        trailing={
          selected === "item-1" ? (
            <CentralIcon name="IconCheckmark2Small" size={24} />
          ) : undefined
        }
      />
      <Item
        title="Option 2"
        selected={selected === "item-2"}
        onClick={() => setSelected("item-2")}
        trailing={
          selected === "item-2" ? (
            <CentralIcon name="IconCheckmark2Small" size={24} />
          ) : undefined
        }
      />
    </div>
  );
}
