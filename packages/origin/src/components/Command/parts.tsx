"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { useRender } from "@base-ui/react/use-render";
import clsx from "clsx";
import { useTrackedOpenChange } from "../Analytics/useTrackedOpenChange";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import { Button } from "../Button";
import { CentralIcon, type CentralIconName } from "../Icon";
import { Loader } from "../Loader";
import { Shortcut } from "../Shortcut";
import styles from "./Command.module.scss";

export interface CommandItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: React.ReactNode;
  keywords?: string[];
  onSelect?: () => void;
  /**
   * Whether selecting this item closes the palette. Set to `false` for
   * drill-in actions.
   * @default true
   */
  closeOnSelect?: boolean;
  disabled?: boolean;
  analyticsName?: string;
}

export interface CommandGroup {
  label: string;
  items: CommandItem[];
}

export type CommandChangeEventDetails = Dialog.Root.ChangeEventDetails;

interface CommandContextValue {
  onSelect: (item: CommandItem) => void;
  renderItem?: ((item: CommandItem) => React.ReactNode) | undefined;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

function useCommandContext() {
  const context = React.useContext(CommandContext);
  if (!context) {
    throw new Error("Command components must be used within Command.Root");
  }
  return context;
}

function filterWithKeywords(
  item: CommandItem | CommandGroup,
  inputValue: string,
): boolean {
  if (!inputValue) return true;

  const query = inputValue.toLowerCase();

  if ("items" in item) {
    return item.items.some((child) => filterWithKeywords(child, inputValue));
  }

  const label = item.label.toLowerCase();

  if (label === query) return true;
  if (label.startsWith(query)) return true;
  if (label.includes(query)) return true;

  if (item.keywords) {
    for (const keyword of item.keywords) {
      if (keyword.toLowerCase().includes(query)) return true;
    }
  }

  let textIndex = 0;
  for (const char of query) {
    const foundIndex = label.indexOf(char, textIndex);
    if (foundIndex === -1) return false;
    textIndex = foundIndex + 1;
  }

  return true;
}

export interface RootProps {
  children?: React.ReactNode;
  items: CommandItem[] | CommandGroup[];
  open?: boolean;
  /**
   * Called when the palette requests an open-state change. Call
   * `eventDetails?.cancel()` to prevent a dismissal; closes triggered by
   * item selection provide no event details.
   */
  onOpenChange?: (
    open: boolean,
    eventDetails?: CommandChangeEventDetails,
  ) => void;
  defaultOpen?: boolean;
  placeholder?: string;
  /**
   * Accessible name for the search input, independent of the visual
   * placeholder copy.
   * @default "Command or search"
   */
  inputAriaLabel?: string;
  filter?: (item: CommandItem | CommandGroup, inputValue: string) => boolean;
  loop?: boolean;
  renderItem?: (item: CommandItem) => React.ReactNode;
  /**
   * Controlled input value. Clear it when opening to avoid changing content
   * during the palette's exit transition.
   */
  inputValue?: string;
  /**
   * Called when the input value changes. When the input is uncontrolled,
   * also called with `""` when reopening resets the query.
   */
  onInputValueChange?: (value: string) => void;
  /** Replaces the list with a loading indicator. */
  loading?: boolean;
  /** Custom loading presentation. Defaults to a centered `Loader`. */
  loadingIndicator?: React.ReactNode;
  /**
   * Empty-state content. Pass `null` to suppress it. The default includes
   * the current query when present.
   */
  empty?: React.ReactNode;
  /**
   * Parent element for the command palette portal. Defaults to `<body>`.
   */
  container?: Dialog.Portal.Props["container"];
  /**
   * Called when the user navigates back. When provided, renders a leading
   * back button in the input row and makes Backspace on an empty input
   * trigger it.
   */
  onBack?: (() => void) | undefined;
  analyticsName?: string;
}

export function Root(props: RootProps) {
  const {
    children,
    items,
    open,
    onOpenChange,
    defaultOpen,
    placeholder = "Run a command or search",
    inputAriaLabel = "Command or search",
    filter = filterWithKeywords,
    loop = true,
    renderItem,
    inputValue,
    onInputValueChange,
    loading = false,
    loadingIndicator,
    empty,
    container,
    onBack,
    analyticsName,
  } = props;
  const trackOpenChange = useTrackedOpenChange<(open: boolean) => void>(
    analyticsName,
    "Command",
    undefined,
  );

  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const isOpen = open !== undefined ? open : internalOpen;

  // Tracking follows the resolved open state rather than the change
  // callback so controlled consumers that flip `open` themselves (e.g.
  // via a hotkey) are covered, and canceled changes (e.g. Escape vetoed
  // to pop a sub-view) are not logged.
  const prevOpenRef = React.useRef(false);
  React.useEffect(() => {
    if (prevOpenRef.current === isOpen) return;
    prevOpenRef.current = isOpen;
    trackOpenChange(isOpen);
  }, [isOpen, trackOpenChange]);

  const [internalInputValue, setInternalInputValue] = React.useState("");

  // The uncontrolled query resets on open, not on close: close-time
  // resets would repaint the popup during its exit transition. Renders
  // of an opening transition derive an already-reset query so the first
  // committed frame paints clean (including a reopen that interrupts an
  // exit), while the layout effect below owns the state update and the
  // listener notification. Nothing is mutated during render, so a render
  // that never commits plans no reset and notifies nobody.
  const committedOpenRef = React.useRef(isOpen);
  const isOpeningUncontrolled =
    inputValue === undefined && isOpen && !committedOpenRef.current;

  React.useLayoutEffect(() => {
    const wasOpen = committedOpenRef.current;
    committedOpenRef.current = isOpen;
    if (
      isOpen &&
      !wasOpen &&
      inputValue === undefined &&
      internalInputValue !== ""
    ) {
      setInternalInputValue("");
      // Listeners mirroring the uncontrolled value (e.g. to drive an
      // async search) hear the programmatic reset exactly once, before
      // paint of the reopened frame.
      onInputValueChange?.("");
    }
  }, [isOpen, inputValue, internalInputValue, onInputValueChange]);

  const query = inputValue ?? (isOpeningUncontrolled ? "" : internalInputValue);

  const handleInputValueChange = React.useCallback(
    (value: string) => {
      if (inputValue === undefined) {
        setInternalInputValue(value);
      }
      onInputValueChange?.(value);
    },
    [inputValue, onInputValueChange],
  );

  const setOpen = React.useCallback(
    (nextOpen: boolean, eventDetails?: CommandChangeEventDetails) => {
      onOpenChange?.(nextOpen, eventDetails);
      if (eventDetails?.isCanceled) return;
      // An accepted close may unmount the palette synchronously in the
      // consumer's handler, before the open-state effect can observe the
      // transition; track it eagerly. The shared ref keeps the effect
      // from logging the same close twice.
      if (!nextOpen && prevOpenRef.current) {
        prevOpenRef.current = false;
        trackOpenChange(false);
      }
      if (open === undefined) {
        setInternalOpen(nextOpen);
      }
    },
    [onOpenChange, open, trackOpenChange],
  );

  const handleSelect = React.useCallback(
    (item: CommandItem) => {
      item.onSelect?.();
      if (item.closeOnSelect !== false) {
        setOpen(false);
      }
    },
    [setOpen],
  );

  const itemToString = React.useCallback(
    (item: CommandItem | CommandGroup | null) => item?.label ?? "",
    [],
  );

  // Freeze the last open view while the mounted popup finishes its exit.
  // An interrupted exit switches back to live state immediately.
  const liveView = {
    items,
    query,
    placeholder,
    inputAriaLabel,
    filter,
    loading,
    loadingIndicator,
    empty,
    onBack,
    renderItem,
    children,
  };
  const lastOpenViewRef = React.useRef<typeof liveView | null>(null);
  React.useEffect(() => {
    if (isOpen) {
      lastOpenViewRef.current = liveView;
    }
  });
  const view = isOpen ? liveView : lastOpenViewRef.current ?? liveView;

  const handleOpenChangeComplete = React.useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      lastOpenViewRef.current = null;
    }
  }, []);

  const isGrouped = view.items.length > 0 && "items" in view.items[0];

  const contextValue = React.useMemo(
    () => ({
      onSelect: handleSelect,
      renderItem: view.renderItem,
    }),
    [handleSelect, view.renderItem],
  );

  const viewOnBack = view.onBack;
  const handleBackspaceOnEmpty = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // During IME composition, Backspace edits the composing text even
      // when the input reports an empty value; never treat it as back.
      if (
        !event.nativeEvent.isComposing &&
        event.key === "Backspace" &&
        event.currentTarget.value === ""
      ) {
        event.preventDefault();
        viewOnBack?.();
      }
    },
    [viewOnBack],
  );

  const input = (
    <Autocomplete.Input
      className={styles.input}
      placeholder={view.placeholder}
      aria-label={view.inputAriaLabel}
      autoFocus
      onKeyDown={view.onBack ? handleBackspaceOnEmpty : undefined}
    />
  );

  return (
    <CommandContext.Provider value={contextValue}>
      <Dialog.Root
        open={isOpen}
        onOpenChange={setOpen}
        onOpenChangeComplete={handleOpenChangeComplete}
      >
        <Dialog.Portal container={container}>
          <Dialog.Backdrop className={styles.backdrop} />
          {/* During the exit transition the popup keeps rendering its
              frozen content but must not react to any interaction —
              including custom controls consumers nest in items or the
              footer. `inert` enforces that once, at the boundary. */}
          <Dialog.Popup className={styles.popup} inert={!isOpen || undefined}>
            <Dialog.Title className={styles.srOnly}>
              Command palette
            </Dialog.Title>
            <Autocomplete.Root
              items={view.items}
              inline
              open
              autoHighlight="always"
              keepHighlight
              loopFocus={loop}
              filter={view.filter}
              itemToStringValue={itemToString}
              value={view.query}
              onValueChange={handleInputValueChange}
            >
              {view.onBack ? (
                <div className={styles.inputRow}>
                  <Button
                    variant="outline"
                    size="compact"
                    iconOnly
                    aria-label="Back"
                    className={styles.backButton}
                    onClick={view.onBack}
                  >
                    <CentralIcon name="IconChevronLeft" size={16} />
                  </Button>
                  {input}
                </div>
              ) : (
                input
              )}

              <div className={styles.list}>
                {/* Live region: stays mounted regardless of the empty
                    policy so screen readers keep announcing it; only its
                    content is conditional. */}
                <Autocomplete.Empty className={styles.empty}>
                  {!view.loading && view.empty !== null ? (
                    <div className={styles.noResults}>
                      {view.empty !== undefined
                        ? view.empty
                        : view.query
                        ? `No results found for "${view.query}"`
                        : "No results."}
                    </div>
                  ) : null}
                </Autocomplete.Empty>
                {view.loading ? (
                  // Presentation only; the persistent status region below
                  // owns the accessible loading announcement.
                  <div className={styles.loading} aria-hidden="true">
                    {view.loadingIndicator ?? <Loader />}
                  </div>
                ) : (
                  <CommandList isGrouped={isGrouped} />
                )}
              </div>

              <Autocomplete.Status className={styles.status}>
                {view.loading ? "Loading" : null}
              </Autocomplete.Status>

              {view.children}
            </Autocomplete.Root>
            {/* Always dismisses the whole palette, even from a drill-in
                sub-view; going back remains a distinct action. */}
            <Dialog.Close className={styles.srOnly}>
              Close command palette
            </Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </CommandContext.Provider>
  );
}

