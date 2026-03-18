import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Command, type CommandItem, type CommandGroup } from "./index";
import { CentralIcon } from "../Icon";
import { Shortcut } from "../Shortcut";

const meta: Meta<typeof Command.Root> = {
  title: "Components/Command",
  component: Command.Root,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    placeholder: { control: "text" },
    loop: { control: "boolean" },
    open: { control: "boolean" },
    defaultOpen: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Command.Root>;

// Sample data
const basicItems: CommandItem[] = [
  {
    id: "1",
    label: "Copy",
    icon: <CentralIcon name="IconSquareBehindSquare1" size={16} />,
  },
  {
    id: "2",
    label: "Paste",
    icon: <CentralIcon name="IconClipboard2" size={16} />,
  },
  {
    id: "3",
    label: "Cut",
    icon: <CentralIcon name="IconCrossSmall" size={16} />,
  },
];

const groupedItems: CommandGroup[] = [
  {
    label: "Suggestions",
    items: [
      {
        id: "1",
        label: "Calendar",
        icon: <CentralIcon name="IconCalendarDays" size={16} />,
      },
      {
        id: "2",
        label: "Search",
        icon: <CentralIcon name="IconMagnifyingGlass2" size={16} />,
      },
      {
        id: "3",
        label: "Calculator",
        icon: <CentralIcon name="IconMagnifyingGlass2" size={16} />,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        id: "4",
        label: "Profile",
        icon: <CentralIcon name="IconUserDuo" size={16} />,
      },
      {
        id: "5",
        label: "Billing",
        icon: <CentralIcon name="IconWallet1" size={16} />,
      },
      {
        id: "6",
        label: "Preferences",
        icon: <CentralIcon name="IconSettingsGear1" size={16} />,
      },
    ],
  },
];

/**
 * Default command palette with basic items.
 */
export const Default: Story = {
  args: {
    items: basicItems,
    defaultOpen: true,
    placeholder: "Type a command or search...",
  },
};

/**
 * Command palette with grouped items.
 */
export const WithGroups: Story = {
  args: {
    items: groupedItems,
    defaultOpen: true,
    placeholder: "What do you need?",
  },
};

/**
 * Command with keyboard shortcuts displayed on items.
 */
export const WithShortcuts: Story = {
  render: () => {
    const items: CommandGroup[] = [
      {
        label: "Actions",
        items: [
          {
            id: "1",
            label: "Copy",
            icon: <CentralIcon name="IconSquareBehindSquare1" size={16} />,
            shortcut: <Shortcut keys={["⌘", "C"]} />,
          },
          {
            id: "2",
            label: "Paste",
            icon: <CentralIcon name="IconClipboard2" size={16} />,
            shortcut: <Shortcut keys={["⌘", "V"]} />,
          },
          {
            id: "3",
            label: "Cut",
            icon: <CentralIcon name="IconCrossSmall" size={16} />,
            shortcut: <Shortcut keys={["⌘", "X"]} />,
          },
        ],
      },
    ];

    return (
      <Command.Root items={items} defaultOpen>
        <Command.Footer>
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
        </Command.Footer>
      </Command.Root>
    );
  },
};

/**
 * Command with disabled items (skipped during keyboard navigation).
 */
export const WithDisabledItems: Story = {
  args: {
    items: [
      { id: "1", label: "Enabled Item 1" },
      { id: "2", label: "Disabled Item", disabled: true },
      { id: "3", label: "Enabled Item 2" },
    ],
    defaultOpen: true,
  },
};

/**
 * Controlled command palette with external state.
 */
function ControlledStoryComponent() {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);

  const items: CommandItem[] = [
    { id: "1", label: "Calendar", onSelect: () => setSelected("Calendar") },
    { id: "2", label: "Search", onSelect: () => setSelected("Search") },
    { id: "3", label: "Calculator", onSelect: () => setSelected("Calculator") },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "center",
      }}
    >
      <button onClick={() => setOpen(true)}>
        {selected ? `Selected: ${selected}` : "Open Command Palette"}
      </button>
      <Command.Root items={items} open={open} onOpenChange={setOpen} />
      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
        Selection persists after closing.
      </p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledStoryComponent />,
};

/**
 * Command with keyword search support.
 * Try searching "duplicate" to find Copy, or "remove" to find Cut.
 */
