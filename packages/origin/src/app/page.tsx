"use client";

import * as React from "react";
import { matchSorter } from "match-sorter";
import { Accordion } from "@/components/Accordion";
import { Collapsible } from "@/components/Collapsible";
import {
  ActionBar,
  ActionBarLabel,
  ActionBarActions,
} from "@/components/ActionBar";
import { Autocomplete } from "@/components/Autocomplete";
import { Alert } from "@/components/Alert";
import { AlertDialog } from "@/components/AlertDialog";
import { Dialog } from "@/components/Dialog";
import { Drawer } from "@/components/Drawer";
import { Badge } from "@/components/Badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { ButtonGroup } from "@/components/ButtonGroup";
import { InputGroup } from "@/components/InputGroup";
import { Card } from "@/components/Card";
import { Checkbox } from "@/components/Checkbox";
import { Chip, ChipFilter } from "@/components/Chip";
import { Combobox } from "@/components/Combobox";
import { Field } from "@/components/Field";
import { Fieldset } from "@/components/Fieldset";
import { Form } from "@/components/Form";
import { CentralIcon } from "@/components/Icon";
import { Input } from "@/components/Input";
import { Item } from "@/components/Item";
import { Loader } from "@/components/Loader";
import { Command } from "@/components/Command";
import { Menu } from "@/components/Menu";
import { Menubar } from "@/components/Menubar";
import { NavigationMenu } from "@/components/NavigationMenu";
import { ContextMenu } from "@/components/ContextMenu";
import { Meter } from "@/components/Meter";
import { Pagination } from "@/components/Pagination";
import { PhoneInput } from "@/components/PhoneInput";
import { Progress } from "@/components/Progress";
import { Radio } from "@/components/Radio";
import { Select } from "@/components/Select";
import { SegmentedNav } from "@/components/SegmentedNav";
import { Separator } from "@/components/Separator";
import { Sidebar } from "@/components/Sidebar";
import { Skeleton } from "@/components/Skeleton";
import { Shortcut } from "@/components/Shortcut";
import { Switch } from "@/components/Switch";
import { Textarea } from "@/components/Textarea";
import { TextareaGroup } from "@/components/TextareaGroup";
import { Tabs } from "@/components/Tabs";
import { Table } from "@/components/Table";
import * as Chart from "@/components/Chart";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table";
import { Toast, ToastVariant } from "@/components/Toast";
import { Tooltip } from "@/components/Tooltip";
import { Popover } from "@/components/Popover";
import { PreviewCard } from "@/components/PreviewCard";
import { Logo } from "@/components/Logo";
import { Toggle, ToggleGroup } from "@/components/Toggle";
import * as DatePicker from "@/components/DatePicker";
import type { DateRange } from "@/components/DatePicker";
// Data for combobox examples
const fruits = [
  "Apple",
  "Banana",
  "Cherry",
  "Date",
  "Elderberry",
  "Fig",
  "Grape",
];

// Toast demo components
function ToastDemo() {
  const toastManager = Toast.useToastManager();

  const showToast = (
    variant: ToastVariant,
    title: string,
    description?: string,
    actionLabel?: string,
  ) => {
    toastManager.add({
      title,
      description,
      data: { variant, actionLabel },
    });
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <Button
        variant="outline"
        onClick={() =>
          showToast(
            "default",
            "Default toast",
            "This is a default toast message.",
          )
        }
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          showToast("info", "Info toast", "This is an informational message.")
        }
      >
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          showToast(
            "success",
            "Success!",
            "Your action was completed successfully.",
          )
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          showToast("warning", "Warning", "Please review before continuing.")
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() => showToast("invalid", "Error", "Something went wrong.")}
      >
        Invalid
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          showToast(
            "default",
            "Item deleted",
            "The item has been moved to trash.",
            "Undo",
          )
        }
      >
        With Action
      </Button>
    </div>
  );
}

function ToastRenderer() {
  const toastManager = Toast.useToastManager();

  return (
    <>
      {toastManager.toasts.map((toast) => {
        const variant = (toast.data?.variant as ToastVariant) || "default";
        const actionLabel = toast.data?.actionLabel as string | undefined;
        return (
          <Toast.Root key={toast.id} toast={toast} variant={variant}>
            {variant !== "default" && <Toast.Icon variant={variant} />}
            <Toast.Content>
              <Toast.Title>{toast.title}</Toast.Title>
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </Toast.Content>
            {actionLabel && <Toast.Action>{actionLabel}</Toast.Action>}
            <Toast.Close aria-label="Close toast" />
          </Toast.Root>
        );
      })}
    </>
  );
}

// Data for autocomplete examples
const autocompleteFruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Elderberry" },
  { value: "fig", label: "Fig" },
  { value: "grape", label: "Grape" },
];

interface AutocompleteFruit {
  value: string;
  label: string;
}

interface FuzzyItem {
  label: string;
}

const fuzzyItems: FuzzyItem[] = [
  { label: "React" },
  { label: "JavaScript" },
  { label: "TypeScript" },
  { label: "Node.js" },
  { label: "CSS Grid" },
  { label: "Flexbox" },
  { label: "Redux" },
  { label: "GraphQL" },
];

function fuzzyFilter(item: FuzzyItem, query: string): boolean {
  if (!query) return true;
  const results = matchSorter([item], query, {
    keys: ["label"],
  });
  return results.length > 0;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) {
    return text;
  }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  const lowerQuery = query.toLowerCase();

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === lowerQuery ? (
          <span key={i} style={{ color: "var(--text-primary)" }}>
            {part}
          </span>
        ) : (
          <span key={i} style={{ color: "var(--text-secondary)" }}>
            {part}
          </span>
        ),
      )}
    </span>
  );
}

function FuzzyMatchingDemo() {
  const [value, setValue] = React.useState("");

  return (
    <div>
      <span
        style={{
          fontSize: "14px",
          color: "#7c7c7c",
          marginBottom: "0.5rem",
          display: "block",
        }}
      >
        Fuzzy Matching (try &quot;rct&quot;)
      </span>
      <Autocomplete.Root
        items={fuzzyItems}
        filter={fuzzyFilter}
        itemToStringValue={(item: FuzzyItem) => item.label}
        value={value}
        onValueChange={setValue}
      >
        <Autocomplete.Input placeholder="Search..." />
        <Autocomplete.Portal>
          <Autocomplete.Positioner>
            <Autocomplete.Popup>
              <Autocomplete.Empty>No results found.</Autocomplete.Empty>
              <Autocomplete.List>
                {(item: FuzzyItem) => (
                  <Autocomplete.Item key={item.label} value={item}>
                    {highlightMatch(item.label, value)}
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>
    </div>
  );
}

function CommandDemo() {
  const [basicOpen, setBasicOpen] = React.useState(false);
  const [fullOpen, setFullOpen] = React.useState(false);

  // Basic items (flat)
  const basicItems: import("@/components/Command").CommandItem[] = [
    {
      id: "1",
      label: "Calendar",
      icon: <CentralIcon name="IconCalendarDays" size={16} />,
    },
    {
      id: "2",
      label: "Search Emoji",
      icon: <CentralIcon name="IconMagnifyingGlass2" size={16} />,
    },
    {
      id: "3",
      label: "Calculator",
      icon: <CentralIcon name="IconSquareBehindSquare1" size={16} />,
    },
    {
      id: "4",
      label: "Settings",
      icon: <CentralIcon name="IconSettingsGear1" size={16} />,
    },
  ];

  // Full items (grouped) - 20+ items to test scrolling
  const fullItems: import("@/components/Command").CommandGroup[] = [
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
        {
          id: "4",
          label: "Notion",
          icon: <CentralIcon name="IconGlobe2" size={16} />,
          shortcut: <Shortcut keys={["⌘", "N"]} />,
        },
        {
          id: "5",
          label: "GitHub",
          icon: <CentralIcon name="IconGlobe2" size={16} />,
          shortcut: <Shortcut keys={["⌘", "G"]} />,
        },
      ],
    },
    {
      label: "Commands",
      items: [
        {
          id: "6",
          label: "Clipboard History",
          icon: <CentralIcon name="IconClipboard2" size={16} />,
          shortcut: <Shortcut keys={["⌘", "⇧", "C"]} />,
          keywords: ["clipboard", "paste"],
        },
        {
          id: "7",
          label: "System Preferences",
          icon: <CentralIcon name="IconSettingsGear1" size={16} />,
          shortcut: <Shortcut keys={["⌘", ","]} />,
          keywords: ["settings"],
        },
        {
          id: "8",
          label: "Screenshot",
          icon: <CentralIcon name="IconSquareBehindSquare1" size={16} />,
          shortcut: <Shortcut keys={["⌘", "⇧", "4"]} />,
          keywords: ["capture", "screen"],
        },
        {
          id: "9",
          label: "Lock Screen",
          icon: <CentralIcon name="IconSettingsGear1" size={16} />,
          shortcut: <Shortcut keys={["⌘", "⌃", "Q"]} />,
        },
        {
          id: "10",
          label: "Force Quit",
          icon: <CentralIcon name="IconSettingsGear1" size={16} />,
          shortcut: <Shortcut keys={["⌘", "⌥", "Esc"]} />,
        },
      ],
    },
    {
      label: "Navigation",
      items: [
        {
          id: "11",
          label: "Go to Dashboard",
          icon: <CentralIcon name="IconGlobe2" size={16} />,
        },
        {
          id: "12",
          label: "Go to Settings",
          icon: <CentralIcon name="IconSettingsGear1" size={16} />,
        },
        {
          id: "13",
          label: "Go to Profile",
          icon: <CentralIcon name="IconGlobe2" size={16} />,
        },
        {
          id: "14",
          label: "Go to Notifications",
          icon: <CentralIcon name="IconGlobe2" size={16} />,
        },
        {
          id: "15",
          label: "Go to Help",
          icon: <CentralIcon name="IconGlobe2" size={16} />,
        },
      ],
    },
    {
      label: "Actions",
      items: [
        {
          id: "16",
          label: "New Document",
          icon: <CentralIcon name="IconFileBend" size={16} />,
          shortcut: <Shortcut keys={["⌘", "N"]} />,
        },
        {
          id: "17",
          label: "New Folder",
          icon: <CentralIcon name="IconFileBend" size={16} />,
          shortcut: <Shortcut keys={["⌘", "⇧", "N"]} />,
        },
        {
          id: "18",
          label: "Duplicate",
          icon: <CentralIcon name="IconSquareBehindSquare1" size={16} />,
          shortcut: <Shortcut keys={["⌘", "D"]} />,
        },
        {
          id: "19",
          label: "Delete",
          icon: <CentralIcon name="IconSettingsGear1" size={16} />,
          shortcut: <Shortcut keys={["⌘", "⌫"]} />,
        },
        {
          id: "20",
          label: "Archive",
          icon: <CentralIcon name="IconFileBend" size={16} />,
          shortcut: <Shortcut keys={["⌘", "E"]} />,
        },
      ],
    },
  ];

  // Keyboard shortcut to open (Cmd+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setFullOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        marginBottom: "128px",
      }}
    >
      {/* Basic Command */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Basic
        </span>
        <Button variant="outline" onClick={() => setBasicOpen(true)}>
          Type a command or search...
        </Button>
        <Command.Root
          items={basicItems}
          open={basicOpen}
          onOpenChange={setBasicOpen}
        />
      </div>

      {/* Full Command with shortcuts and footer */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          With Groups, Shortcuts &amp; Footer (⌘K to open)
        </span>
        <Button variant="outline" onClick={() => setFullOpen(true)}>
          Open Command Palette
          <Shortcut keys={["⌘", "K"]} style={{ marginLeft: "auto" }} />
        </Button>
        <Command.Root
          items={fullItems}
          open={fullOpen}
          onOpenChange={setFullOpen}
          placeholder="Search for apps and commands..."
        >
          <Command.Footer>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Shortcut keys={["↑", "↓"]} />
              <span>Navigate</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>Select</span>
                <Shortcut keys={["↵"]} />
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>Close</span>
                <Shortcut keys={["Esc"]} />
              </div>
            </div>
          </Command.Footer>
        </Command.Root>
      </div>
    </div>
  );
}

function AutocompleteExamples() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        marginBottom: "128px",
        maxWidth: "256px",
      }}
    >
      {/* Basic */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Basic
        </span>
        <Autocomplete.Root items={autocompleteFruits}>
          <Autocomplete.Input placeholder="Search fruits..." />
          <Autocomplete.Portal>
            <Autocomplete.Positioner>
              <Autocomplete.Popup>
                <Autocomplete.Empty>No results found.</Autocomplete.Empty>
                <Autocomplete.List>
                  {(item: AutocompleteFruit) => (
                    <Autocomplete.Item key={item.value} value={item}>
                      {item.label}
                    </Autocomplete.Item>
                  )}
                </Autocomplete.List>
              </Autocomplete.Popup>
            </Autocomplete.Positioner>
          </Autocomplete.Portal>
        </Autocomplete.Root>
      </div>

      {/* With Leading Icons */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          With Leading Icons
        </span>
        <Autocomplete.Root items={autocompleteFruits}>
          <Autocomplete.Input placeholder="Search fruits..." />
          <Autocomplete.Portal>
            <Autocomplete.Positioner>
              <Autocomplete.Popup>
                <Autocomplete.Empty>No results found.</Autocomplete.Empty>
                <Autocomplete.List>
                  {(item: AutocompleteFruit) => (
                    <Autocomplete.Item
                      key={item.value}
                      value={item}
                      leadingIcon={<CentralIcon name="IconGlobe2" size={16} />}
                    >
                      {item.label}
                    </Autocomplete.Item>
                  )}
                </Autocomplete.List>
              </Autocomplete.Popup>
            </Autocomplete.Positioner>
          </Autocomplete.Portal>
        </Autocomplete.Root>
      </div>

      {/* Disabled */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Disabled
        </span>
        <Autocomplete.Root items={autocompleteFruits} disabled>
          <Autocomplete.Input placeholder="Search fruits..." />
          <Autocomplete.Portal>
            <Autocomplete.Positioner>
              <Autocomplete.Popup>
                <Autocomplete.List>
                  {(item: AutocompleteFruit) => (
                    <Autocomplete.Item key={item.value} value={item}>
                      {item.label}
                    </Autocomplete.Item>
                  )}
                </Autocomplete.List>
              </Autocomplete.Popup>
            </Autocomplete.Positioner>
          </Autocomplete.Portal>
        </Autocomplete.Root>
      </div>

      {/* Fuzzy Matching */}
      <FuzzyMatchingDemo />
    </div>
  );
}

function MenuExamples() {
  const [showGrid, setShowGrid] = React.useState(true);
  const [showRulers, setShowRulers] = React.useState(false);
  const [sortBy, setSortBy] = React.useState("name");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        marginBottom: "128px",
      }}
    >
      {/* Basic */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Basic
        </span>
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
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>

      {/* With Icons */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          With Icons
        </span>
        <Menu.Root>
          <Menu.Trigger render={<Button variant="outline" />}>
            Edit
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup>
                <Menu.Item>
                  <CentralIcon name="IconPencil" size={16} />
                  Edit
                </Menu.Item>
                <Menu.Item>
                  <CentralIcon name="IconClipboard2" size={16} />
                  Copy
                </Menu.Item>
                <Menu.Item>
                  <CentralIcon name="IconTrashCanSimple" size={16} />
                  Delete
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>

      {/* Checkbox Items */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Checkbox Items
        </span>
        <Menu.Root>
          <Menu.Trigger render={<Button variant="outline" />}>
            View Options
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup>
                <Menu.CheckboxItem
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                >
                  <Menu.CheckboxItemIndicator>
                    <CentralIcon name="IconCheckmark2Small" size={16} />
                  </Menu.CheckboxItemIndicator>
                  Show Grid
                </Menu.CheckboxItem>
                <Menu.CheckboxItem
                  checked={showRulers}
                  onCheckedChange={setShowRulers}
                >
                  <Menu.CheckboxItemIndicator>
                    <CentralIcon name="IconCheckmark2Small" size={16} />
                  </Menu.CheckboxItemIndicator>
                  Show Rulers
                </Menu.CheckboxItem>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>

      {/* Radio Items */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Radio Items
        </span>
        <Menu.Root>
          <Menu.Trigger render={<Button variant="outline" />}>
            Sort By
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup>
                <Menu.RadioGroup value={sortBy} onValueChange={setSortBy}>
                  <Menu.RadioItem value="name">
                    <Menu.RadioItemIndicator>
                      <CentralIcon name="IconCheckmark2Small" size={16} />
                    </Menu.RadioItemIndicator>
                    Name
                  </Menu.RadioItem>
                  <Menu.RadioItem value="date">
                    <Menu.RadioItemIndicator>
                      <CentralIcon name="IconCheckmark2Small" size={16} />
                    </Menu.RadioItemIndicator>
                    Date
                  </Menu.RadioItem>
                  <Menu.RadioItem value="size">
                    <Menu.RadioItemIndicator>
                      <CentralIcon name="IconCheckmark2Small" size={16} />
                    </Menu.RadioItemIndicator>
                    Size
                  </Menu.RadioItem>
                </Menu.RadioGroup>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>

      {/* With Groups */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          With Groups
        </span>
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
      </div>

      {/* With Submenu */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          With Submenu
        </span>
        <Menu.Root>
          <Menu.Trigger render={<Button variant="outline" />}>
            File
          </Menu.Trigger>
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
      </div>
    </div>
  );
}

function MenubarDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        marginBottom: "128px",
      }}
    >
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Basic
        </span>
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
      </div>

      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Disabled
        </span>
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
      </div>
    </div>
  );
}

