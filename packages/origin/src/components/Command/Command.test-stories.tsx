"use client";

import * as React from "react";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { Command, type CommandItem, type CommandGroup } from "./index";
import { AnalyticsProvider, type InteractionInfo } from "../Analytics";
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

// Controlled command with analytics: the external toggle mimics a consumer
// hotkey flipping `open` without going through the palette's own handlers
export function ControlledCommandWithAnalytics() {
  const [events, setEvents] = React.useState<InteractionInfo[]>([]);
  const [open, setOpen] = React.useState(false);
  const handler = React.useMemo(
    () => ({
      onInteraction: (info: InteractionInfo) =>
        setEvents((prev) => [...prev, info]),
    }),
    [],
  );

  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <AnalyticsProvider value={handler}>
      <button onClick={() => setOpen((prev) => !prev)}>Toggle</button>
      <Command.Root
        analyticsName="test_palette"
        items={items}
        open={open}
        onOpenChange={setOpen}
      />
      <pre data-testid="analytics-log">{JSON.stringify(events)}</pre>
    </AnalyticsProvider>
  );
}

// Slowed exit with a select counter and analytics log so tests can prove
// frozen items are inert: further activation during the exit must not
// re-fire callbacks or analytics.
export function FrozenExitSelectionCommand() {
  const [events, setEvents] = React.useState<InteractionInfo[]>([]);
  const [selectCount, setSelectCount] = React.useState(0);
  const handler = React.useMemo(
    () => ({
      onInteraction: (info: InteractionInfo) =>
        setEvents((prev) => [...prev, info]),
    }),
    [],
  );

  const items: CommandItem[] = [
    {
      id: "copy",
      label: "Copy",
      analyticsName: "copy",
      onSelect: () => setSelectCount((count) => count + 1),
    },
    { id: "paste", label: "Paste", analyticsName: "paste" },
  ];

  return (
    <AnalyticsProvider value={handler}>
      <style>{`[role="dialog"] { transition-duration: 1500ms !important; }`}</style>
      <Command.Root analyticsName="test_palette" items={items} defaultOpen />
      <div data-testid="select-count">{selectCount}</div>
      <div data-testid="select-event-count">
        {events.filter((event) => event.interaction === "select").length}
      </div>
    </AnalyticsProvider>
  );
}

// Slowed exit transition so tests can observe popup content mid-exit
export function SlowExitCommand() {
  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <>
      <style>{`[role="dialog"] { transition-duration: 1500ms !important; }`}</style>
      <Command.Root items={items} defaultOpen />
    </>
  );
}

// Custom interactive controls nested in renderItem and the footer, with
// a slowed exit. Once a close starts, none of them may fire.
export function CustomControlsExitCommand() {
  const [open, setOpen] = React.useState(true);
  const [itemActionCount, setItemActionCount] = React.useState(0);
  const [footerActionCount, setFooterActionCount] = React.useState(0);

  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <>
      <style>{`[role="dialog"] { transition-duration: 1500ms !important; }`}</style>
      <button onClick={() => setOpen(true)}>Open Command</button>
      <Command.Root
        items={items}
        open={open}
        onOpenChange={setOpen}
        renderItem={(item) => (
          <>
            <span>{item.label}</span>
            <button
              onClick={(event) => {
                event.stopPropagation();
                setItemActionCount((count) => count + 1);
              }}
            >
              Pin {item.label}
            </button>
          </>
        )}
      >
        <Command.Footer>
          <button onClick={() => setFooterActionCount((count) => count + 1)}>
            Footer action
          </button>
        </Command.Footer>
      </Command.Root>
      <div data-testid="item-action-count">{itemActionCount}</div>
      <div data-testid="footer-action-count">{footerActionCount}</div>
    </>
  );
}

// Uncontrolled input with an onInputValueChange listener, mimicking a
// consumer that mirrors the query to drive an async search.
export function UncontrolledInputListenerCommand() {
  const [open, setOpen] = React.useState(true);
  const [log, setLog] = React.useState<string[]>([]);

  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Command</button>
      <Command.Root
        items={items}
        open={open}
        onOpenChange={setOpen}
        onInputValueChange={(value) => setLog((prev) => [...prev, value])}
      />
      <pre data-testid="input-log">{JSON.stringify(log)}</pre>
    </>
  );
}

