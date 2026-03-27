/**
 * Base UI utilities for custom components.
 *
 * This file contains:
 * 1. Re-exports of Base UI public APIs
 * 2. Copies of internal Base UI utilities (MIT license)
 *
 * Zero drift from Base UI patterns.
 *
 * @baseui-version 1.2.0
 * @synced 2026-02-11
 *
 * To check for updates: npm run check:baseui
 * To sync: Compare files below with node_modules/@base-ui/react/esm/utils/
 *
 * ## Direct imports (always prefer these)
 *
 * ```tsx
 * // From @base-ui/utils
 * import { useControlled } from '@base-ui/utils/useControlled';
 * import { useStableCallback } from '@base-ui/utils/useStableCallback';
 * import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
 * import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
 * import { useId } from '@base-ui/utils/useId';
 * import { visuallyHidden } from '@base-ui/utils/visuallyHidden';
 *
 * // From @base-ui/react
 * import { mergeProps } from '@base-ui/react/merge-props';
 * import { useRender } from '@base-ui/react/use-render';
 * ```
 */

// -----------------------------------------------------------------------------
// Re-exports of Base UI public APIs
// -----------------------------------------------------------------------------

export { mergeProps } from "@base-ui/react/merge-props";
export { useRender } from "@base-ui/react/use-render";

// -----------------------------------------------------------------------------
// Copied from @base-ui/utils/empty
// Source: https://github.com/mui/base-ui
// -----------------------------------------------------------------------------

const EMPTY_OBJECT = Object.freeze({});

function stringifyDataAttributeValue(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (
    typeof value === "number" ||
    typeof value === "bigint" ||
    typeof value === "symbol"
  ) {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  return null;
}

// -----------------------------------------------------------------------------
// Copied from @base-ui/react/esm/utils/getStateAttributesProps.js
// Source: https://github.com/mui/base-ui
// -----------------------------------------------------------------------------

export type StateAttributesMapping<S = Record<string, unknown>> = {
  [K in keyof S]?: (value: S[K]) => Record<string, string> | null;
};

export function getStateAttributesProps<S extends Record<string, unknown>>(
  state: S,
  customMapping?: StateAttributesMapping<S>,
): Record<string, string> {
  const props: Record<string, string> = {};

  for (const key in state) {
    const value = state[key];
    if (customMapping && Object.hasOwn(customMapping, key)) {
      const customProps = customMapping[key]!(value);
      if (customProps != null) {
        Object.assign(props, customProps);
      }
      continue;
    }
    if (value === true) {
      props[`data-${key.toLowerCase()}`] = "";
    } else if (value) {
      const stringValue = stringifyDataAttributeValue(value);
      if (stringValue !== null) {
        props[`data-${key.toLowerCase()}`] = stringValue;
      }
    }
  }
  return props;
}

// -----------------------------------------------------------------------------
// Copied from @base-ui/react/esm/utils/createBaseUIEventDetails.js
// Source: https://github.com/mui/base-ui
// -----------------------------------------------------------------------------

export interface ChangeEventDetails<E = Event> {
  reason: string;
  event: E;
  cancel: () => void;
  allowPropagation: () => void;
  isCanceled: boolean;
  isPropagationAllowed: boolean;
  trigger?: HTMLElement;
}

export function createChangeEventDetails<E = Event>(
  reason: string,
  event?: E,
  trigger?: HTMLElement,
  customProperties?: Record<string, unknown>,
): ChangeEventDetails<E> {
  let canceled = false;
  let allowPropagation = false;
  const custom = customProperties ?? EMPTY_OBJECT;
  const details: ChangeEventDetails<E> = {
    reason,
    event: event ?? (new Event("base-ui") as unknown as E),
    cancel() {
      canceled = true;
    },
    allowPropagation() {
      allowPropagation = true;
    },
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return allowPropagation;
    },
    trigger,
    ...custom,
  };
  return details;
}

export interface GenericEventDetails<E = Event> {
  reason: string;
  event: E;
}

export function createGenericEventDetails<E = Event>(
  reason: string,
  event?: E,
  customProperties?: Record<string, unknown>,
): GenericEventDetails<E> {
  const custom = customProperties ?? EMPTY_OBJECT;
  const details: GenericEventDetails<E> = {
    reason,
    event: event ?? (new Event("base-ui") as unknown as E),
    ...custom,
  };
  return details;
}

// -----------------------------------------------------------------------------
// Copied from @base-ui/react/esm/utils/reason-parts.js
// Source: https://github.com/mui/base-ui
// -----------------------------------------------------------------------------

export const REASONS = {
  none: "none",
  triggerPress: "trigger-press",
  triggerHover: "trigger-hover",
  triggerFocus: "trigger-focus",
  outsidePress: "outside-press",
  itemPress: "item-press",
  closePress: "close-press",
  linkPress: "link-press",
  clearPress: "clear-press",
  chipRemovePress: "chip-remove-press",
  trackPress: "track-press",
  incrementPress: "increment-press",
  decrementPress: "decrement-press",
  inputChange: "input-change",
  inputClear: "input-clear",
  inputBlur: "input-blur",
  inputPaste: "input-paste",
  inputPress: "input-press",
  focusOut: "focus-out",
  escapeKey: "escape-key",
  closeWatcher: "close-watcher",
  listNavigation: "list-navigation",
  keyboard: "keyboard",
  pointer: "pointer",
  drag: "drag",
  wheel: "wheel",
  scrub: "scrub",
  cancelOpen: "cancel-open",
  siblingOpen: "sibling-open",
  disabled: "disabled",
  imperativeAction: "imperative-action",
  swipe: "swipe",
  windowResize: "window-resize",
} as const;

export type Reason = (typeof REASONS)[keyof typeof REASONS];