function ContextMenuExamples() {
  const [showGrid, setShowGrid] = React.useState(true);
  const [sortBy, setSortBy] = React.useState("name");

  const TriggerArea = ({ children }: { children?: React.ReactNode }) => (
    <div
      style={{
        padding: "40px 60px",
        border: "1px dashed var(--border-secondary)",
        borderRadius: "var(--corner-radius-sm)",
        backgroundColor: "var(--surface-secondary)",
        color: "var(--text-secondary)",
        fontSize: "14px",
        textAlign: "center",
      }}
    >
      {children || "Right-click here"}
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        marginBottom: "128px",
      }}
    >
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Basic
        </span>
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <TriggerArea />
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
      </div>

      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          With Checkbox Items
        </span>
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <TriggerArea>Right-click for view options</TriggerArea>
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Positioner>
              <ContextMenu.Popup>
                <ContextMenu.CheckboxItem
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                >
                  <ContextMenu.CheckboxItemIndicator />
                  Show Grid
                </ContextMenu.CheckboxItem>
              </ContextMenu.Popup>
            </ContextMenu.Positioner>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          With Radio Items
        </span>
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <TriggerArea>Right-click to sort</TriggerArea>
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Positioner>
              <ContextMenu.Popup>
                <ContextMenu.Group>
                  <ContextMenu.GroupLabel>Sort by</ContextMenu.GroupLabel>
                  <ContextMenu.RadioGroup
                    value={sortBy}
                    onValueChange={setSortBy}
                  >
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
                </ContextMenu.Group>
              </ContextMenu.Popup>
            </ContextMenu.Positioner>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          With Submenu
        </span>
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <TriggerArea />
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
                    <ContextMenu.Positioner
                      side="right"
                      sideOffset={-4}
                      alignOffset={-4}
                    >
                      <ContextMenu.Popup>
                        <ContextMenu.Item>Email</ContextMenu.Item>
                        <ContextMenu.Item>Messages</ContextMenu.Item>
                        <ContextMenu.Item>Copy Link</ContextMenu.Item>
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
      </div>
    </div>
  );
}

function PaginationDemo() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(100);
  const totalItems = 2500;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Default
        </span>
        <Pagination.Root
          page={page}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        >
          <Pagination.Label />
          <Select.Root
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v))}
          >
            <Select.Trigger variant="ghost">
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popup>
                  <Select.List>
                    <Select.Item value="10">
                      <Select.ItemText>10</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="25">
                      <Select.ItemText>25</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="50">
                      <Select.ItemText>50</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="100">
                      <Select.ItemText>100</Select.ItemText>
                    </Select.Item>
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
          <Pagination.Range />
          <Pagination.Navigation>
            <Pagination.Previous />
            <Pagination.Next />
          </Pagination.Navigation>
        </Pagination.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          First Page (Previous disabled)
        </span>
        <Pagination.Root page={1} totalItems={1000} pageSize={100}>
          <Pagination.Label />
          <Pagination.Range />
          <Pagination.Navigation>
            <Pagination.Previous />
            <Pagination.Next />
          </Pagination.Navigation>
        </Pagination.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Last Page (Next disabled)
        </span>
        <Pagination.Root page={10} totalItems={1000} pageSize={100}>
          <Pagination.Label />
          <Pagination.Range />
          <Pagination.Navigation>
            <Pagination.Previous />
            <Pagination.Next />
          </Pagination.Navigation>
        </Pagination.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Single Page (both disabled)
        </span>
        <Pagination.Root page={1} totalItems={50} pageSize={100}>
          <Pagination.Label />
          <Pagination.Range />
          <Pagination.Navigation>
            <Pagination.Previous />
            <Pagination.Next />
          </Pagination.Navigation>
        </Pagination.Root>
      </div>
    </div>
  );
}

// Phone Input demo data
const phoneCountries = [
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "JP", name: "Japan", dialCode: "+81" },
  { code: "AU", name: "Australia", dialCode: "+61" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "IN", name: "India", dialCode: "+91" },
];

type PhoneCountry = (typeof phoneCountries)[number];

// Circle-flags CDN URL helper
function getFlagUrl(code: string) {
  return `https://hatscripts.github.io/circle-flags/flags/${code.toLowerCase()}.svg`;
}

function PhoneInputDemo() {
  const [country, setCountry] = React.useState<PhoneCountry>(phoneCountries[0]);
  const [phone, setPhone] = React.useState("");
  const [invalidCountry, setInvalidCountry] = React.useState<PhoneCountry>(
    phoneCountries[0],
  );
  const [invalidPhone, setInvalidPhone] = React.useState("");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        maxWidth: "300px",
      }}
    >
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Default
        </span>
        <PhoneInput.Root>
          <PhoneInput.CountrySelect
            value={country}
            onValueChange={(v) => v && setCountry(v)}
          >
            <PhoneInput.CountryTrigger aria-label="Select country">
              <PhoneInput.CountryValue>
                {(c: PhoneCountry) => (
                  <>
                    <PhoneInput.CountryFlag>
                      <img src={getFlagUrl(c.code)} alt="" />
                    </PhoneInput.CountryFlag>
                    <span>{c.dialCode}</span>
                  </>
                )}
              </PhoneInput.CountryValue>
              <PhoneInput.CountryIcon />
            </PhoneInput.CountryTrigger>
            <PhoneInput.CountryListbox>
              {phoneCountries.map((c) => (
                <PhoneInput.CountryItem key={c.code} value={c}>
                  <PhoneInput.CountryFlag>
                    <img src={getFlagUrl(c.code)} alt="" />
                  </PhoneInput.CountryFlag>
                  <PhoneInput.CountryItemText>
                    {c.name} ({c.dialCode})
                  </PhoneInput.CountryItemText>
                  <PhoneInput.CountryItemIndicator />
                </PhoneInput.CountryItem>
              ))}
            </PhoneInput.CountryListbox>
          </PhoneInput.CountrySelect>
          <PhoneInput.Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone"
          />
        </PhoneInput.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Invalid
        </span>
        <PhoneInput.Root invalid>
          <PhoneInput.CountrySelect
            value={invalidCountry}
            onValueChange={(v) => v && setInvalidCountry(v)}
          >
            <PhoneInput.CountryTrigger aria-label="Select country">
              <PhoneInput.CountryValue>
                {(c: PhoneCountry) => (
                  <>
                    <PhoneInput.CountryFlag>
                      <img src={getFlagUrl(c.code)} alt="" />
                    </PhoneInput.CountryFlag>
                    <span>{c.dialCode}</span>
                  </>
                )}
              </PhoneInput.CountryValue>
              <PhoneInput.CountryIcon />
            </PhoneInput.CountryTrigger>
            <PhoneInput.CountryListbox>
              {phoneCountries.map((c) => (
                <PhoneInput.CountryItem key={c.code} value={c}>
                  <PhoneInput.CountryFlag>
                    <img src={getFlagUrl(c.code)} alt="" />
                  </PhoneInput.CountryFlag>
                  <PhoneInput.CountryItemText>
                    {c.name} ({c.dialCode})
                  </PhoneInput.CountryItemText>
                  <PhoneInput.CountryItemIndicator />
                </PhoneInput.CountryItem>
              ))}
            </PhoneInput.CountryListbox>
          </PhoneInput.CountrySelect>
          <PhoneInput.Input
            value={invalidPhone}
            onChange={(e) => setInvalidPhone(e.target.value)}
            placeholder="Enter phone"
          />
        </PhoneInput.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Disabled
        </span>
        <PhoneInput.Root disabled>
          <PhoneInput.CountrySelect value={phoneCountries[0]}>
            <PhoneInput.CountryTrigger aria-label="Select country">
              <PhoneInput.CountryValue>
                {(c: PhoneCountry) => (
                  <>
                    <PhoneInput.CountryFlag>
                      <img src={getFlagUrl(c.code)} alt="" />
                    </PhoneInput.CountryFlag>
                    <span>{c.dialCode}</span>
                  </>
                )}
              </PhoneInput.CountryValue>
              <PhoneInput.CountryIcon />
            </PhoneInput.CountryTrigger>
            <PhoneInput.CountryListbox>
              {phoneCountries.map((c) => (
                <PhoneInput.CountryItem key={c.code} value={c}>
                  <PhoneInput.CountryFlag>
                    <img src={getFlagUrl(c.code)} alt="" />
                  </PhoneInput.CountryFlag>
                  <PhoneInput.CountryItemText>
                    {c.name} ({c.dialCode})
                  </PhoneInput.CountryItemText>
                  <PhoneInput.CountryItemIndicator />
                </PhoneInput.CountryItem>
              ))}
            </PhoneInput.CountryListbox>
          </PhoneInput.CountrySelect>
          <PhoneInput.Input placeholder="Enter phone" />
        </PhoneInput.Root>
      </div>
    </div>
  );
}