interface CommandListProps {
  isGrouped: boolean;
}

function CommandList({ isGrouped }: CommandListProps) {
  return (
    <Autocomplete.List>
      {isGrouped
        ? (group: CommandGroup) => (
            <Autocomplete.Group key={group.label} items={group.items}>
              <Autocomplete.GroupLabel className={styles.groupHeading}>
                {group.label}
              </Autocomplete.GroupLabel>
              <Autocomplete.Collection>
                {(item: CommandItem) => (
                  <ItemRenderer key={item.id} item={item} />
                )}
              </Autocomplete.Collection>
            </Autocomplete.Group>
          )
        : (item: CommandItem) => <ItemRenderer key={item.id} item={item} />}
    </Autocomplete.List>
  );
}

interface ItemRendererProps {
  item: CommandItem;
}

function ItemRenderer({ item }: ItemRendererProps) {
  const { onSelect, renderItem } = useCommandContext();
  const trackedClick = useTrackedCallback(
    item.analyticsName,
    "Command.Item",
    "select",
    () => onSelect(item),
    () => ({ value: item.id }),
  );

  return (
    <Autocomplete.Item
      value={item}
      disabled={item.disabled}
      className={styles.item}
      onClick={trackedClick}
    >
      {renderItem ? (
        renderItem(item)
      ) : (
        <>
          <span className={styles.itemLeading}>
            {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
            <span className={styles.itemLabel}>{item.label}</span>
          </span>
          {item.shortcut}
        </>
      )}
    </Autocomplete.Item>
  );
}

export interface InputProps extends Autocomplete.Input.Props {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, ...props }, ref) {
    const inputClassName: InputProps["className"] =
      typeof className === "function"
        ? (state) => clsx(styles.input, className(state))
        : clsx(styles.input, className);