const NEVER_RESOLVES = new Promise<void>(() => {});

declare global {
  interface Window {
    __suspendedRenders?: number;
  }
}

// Counts render attempts so tests can wait until the abandoned render
// pass has actually executed before committing a different state.
function SuspendWhile({ blocked }: { blocked: boolean }) {
  if (blocked) {
    window.__suspendedRenders = (window.__suspendedRenders ?? 0) + 1;
    throw NEVER_RESOLVES;
  }
  return null;
}

// Starts a reopen inside a transition that suspends and never commits,
// then commits a closed state instead. A reset planned during the
// abandoned render must not leak a notification into the closed commit.
export function AbandonedReopenCommand() {
  const [open, setOpen] = React.useState(true);
  const [blocked, setBlocked] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);
  const [log, setLog] = React.useState<string[]>([]);

  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <React.Suspense fallback={null}>
      <button
        onClick={() =>
          React.startTransition(() => {
            setOpen(true);
            setBlocked(true);
          })
        }
      >
        Attempt reopen
      </button>
      <button
        onClick={() => {
          setBlocked(false);
          setOpen(false);
          setAttempts((count) => count + 1);
        }}
      >
        Abandon reopen
      </button>
      <button onClick={() => setOpen(true)}>Reopen</button>
      <Command.Root
        items={items}
        open={open}
        onOpenChange={setOpen}
        onInputValueChange={(value) => setLog((prev) => [...prev, value])}
      />
      <SuspendWhile blocked={blocked} />
      <pre data-testid="input-log">{JSON.stringify(log)}</pre>
      <div data-testid="attempts">{attempts}</div>
    </React.Suspense>
  );
}

// Controlled open, uncontrolled input, slowed transitions. Closing
// schedules a reopen that interrupts the exit, so the popup never
// unmounts between sessions.
export function UncontrolledInputReopenCommand({
  reopenDelayMs = 300,
}: {
  reopenDelayMs?: number;
}) {
  const [open, setOpen] = React.useState(true);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTimeout(() => setOpen(true), reopenDelayMs);
    }
  };

  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <>
      <style>{`[role="dialog"] { transition-duration: 1500ms !important; }`}</style>
      <Command.Root items={items} open={open} onOpenChange={handleOpenChange} />
    </>
  );
}

// Mimics a product screen registering a contextual action while mounted
// (effect-timed, like real registration channels).
function ScreenWithContextualAction({
  onRegistered,
}: {
  onRegistered: (registered: boolean) => void;
}) {
  React.useEffect(() => {
    onRegistered(true);
    return () => onRegistered(false);
  }, [onRegistered]);
  return null;
}

// Selecting the nav item unmounts the registering screen, so the
// contextual row leaves the live item set one commit after the close.
// With reopenDelayMs set, closing schedules a reopen that interrupts
// the (slowed) exit transition.
export function ExitFreezeCommand({
  reopenDelayMs = 0,
}: {
  reopenDelayMs?: number;
}) {
  const [open, setOpen] = React.useState(true);
  const [screen, setScreen] = React.useState<"a" | "b">("a");
  const [hasContextualAction, setHasContextualAction] = React.useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && reopenDelayMs > 0) {
      setTimeout(() => setOpen(true), reopenDelayMs);
    }
  };

  const items: CommandItem[] = [
    ...(hasContextualAction
      ? [{ id: "filter", label: "Filter...", closeOnSelect: false }]
      : []),
    {
      id: "nav-customers",
      label: "Go to customers",
      onSelect: () => setScreen("b"),
    },
    { id: "nav-transactions", label: "Go to transactions" },
  ];

  return (
    <>
      <style>{`[role="dialog"] { transition-duration: 1500ms !important; }`}</style>
      {screen === "a" && (
        <ScreenWithContextualAction onRegistered={setHasContextualAction} />
      )}
      <Command.Root items={items} open={open} onOpenChange={handleOpenChange} />
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

// Controlled command with plain items — closing on select relies entirely on
// Command.Root calling onOpenChange(false)
export function ControlledCommandDefaultClose() {
  const [open, setOpen] = React.useState(true);

  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
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

  return <Command.Root items={groups} defaultOpen />;
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
      <Command.Footer />
    </Command.Root>
  );
}