function ComboboxExamples() {
  // Use the useFilter hook for filtering support
  const filter = Combobox.useFilter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        marginBottom: "128px",
        maxWidth: "256px",
      }}
    >
      {/* Single Select with filtering */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Single Select
        </span>
        <Combobox.Root items={fruits} filter={filter.contains}>
          <Combobox.InputWrapper>
            <Combobox.Input placeholder="Select a fruit..." />
            <Combobox.ActionButtons>
              <Combobox.Trigger />
            </Combobox.ActionButtons>
          </Combobox.InputWrapper>
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={4}>
              <Combobox.Popup>
                <Combobox.Empty />
                <Combobox.List>
                  {(item: string) => (
                    <Combobox.Item key={item} value={item}>
                      <Combobox.ItemIndicator />
                      <Combobox.ItemText>{item}</Combobox.ItemText>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </div>

      {/* With Clear Button (shows next to chevron when value exists) */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          With Clear Button
        </span>
        <Combobox.Root
          items={fruits}
          defaultValue="Apple"
          filter={filter.contains}
        >
          <Combobox.InputWrapper>
            <Combobox.Input placeholder="Select a fruit..." />
            <Combobox.ActionButtons>
              <Combobox.Clear aria-label="Clear selection" />
              <Combobox.Trigger aria-label="Open popup" />
            </Combobox.ActionButtons>
          </Combobox.InputWrapper>
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={4}>
              <Combobox.Popup>
                <Combobox.Empty />
                <Combobox.List>
                  {(item: string) => (
                    <Combobox.Item key={item} value={item}>
                      <Combobox.ItemIndicator />
                      <Combobox.ItemText>{item}</Combobox.ItemText>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </div>

      {/* With Trailing Icons */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          With Trailing Icons
        </span>
        <Combobox.Root items={fruits} filter={filter.contains}>
          <Combobox.InputWrapper>
            <Combobox.Input placeholder="Select a fruit..." />
            <Combobox.ActionButtons>
              <Combobox.Trigger />
            </Combobox.ActionButtons>
          </Combobox.InputWrapper>
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={4}>
              <Combobox.Popup>
                <Combobox.Empty />
                <Combobox.List>
                  {(item: string) => (
                    <Combobox.Item
                      key={item}
                      value={item}
                      trailingIcon={<CentralIcon name="IconGlobe2" size={16} />}
                    >
                      <Combobox.ItemIndicator />
                      <Combobox.ItemText>{item}</Combobox.ItemText>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </div>

      {/* With Leading Icons (indicator on right) */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          With Leading Icons
        </span>
        <Combobox.Root items={fruits} filter={filter.contains}>
          <Combobox.InputWrapper>
            <Combobox.Input placeholder="Select a fruit..." />
            <Combobox.ActionButtons>
              <Combobox.Trigger />
            </Combobox.ActionButtons>
          </Combobox.InputWrapper>
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={4}>
              <Combobox.Popup>
                <Combobox.Empty />
                <Combobox.List>
                  {(item: string) => (
                    <Combobox.Item
                      key={item}
                      value={item}
                      leadingIcon={<CentralIcon name="IconGlobe2" size={16} />}
                    >
                      <Combobox.ItemText>{item}</Combobox.ItemText>
                      <Combobox.ItemIndicator />
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </div>

      {/* Multi Select - no chevron per Figma spec and Base UI pattern */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Multi Select
        </span>
        <Combobox.Root items={fruits} multiple filter={filter.contains}>
          <Combobox.InputWrapper>
            <Combobox.Chips>
              <Combobox.Value>
                {(values: string[]) => (
                  <>
                    {values?.map((value) => (
                      <Combobox.Chip key={value} aria-label={value}>
                        {value}
                        <Combobox.ChipRemove />
                      </Combobox.Chip>
                    ))}
                    {/* Input is INSIDE Value - clicking anywhere opens popup */}
                    <Combobox.Input
                      placeholder={values?.length > 0 ? "" : "Select fruits..."}
                    />
                  </>
                )}
              </Combobox.Value>
            </Combobox.Chips>
            {/* No ActionButtons/Trigger for multi-select - per Figma spec */}
          </Combobox.InputWrapper>
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={4}>
              <Combobox.Popup>
                <Combobox.Empty />
                <Combobox.List>
                  {(item: string) => (
                    <Combobox.Item key={item} value={item}>
                      <Combobox.ItemCheckbox />
                      <Combobox.ItemText>{item}</Combobox.ItemText>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </div>

      {/* Disabled */}
      <div>
        <span
          style={{
            fontSize: "14px",
            color: "#7c7c7c",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Disabled
        </span>
        <Combobox.Root items={fruits} disabled filter={filter.contains}>
          <Combobox.InputWrapper>
            <Combobox.Input placeholder="Disabled combobox..." />
            <Combobox.ActionButtons>
              <Combobox.Trigger />
            </Combobox.ActionButtons>
          </Combobox.InputWrapper>
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={4}>
              <Combobox.Popup>
                <Combobox.List>
                  {(item: string) => (
                    <Combobox.Item key={item} value={item}>
                      <Combobox.ItemIndicator />
                      <Combobox.ItemText>{item}</Combobox.ItemText>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </div>
    </div>
  );
}

// Table example data
interface TablePerson {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}

const tableData: TablePerson[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Engineer",
    status: "active",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Designer",
    status: "active",
  },
  {
    id: "3",
    name: "Carol White",
    email: "carol@example.com",
    role: "Manager",
    status: "inactive",
  },
  {
    id: "4",
    name: "David Brown",
    email: "david@example.com",
    role: "Engineer",
    status: "active",
  },
  {
    id: "5",
    name: "Eve Davis",
    email: "eve@example.com",
    role: "Designer",
    status: "active",
  },
];

const tableColumnHelper = createColumnHelper<TablePerson>();

function TableExamples() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const columns = [
    tableColumnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Table.CheckboxWrapper>
          <label style={{ display: "flex", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              aria-label="Select all"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            />
            <Checkbox.Indicator
              checked={table.getIsAllRowsSelected()}
              indeterminate={table.getIsSomeRowsSelected()}
            />
          </label>
        </Table.CheckboxWrapper>
      ),
      cell: ({ row }) => (
        <Table.CheckboxWrapper>
          <label style={{ display: "flex", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
              aria-label="Select row"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            />
            <Checkbox.Indicator checked={row.getIsSelected()} />
          </label>
        </Table.CheckboxWrapper>
      ),
      meta: { variant: "checkbox" as const },
    }),
    tableColumnHelper.accessor("name", {
      header: "Name",
      cell: (info) => (
        <Table.CellContent
          label={info.getValue()}
          description={info.row.original.email}
        />
      ),
      enableSorting: true,
    }),
    tableColumnHelper.accessor("role", {
      header: "Role",
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    tableColumnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <Badge variant={info.getValue() === "active" ? "green" : "gray"}>
          {info.getValue()}
        </Badge>
      ),
      enableSorting: false,
      meta: { align: "right" as const },
    }),
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  const hasSelection = Object.keys(rowSelection).length > 0;

  return (
    <div style={{ marginBottom: "128px" }}>
      <Table.Root hasSelection={hasSelection}>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.HeaderRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.HeaderCell
                  key={header.id}
                  variant={
                    (header.column.columnDef.meta as { variant?: "checkbox" })
                      ?.variant
                  }
                  sortable={header.column.getCanSort()}
                  sortDirection={header.column.getIsSorted() || undefined}
                  onSort={header.column.getToggleSortingHandler()}
                  align={
                    (
                      header.column.columnDef.meta as {
                        align?: "left" | "right";
                      }
                    )?.align
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </Table.HeaderCell>
              ))}
            </Table.HeaderRow>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row, index) => (
            <Table.Row
              key={row.id}
              selected={row.getIsSelected()}
              last={index === table.getRowModel().rows.length - 1}
            >
              {row.getVisibleCells().map((cell) => (
                <Table.Cell
                  key={cell.id}
                  variant={
                    (cell.column.columnDef.meta as { variant?: "checkbox" })
                      ?.variant
                  }
                  align={
                    (cell.column.columnDef.meta as { align?: "left" | "right" })
                      ?.align
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
}

function LiveDemo() {
  const [data, setData] = React.useState<{ time: number; value: number }[]>([]);
  const [value, setValue] = React.useState(100);
  const valueRef = React.useRef(100);

  React.useEffect(() => {
    const now = Date.now() / 1000;
    const seed: { time: number; value: number }[] = [];
    let v = 100;
    for (let i = 30; i >= 0; i--) {
      v += (Math.random() - 0.5) * 4;
      seed.push({ time: now - i, value: v });
    }
    valueRef.current = v;
    setData(seed);
    setValue(v);

    const interval = setInterval(() => {
      const t = Date.now() / 1000;
      valueRef.current += (Math.random() - 0.5) * 3;
      const next = valueRef.current;
      setValue(next);
      setData((prev) => {
        const cutoff = t - 60;
        const filtered = prev.filter((p) => p.time > cutoff);
        return [...filtered, { time: t, value: next }];
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <Chart.Live
      data={data}
      value={value}
      color="var(--color-blue-500)"
      window={30}
      height={200}
      grid
      fill
      interactive
      formatValue={(v) => v.toFixed(1)}
    />
  );
}

const drawerRequests = [
  {
    id: "ck8qs-177",
    method: "GET",
    path: "/customers",
    status: 200,
    duration: "314ms",
    host: "api.example.com",
    cache: "HIT",
  },
  {
    id: "ck8qs-178",
    method: "POST",
    path: "/transactions",
    status: 201,
    duration: "892ms",
    host: "api.example.com",
    cache: "MISS",
  },
  {
    id: "ck8qs-179",
    method: "GET",
    path: "/fees",
    status: 200,
    duration: "156ms",
    host: "api.example.com",
    cache: "HIT",
  },
];

function DrawerDemo() {
  const [selected, setSelected] = React.useState<
    (typeof drawerRequests)[0] | null
  >(null);

  return (
    <div style={{ marginBottom: "128px" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 0 }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "var(--stroke-xs) solid var(--border-primary)",
            }}
          >
            <th
              className="label-sm"
              style={{
                textAlign: "left",
                padding: "var(--spacing-xs) var(--spacing-sm)",
                color: "var(--text-tertiary)",
              }}
            >
              Method
            </th>
            <th
              className="label-sm"
              style={{
                textAlign: "left",
                padding: "var(--spacing-xs) var(--spacing-sm)",
                color: "var(--text-tertiary)",
              }}
            >
              Path
            </th>
            <th
              className="label-sm"
              style={{
                textAlign: "right",
                padding: "var(--spacing-xs) var(--spacing-sm)",
                color: "var(--text-tertiary)",
              }}
            >
              Status
            </th>
            <th
              className="label-sm"
              style={{
                textAlign: "right",
                padding: "var(--spacing-xs) var(--spacing-sm)",
                color: "var(--text-tertiary)",
              }}
            >
              Duration
            </th>
          </tr>
        </thead>
        <tbody>
          {drawerRequests.map((req) => (
            <tr
              key={req.id}
              onClick={() => setSelected(req)}
              style={{
                borderBottom: "var(--stroke-xs) solid var(--border-primary)",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "var(--surface-hover)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "";
              }}
            >
              <td
                className="body-sm"
                style={{
                  padding: "var(--spacing-sm)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {req.method}
              </td>
              <td
                className="body-sm"
                style={{
                  padding: "var(--spacing-sm)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {req.path}
              </td>
              <td
                className="body-sm"
                style={{ padding: "var(--spacing-sm)", textAlign: "right" }}
              >
                <Badge variant={req.status < 300 ? "green" : "red"}>
                  {req.status}
                </Badge>
              </td>
              <td
                className="body-sm"
                style={{
                  padding: "var(--spacing-sm)",
                  textAlign: "right",
                  color: "var(--text-secondary)",
                }}
              >
                {req.duration}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Drawer.Root
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        swipeDirection="right"
      >
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport
            style={{ alignItems: "stretch", justifyContent: "flex-end" }}
          >
            <Drawer.Popup>
              {selected && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "var(--spacing-md) var(--spacing-xl)",
                      borderBottom:
                        "var(--stroke-xs) solid var(--border-primary)",
                    }}
                  >
                    <span
                      className="label"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-mono, monospace)",
                      }}
                    >
                      {selected.method} {selected.path}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--spacing-xs)",
                      }}
                    >
                      <Badge variant={selected.status < 300 ? "green" : "red"}>
                        {selected.status}
                      </Badge>
                      <Drawer.Close
                        render={
                          <Button
                            variant="ghost"
                            size="compact"
                            iconOnly
                            aria-label="Close"
                          />
                        }
                      >
                        <CentralIcon name="IconCrossSmall" size={16} />
                      </Drawer.Close>
                    </div>
                  </div>
                  <Drawer.Content>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--spacing-lg)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "var(--spacing-xs)",
                        }}
                      >
                        {[
                          ["Request ID", selected.id],
                          ["Path", selected.path],
                          ["Host", selected.host],
                          ["Duration", selected.duration],
                          ["Cache", selected.cache],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "var(--spacing-2xs) 0",
                            }}
                          >
                            <span
                              className="body-sm"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {label}
                            </span>
                            <span
                              className="body-sm"
                              style={{
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-mono, monospace)",
                              }}
                            >
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Drawer.Content>
                </>
              )}
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

function DatePickerDemo() {
  const [singleDate, setSingleDate] = React.useState<Date | null>(null);
  const [rangeValue, setRangeValue] = React.useState<Date | DateRange | null>(
    null,
  );
  const [mode, setMode] = React.useState<"single" | "range">("range");
  const [includeTime, setIncludeTime] = React.useState(false);

  return (
    <div
      style={{
        display: "flex",
        gap: "2rem",
        flexWrap: "wrap",
        marginBottom: "128px",
      }}
    >
      <div>
        <p
          className="label-sm"
          style={{
            color: "var(--text-tertiary)",
            marginBottom: "var(--spacing-xs)",
          }}
        >
          Single date
        </p>
        <DatePicker.Root
          value={singleDate}
          onValueChange={(v) => setSingleDate(v as Date)}
        >
          <DatePicker.Header />
          <DatePicker.Navigation />
          <DatePicker.Grid />
          <DatePicker.Footer>
            <Button variant="outline" size="compact" style={{ width: "100%" }}>
              Apply
            </Button>
          </DatePicker.Footer>
        </DatePicker.Root>
      </div>
      <div>
        <p
          className="label-sm"
          style={{
            color: "var(--text-tertiary)",
            marginBottom: "var(--spacing-xs)",
          }}
        >
          Date range
        </p>
        <DatePicker.Root
          mode={mode}
          includeTime={includeTime}
          value={rangeValue}
          onValueChange={setRangeValue}
        >
          <DatePicker.Header />
          <DatePicker.Navigation />
          <DatePicker.Grid />
          <DatePicker.Controls>
            <DatePicker.ControlItem label="End date">
              <Switch
                size="sm"
                checked={mode === "range"}
                onCheckedChange={(v) => {
                  setMode(v ? "range" : "single");
                  setRangeValue(null);
                }}
              />
            </DatePicker.ControlItem>
            <DatePicker.ControlItem label="Include time">
              <Switch
                size="sm"
                checked={includeTime}
                onCheckedChange={setIncludeTime}
              />
            </DatePicker.ControlItem>
          </DatePicker.Controls>
          <DatePicker.Footer>
            <Button variant="outline" size="compact" style={{ width: "100%" }}>
              Apply
            </Button>
          </DatePicker.Footer>
        </DatePicker.Root>
      </div>
      <div>
        <p
          className="label-sm"
          style={{
            color: "var(--text-tertiary)",
            marginBottom: "var(--spacing-xs)",
          }}
        >
          French (locale)
        </p>
        <DatePicker.Root
          mode={mode}
          includeTime={includeTime}
          value={rangeValue}
          onValueChange={setRangeValue}
          locale="fr-FR"
          weekStartsOn={1}
          labels={{
            previousMonth: "Mois pr\u00e9c\u00e9dent",
            nextMonth: "Mois suivant",
            date: "Date",
            time: "Heure",
            startDate: "Date de d\u00e9but",
            endDate: "Date de fin",
            startTime: "Heure de d\u00e9but",
            endTime: "Heure de fin",
          }}
        >
          <DatePicker.Header />
          <DatePicker.Navigation />
          <DatePicker.Grid />
          <DatePicker.Controls>
            <DatePicker.ControlItem label="Date de fin">
              <Switch
                size="sm"
                checked={mode === "range"}
                onCheckedChange={(v) => {
                  setMode(v ? "range" : "single");
                  setRangeValue(null);
                }}
              />
            </DatePicker.ControlItem>
            <DatePicker.ControlItem label="Inclure l'heure">
              <Switch
                size="sm"
                checked={includeTime}
                onCheckedChange={setIncludeTime}
              />
            </DatePicker.ControlItem>
          </DatePicker.Controls>
          <DatePicker.Footer>
            <Button variant="outline" size="compact" style={{ width: "100%" }}>
              Appliquer
            </Button>
          </DatePicker.Footer>
        </DatePicker.Root>
      </div>
    </div>
  );
}

function SegmentedNavDemo({
  ariaLabel,
  items,
  initialActive,
}: {
  ariaLabel: string;
  items: string[];
  initialActive: string;
}) {
  const [activeItem, setActiveItem] = React.useState(initialActive);

  return (
    <SegmentedNav aria-label={ariaLabel}>
      {items.map((item) => (
        <SegmentedNav.Link
          key={item}
          active={activeItem === item}
          render={
            <a
              href="/"
              onClick={(event) => {
                event.preventDefault();
                setActiveItem(item);
              }}
            />
          }
        >
          {item}
        </SegmentedNav.Link>
      ))}
    </SegmentedNav>
  );
}

function GroupedSegmentedNavDemo({
  ariaLabel,
  groups,
  initialActive,
}: {
  ariaLabel: string;
  groups: string[][];
  initialActive: string;
}) {
  const [activeItem, setActiveItem] = React.useState(initialActive);

  return (
    <SegmentedNav aria-label={ariaLabel}>
      {groups.map((group, index) => (
        <SegmentedNav.Group key={`group-${index}`}>
          {group.map((item) => (
            <SegmentedNav.Link
              key={item}
              active={activeItem === item}
              render={
                <a
                  href="/"
                  onClick={(event) => {
                    event.preventDefault();
                    setActiveItem(item);
                  }}
                />
              }
            >
              {item}
            </SegmentedNav.Link>
          ))}
        </SegmentedNav.Group>
      ))}
    </SegmentedNav>
  );
}

export default function Home() {
  return (
    <main style={{ padding: "2rem", maxWidth: "600px" }}>
      <Logo
        height={24}
        aria-label="Lightspark"
        style={{ marginBottom: "2rem" }}
      />
      <h1>Origin</h1>
      <p style={{ marginBottom: "2rem" }}>
        Design system rebuild — Base UI + Figma-first approach.
      </p>

      <h2 style={{ marginBottom: "1rem" }}>Accordion Component</h2>

      <Accordion.Root
        defaultValue={["item-1"]}
        style={{ marginBottom: "128px" }}
      >
        <Accordion.Item value="item-1">
          <Accordion.Header>
            <Accordion.Trigger>What is Origin?</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>
            Origin is a design system that combines Base UI for accessibility
            and behavior with Figma Dev Mode CSS for pixel-perfect styling.
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="item-2">
          <Accordion.Header>
            <Accordion.Trigger>How does it work?</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>
            Components are designed in Figma using tokenized properties. The
            Figma lint plugin validates structure against Base UI anatomy. CSS
            is extracted from Dev Mode and transformed to use semantic tokens.
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="item-3">
          <Accordion.Header>
            <Accordion.Trigger>Why this approach?</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>
            This approach ensures perfect design-to-code fidelity while
            maintaining full accessibility through Base UI primitives.
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
      <h2 style={{ marginBottom: "1rem" }}>Action Bar Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "128px",
        }}
      >
        <ActionBar>
          <ActionBarLabel>4 transactions selected</ActionBarLabel>
          <ActionBarActions>
            <Button variant="outline" size="default">
              Clear
            </Button>
            <Button
              variant="filled"
              size="default"
              leadingIcon={<CentralIcon name="IconArrowOutOfBox" size={16} />}
            >
              Export
            </Button>
          </ActionBarActions>
        </ActionBar>

        <ActionBar>
          <ActionBarLabel>3 users selected</ActionBarLabel>
          <ActionBarActions>
            <Button variant="outline" size="default">
              Cancel
            </Button>
            <Button variant="critical" size="default">
              Delete users
            </Button>
          </ActionBarActions>
        </ActionBar>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Alert Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "128px",
        }}
      >
        <Alert
          variant="default"
          title="Title"
          description="Description here."
        />
        <Alert
          variant="critical"
          title="Title"
          description="Description here."
        />
        <Alert variant="default" title="Title only alert" />
        <Alert
          variant="default"
          title="No icon alert"
          description="This alert has no icon."
          icon={false}
        />
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Alert Dialog Component</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "128px" }}>
        <AlertDialog.Root>
          <AlertDialog.Trigger render={<Button variant="outline" />}>
            Open Alert Dialog
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Popup>
              <AlertDialog.Title>Delete Item?</AlertDialog.Title>
              <AlertDialog.Description>
                This action cannot be undone. The item will be permanently
                removed from your account.
              </AlertDialog.Description>
              <AlertDialog.Actions>
                <AlertDialog.Close render={<Button variant="outline" />}>
                  Cancel
                </AlertDialog.Close>
                <AlertDialog.Close render={<Button variant="filled" />}>
                  Delete
                </AlertDialog.Close>
              </AlertDialog.Actions>
            </AlertDialog.Popup>
          </AlertDialog.Portal>
        </AlertDialog.Root>

        <AlertDialog.Root>
          <AlertDialog.Trigger render={<Button variant="critical" />}>
            Destructive Action
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Popup>
              <AlertDialog.Title>Are you sure?</AlertDialog.Title>
              <AlertDialog.Description>
                This will permanently delete your account and all associated
                data.
              </AlertDialog.Description>
              <AlertDialog.Actions>
                <AlertDialog.Close render={<Button variant="outline" />}>
                  Cancel
                </AlertDialog.Close>
                <AlertDialog.Close render={<Button variant="critical" />}>
                  Delete Account
                </AlertDialog.Close>
              </AlertDialog.Actions>
            </AlertDialog.Popup>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Autocomplete Component</h2>

      <AutocompleteExamples />
      <div style={{ marginBottom: "128px" }} />

      <h2 style={{ marginBottom: "1rem" }}>Badge Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "128px",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ width: "80px", fontSize: "14px" }}>Subtle:</span>
          <Badge variant="gray">Label</Badge>
          <Badge variant="purple">Label</Badge>
          <Badge variant="blue">Label</Badge>
          <Badge variant="sky">Label</Badge>
          <Badge variant="pink">Label</Badge>
          <Badge variant="green">Label</Badge>
          <Badge variant="yellow">Label</Badge>
          <Badge variant="red">Label</Badge>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ width: "80px", fontSize: "14px" }}>Vibrant:</span>
          <Badge variant="gray" vibrant>
            Label
          </Badge>
          <Badge variant="purple" vibrant>
            Label
          </Badge>
          <Badge variant="blue" vibrant>
            Label
          </Badge>
          <Badge variant="sky" vibrant>
            Label
          </Badge>
          <Badge variant="pink" vibrant>
            Label
          </Badge>
          <Badge variant="green" vibrant>
            Label
          </Badge>
          <Badge variant="yellow" vibrant>
            Label
          </Badge>
          <Badge variant="red" vibrant>
            Label
          </Badge>
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Breadcrumb Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          marginBottom: "128px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Default
          </span>
          <Breadcrumb.Root>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="/products">Products</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Page>Shoes</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            With Collapsed Items
          </span>
          <Breadcrumb.Root>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Ellipsis />
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="/products/shoes/running">
                  Running
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Page>Trail Runners</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Custom Separator
          </span>
          <Breadcrumb.Root>
            <Breadcrumb.List separator="/">
              <Breadcrumb.Item>
                <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="/products">Products</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Page>Shoes</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Button Component</h2>

      {/* Variants */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        <Button variant="filled">Filled</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="critical">Critical</Button>
        <Button variant="link">Link</Button>
      </div>

      {/* Sizes */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <Button size="dense">Dense</Button>
        <Button size="compact">Compact</Button>
        <Button size="default">Default</Button>
      </div>

      {/* With Icons */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <Button leadingIcon={<CentralIcon name="IconArrowLeft" size={16} />}>
          Back
        </Button>
        <Button trailingIcon={<CentralIcon name="IconArrowRight" size={16} />}>
          Next
        </Button>
        <Button
          leadingIcon={<CentralIcon name="IconArrowLeft" size={16} />}
          trailingIcon={<CentralIcon name="IconArrowRight" size={16} />}
        >
          Both
        </Button>
      </div>

      {/* Icon Only */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <Button
          size="dense"
          iconOnly
          leadingIcon={<CentralIcon name="IconPlusSmall" size={16} />}
          aria-label="Add"
        />
        <Button
          size="compact"
          iconOnly
          leadingIcon={<CentralIcon name="IconPlusSmall" size={16} />}
          aria-label="Add"
        />
        <Button
          size="default"
          iconOnly
          leadingIcon={<CentralIcon name="IconPlusSmall" size={16} />}
          aria-label="Add"
        />
      </div>

      {/* States */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <Button>Default</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>

      {/* Link Variant */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "128px",
        }}
      >
        <span style={{ fontSize: "14px", color: "#7c7c7c" }}>Link:</span>
        <Button variant="link">Learn more</Button>
        <Button variant="link" size="compact">
          Compact link
        </Button>
        <Button variant="link" disabled>
          Disabled link
        </Button>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Button Group</h2>

      <div
        style={{
          display: "flex",
          gap: "2rem",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <span style={{ fontSize: "12px", color: "#7c7c7c" }}>
            Filled horizontal
          </span>
          <ButtonGroup>
            <Button variant="filled">Button</Button>
            <Button variant="filled">Button</Button>
            <Button variant="filled" iconOnly aria-label="More">
              <CentralIcon name="IconChevronDownSmall" size={16} />
            </Button>
          </ButtonGroup>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <span style={{ fontSize: "12px", color: "#7c7c7c" }}>
            Outline horizontal
          </span>
          <ButtonGroup variant="outline">
            <Button variant="outline">Button</Button>
            <Button variant="outline">Button</Button>
            <Button variant="outline" iconOnly aria-label="More">
              <CentralIcon name="IconChevronDownSmall" size={16} />
            </Button>
          </ButtonGroup>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <span style={{ fontSize: "12px", color: "#7c7c7c" }}>
            Secondary horizontal
          </span>
          <ButtonGroup variant="secondary">
            <Button variant="secondary">Button</Button>
            <Button variant="secondary">Button</Button>
            <Button variant="secondary" iconOnly aria-label="More">
              <CentralIcon name="IconChevronDownSmall" size={16} />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "2rem",
          alignItems: "flex-start",
          marginBottom: "128px",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <span style={{ fontSize: "12px", color: "#7c7c7c" }}>
            Filled vertical
          </span>
          <ButtonGroup orientation="vertical">
            <Button variant="filled">Button</Button>
            <Button variant="filled">Button</Button>
            <Button variant="filled">Button</Button>
          </ButtonGroup>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <span style={{ fontSize: "12px", color: "#7c7c7c" }}>
            Outline vertical
          </span>
          <ButtonGroup orientation="vertical" variant="outline">
            <Button variant="outline">Button</Button>
            <Button variant="outline">Button</Button>
            <Button variant="outline">Button</Button>
          </ButtonGroup>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <span style={{ fontSize: "12px", color: "#7c7c7c" }}>
            Secondary vertical
          </span>
          <ButtonGroup orientation="vertical" variant="secondary">
            <Button variant="secondary">Button</Button>
            <Button variant="secondary">Button</Button>
            <Button variant="secondary">Button</Button>
          </ButtonGroup>
        </div>
      </div>
      <div style={{ marginBottom: "128px" }} />

      <h2 style={{ marginBottom: "1rem" }}>Card Component</h2>

      <div
        style={{
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
          alignItems: "flex-start",
          marginBottom: "128px",
        }}
      >
        <Card.Root variant="structured" style={{ width: 360 }}>
          <Card.Header>
            <Card.TitleGroup>
              <Card.Title>Structured</Card.Title>
              <Card.Subtitle>With card surface</Card.Subtitle>
            </Card.TitleGroup>
          </Card.Header>
          <Card.Body>
            <p>Body content with sectioned layout.</p>
          </Card.Body>
          <Card.Footer>
            <Button>Button</Button>
          </Card.Footer>
        </Card.Root>

        <Card.Root variant="simple" style={{ width: 360 }}>
          <Card.TitleGroup>
            <Card.Title>Simple</Card.Title>
            <Card.Subtitle>No card surface</Card.Subtitle>
          </Card.TitleGroup>
          <Card.Body>
            <p>Body content with uniform padding.</p>
          </Card.Body>
          <Button>Button</Button>
        </Card.Root>
      </div>

      <h2 style={{ marginBottom: "1rem" }}>Charts</h2>

      <h3 style={{ marginBottom: "0.75rem" }}>Bar</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 388 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Grouped
          </p>
          <Chart.Bar
            data={[
              { month: "Jan", incoming: 400, outgoing: 240 },
              { month: "Feb", incoming: 500, outgoing: 300 },
              { month: "Mar", incoming: 450, outgoing: 280 },
              { month: "Apr", incoming: 600, outgoing: 350 },
              { month: "May", incoming: 550, outgoing: 320 },
            ]}
            series={[
              { key: "incoming", label: "Incoming" },
              { key: "outgoing", label: "Outgoing" },
            ]}
            xKey="month"
            height={220}
            grid
            tooltip
          />
        </div>
        <div style={{ width: 388 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Stacked
          </p>
          <Chart.Bar
            data={[
              { q: "Q1", payments: 400, transfers: 200, fees: 50 },
              { q: "Q2", payments: 500, transfers: 250, fees: 60 },
              { q: "Q3", payments: 450, transfers: 280, fees: 55 },
              { q: "Q4", payments: 600, transfers: 300, fees: 70 },
            ]}
            series={[
              {
                key: "payments",
                label: "Payments",
                color: "var(--color-blue-700)",
              },
              {
                key: "transfers",
                label: "Transfers",
                color: "var(--color-blue-400)",
              },
              { key: "fees", label: "Fees", color: "var(--color-blue-200)" },
            ]}
            xKey="q"
            height={220}
            grid
            tooltip
            stacked
          />
        </div>
        <div style={{ width: 388 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Horizontal
          </p>
          <Chart.Bar
            data={[
              { country: "US", volume: 4200 },
              { country: "UK", volume: 2800 },
              { country: "EU", volume: 3100 },
              { country: "JP", volume: 1500 },
              { country: "BR", volume: 900 },
            ]}
            dataKey="volume"
            xKey="country"
            height={220}
            grid
            tooltip
            orientation="horizontal"
          />
        </div>
        <div style={{ width: 388 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Single series + reference
          </p>
          <Chart.Bar
            data={[
              { day: "Mon", count: 12 },
              { day: "Tue", count: 18 },
              { day: "Wed", count: 15 },
              { day: "Thu", count: 22 },
              { day: "Fri", count: 20 },
            ]}
            dataKey="count"
            xKey="day"
            height={220}
            grid
            tooltip
            referenceLines={[{ value: 17, label: "Average" }]}
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>BarList</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 400 }}>
          <Chart.BarList
            data={[
              { name: "/", value: 2340, displayValue: "0.28s" },
              { name: "/pricing", value: 326, displayValue: "0.34s" },
              { name: "/blog", value: 148, displayValue: "0.31s" },
              { name: "/docs", value: 89, displayValue: "0.42s" },
              { name: "/about", value: 45, displayValue: "0.25s" },
            ]}
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>BarList (ranked)</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 400 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            With rank, change indicators, and secondary values
          </p>
          <Chart.BarList
            data={[
              {
                name: "United States",
                value: 4200,
                secondaryValue: 32,
                change: "up" as const,
              },
              {
                name: "United Kingdom",
                value: 2800,
                secondaryValue: 21,
                change: "down" as const,
              },
              {
                name: "Germany",
                value: 1500,
                secondaryValue: 11,
                change: "neutral" as const,
              },
              { name: "Japan", value: 900, secondaryValue: 7 },
              {
                name: "Brazil",
                value: 650,
                secondaryValue: 5,
                change: "up" as const,
              },
            ]}
            formatValue={(v) => `$${v.toLocaleString()}`}
            formatSecondaryValue={(v) => `${v}%`}
            showRank
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>Composed</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 500 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Bar + line, dual Y-axes
          </p>
          <Chart.Composed
            data={[
              { month: "Jan", revenue: 4200, rate: 3.2 },
              { month: "Feb", revenue: 5100, rate: 3.8 },
              { month: "Mar", revenue: 4800, rate: 3.5 },
              { month: "Apr", revenue: 6200, rate: 4.1 },
              { month: "May", revenue: 5800, rate: 3.9 },
              { month: "Jun", revenue: 7100, rate: 4.5 },
            ]}
            series={[
              {
                key: "revenue",
                label: "Revenue",
                type: "bar",
                color: "var(--color-blue-300)",
              },
              {
                key: "rate",
                label: "Conversion %",
                type: "line",
                axis: "right",
                color: "var(--text-primary)",
              },
            ]}
            xKey="month"
            height={250}
            grid
            tooltip
            formatYLabelRight={(v) => `${v}%`}
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>Donut</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 388 }}>
          <Chart.Pie
            data={[
              { name: "Payments", value: 4200, color: "var(--color-blue-700)" },
              {
                name: "Transfers",
                value: 2800,
                color: "var(--color-blue-500)",
              },
              { name: "Fees", value: 650, color: "var(--color-blue-300)" },
              { name: "Refunds", value: 320, color: "var(--color-blue-100)" },
            ]}
            height={200}
          />
        </div>
        <div style={{ width: 388 }}>
          <Chart.Pie
            data={[
              { name: "USD", value: 58, color: "var(--color-blue-700)" },
              { name: "EUR", value: 22, color: "var(--color-blue-500)" },
              { name: "GBP", value: 12, color: "var(--color-blue-300)" },
              { name: "Other", value: 8, color: "var(--color-blue-100)" },
            ]}
            height={200}
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>Funnel</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 600 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Conversion pipeline
          </p>
          <Chart.Funnel
            data={[
              {
                label: "Visitors",
                value: 10000,
                color: "var(--color-blue-700)",
              },
              {
                label: "Sign ups",
                value: 4200,
                color: "var(--color-blue-500)",
              },
              {
                label: "Activated",
                value: 2800,
                color: "var(--color-blue-400)",
              },
              {
                label: "Subscribed",
                value: 1200,
                color: "var(--color-blue-300)",
              },
              { label: "Retained", value: 900, color: "var(--color-blue-200)" },
            ]}
            formatValue={(v) => v.toLocaleString()}
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>Gauge</h3>
      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 280 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Default
          </p>
          <Chart.Gauge
            value={0.32}
            min={0}
            max={1}
            thresholds={[
              { upTo: 0.5, color: "var(--color-green-500)", label: "Great" },
              {
                upTo: 0.8,
                color: "var(--color-yellow-500)",
                label: "Needs work",
              },
              { upTo: 1, color: "var(--color-red-500)", label: "Poor" },
            ]}
            markerLabel="P75"
            formatValue={(v) => `${v.toFixed(2)}s`}
          />
        </div>
        <div style={{ width: 280 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Minimal
          </p>
          <Chart.Gauge
            value={0.32}
            min={0}
            max={1}
            variant="minimal"
            thresholds={[
              { upTo: 0.5, color: "var(--color-green-500)", label: "Great" },
              {
                upTo: 0.8,
                color: "var(--color-yellow-500)",
                label: "Needs work",
              },
              { upTo: 1, color: "var(--color-red-500)", label: "Poor" },
            ]}
            formatValue={(v) => `${v.toFixed(2)}s`}
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>Line</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 388 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Multi-series with grid
          </p>
          <Chart.Line
            data={[
              { date: "Mon", incoming: 120, outgoing: 80 },
              { date: "Tue", incoming: 150, outgoing: 95 },
              { date: "Wed", incoming: 140, outgoing: 110 },
              { date: "Thu", incoming: 180, outgoing: 100 },
              { date: "Fri", incoming: 160, outgoing: 130 },
            ]}
            series={[
              { key: "incoming", label: "Incoming" },
              { key: "outgoing", label: "Outgoing" },
            ]}
            xKey="date"
            height={200}
            grid
            tooltip
          />
        </div>
        <div style={{ width: 388 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Area fill + fadeLeft
          </p>
          <Chart.Line
            data={[
              { date: "Mon", value: 120 },
              { date: "Tue", value: 150 },
              { date: "Wed", value: 140 },
              { date: "Thu", value: 180 },
              { date: "Fri", value: 160 },
              { date: "Sat", value: 200 },
              { date: "Sun", value: 190 },
            ]}
            dataKey="value"
            xKey="date"
            height={200}
            grid
            fill
            fadeLeft
            tooltip="compact"
          />
        </div>
        <div style={{ width: 388 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Dashed + dotted series
          </p>
          <Chart.Line
            data={[
              { date: "Jan", actual: 100, projected: 110, target: 130 },
              { date: "Feb", actual: 120, projected: 125, target: 130 },
              { date: "Mar", actual: 115, projected: 140, target: 130 },
              { date: "Apr", actual: 140, projected: 155, target: 130 },
              { date: "May", actual: 160, projected: 170, target: 130 },
            ]}
            series={[
              { key: "actual", label: "Actual" },
              { key: "projected", label: "Projected", style: "dashed" },
              {
                key: "target",
                label: "Target",
                style: "dotted",
                color: "var(--text-tertiary)",
              },
            ]}
            xKey="date"
            height={200}
            grid
            tooltip
          />
        </div>
        <div style={{ width: 388 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Reference lines
          </p>
          <Chart.Line
            data={[
              { date: "Mon", value: 85 },
              { date: "Tue", value: 92 },
              { date: "Wed", value: 78 },
              { date: "Thu", value: 95 },
              { date: "Fri", value: 88 },
            ]}
            dataKey="value"
            xKey="date"
            height={200}
            grid
            tooltip
            fadeLeft={60}
            referenceLines={[
              { value: 90, label: "Target" },
              { value: 75, label: "Minimum" },
            ]}
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>Live (Real-Time)</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 500 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Streaming data (random walk)
          </p>
          <LiveDemo />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>Sankey</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 640 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Budget allocation
          </p>
          <Chart.Sankey
            data={{
              nodes: [
                {
                  id: "revenue",
                  label: "Revenue",
                  color: "var(--color-blue-700)",
                },
                {
                  id: "grants",
                  label: "Grants",
                  color: "var(--color-blue-400)",
                },
                {
                  id: "investments",
                  label: "Investments",
                  color: "var(--color-blue-200)",
                },
                {
                  id: "engineering",
                  label: "Engineering",
                  color: "var(--color-purple-600)",
                },
                {
                  id: "marketing",
                  label: "Marketing",
                  color: "var(--color-purple-400)",
                },
                {
                  id: "operations",
                  label: "Operations",
                  color: "var(--color-purple-200)",
                },
                {
                  id: "product",
                  label: "Product",
                  color: "var(--color-green-600)",
                },
                {
                  id: "growth",
                  label: "Growth",
                  color: "var(--color-green-400)",
                },
                {
                  id: "infra",
                  label: "Infra",
                  color: "var(--color-green-200)",
                },
              ],
              links: [
                { source: "revenue", target: "engineering", value: 400 },
                { source: "revenue", target: "marketing", value: 200 },
                { source: "revenue", target: "operations", value: 150 },
                { source: "grants", target: "engineering", value: 80 },
                { source: "grants", target: "operations", value: 40 },
                { source: "investments", target: "marketing", value: 60 },
                { source: "investments", target: "engineering", value: 30 },
                { source: "engineering", target: "product", value: 350 },
                { source: "engineering", target: "infra", value: 160 },
                { source: "marketing", target: "growth", value: 220 },
                { source: "marketing", target: "product", value: 40 },
                { source: "operations", target: "infra", value: 120 },
                { source: "operations", target: "growth", value: 70 },
              ],
            }}
            stages={["Sources", "Departments", "Outcomes"]}
            showValues
            height={380}
            formatValue={(v) => `$${v}k`}
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>Scatter</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 500 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Multi-series with grid
          </p>
          <Chart.Scatter
            data={[
              {
                key: "product-a",
                label: "Product A",
                color: "var(--color-blue-600)",
                data: [
                  { x: 10, y: 30, label: "Jan" },
                  { x: 25, y: 55, label: "Feb" },
                  { x: 40, y: 70, label: "Mar" },
                  { x: 55, y: 45, label: "Apr" },
                  { x: 70, y: 85, label: "May" },
                  { x: 85, y: 60, label: "Jun" },
                ],
              },
              {
                key: "product-b",
                label: "Product B",
                color: "var(--color-purple-500)",
                data: [
                  { x: 15, y: 60 },
                  { x: 30, y: 40 },
                  { x: 50, y: 80 },
                  { x: 65, y: 35 },
                  { x: 80, y: 90 },
                ],
              },
            ]}
            height={300}
            grid
            tooltip
            legend
            formatXLabel={(v) => `${v}%`}
            formatYLabel={(v) => `$${v}`}
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>Sparkline</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 160 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Line
          </p>
          <Chart.Sparkline
            data={[
              { v: 10 },
              { v: 15 },
              { v: 12 },
              { v: 18 },
              { v: 14 },
              { v: 22 },
              { v: 19 },
              { v: 25 },
            ]}
            dataKey="v"
          />
        </div>
        <div style={{ width: 160 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Line
          </p>
          <Chart.Sparkline
            data={[
              { v: 25 },
              { v: 22 },
              { v: 24 },
              { v: 18 },
              { v: 20 },
              { v: 15 },
              { v: 12 },
              { v: 10 },
            ]}
            dataKey="v"
            color="var(--color-blue-500)"
          />
        </div>
        <div style={{ width: 300 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Bar
          </p>
          <Chart.Sparkline
            variant="bar"
            data={[
              { v: 12 },
              { v: 18 },
              { v: 15 },
              { v: 22 },
              { v: 20 },
              { v: 14 },
              { v: 25 },
              { v: 19 },
              { v: 16 },
              { v: 21 },
              { v: 13 },
              { v: 24 },
              { v: 17 },
              { v: 23 },
              { v: 11 },
              { v: 20 },
              { v: 18 },
              { v: 26 },
              { v: 15 },
              { v: 22 },
              { v: 19 },
              { v: 14 },
              { v: 21 },
              { v: 16 },
            ]}
            dataKey="v"
            color="var(--color-blue-400)"
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>Split (Distribution)</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 500 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Shade ramp
          </p>
          <Chart.Split
            data={[
              {
                label: "Payments",
                value: 4200,
                color: "var(--color-blue-700)",
              },
              {
                label: "Transfers",
                value: 2800,
                color: "var(--color-blue-400)",
              },
              { label: "Fees", value: 650, color: "var(--color-blue-200)" },
              { label: "Refunds", value: 320, color: "var(--color-blue-100)" },
            ]}
            formatValue={(v) => `$${v.toLocaleString()}`}
            showValues
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>Stacked Area</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 500 }}>
          <Chart.StackedArea
            data={[
              { month: "Jan", payments: 400, transfers: 200, fees: 50 },
              { month: "Feb", payments: 450, transfers: 250, fees: 60 },
              { month: "Mar", payments: 420, transfers: 280, fees: 55 },
              { month: "Apr", payments: 500, transfers: 300, fees: 70 },
              { month: "May", payments: 480, transfers: 320, fees: 65 },
              { month: "Jun", payments: 550, transfers: 350, fees: 80 },
            ]}
            series={[
              {
                key: "payments",
                label: "Payments",
                color: "var(--color-blue-700)",
              },
              {
                key: "transfers",
                label: "Transfers",
                color: "var(--color-blue-400)",
              },
              { key: "fees", label: "Fees", color: "var(--color-blue-200)" },
            ]}
            xKey="month"
            height={250}
            grid
            tooltip
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>Tooltip Modes</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 280 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            simple
          </p>
          <Chart.Line
            data={[
              { d: "Aug 10", v: 180 },
              { d: "Aug 11", v: 185 },
              { d: "Aug 12", v: 182 },
              { d: "Aug 13", v: 188 },
              { d: "Aug 14", v: 190 },
              { d: "Aug 15", v: 195 },
            ]}
            dataKey="v"
            xKey="d"
            height={160}
            grid
            tooltip="simple"
          />
        </div>
        <div style={{ width: 280 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            compact
          </p>
          <Chart.Line
            data={[
              { d: "Aug 10", v: 180 },
              { d: "Aug 11", v: 185 },
              { d: "Aug 12", v: 182 },
              { d: "Aug 13", v: 188 },
              { d: "Aug 14", v: 190 },
              { d: "Aug 15", v: 195 },
            ]}
            dataKey="v"
            xKey="d"
            height={160}
            grid
            tooltip="compact"
          />
        </div>
        <div style={{ width: 280 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            detailed
          </p>
          <Chart.Line
            data={[
              { d: "Mon", a: 120, b: 80 },
              { d: "Tue", a: 150, b: 95 },
              { d: "Wed", a: 140, b: 110 },
              { d: "Thu", a: 180, b: 100 },
            ]}
            series={[
              { key: "a", label: "Incoming" },
              { key: "b", label: "Outgoing" },
            ]}
            xKey="d"
            height={160}
            grid
            tooltip="detailed"
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>Uptime</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: 500 }}>
          <Chart.Uptime
            data={Array.from({ length: 90 }, (_, i) => ({
              status: (i === 12
                ? "down"
                : i === 34
                ? "degraded"
                : i === 67
                ? "down"
                : i === 45
                ? "degraded"
                : "up") as "up" | "down" | "degraded",
              label: `Day ${i + 1}`,
            }))}
            label="90 days — 97.8% uptime"
          />
        </div>
      </div>

      <h3 style={{ marginBottom: "0.75rem" }}>Waterfall</h3>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "128px",
        }}
      >
        <div style={{ width: 500 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Revenue breakdown
          </p>
          <Chart.Waterfall
            data={[
              { label: "Revenue", value: 420, type: "total" },
              { label: "Product", value: 280 },
              { label: "Services", value: 140 },
              { label: "Refunds", value: -85 },
              { label: "Fees", value: -45 },
              { label: "Tax", value: -62 },
              { label: "Net", value: 648, type: "total" },
            ]}
            height={300}
            grid
            tooltip
            showValues
            formatValue={(v) => `$${v}`}
          />
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Checkbox Component</h2>

      <div style={{ display: "flex", gap: "3rem", marginBottom: "128px" }}>
        {/* Default variant */}
        <Checkbox.Field>
          <Checkbox.Legend>Legend</Checkbox.Legend>
          <Checkbox.Group defaultValue={["opt1"]}>
            <Checkbox.Item
              value="opt1"
              label="Label"
              description="Description goes here."
            />
            <Checkbox.Item
              value="opt2"
              label="Label"
              description="Description goes here."
            />
          </Checkbox.Group>
          <Checkbox.Description>Help text goes here.</Checkbox.Description>
        </Checkbox.Field>

        {/* Card variant */}
        <Checkbox.Field style={{ width: 280 }}>
          <Checkbox.Legend>Legend</Checkbox.Legend>
          <Checkbox.Group defaultValue={["card1"]} variant="card">
            <Checkbox.Item
              value="card1"
              label="Label"
              description="Description goes here."
            />
            <Checkbox.Item
              value="card2"
              label="Label"
              description="Description goes here."
            />
          </Checkbox.Group>
          <Checkbox.Description>Help text goes here.</Checkbox.Description>
        </Checkbox.Field>

        {/* Critical state */}
        <Checkbox.Field invalid style={{ width: 280 }}>
          <Checkbox.Legend>Legend</Checkbox.Legend>
          <Checkbox.Group variant="card">
            <Checkbox.Item
              value="err1"
              label="Label"
              description="Description goes here."
            />
            <Checkbox.Item
              value="err2"
              label="Label"
              description="Description goes here."
            />
          </Checkbox.Group>
          <Checkbox.Error match>Error text goes here.</Checkbox.Error>
        </Checkbox.Field>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Chip Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "128px",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>Default MD</span>
          <Chip onDismiss={() => console.log("dismissed")}>label</Chip>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>Default SM</span>
          <Chip size="sm" onDismiss={() => console.log("dismissed")}>
            label
          </Chip>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>Filter MD</span>
          <ChipFilter
            property="Status"
            operator="is"
            value="Active"
            onDismiss={() => console.log("dismissed")}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>Filter SM</span>
          <ChipFilter
            size="sm"
            property="Status"
            operator="is"
            value="Active"
            onDismiss={() => console.log("dismissed")}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>Disabled</span>
          <Chip disabled onDismiss={() => console.log("dismissed")}>
            label
          </Chip>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>No dismiss</span>
          <Chip>label</Chip>
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Collapsible</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-lg)",
          marginBottom: "128px",
          maxWidth: 480,
        }}
      >
        <Collapsible.Root>
          <Collapsible.Trigger>Advanced settings</Collapsible.Trigger>
          <Collapsible.Panel>
            These settings are for experienced users. Adjust log level, enable
            debug mode, and configure custom telemetry endpoints.
          </Collapsible.Panel>
        </Collapsible.Root>

        <Collapsible.Root defaultOpen>
          <Collapsible.Trigger>Details</Collapsible.Trigger>
          <Collapsible.Panel>
            This panel starts open by default. Useful for content that should be
            visible on first load but dismissable.
          </Collapsible.Panel>
        </Collapsible.Root>

        <Collapsible.Root disabled>
          <Collapsible.Trigger>Locked section</Collapsible.Trigger>
          <Collapsible.Panel>This content is locked.</Collapsible.Panel>
        </Collapsible.Root>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Combobox Component</h2>

      <ComboboxExamples />
      <div style={{ marginBottom: "128px" }} />

      <h2 style={{ marginBottom: "1rem" }}>Command Component</h2>

      <CommandDemo />
      <div style={{ marginBottom: "128px" }} />

      <h2 style={{ marginBottom: "1rem" }}>Context Menu Component</h2>

      <ContextMenuExamples />
      <div style={{ marginBottom: "128px" }} />

      <h2 style={{ marginBottom: "1rem" }}>DatePicker</h2>
      <DatePickerDemo />
      <div style={{ marginBottom: "128px" }} />

      <h2 style={{ marginBottom: "1rem" }}>Dialog Component</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "128px" }}>
        <Dialog.Root>
          <Dialog.Trigger render={<Button variant="outline" />}>
            Open Dialog
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
              <Dialog.CloseButton />
              <Dialog.Header>
                <Dialog.Title>Dialog Title</Dialog.Title>
                <Dialog.Description>
                  This is a description of the dialog content.
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Content>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "var(--text-secondary)",
                  }}
                >
                  Dialog content goes here. This area can contain forms, text,
                  or any other content.
                </p>
              </Dialog.Content>
              <Dialog.Footer>
                <Dialog.Close render={<Button variant="outline" />}>
                  Cancel
                </Dialog.Close>
                <Button variant="filled">Confirm</Button>
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>

        <Dialog.Root>
          <Dialog.Trigger render={<Button variant="outline" />}>
            Without Close Button
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
              <Dialog.Header>
                <Dialog.Title>No Close Button</Dialog.Title>
                <Dialog.Description>
                  This dialog does not have an X close button.
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Content>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "var(--text-secondary)",
                  }}
                >
                  The user must use the footer buttons or press Escape to close.
                </p>
              </Dialog.Content>
              <Dialog.Footer>
                <Dialog.Close render={<Button variant="outline" />}>
                  Cancel
                </Dialog.Close>
                <Dialog.Close render={<Button variant="filled" />}>
                  Done
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Drawer</h2>

      <DrawerDemo />
      <div style={{ marginBottom: "128px" }} />

      <h2 style={{ marginBottom: "1rem" }}>Field Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "128px",
          width: "256px",
        }}
      >
        <Field.Root>
          <Field.Label>Default</Field.Label>
          <Input placeholder="Placeholder" />
          <Field.Description>Help text goes here.</Field.Description>
        </Field.Root>

        <Field.Root>
          <Field.Label>Filled</Field.Label>
          <Input defaultValue="Content" />
          <Field.Description>Help text goes here.</Field.Description>
        </Field.Root>

        <Field.Root disabled>
          <Field.Label>Disabled</Field.Label>
          <Input placeholder="Placeholder" />
          <Field.Description>Help text goes here.</Field.Description>
        </Field.Root>

        <Field.Root invalid>
          <Field.Label>Invalid</Field.Label>
          <Input placeholder="Placeholder" />
          <Field.Error>Error text goes here.</Field.Error>
        </Field.Root>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Fieldset Component</h2>

      <div style={{ display: "flex", gap: "3rem", marginBottom: "128px" }}>
        <div style={{ width: 320 }}>
          <Fieldset.Root>
            <Fieldset.Legend>Vertical (default)</Fieldset.Legend>
            <Field.Root name="firstName">
              <Field.Label>First Name</Field.Label>
              <Input placeholder="Enter first name" />
              <Field.Description>Your legal first name.</Field.Description>
            </Field.Root>
            <Field.Root name="lastName">
              <Field.Label>Last Name</Field.Label>
              <Input placeholder="Enter last name" />
              <Field.Description>Your legal last name.</Field.Description>
            </Field.Root>
          </Fieldset.Root>
        </div>
        <div style={{ width: 480 }}>
          <Fieldset.Root orientation="horizontal">
            <Fieldset.Legend>Horizontal</Fieldset.Legend>
            <Field.Root name="city">
              <Field.Label>City</Field.Label>
              <Input placeholder="City" />
            </Field.Root>
            <Field.Root name="state">
              <Field.Label>State</Field.Label>
              <Input placeholder="State" />
            </Field.Root>
            <Field.Root name="zip">
              <Field.Label>Zip</Field.Label>
              <Input placeholder="Zip" />
            </Field.Root>
          </Fieldset.Root>
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Form Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          marginBottom: "128px",
          width: "256px",
        }}
      >
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Form submitted!");
          }}
        >
          <Field.Root name="email">
            <Field.Label>Email</Field.Label>
            <Input type="email" placeholder="Enter your email" />
            <Field.Description>We'll never share your email.</Field.Description>
          </Field.Root>
          <Field.Root name="password">
            <Field.Label>Password</Field.Label>
            <Input type="password" placeholder="Enter your password" />
          </Field.Root>
          <Button type="submit">Sign In</Button>
        </Form>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Input Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "128px",
          maxWidth: "256px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            Default
          </span>
          <Input placeholder="Placeholder" />
        </div>
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            Filled
          </span>
          <Input defaultValue="Content" />
        </div>
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            Disabled
          </span>
          <Input placeholder="Placeholder" disabled />
        </div>
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            Read Only
          </span>
          <Input defaultValue="Read only content" readOnly />
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Input Group</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: 300,
          marginBottom: "1rem",
        }}
      >
        <InputGroup.Root>
          <InputGroup.Addon>
            <CentralIcon name="IconMagnifyingGlass2" size={16} />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Search..." />
        </InputGroup.Root>

        <InputGroup.Root>
          <InputGroup.Input placeholder="Search..." />
          <InputGroup.Button>Search</InputGroup.Button>
        </InputGroup.Root>

        <InputGroup.Root>
          <InputGroup.Input placeholder="Search..." />
          <InputGroup.Button variant="outline">Search</InputGroup.Button>
        </InputGroup.Root>

        <InputGroup.Root>
          <InputGroup.Input placeholder="0.00" />
          <InputGroup.SelectTrigger>USD</InputGroup.SelectTrigger>
        </InputGroup.Root>

        <InputGroup.Root>
          <InputGroup.Input placeholder="0.00" />
          <InputGroup.SelectTrigger variant="outline">
            USD
          </InputGroup.SelectTrigger>
        </InputGroup.Root>

        <InputGroup.Root>
          <InputGroup.Cap>https://</InputGroup.Cap>
          <InputGroup.Input placeholder="example.com" />
        </InputGroup.Root>

        <InputGroup.Root>
          <InputGroup.Input placeholder="Enter value..." />
          <InputGroup.Cap>
            <InputGroup.Button>Copy</InputGroup.Button>
          </InputGroup.Cap>
        </InputGroup.Root>

        <InputGroup.Root>
          <InputGroup.Cap>
            <InputGroup.Button aria-label="Search">
              <CentralIcon name="IconMagnifyingGlass2" size={16} />
            </InputGroup.Button>
          </InputGroup.Cap>
          <InputGroup.Input placeholder="Search..." />
        </InputGroup.Root>

        <InputGroup.Root>
          <InputGroup.Cap>https://</InputGroup.Cap>
          <InputGroup.Input placeholder="your-domain.com" />
          <InputGroup.Cap>
            <InputGroup.Button>Go</InputGroup.Button>
          </InputGroup.Cap>
        </InputGroup.Root>

        <InputGroup.Root>
          <InputGroup.Input defaultValue="sk_live_abc123..." />
          <InputGroup.Cap>
            <InputGroup.Button aria-label="Copy to clipboard">
              <CentralIcon name="IconClipboard2" size={16} />
            </InputGroup.Button>
          </InputGroup.Cap>
        </InputGroup.Root>

        <InputGroup.Root>
          <InputGroup.Text>$</InputGroup.Text>
          <InputGroup.Input placeholder="0.00" />
          <InputGroup.Text>USD</InputGroup.Text>
        </InputGroup.Root>

        <InputGroup.Root disabled>
          <InputGroup.Addon>
            <CentralIcon name="IconMagnifyingGlass2" size={16} />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Disabled" />
        </InputGroup.Root>

        <InputGroup.Root invalid>
          <InputGroup.Addon>
            <CentralIcon name="IconMagnifyingGlass2" size={16} />
          </InputGroup.Addon>
          <InputGroup.Input defaultValue="Invalid" />
        </InputGroup.Root>
      </div>

      <div style={{ marginBottom: "128px" }} />
      <h2 style={{ marginBottom: "1rem" }}>Item Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0",
          marginBottom: "128px",
          maxWidth: "400px",
        }}
      >
        <Item
          title="Account settings"
          description="Manage your account"
          leading={<CentralIcon name="IconSettingsGear1" size={24} />}
          trailing={<CentralIcon name="IconChevronRightSmall" size={20} />}
          onClick={() => console.log("clicked")}
        />
        <Item
          title="Notifications"
          description="Configure alerts"
          leading={<CentralIcon name="IconBell" size={24} />}
          trailing={<Switch size="sm" />}
          clickable={false}
        />
        <Item
          title="Selected option"
          selected
          trailing={<CentralIcon name="IconCheckmark2Small" size={24} />}
          onClick={() => console.log("clicked")}
        />
        <Item
          title="Disabled item"
          description="This item is disabled"
          disabled
        />
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Loader Component</h2>

      <div
        style={{
          display: "flex",
          gap: "2rem",
          alignItems: "center",
          marginBottom: "128px",
        }}
      >
        <Loader />
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Logo Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          marginBottom: "128px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Lightspark Logo Regular
          </span>
          <Logo variant="logo" weight="regular" aria-label="Lightspark" />
        </div>
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Lightspark Logo Light
          </span>
          <Logo variant="logo" weight="light" aria-label="Lightspark" />
        </div>
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Lightspark Logomark Regular
          </span>
          <Logo variant="logomark" weight="regular" aria-label="Lightspark" />
        </div>
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Lightspark Logomark Light
          </span>
          <Logo variant="logomark" weight="light" aria-label="Lightspark" />
        </div>
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Lightspark Wordmark
          </span>
          <Logo variant="wordmark" aria-label="Lightspark" />
        </div>
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Grid Logo
          </span>
          <Logo brand="grid" variant="logo" aria-label="Grid" />
        </div>
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Grid Logomark
          </span>
          <Logo brand="grid" variant="logomark" aria-label="Grid" />
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Menu Component</h2>

      <MenuExamples />
      <div style={{ marginBottom: "128px" }} />

      <h2 style={{ marginBottom: "1rem" }}>Menubar Component</h2>

      <MenubarDemo />
      <div style={{ marginBottom: "128px" }} />

      <h2 style={{ marginBottom: "1rem" }}>Meter Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          marginBottom: "128px",
          maxWidth: "240px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Storage (50%)
          </span>
          <Meter.Root value={50}>
            <Meter.Label>Storage used</Meter.Label>
            <Meter.Value />
            <Meter.Track>
              <Meter.Indicator />
            </Meter.Track>
          </Meter.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Low (25%)
          </span>
          <Meter.Root value={25}>
            <Meter.Label>Battery level</Meter.Label>
            <Meter.Value />
            <Meter.Track>
              <Meter.Indicator />
            </Meter.Track>
          </Meter.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            High (90%)
          </span>
          <Meter.Root value={90}>
            <Meter.Label>Disk space</Meter.Label>
            <Meter.Value />
            <Meter.Track>
              <Meter.Indicator />
            </Meter.Track>
          </Meter.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Track Only
          </span>
          <Meter.Root value={65}>
            <Meter.Track>
              <Meter.Indicator />
            </Meter.Track>
          </Meter.Root>
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Navigation Menu Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          marginBottom: "128px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            With Dropdown
          </span>
          <NavigationMenu.Root>
            <NavigationMenu.List>
              <NavigationMenu.Item>
                <NavigationMenu.Trigger>
                  Products
                  <NavigationMenu.Icon>
                    <CentralIcon name="IconChevronDownSmall" size={16} />
                  </NavigationMenu.Icon>
                </NavigationMenu.Trigger>
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
                <NavigationMenu.Content>
                  <NavigationMenu.PopupItem>
                    Documentation
                  </NavigationMenu.PopupItem>
                  <NavigationMenu.PopupItem>
                    API Reference
                  </NavigationMenu.PopupItem>
                  <NavigationMenu.PopupItem>Blog</NavigationMenu.PopupItem>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <NavigationMenu.Link href="#">Pricing</NavigationMenu.Link>
              </NavigationMenu.Item>
            </NavigationMenu.List>

            <NavigationMenu.Portal>
              <NavigationMenu.Positioner>
                <NavigationMenu.Popup>
                  <NavigationMenu.Viewport />
                </NavigationMenu.Popup>
              </NavigationMenu.Positioner>
            </NavigationMenu.Portal>
          </NavigationMenu.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Links Only
          </span>
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
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            With Group Labels
          </span>
          <NavigationMenu.Root>
            <NavigationMenu.List>
              <NavigationMenu.Item>
                <NavigationMenu.Trigger>
                  Products
                  <NavigationMenu.Icon>
                    <CentralIcon name="IconChevronDownSmall" size={16} />
                  </NavigationMenu.Icon>
                </NavigationMenu.Trigger>
                <NavigationMenu.Content>
                  <NavigationMenu.Group>
                    <NavigationMenu.GroupLabel>
                      Analytics
                    </NavigationMenu.GroupLabel>
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
                    <NavigationMenu.GroupLabel>
                      Settings
                    </NavigationMenu.GroupLabel>
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

            <NavigationMenu.Portal>
              <NavigationMenu.Positioner>
                <NavigationMenu.Popup>
                  <NavigationMenu.Viewport />
                </NavigationMenu.Popup>
              </NavigationMenu.Positioner>
            </NavigationMenu.Portal>
          </NavigationMenu.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            With Actions
          </span>
          <NavigationMenu.Root>
            <NavigationMenu.List>
              <NavigationMenu.Item>
                <NavigationMenu.Link href="#" active>
                  Dashboard
                </NavigationMenu.Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <NavigationMenu.Link href="#">Settings</NavigationMenu.Link>
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
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Pagination Component</h2>

      <PaginationDemo />

      <div style={{ marginBottom: "128px" }} />
      <h2 style={{ marginBottom: "1rem" }}>Phone Input Component</h2>

      <PhoneInputDemo />

      <div style={{ marginBottom: "128px" }} />
      <h2 style={{ marginBottom: "1rem" }}>Popover Component</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "128px" }}>
        <Popover.Root>
          <Popover.Trigger render={<Button variant="outline" />}>
            Notifications
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner>
              <Popover.Popup
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-3xs)",
                  padding: "var(--spacing-sm) var(--spacing-md)",
                  width: 240,
                }}
              >
                <Popover.Title
                  className="label"
                  style={{ margin: 0, color: "var(--text-primary)" }}
                >
                  Notifications
                </Popover.Title>
                <Popover.Description
                  className="body-sm"
                  style={{ margin: 0, color: "var(--text-secondary)" }}
                >
                  You are all caught up. Good job!
                </Popover.Description>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

        <Popover.Root>
          <Popover.Trigger render={<Button variant="outline" />}>
            Settings
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner>
              <Popover.Popup
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-3xs)",
                  padding: "var(--spacing-sm) var(--spacing-md)",
                  width: 260,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Popover.Title
                    className="label"
                    style={{ margin: 0, color: "var(--text-primary)" }}
                  >
                    Settings
                  </Popover.Title>
                  <Popover.Close
                    render={
                      <Button
                        variant="ghost"
                        size="compact"
                        iconOnly
                        style={{
                          marginRight: "calc(var(--spacing-xs) * -1)",
                          marginTop: "calc(var(--spacing-3xs) * -1)",
                        }}
                      >
                        <CentralIcon name="IconCrossSmall" size={16} />
                      </Button>
                    }
                  />
                </div>
                <Popover.Description
                  className="body-sm"
                  style={{ margin: 0, color: "var(--text-secondary)" }}
                >
                  Adjust your notification preferences and alert thresholds.
                </Popover.Description>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

        <Popover.Root>
          <Popover.Trigger render={<Button variant="outline" />}>
            Modal Popover
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Backdrop />
            <Popover.Positioner>
              <Popover.Popup
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-xs)",
                  padding: "var(--spacing-md)",
                  width: 280,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-3xs)",
                  }}
                >
                  <Popover.Title
                    className="label"
                    style={{ margin: 0, color: "var(--text-primary)" }}
                  >
                    Confirm Action
                  </Popover.Title>
                  <Popover.Description
                    className="body-sm"
                    style={{ margin: 0, color: "var(--text-secondary)" }}
                  >
                    This action requires your confirmation before proceeding.
                  </Popover.Description>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "var(--spacing-xs)",
                    justifyContent: "flex-end",
                  }}
                >
                  <Popover.Close
                    render={<Button variant="outline" size="compact" />}
                  >
                    Cancel
                  </Popover.Close>
                  <Popover.Close
                    render={<Button variant="filled" size="compact" />}
                  >
                    Confirm
                  </Popover.Close>
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Preview Card</h2>

      <div
        style={{
          display: "flex",
          gap: "2rem",
          marginBottom: "128px",
          alignItems: "center",
        }}
      >
        <PreviewCard.Root>
          <PreviewCard.Trigger href="https://example.com">
            Hover to preview
          </PreviewCard.Trigger>
          <PreviewCard.Portal>
            <PreviewCard.Positioner sideOffset={8}>
              <PreviewCard.Popup
                style={{ padding: "var(--spacing-md)", width: 280 }}
              >
                <PreviewCard.Arrow />
                <p style={{ margin: 0 }}>
                  A lightweight preview of the linked content
                </p>
              </PreviewCard.Popup>
            </PreviewCard.Positioner>
          </PreviewCard.Portal>
        </PreviewCard.Root>

        <PreviewCard.Root>
          <PreviewCard.Trigger href="https://example.com">
            Rich preview
          </PreviewCard.Trigger>
          <PreviewCard.Portal>
            <PreviewCard.Positioner sideOffset={8}>
              <PreviewCard.Popup style={{ width: 300 }}>
                <div
                  style={{
                    height: 120,
                    background: "var(--surface-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-tertiary)",
                  }}
                >
                  <CentralIcon name="IconGlobe2" size={24} />
                </div>
                <div
                  style={{
                    padding: "var(--spacing-md)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-2xs)",
                  }}
                >
                  <span
                    className="label"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Typography Guide
                  </span>
                  <span
                    className="body-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Learn about text styles, mixins, and the type scale
                  </span>
                </div>
              </PreviewCard.Popup>
            </PreviewCard.Positioner>
          </PreviewCard.Portal>
        </PreviewCard.Root>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Progress Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          marginBottom: "128px",
          maxWidth: "240px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Default (50%)
          </span>
          <Progress.Root value={50}>
            <Progress.Label>Export data</Progress.Label>
            <Progress.Value />
            <Progress.Track>
              <Progress.Indicator />
            </Progress.Track>
          </Progress.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Complete (100%)
          </span>
          <Progress.Root value={100}>
            <Progress.Label>Upload complete</Progress.Label>
            <Progress.Value />
            <Progress.Track>
              <Progress.Indicator />
            </Progress.Track>
          </Progress.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Indeterminate
          </span>
          <Progress.Root value={null}>
            <Progress.Label>Loading...</Progress.Label>
            <Progress.Track>
              <Progress.Indicator />
            </Progress.Track>
          </Progress.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Track Only
          </span>
          <Progress.Root value={75}>
            <Progress.Track>
              <Progress.Indicator />
            </Progress.Track>
          </Progress.Root>
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Radio Component</h2>

      <div style={{ display: "flex", gap: "3rem", marginBottom: "128px" }}>
        {/* Default variant */}
        <Radio.Field>
          <Radio.Legend>Legend</Radio.Legend>
          <Radio.Group defaultValue="opt1">
            <Radio.Item
              value="opt1"
              label="Label"
              description="Description goes here."
            />
            <Radio.Item
              value="opt2"
              label="Label"
              description="Description goes here."
            />
          </Radio.Group>
          <Radio.Description>Help text goes here.</Radio.Description>
        </Radio.Field>

        {/* Card variant */}
        <Radio.Field style={{ width: 280 }}>
          <Radio.Legend>Legend</Radio.Legend>
          <Radio.Group defaultValue="card1" variant="card">
            <Radio.Item
              value="card1"
              label="Label"
              description="Description goes here."
            />
            <Radio.Item
              value="card2"
              label="Label"
              description="Description goes here."
            />
          </Radio.Group>
          <Radio.Description>Help text goes here.</Radio.Description>
        </Radio.Field>

        {/* Critical state */}
        <Radio.Field invalid style={{ width: 280 }}>
          <Radio.Legend>Legend</Radio.Legend>
          <Radio.Group variant="card">
            <Radio.Item
              value="err1"
              label="Label"
              description="Description goes here."
            />
            <Radio.Item
              value="err2"
              label="Label"
              description="Description goes here."
            />
          </Radio.Group>
          <Radio.Error match>Error text goes here.</Radio.Error>
        </Radio.Field>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>SegmentedNav Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          marginBottom: "128px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Flat links
          </span>
          <SegmentedNavDemo
            ariaLabel="Payout sections"
            items={["Overview", "Activity", "Recipients", "Customers"]}
            initialActive="Activity"
          />
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Grouped links
          </span>
          <GroupedSegmentedNavDemo
            ariaLabel="Grouped payout sections"
            groups={[
              ["Overview", "Platform payouts", "Recipients"],
              ["Customer payouts"],
            ]}
            initialActive="Platform payouts"
          />
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Longer labels
          </span>
          <SegmentedNavDemo
            ariaLabel="Customer payout sections"
            items={["Customer overview", "Platform payouts", "Reconciliation"]}
            initialActive="Platform payouts"
          />
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Select Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          marginBottom: "128px",
          maxWidth: "256px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Default
          </span>
          <Select.Root>
            <Select.Trigger>
              <Select.Value placeholder="Select a fruit" />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popup>
                  <Select.List>
                    <Select.Item value="apple">
                      <Select.ItemIndicator />
                      <Select.ItemText>Apple</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="banana">
                      <Select.ItemIndicator />
                      <Select.ItemText>Banana</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="orange">
                      <Select.ItemIndicator />
                      <Select.ItemText>Orange</Select.ItemText>
                    </Select.Item>
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            With Groups
          </span>
          <Select.Root>
            <Select.Trigger>
              <Select.Value placeholder="Select food" />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popup>
                  <Select.List>
                    <Select.Item value="apple">
                      <Select.ItemIndicator />
                      <Select.ItemText>Apple</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="banana">
                      <Select.ItemIndicator />
                      <Select.ItemText>Banana</Select.ItemText>
                    </Select.Item>
                  </Select.List>
                  <Select.Separator />
                  <Select.Group>
                    <Select.GroupLabel>Vegetables</Select.GroupLabel>
                    <Select.List>
                      <Select.Item value="carrot">
                        <Select.ItemIndicator />
                        <Select.ItemText>Carrot</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="broccoli">
                        <Select.ItemIndicator />
                        <Select.ItemText>Broccoli</Select.ItemText>
                      </Select.Item>
                    </Select.List>
                  </Select.Group>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            With Trailing Icons
          </span>
          <Select.Root>
            <Select.Trigger>
              <Select.Value placeholder="Select a country" />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popup>
                  <Select.List>
                    <Select.Item
                      value="us"
                      trailingIcon={<CentralIcon name="IconGlobe2" size={16} />}
                    >
                      <Select.ItemIndicator />
                      <Select.ItemText>United States</Select.ItemText>
                    </Select.Item>
                    <Select.Item
                      value="uk"
                      trailingIcon={<CentralIcon name="IconGlobe2" size={16} />}
                    >
                      <Select.ItemIndicator />
                      <Select.ItemText>United Kingdom</Select.ItemText>
                    </Select.Item>
                    <Select.Item
                      value="de"
                      trailingIcon={<CentralIcon name="IconGlobe2" size={16} />}
                    >
                      <Select.ItemIndicator />
                      <Select.ItemText>Germany</Select.ItemText>
                    </Select.Item>
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Disabled
          </span>
          <Select.Root disabled>
            <Select.Trigger>
              <Select.Value placeholder="Select a fruit" />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popup>
                  <Select.List>
                    <Select.Item value="apple">
                      <Select.ItemIndicator />
                      <Select.ItemText>Apple</Select.ItemText>
                    </Select.Item>
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Multi Select
          </span>
          <Select.Root multiple defaultValue={["apple", "banana"]}>
            <Select.Trigger>
              <Select.Value>
                {(selected: string[]) => {
                  if (selected.length === 0) {
                    return <span data-placeholder="">Select fruits</span>;
                  }
                  const labels: Record<string, string> = {
                    apple: "Apple",
                    banana: "Banana",
                    orange: "Orange",
                  };
                  const first = labels[selected[0]];
                  return selected.length === 1
                    ? first
                    : `${first} +${selected.length - 1}`;
                }}
              </Select.Value>
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popup>
                  <Select.List>
                    <Select.Item value="apple">
                      <Select.ItemIndicator />
                      <Select.ItemText>Apple</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="banana">
                      <Select.ItemIndicator />
                      <Select.ItemText>Banana</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="orange">
                      <Select.ItemIndicator />
                      <Select.ItemText>Orange</Select.ItemText>
                    </Select.Item>
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Ghost Variant (minimal inline)
          </span>
          <Select.Root defaultValue="apple">
            <Select.Trigger variant="ghost">
              <Select.Value placeholder="Select" />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popup>
                  <Select.List>
                    <Select.Item value="apple">
                      <Select.ItemIndicator />
                      <Select.ItemText>Apple</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="banana">
                      <Select.ItemIndicator />
                      <Select.ItemText>Banana</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="orange">
                      <Select.ItemIndicator />
                      <Select.ItemText>Orange</Select.ItemText>
                    </Select.Item>
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Hybrid Variant (for navbars/toolbars)
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Environment:</span>
            <Select.Root defaultValue="production">
              <Select.Trigger variant="hybrid">
                <Select.Value>
                  {(value: string) => {
                    const labels: Record<string, string> = {
                      production: "Production",
                      sandbox: "Sandbox",
                      staging: "Staging",
                    };
                    return labels[value] || value;
                  }}
                </Select.Value>
                <Select.HybridIcon />
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner>
                  <Select.Popup>
                    <Select.List>
                      <Select.Item value="production">
                        <Select.ItemText>Production</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                      <Select.Item value="sandbox">
                        <Select.ItemText>Sandbox</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                      <Select.Item value="staging">
                        <Select.ItemText>Staging</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                    </Select.List>
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </div>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Hybrid Disabled
          </span>
          <Select.Root disabled defaultValue="production">
            <Select.Trigger variant="hybrid">
              <Select.Value>
                {(value: string) => {
                  const labels: Record<string, string> = {
                    production: "Production",
                    sandbox: "Sandbox",
                    staging: "Staging",
                  };
                  return labels[value] || value;
                }}
              </Select.Value>
              <Select.HybridIcon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popup>
                  <Select.List>
                    <Select.Item value="production">
                      <Select.ItemText>Production</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Empty State
          </span>
          <Select.Root>
            <Select.Trigger>
              <Select.Value placeholder="Select an option" />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popup>
                  <Select.Empty>No options available</Select.Empty>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Separator Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          marginBottom: "128px",
          maxWidth: "300px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Default (1px)
          </span>
          <Separator />
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Hairline (0.5px)
          </span>
          <Separator variant="hairline" />
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Vertical in Navigation
          </span>
          <nav
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
              height: "32px",
            }}
          >
            <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
              Home
            </a>
            <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
              Pricing
            </a>
            <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
              Blog
            </a>
            <Separator orientation="vertical" />
            <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
              Log in
            </a>
            <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
              Sign up
            </a>
          </nav>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Vertical Hairline
          </span>
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
              height: "32px",
            }}
          >
            <span>Left</span>
            <Separator orientation="vertical" variant="hairline" />
            <span>Right</span>
          </div>
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Shortcut Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "128px",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>Single Key</span>
          <Shortcut keys={["⌘"]} />
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>Two Keys</span>
          <Shortcut keys={["⌘", "K"]} />
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>Three Keys</span>
          <Shortcut keys={["⌘", "⇧", "P"]} />
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>Common</span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <span
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <Shortcut keys={["⌘", "C"]} /> Copy
            </span>
            <span
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <Shortcut keys={["⌘", "V"]} /> Paste
            </span>
            <span
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <Shortcut keys={["⌘", "Z"]} /> Undo
            </span>
          </div>
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Sidebar Component</h2>

      <div style={{ display: "flex", gap: "2rem", marginBottom: "128px" }}>
        <div style={{ height: "600px" }}>
          <Sidebar.Provider>
            <Sidebar.Root>
              <Sidebar.Header>
                <div
                  style={{
                    padding: "var(--spacing-xs)",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Sidebar.Trigger />
                </div>
              </Sidebar.Header>
              <Sidebar.Content>
                <Sidebar.Group>
                  <Sidebar.GroupLabel>Default Items</Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    <Sidebar.Item
                      icon={<CentralIcon name="IconHome" size={20} />}
                      active
                    >
                      Dashboard
                    </Sidebar.Item>
                    <Sidebar.Item
                      icon={<CentralIcon name="IconPeopleCircle" size={20} />}
                      trailing={<Shortcut keys={["⌘", "P"]} />}
                    >
                      Profile
                    </Sidebar.Item>
                    <Sidebar.Item
                      icon={<CentralIcon name="IconSettingsGear1" size={20} />}
                      disabled
                    >
                      Disabled
                    </Sidebar.Item>
                  </Sidebar.Menu>
                </Sidebar.Group>

                <Sidebar.Separator />

                <Sidebar.Group>
                  <Sidebar.GroupLabel>
                    Submenu (Vertical Chevron)
                  </Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    <Sidebar.ExpandableItem
                      icon={
                        <CentralIcon name="IconSquareBehindSquare1" size={20} />
                      }
                      label="Projects"
                      defaultOpen
                    >
                      <Sidebar.SubmenuItem
                        icon={<CentralIcon name="IconFileBend" size={20} />}
                      >
                        Alpha
                      </Sidebar.SubmenuItem>
                      <Sidebar.SubmenuItem
                        icon={<CentralIcon name="IconFileBend" size={20} />}
                        active
                      >
                        Beta
                      </Sidebar.SubmenuItem>
                    </Sidebar.ExpandableItem>
                  </Sidebar.Menu>
                </Sidebar.Group>

                <Sidebar.Separator />

                <Sidebar.Group>
                  <Sidebar.GroupLabel>
                    Tree (Horizontal Chevron)
                  </Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    <Sidebar.TreeItem
                      icon={
                        <CentralIcon name="IconSquareBehindSquare1" size={20} />
                      }
                      label="Files"
                      defaultOpen
                    >
                      <Sidebar.SubmenuItem
                        icon={<CentralIcon name="IconFileBend" size={20} />}
                      >
                        Document
                      </Sidebar.SubmenuItem>
                      <Sidebar.TreeItem
                        icon={
                          <CentralIcon
                            name="IconSquareBehindSquare1"
                            size={20}
                          />
                        }
                        label="Nested"
                      >
                        <Sidebar.SubmenuItem
                          icon={<CentralIcon name="IconFileBend" size={20} />}
                        >
                          Child
                        </Sidebar.SubmenuItem>
                      </Sidebar.TreeItem>
                    </Sidebar.TreeItem>
                  </Sidebar.Menu>
                </Sidebar.Group>

                <Sidebar.Separator />

                <Sidebar.Group>
                  <Sidebar.GroupLabel>Drilldown (Navigate)</Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    <Sidebar.DrilldownItem
                      icon={
                        <CentralIcon name="IconSquareBehindSquare1" size={20} />
                      }
                    >
                      Teams
                    </Sidebar.DrilldownItem>
                    <Sidebar.DrilldownItem
                      icon={<CentralIcon name="IconPeopleCircle" size={20} />}
                    >
                      Members
                    </Sidebar.DrilldownItem>
                  </Sidebar.Menu>
                </Sidebar.Group>
              </Sidebar.Content>
              <Sidebar.Footer>
                <Sidebar.Menu>
                  <Sidebar.Item
                    icon={<CentralIcon name="IconSettingsGear1" size={20} />}
                  >
                    Settings
                  </Sidebar.Item>
                </Sidebar.Menu>
              </Sidebar.Footer>
            </Sidebar.Root>
          </Sidebar.Provider>
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Skeleton Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          marginBottom: "128px",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "14px",
              marginBottom: "0.75rem",
              color: "var(--text-secondary)",
            }}
          >
            Standalone
          </h3>
          <Skeleton style={{ width: 200, height: 20 }} />
        </div>

        <div>
          <h3
            style={{
              fontSize: "14px",
              marginBottom: "0.75rem",
              color: "var(--text-secondary)",
            }}
          >
            Text lines (grouped)
          </h3>
          <Skeleton.Group>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-2xs)",
                maxWidth: 320,
              }}
            >
              <Skeleton style={{ width: "100%", height: 16 }} />
              <Skeleton style={{ width: "100%", height: 16 }} />
              <Skeleton style={{ width: "75%", height: 16 }} />
            </div>
          </Skeleton.Group>
        </div>

        <div>
          <h3
            style={{
              fontSize: "14px",
              marginBottom: "0.75rem",
              color: "var(--text-secondary)",
            }}
          >
            Avatar + name (grouped)
          </h3>
          <Skeleton.Group>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-sm)",
              }}
            >
              <Skeleton
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--corner-radius-round)",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-2xs)",
                }}
              >
                <Skeleton style={{ width: 150, height: 16 }} />
                <Skeleton style={{ width: 100, height: 16 }} />
              </div>
            </div>
          </Skeleton.Group>
        </div>

        <div>
          <h3
            style={{
              fontSize: "14px",
              marginBottom: "0.75rem",
              color: "var(--text-secondary)",
            }}
          >
            Card (grouped)
          </h3>
          <Skeleton.Group>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-sm)",
                width: 300,
                padding: "var(--spacing-md)",
                borderRadius: "var(--corner-radius-md)",
                border: "var(--stroke-xs) solid var(--border-primary)",
              }}
            >
              <Skeleton style={{ width: "100%", aspectRatio: "16 / 9" }} />
              <Skeleton style={{ width: "75%", height: 16 }} />
              <Skeleton style={{ width: "50%", height: 16 }} />
            </div>
          </Skeleton.Group>
        </div>

        <div>
          <h3
            style={{
              fontSize: "14px",
              marginBottom: "0.75rem",
              color: "var(--text-secondary)",
            }}
          >
            Table rows (grouped)
          </h3>
          <Skeleton.Group>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-xs)",
                width: 400,
              }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: "var(--spacing-sm)" }}
                >
                  <Skeleton style={{ flex: 1, height: 16 }} />
                  <Skeleton style={{ width: 80, height: 16 }} />
                  <Skeleton style={{ width: 60, height: 16 }} />
                </div>
              ))}
            </div>
          </Skeleton.Group>
        </div>

        <div>
          <h3
            style={{
              fontSize: "14px",
              marginBottom: "0.75rem",
              color: "var(--text-secondary)",
            }}
          >
            Form (grouped)
          </h3>
          <Skeleton.Group>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-lg)",
                width: 280,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-2xs)",
                }}
              >
                <Skeleton style={{ width: 80, height: 14 }} />
                <Skeleton style={{ width: "100%", height: 36 }} />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-2xs)",
                }}
              >
                <Skeleton style={{ width: 100, height: 14 }} />
                <Skeleton style={{ width: "100%", height: 36 }} />
              </div>
              <Skeleton style={{ width: 80, height: 36 }} />
            </div>
          </Skeleton.Group>
        </div>

        <div>
          <h3
            style={{
              fontSize: "14px",
              marginBottom: "0.75rem",
              color: "var(--text-secondary)",
            }}
          >
            On surface-secondary
          </h3>
          <div
            style={{
              background: "var(--surface-secondary)",
              borderRadius: "var(--corner-radius-md)",
              padding: "var(--spacing-md)",
            }}
          >
            <Skeleton.Group>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-sm)",
                }}
              >
                <Skeleton
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--corner-radius-round)",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-2xs)",
                  }}
                >
                  <Skeleton style={{ width: 150, height: 16 }} />
                  <Skeleton style={{ width: 100, height: 16 }} />
                </div>
              </div>
            </Skeleton.Group>
          </div>
        </div>

        <div>
          <h3
            style={{
              fontSize: "14px",
              marginBottom: "0.75rem",
              color: "var(--text-secondary)",
            }}
          >
            On surface-tertiary
          </h3>
          <div
            style={{
              background: "var(--surface-tertiary)",
              borderRadius: "var(--corner-radius-md)",
              padding: "var(--spacing-md)",
            }}
          >
            <Skeleton.Group>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-sm)",
                }}
              >
                <Skeleton
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--corner-radius-round)",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-2xs)",
                  }}
                >
                  <Skeleton style={{ width: 150, height: 16 }} />
                  <Skeleton style={{ width: 100, height: 16 }} />
                </div>
              </div>
            </Skeleton.Group>
          </div>
        </div>

        <div>
          <h3
            style={{
              fontSize: "14px",
              marginBottom: "0.75rem",
              color: "var(--text-secondary)",
            }}
          >
            On dark surface
          </h3>
          <div
            data-theme="dark"
            style={{
              background: "var(--surface-primary)",
              borderRadius: "var(--corner-radius-md)",
              padding: "var(--spacing-md)",
            }}
          >
            <Skeleton.Group>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-sm)",
                }}
              >
                <Skeleton
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--corner-radius-round)",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-2xs)",
                  }}
                >
                  <Skeleton style={{ width: 150, height: 16 }} />
                  <Skeleton style={{ width: 100, height: 16 }} />
                </div>
              </div>
            </Skeleton.Group>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: "1rem" }}>Switch Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "128px",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>SM Off</span>
          <Switch size="sm" />
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>SM On</span>
          <Switch size="sm" defaultChecked />
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>MD Off</span>
          <Switch size="md" />
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>MD On</span>
          <Switch size="md" defaultChecked />
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>Disabled Off</span>
          <Switch size="md" disabled />
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>Disabled On</span>
          <Switch size="md" disabled defaultChecked />
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ width: "100px", fontSize: "14px" }}>Read Only</span>
          <Switch size="md" readOnly defaultChecked />
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Table Component</h2>

      <TableExamples />
      <div style={{ marginBottom: "128px" }} />

      <h2 style={{ marginBottom: "1rem" }}>Tabs Component</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          marginBottom: "128px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Default Variant
          </span>
          <Tabs.Root defaultValue="account" style={{ maxWidth: "400px" }}>
            <Tabs.List>
              <Tabs.Tab value="account">Account</Tabs.Tab>
              <Tabs.Tab value="password">Password</Tabs.Tab>
              <Tabs.Tab value="settings">Settings</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="account">
              Manage your account settings and preferences.
            </Tabs.Panel>
            <Tabs.Panel value="password">
              Change your password and security options.
            </Tabs.Panel>
            <Tabs.Panel value="settings">
              Configure application settings.
            </Tabs.Panel>
          </Tabs.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Minimal Variant
          </span>
          <Tabs.Root defaultValue="overview" style={{ maxWidth: "400px" }}>
            <Tabs.List variant="minimal">
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="details">Details</Tabs.Tab>
              <Tabs.Tab value="history">History</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="overview">
              Overview content without container background.
            </Tabs.Panel>
            <Tabs.Panel value="details">Details content.</Tabs.Panel>
            <Tabs.Panel value="history">History content.</Tabs.Panel>
          </Tabs.Root>
        </div>

        <div>
          <span
            style={{
              fontSize: "14px",
              color: "#7c7c7c",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            With Disabled Tab
          </span>
          <Tabs.Root defaultValue="active" style={{ maxWidth: "400px" }}>
            <Tabs.List>
              <Tabs.Tab value="active">Active</Tabs.Tab>
              <Tabs.Tab value="disabled" disabled>
                Disabled
              </Tabs.Tab>
              <Tabs.Tab value="another">Another</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="active">This tab is active.</Tabs.Panel>
            <Tabs.Panel value="disabled">
              This panel cannot be accessed.
            </Tabs.Panel>
            <Tabs.Panel value="another">Another tab content.</Tabs.Panel>
          </Tabs.Root>
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Textarea</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: 300,
          marginBottom: "128px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            Default
          </span>
          <Textarea placeholder="Placeholder" />
        </div>
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            Filled
          </span>
          <Textarea defaultValue="Content" />
        </div>
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            Disabled
          </span>
          <Textarea placeholder="Placeholder" disabled />
        </div>
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            Invalid
          </span>
          <Textarea defaultValue="Invalid content" data-invalid="" />
        </div>
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            With Field
          </span>
          <Field.Root>
            <Field.Label>Description</Field.Label>
            <Textarea placeholder="Enter a description..." rows={4} />
            <Field.Description>Provide additional details</Field.Description>
          </Field.Root>
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Textarea Group</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: 400,
          marginBottom: "128px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            Default
          </span>
          <TextareaGroup.Root>
            <TextareaGroup.Textarea placeholder="Write a message..." />
          </TextareaGroup.Root>
        </div>
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            With Header
          </span>
          <TextareaGroup.Root>
            <TextareaGroup.Header>
              <Chip onDismiss={() => {}}>recipient-1</Chip>
              <Chip onDismiss={() => {}}>recipient-2</Chip>
            </TextareaGroup.Header>
            <TextareaGroup.Textarea placeholder="Write a message..." />
          </TextareaGroup.Root>
        </div>
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            Full Composer
          </span>
          <TextareaGroup.Root>
            <TextareaGroup.Header>
              <Chip onDismiss={() => {}}>tag-1</Chip>
              <Chip onDismiss={() => {}}>tag-2</Chip>
            </TextareaGroup.Header>
            <TextareaGroup.Textarea placeholder="Write a message..." />
            <TextareaGroup.Footer>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Chip onDismiss={() => {}}>label</Chip>
              </div>
              <div>
                <Button>Send</Button>
              </div>
            </TextareaGroup.Footer>
          </TextareaGroup.Root>
        </div>
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            With Max Height (200px)
          </span>
          <TextareaGroup.Root maxHeight={200}>
            <TextareaGroup.Textarea
              placeholder="Write a long prompt..."
              defaultValue={"This is a long prompt that grows.\n".repeat(15)}
            />
            <TextareaGroup.Footer>
              <div />
              <div>
                <Button>Send</Button>
              </div>
            </TextareaGroup.Footer>
          </TextareaGroup.Root>
        </div>
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            Disabled
          </span>
          <TextareaGroup.Root disabled>
            <TextareaGroup.Textarea placeholder="Write a message..." />
          </TextareaGroup.Root>
        </div>
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#7c7c7c",
              marginBottom: "4px",
              display: "block",
            }}
          >
            Invalid
          </span>
          <TextareaGroup.Root invalid>
            <TextareaGroup.Textarea defaultValue="Bad content" />
          </TextareaGroup.Root>
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Toast Component</h2>

      <Toast.Provider>
        <ToastDemo />
        <Toast.Portal>
          <Toast.Viewport>
            <ToastRenderer />
          </Toast.Viewport>
        </Toast.Portal>
      </Toast.Provider>

      <div style={{ marginBottom: "128px" }} />
      <h2 style={{ marginBottom: "1rem" }}>Toggle</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-lg)",
          marginBottom: "128px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-xs)",
          }}
        >
          <span className="label-sm" style={{ color: "var(--text-tertiary)" }}>
            Standalone
          </span>
          <div
            style={{
              display: "flex",
              gap: "var(--spacing-xs)",
              alignItems: "center",
            }}
          >
            <Toggle
              aria-label="Favorite"
              render={(props, state) => (
                <button type="button" {...props}>
                  <CentralIcon
                    name={state.pressed ? "IconHeart2Filled" : "IconHeart2"}
                    size={16}
                  />
                  <span style={{ padding: "0 var(--spacing-3xs)" }}>
                    Favorite
                  </span>
                </button>
              )}
            />
            <Toggle
              aria-label="Favorite"
              render={(props, state) => (
                <button type="button" {...props}>
                  <CentralIcon
                    name={state.pressed ? "IconHeart2Filled" : "IconHeart2"}
                    size={16}
                  />
                </button>
              )}
            />
            <Toggle disabled aria-label="Favorite">
              <CentralIcon name="IconHeart2" size={16} />
              <span style={{ padding: "0 var(--spacing-3xs)" }}>Disabled</span>
            </Toggle>
            <Toggle defaultPressed disabled aria-label="Locked on">
              <CentralIcon name="IconHeart2Filled" size={16} />
              <span style={{ padding: "0 var(--spacing-3xs)" }}>Locked</span>
            </Toggle>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-xs)",
          }}
        >
          <span className="label-sm" style={{ color: "var(--text-tertiary)" }}>
            Toggle Group (single select)
          </span>
          <ToggleGroup defaultValue={["left"]} aria-label="Text alignment">
            <Toggle value="left" aria-label="Align left">
              <CentralIcon name="IconLayoutLeft" size={16} />
            </Toggle>
            <Toggle value="center" aria-label="Align center">
              <CentralIcon name="IconLayoutColumn" size={16} />
            </Toggle>
            <Toggle value="right" aria-label="Align right">
              <CentralIcon name="IconLayoutRight" size={16} />
            </Toggle>
          </ToggleGroup>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-xs)",
          }}
        >
          <span className="label-sm" style={{ color: "var(--text-tertiary)" }}>
            Toggle Group (multiple)
          </span>
          <ToggleGroup multiple aria-label="Text formatting">
            <Toggle value="bold" aria-label="Bold">
              <span
                style={{ padding: "0 var(--spacing-3xs)", fontWeight: 700 }}
              >
                B
              </span>
            </Toggle>
            <Toggle value="italic" aria-label="Italic">
              <span
                style={{ padding: "0 var(--spacing-3xs)", fontStyle: "italic" }}
              >
                I
              </span>
            </Toggle>
            <Toggle value="underline" aria-label="Underline">
              <span
                style={{
                  padding: "0 var(--spacing-3xs)",
                  textDecoration: "underline",
                }}
              >
                U
              </span>
            </Toggle>
          </ToggleGroup>
        </div>
      </div>
      <h2 style={{ marginBottom: "1rem" }}>Tooltip Component</h2>

      <Tooltip.Provider>
        <div
          style={{
            display: "flex",
            gap: "2rem",
            marginBottom: "128px",
            alignItems: "center",
          }}
        >
          <Tooltip.Root>
            <Tooltip.Trigger
              render={<Button variant="outline">Hover me</Button>}
            />
            <Tooltip.Portal>
              <Tooltip.Positioner sideOffset={8}>
                <Tooltip.Popup>
                  This is a tooltip
                  <Tooltip.Arrow />
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger
              render={<Button variant="outline">Long text</Button>}
            />
            <Tooltip.Portal>
              <Tooltip.Positioner sideOffset={8}>
                <Tooltip.Popup>
                  This is a longer tooltip that demonstrates text wrapping
                  within the max-width constraint.
                  <Tooltip.Arrow />
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger
              render={
                <button
                  aria-label="Info"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <CentralIcon name="IconCircleInfo" size={20} />
                </button>
              }
            />
            <Tooltip.Portal>
              <Tooltip.Positioner sideOffset={8}>
                <Tooltip.Popup>
                  Icon trigger tooltip
                  <Tooltip.Arrow />
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </Tooltip.Provider>
      <h2 style={{ marginBottom: "1rem" }}>VisuallyHidden</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          marginBottom: "128px",
          width: 320,
        }}
      >
        <Fieldset.Root>
          <Fieldset.Legend visuallyHidden>Transaction limits</Fieldset.Legend>
          <Field.Root name="min">
            <Field.Label>Minimum amount</Field.Label>
            <Input placeholder="1.00" />
          </Field.Root>
          <Field.Root name="max">
            <Field.Label>Maximum amount</Field.Label>
            <Input placeholder="10,000.00" />
          </Field.Root>
        </Fieldset.Root>
        <span className="body-sm" style={{ color: "var(--text-tertiary)" }}>
          The legend above is visually hidden but accessible to screen readers.
          Inspect the fieldset to verify.
        </span>
      </div>
    </main>
  );
}