export const WithKeywords: Story = {
  render: () => {
    const items: CommandItem[] = [
      {
        id: "1",
        label: "Copy",
        icon: <CentralIcon name="IconSquareBehindSquare1" size={16} />,
        keywords: ["duplicate", "clone"],
      },
      {
        id: "2",
        label: "Paste",
        icon: <CentralIcon name="IconClipboard2" size={16} />,
        keywords: ["insert"],
      },
      {
        id: "3",
        label: "Cut",
        icon: <CentralIcon name="IconCrossSmall" size={16} />,
        keywords: ["remove", "delete"],
      },
    ];

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <Command.Root
          items={items}
          defaultOpen
          placeholder="Try searching 'duplicate' or 'remove'..."
        />
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          Items have hidden keywords for better discoverability.
        </p>
      </div>
    );
  },
};

/**
 * Empty state when no items match the search.
 */
export const EmptyState: Story = {
  args: {
    items: [
      { id: "1", label: "Apple" },
      { id: "2", label: "Banana" },
    ],
    defaultOpen: true,
    placeholder: "Type 'xyz' to see empty state...",
  },
};

/**
 * Command with many items to demonstrate scrolling.
 */
export const ManyItems: Story = {
  render: () => {
    const items: CommandItem[] = Array.from({ length: 50 }, (_, i) => ({
      id: String(i + 1),
      label: `Item ${i + 1}`,
      icon: <CentralIcon name="IconFileBend" size={16} />,
    }));

    return <Command.Root items={items} defaultOpen />;
  },
};

/**
 * Custom item rendering via renderItem prop.
 */
export const CustomRenderItem: Story = {
  render: () => {
    const items: CommandItem[] = [
      { id: "1", label: "High Priority Task" },
      { id: "2", label: "Medium Priority Task" },
      { id: "3", label: "Low Priority Task" },
    ];

    const priorities: Record<string, { color: string; label: string }> = {
      "1": { color: "#ef4444", label: "High" },
      "2": { color: "#f59e0b", label: "Medium" },
      "3": { color: "#22c55e", label: "Low" },
    };

    return (
      <Command.Root
        items={items}
        defaultOpen
        renderItem={(item) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: priorities[item.id].color,
              }}
            />
            <span style={{ flex: 1 }}>{item.label}</span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {priorities[item.id].label}
            </span>
          </div>
        )}
      />
    );
  },
};

/**
 * Full-featured Raycast-style command palette with ⌘K trigger.
 */
function RaycastStyleComponent() {
  const [open, setOpen] = React.useState(false);

  const items: CommandGroup[] = [
    {
      label: "Suggestions",
      items: [
        {
          id: "1",
          label: "Linear",
          icon: <CentralIcon name="IconGlobe2" size={16} />,
          shortcut: <Shortcut keys={["⌘", "L"]} />,
        },
        {
          id: "2",
          label: "Figma",
          icon: <CentralIcon name="IconGlobe2" size={16} />,
          shortcut: <Shortcut keys={["⌘", "F"]} />,
        },
        {
          id: "3",
          label: "Slack",
          icon: <CentralIcon name="IconGlobe2" size={16} />,
          shortcut: <Shortcut keys={["⌘", "S"]} />,
        },
      ],
    },
    {
      label: "Commands",
      items: [
        {
          id: "4",
          label: "Clipboard History",
          icon: <CentralIcon name="IconSquareBehindSquare1" size={16} />,
          shortcut: <Shortcut keys={["⌘", "⇧", "C"]} />,
          keywords: ["clipboard", "paste"],
        },
        {
          id: "5",
          label: "System Preferences",
          icon: <CentralIcon name="IconSettingsGear1" size={16} />,
          shortcut: <Shortcut keys={["⌘", ","]} />,
          keywords: ["settings", "preferences"],
        },
      ],
    },
  ];

  // Listen for Cmd+K
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "center",
      }}
    >
      <button
        onClick={() => setOpen(true)}
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >
        Open Command Palette
        <Shortcut keys={["⌘", "K"]} />
      </button>
      <Command.Root items={items} open={open} onOpenChange={setOpen}>
        <Command.Footer>
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
        </Command.Footer>
      </Command.Root>
      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
        Press ⌘K to toggle the command palette
      </p>
    </div>
  );
}

export const RaycastStyle: Story = {
  render: () => <RaycastStyleComponent />,
};