// Footer without children renders the default hint bar
export function CommandWithDefaultFooter() {
  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <Command.Root items={items} defaultOpen>
      <Command.Footer />
    </Command.Root>
  );
}

// Footer with custom children replaces the default hint bar
export function CommandWithCustomFooterContent() {
  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <Command.Root items={items} defaultOpen>
      <Command.Footer>
        <span>Custom footer content</span>
      </Command.Footer>
    </Command.Root>
  );
}

// Drill-in sub-view via closeOnSelect: false and controlled input value
export function CommandWithSubViewDrillIn() {
  const [open, setOpen] = React.useState(true);
  const [view, setView] = React.useState<"root" | "filters">("root");
  const [inputValue, setInputValue] = React.useState("");

  const rootItems: CommandItem[] = [
    {
      id: "filter",
      label: "Filter...",
      closeOnSelect: false,
      onSelect: () => {
        setView("filters");
        setInputValue("");
      },
    },
    { id: "home", label: "Go home" },
  ];

  const filterItems: CommandItem[] = [
    { id: "status", label: "Status" },
    { id: "currency", label: "Currency" },
  ];

  return (
    <div>
      <Command.Root
        items={view === "root" ? rootItems : filterItems}
        open={open}
        onOpenChange={setOpen}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        placeholder={
          view === "root" ? "Run a command or search" : "Filter by..."
        }
      />
      <div data-testid="view">{view}</div>
      <div data-testid="input-value">{inputValue}</div>
    </div>
  );
}

// Escape pops back out of a sub-view via eventDetails.cancel(); a second
// Escape at the root level closes the palette.
export function CommandEscapePopsSubView() {
  const [open, setOpen] = React.useState(true);
  const [view, setView] = React.useState<"root" | "filters">("root");
  const [inputValue, setInputValue] = React.useState("");
  const [events, setEvents] = React.useState<InteractionInfo[]>([]);
  const handler = React.useMemo(
    () => ({
      onInteraction: (info: InteractionInfo) =>
        setEvents((prev) => [...prev, info]),
    }),
    [],
  );

  const rootItems: CommandItem[] = [
    {
      id: "filter",
      label: "Filter...",
      closeOnSelect: false,
      onSelect: () => {
        setView("filters");
        setInputValue("");
      },
    },
    { id: "home", label: "Go home" },
  ];

  const filterItems: CommandItem[] = [
    { id: "status", label: "Status" },
    { id: "currency", label: "Currency" },
  ];

  return (
    <AnalyticsProvider value={handler}>
      <Command.Root
        analyticsName="test_palette"
        items={view === "root" ? rootItems : filterItems}
        open={open}
        onOpenChange={(nextOpen, eventDetails) => {
          if (
            !nextOpen &&
            eventDetails?.reason === "escape-key" &&
            view !== "root"
          ) {
            eventDetails.cancel();
            setView("root");
            setInputValue("");
            return;
          }
          setOpen(nextOpen);
        }}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
      />
      <div data-testid="view">{view}</div>
      <div data-testid="open">{String(open)}</div>
      <pre data-testid="analytics-log">{JSON.stringify(events)}</pre>
    </AnalyticsProvider>
  );
}

// A controlled consumer that unmounts the palette synchronously inside
// its accepted close handler; the close must still be tracked.
export function UnmountOnCloseAnalyticsCommand() {
  const [events, setEvents] = React.useState<InteractionInfo[]>([]);
  const [mounted, setMounted] = React.useState(false);
  const handler = React.useMemo(
    () => ({
      onInteraction: (info: InteractionInfo) =>
        setEvents((prev) => [...prev, info]),
    }),
    [],
  );

  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <AnalyticsProvider value={handler}>
      <button onClick={() => setMounted(true)}>Open Command</button>
      {mounted && (
        <Command.Root
          analyticsName="test_palette"
          items={items}
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setMounted(false);
            }
          }}
        />
      )}
      <pre data-testid="analytics-log">{JSON.stringify(events)}</pre>
    </AnalyticsProvider>
  );
}