    return (
      <Autocomplete.Input ref={ref} className={inputClassName} {...props} />
    );
  },
);

export interface FooterProps extends React.ComponentPropsWithoutRef<"div"> {
  /**
   * Replaces the default `div` element, e.g. with a `footer` landmark.
   * Props are merged per Base UI `useRender` semantics.
   */
  render?: useRender.RenderProp | undefined;
}

interface FooterKeyGlyphProps {
  label: string;
  icon: CentralIconName;
}

function FooterKeyGlyph({ label, icon }: FooterKeyGlyphProps) {
  return (
    <span role="img" aria-label={label} className={styles.footerKeyIcon}>
      <CentralIcon name={icon} size={12} />
    </span>
  );
}

function FooterDefaultHints() {
  return (
    <>
      <span className={styles.footerGroup}>
        <Shortcut
          keys={[
            <FooterKeyGlyph key="up" label="Arrow up" icon="IconArrowUp" />,
            <FooterKeyGlyph
              key="down"
              label="Arrow down"
              icon="IconArrowDown"
            />,
          ]}
        />
        <span>Navigate</span>
      </span>
      <span className={styles.footerHint}>
        <span>Select</span>
        <Shortcut
          keys={[
            <FooterKeyGlyph
              key="enter"
              label="Enter"
              icon="IconArrowCornerDownLeft"
            />,
          ]}
        />
      </span>
    </>
  );
}

/**
 * Renders a hint bar with the default navigation shortcuts when no
 * children are provided. Any children replace the default hints entirely.
 */
export const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  function Footer(props, forwardedRef) {
    const { className, render, children, ...elementProps } = props;

    return useRender({
      defaultTagName: "div",
      render,
      ref: forwardedRef,
      props: {
        ...elementProps,
        className: clsx(styles.footer, className),
        children: children ?? <FooterDefaultHints />,
      },
    });
  },
);

if (process.env.NODE_ENV !== "production") {
  Input.displayName = "Command.Input";
  Footer.displayName = "Command.Footer";
}
