"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Autocomplete } from "@base-ui/react/autocomplete";
import clsx from "clsx";
import { useTrackedOpenChange } from "../Analytics/useTrackedOpenChange";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import styles from "./Command.module.scss";

export interface CommandItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: React.ReactNode;
  keywords?: string[];
  onSelect?: () => void;
  disabled?: boolean;
  analyticsName?: string;
}

export interface CommandGroup {
  label: string;
  items: CommandItem[];
}

interface CommandContextValue {
  onSelect: (item: CommandItem) => void;
  renderItem?: (item: CommandItem) => React.ReactNode;
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
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  placeholder?: string;
  filter?: (item: CommandItem | CommandGroup, inputValue: string) => boolean;
  loop?: boolean;
  renderItem?: (item: CommandItem) => React.ReactNode;
  analyticsName?: string;
}

export function Root(props: RootProps) {
  const {
    children,
    items,
    open,
    onOpenChange,
    defaultOpen,
    placeholder = "Type a command or search...",
    filter = filterWithKeywords,
    loop = true,
    renderItem,
    analyticsName,
  } = props;
  const trackedOpenChange = useTrackedOpenChange(
    analyticsName,
    "Command",
    onOpenChange,
  );

  const handleSelect = React.useCallback(
    (item: CommandItem) => {
      item.onSelect?.();
      trackedOpenChange?.(false);
    },
    [trackedOpenChange],
  );

  const contextValue = React.useMemo(
    () => ({ onSelect: handleSelect, renderItem }),
    [handleSelect, renderItem],
  );

  const itemToString = React.useCallback(
    (item: CommandItem | CommandGroup | null) => {
      if (!item) return "";
      if ("items" in item) return item.label;
      return item.label;
    },
    [],
  );

  const isGrouped = items.length > 0 && "items" in items[0];

  return (
    <CommandContext.Provider value={contextValue}>
      <Dialog.Root
        open={open}
        onOpenChange={trackedOpenChange}
        defaultOpen={defaultOpen}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className={styles.backdrop} />
          <Dialog.Popup className={styles.popup}>
            <Autocomplete.Root
              items={items}
              inline
              open
              autoHighlight="always"
              keepHighlight
              loopFocus={loop}
              filter={filter}
              itemToStringValue={itemToString}
            >
              <div className={styles.inputWrapper}>
                <Autocomplete.Input
                  className={styles.input}
                  placeholder={placeholder}
                  autoFocus
                />
              </div>

              <div className={styles.list}>
                <Autocomplete.Empty className={styles.empty}>
                  No results.
                </Autocomplete.Empty>

                {isGrouped ? (
                  <Autocomplete.List>
                    {(group: CommandGroup) => (
                      <Autocomplete.Group key={group.label} items={group.items}>
                        <Autocomplete.GroupLabel
                          className={styles.groupHeading}
                        >
                          {group.label}
                        </Autocomplete.GroupLabel>
                        <Autocomplete.Collection>
                          {(item: CommandItem) => (
                            <ItemRenderer key={item.id} item={item} />
                          )}
                        </Autocomplete.Collection>
                      </Autocomplete.Group>
                    )}
                  </Autocomplete.List>
                ) : (
                  <Autocomplete.List>
                    {(item: CommandItem) => (
                      <ItemRenderer key={item.id} item={item} />
                    )}
                  </Autocomplete.List>
                )}
              </div>

              {children}
            </Autocomplete.Root>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </CommandContext.Provider>
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

export interface InputProps extends React.ComponentPropsWithoutRef<"input"> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, ...props }, ref) {
    return (
      <div className={styles.inputWrapper}>
        <Autocomplete.Input
          ref={ref}
          className={clsx(styles.input, className)}
          {...props}
        />
      </div>
    );
  },
);

export interface FooterProps extends React.ComponentPropsWithoutRef<"div"> {}

export const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  function Footer({ className, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.footer, className)} {...props} />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Input.displayName = "Command.Input";
  Footer.displayName = "Command.Footer";
}