// Back affordance: leading button plus Backspace on an empty input
export function CommandWithBackButton() {
  const [backCount, setBackCount] = React.useState(0);
  const items: CommandItem[] = [
    { id: "status", label: "Status" },
    { id: "currency", label: "Currency" },
  ];

  return (
    <div>
      <Command.Root
        items={items}
        defaultOpen
        onBack={() => setBackCount((count) => count + 1)}
      />
      <div data-testid="back-count">{backCount}</div>
    </div>
  );
}

// Slowed exit where closing also drops onBack, mimicking a consumer
// resetting its drill-in state around a close.
export function FrozenExitBackCommand() {
  const [open, setOpen] = React.useState(true);
  const [drilled, setDrilled] = React.useState(true);
  const [backCount, setBackCount] = React.useState(0);
  const items: CommandItem[] = [
    { id: "status", label: "Status" },
    { id: "currency", label: "Currency" },
  ];

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setDrilled(false);
    }
  };

  return (
    <div>
      <style>{`[role="dialog"] { transition-duration: 1500ms !important; }`}</style>
      <Command.Root
        items={items}
        open={open}
        onOpenChange={handleOpenChange}
        onBack={drilled ? () => setBackCount((count) => count + 1) : undefined}
      />
      <div data-testid="back-count">{backCount}</div>
    </div>
  );
}

// No items and no query: the default empty state falls back to plain copy
export function EmptyItemsCommand() {
  return <Command.Root items={[]} defaultOpen />;
}

// Loading state with the default indicator
export function LoadingCommand() {
  return <Command.Root items={[]} defaultOpen loading />;
}

// Loading that can be finished, to observe the persistent status region
// across the async transition
export function LoadingToggleCommand() {
  const [loading, setLoading] = React.useState(true);
  // The toggle lives in the footer because the modal palette makes
  // outside content inert while open.
  return (
    <Command.Root items={[]} defaultOpen loading={loading}>
      <Command.Footer>
        <button onClick={() => setLoading(false)}>Finish loading</button>
      </Command.Footer>
    </Command.Root>
  );
}

// Loading state with a custom indicator
export function LoadingCommandWithCustomIndicator() {
  return (
    <Command.Root
      items={[]}
      defaultOpen
      loading
      loadingIndicator={<span>Searching records...</span>}
    />
  );
}

// Long instructional placeholder paired with a concise accessible name
export function CommandWithCustomInputLabel() {
  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <Command.Root
      items={items}
      defaultOpen
      placeholder="Type to search across commands, settings, and documentation"
      inputAriaLabel="Search commands"
    />
  );
}

// Placeholder removed entirely; the input must keep an accessible name
export function CommandWithEmptyPlaceholder() {
  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return <Command.Root items={items} defaultOpen placeholder="" />;
}

// Custom empty-state content
export function CommandWithCustomEmpty() {
  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <Command.Root
      items={items}
      defaultOpen
      empty={<span>Nothing matched your search</span>}
    />
  );
}

// Explicit null empty prop suppresses the empty state
export function CommandWithNullEmpty() {
  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return <Command.Root items={items} defaultOpen empty={null} />;
}

// Portal rendered into a custom container element
export function CommandWithCustomContainer() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <div>
      <div data-testid="portal-container" ref={containerRef} />
      <Command.Root items={items} defaultOpen container={containerRef} />
    </div>
  );
}

// Footer rendered as a custom element via the render prop
export function CommandWithFooterRender() {
  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <Command.Root items={items} defaultOpen>
      <Command.Footer render={<footer data-testid="custom-footer" />}>
        <span>Footer content</span>
      </Command.Footer>
    </Command.Root>
  );
}

export function CommandOverStickyContent() {
  const items: CommandItem[] = [
    { id: "1", label: "Copy" },
    { id: "2", label: "Paste" },
  ];

  return (
    <div>
      <div
        data-testid="sticky-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          height: 300,
          background: "rebeccapurple",
        }}
      />
      <Command.Root items={items} defaultOpen />
    </div>
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

// The exported input forwards Base UI state to functional classNames
// while keeping the base class applied.
export function FunctionalClassNameInput() {
  return (
    <Autocomplete.Root items={["Copy", "Paste"]} inline open>
      <Command.Input
        placeholder="Custom input"
        className={(state) => (state.disabled ? "is-disabled" : "is-enabled")}
      />
    </Autocomplete.Root>
  );
}
