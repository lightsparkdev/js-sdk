"use client";

import * as React from "react";
import { Command, type CommandItem, type CommandGroup } from "./index";
import { CentralIcon } from "../Icon";
import { Shortcut } from "../Shortcut";

// Basic command with items
export function BasicCommand() {
  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
    { id: "3", label: "Cut" },
  ];

  return <Command.Root items={items} defaultOpen />;
}

// Command with trigger
export function CommandWithTrigger() {
  const [open, setOpen] = React.useState(false);

  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Command</button>
      <Command.Root items={items} open={open} onOpenChange={setOpen} />
    </>
  );
}

// Command with groups
export function CommandWithGroups() {
  const groups: CommandGroup[] = [
    {
      label: "Suggestions",
      items: [
        { id: "1", label: "Calendar" },
        { id: "2", label: "Search" },
      ],
    },
    {
      label: "Settings",
      items: [
        { id: "3", label: "Profile" },
        { id: "4", label: "Preferences" },
      ],
    },
  ];

  return <Command.Root items={groups} defaultOpen />;
}

// Command with icons
export function CommandWithIcons() {
  const items: CommandItem[] = [
    {
      id: "1",
      label: "Copy",
      icon: <CentralIcon name="IconFileBend" size={16} />,
    },
    {
      id: "2",
      label: "Paste",
      icon: <CentralIcon name="IconFileBend" size={16} />,
    },
  ];

  return <Command.Root items={items} defaultOpen />;
}

// Command with disabled items
export function CommandWithDisabledItems() {
  const items: CommandItem[] = [
    { id: "1", label: "Enabled Item" },
    { id: "2", label: "Disabled Item", disabled: true },
    { id: "3", label: "Another Item" },
  ];

  return <Command.Root items={items} defaultOpen />;
}

// Controlled command
export function ControlledCommand() {
  const [open, setOpen] = React.useState(true);

  const items: CommandItem[] = [
    { id: "1", label: "Copy", onSelect: () => setOpen(false) },
    { id: "2", label: "Paste", onSelect: () => setOpen(false) },
  ];

  return <Command.Root items={items} open={open} onOpenChange={setOpen} />;
}

// Command with onSelect callback
export function CommandWithCallback() {
  const [selectedValue, setSelectedValue] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(true);

  const items: CommandItem[] = [
    { id: "1", label: "Copy", onSelect: () => setSelectedValue("copy") },
    { id: "2", label: "Paste", onSelect: () => setSelectedValue("paste") },
  ];

  // Keep open after selection for testing
  const handleOpenChange = (newOpen: boolean) => {
    // Don't close on item select
    if (!newOpen && selectedValue) return;
    setOpen(newOpen);
  };

  return (
    <div>
      <Command.Root items={items} open={open} onOpenChange={handleOpenChange} />
      <div data-testid="selected">{selectedValue}</div>
    </div>
  );
}

// Full example matching Figma design
export function FigmaDesignCommand() {
  const groups: CommandGroup[] = [
    {
      label: "Title",
      items: [
        {
          id: "1",
          label: "Command",
          icon: <CentralIcon name="IconGlobe2" size={16} />,
        },
        {
          id: "2",
          label: "Command",
          icon: <CentralIcon name="IconGlobe2" size={16} />,
        },
        {
          id: "3",
          label: "Command",
          icon: <CentralIcon name="IconGlobe2" size={16} />,
        },
        {
          id: "4",
          label: "Command",
          icon: <CentralIcon name="IconGlobe2" size={16} />,
        },
      ],
    },
  ];

  return (
    <Command.Root
      items={groups}
      defaultOpen
      placeholder="Run a command or search"
    />
  );
}

// Command with shortcuts
export function CommandWithShortcuts() {
  const groups: CommandGroup[] = [
    {
      label: "Actions",
      items: [
        {
          id: "1",
          label: "Copy",
          icon: <CentralIcon name="IconFileBend" size={16} />,
          shortcut: <Shortcut keys={["⌘", "C"]} />,
        },
        {
          id: "2",
          label: "Paste",
          icon: <CentralIcon name="IconFileBend" size={16} />,
          shortcut: <Shortcut keys={["⌘", "V"]} />,
        },
        {
          id: "3",
          label: "Cut",
          icon: <CentralIcon name="IconFileBend" size={16} />,
          shortcut: <Shortcut keys={["⌘", "X"]} />,
        },
      ],
    },
  ];

  return (
    <Command.Root items={groups} defaultOpen>
      <Command.Footer>
        <span>↑↓ Navigate</span>
        <span>↵ Open</span>
      </Command.Footer>
    </Command.Root>
  );
}

// Command with keywords for filtering
export function CommandWithKeywords() {
  const items: CommandItem[] = [
    { id: "1", label: "Copy", keywords: ["duplicate", "clone"] },
    { id: "2", label: "Paste", keywords: ["insert"] },
    { id: "3", label: "Cut", keywords: ["remove", "delete"] },
  ];

  return (
    <Command.Root
      items={items}
      defaultOpen
      placeholder="Try searching 'duplicate'..."
    />
  );
}
