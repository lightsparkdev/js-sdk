"use client";

import * as React from "react";
import type { DateRangeEndpoint } from "./datePickerContext";

type CleanupAwareRefCallback<T> = (instance: T | null) => void | (() => void);

function isEnabledCalendarDay(target: EventTarget | null) {
  const button =
    target instanceof Element
      ? target.closest<HTMLButtonElement>("button[data-date-picker-day]")
      : null;
  return button !== null && button.getAttribute("aria-disabled") !== "true";
}

export function useRangeEndpointIntent(
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
  onBlur: React.FocusEventHandler<HTMLDivElement> | undefined,
) {
  const rootElementRef = React.useRef<HTMLDivElement | null>(null);
  const rootRefCleanupRef = React.useRef<(() => void) | undefined>(undefined);
  const endpointIntentRef = React.useRef<DateRangeEndpoint | null>(null);
  const calendarSelectionEndpointRef = React.useRef<DateRangeEndpoint | null>(
    null,
  );
  const deferredInvalidCommitRef = React.useRef<(() => void) | null>(null);
  const hasInternalPointerDownRef = React.useRef(false);

  const setRootRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      const callbackRef: CleanupAwareRefCallback<HTMLDivElement> | null =
        typeof forwardedRef === "function" ? forwardedRef : null;
      const objectRef =
        forwardedRef && typeof forwardedRef !== "function"
          ? forwardedRef
          : null;
      const previousCleanup = rootRefCleanupRef.current;
      if (previousCleanup) {
        previousCleanup();
        if (!element) {
          return;
        }
      }

      rootElementRef.current = element;
      if (!element) {
        callbackRef?.(null);
        if (objectRef) {
          objectRef.current = null;
        }
        return;
      }

      const forwardedRefCleanup = callbackRef?.(element);
      if (objectRef) {
        objectRef.current = element;
      }

      if (typeof forwardedRefCleanup !== "function") {
        return;
      }

      const cleanup = () => {
        rootElementRef.current = null;
        forwardedRefCleanup();

        if (rootRefCleanupRef.current === cleanup) {
          rootRefCleanupRef.current = undefined;
        }
      };
      rootRefCleanupRef.current = cleanup;
      return cleanup;
    },
    [forwardedRef],
  );
  const setRangeEndpointIntent = React.useCallback(
    (endpoint: DateRangeEndpoint) => {
      endpointIntentRef.current = endpoint;
    },
    [],
  );
  const clearRangeEndpointIntent = React.useCallback(() => {
    endpointIntentRef.current = null;
    calendarSelectionEndpointRef.current = null;
    deferredInvalidCommitRef.current = null;
  }, []);
  const consumeRangeEndpointIntent = React.useCallback(() => {
    const endpoint = endpointIntentRef.current;
    endpointIntentRef.current = null;
    calendarSelectionEndpointRef.current = null;
    deferredInvalidCommitRef.current = null;
    return endpoint;
  }, []);
  const deferRangeEndpointInvalidCommit = React.useCallback(
    (endpoint: DateRangeEndpoint, commit: () => void) => {
      if (calendarSelectionEndpointRef.current !== endpoint) {
        return false;
      }
      deferredInvalidCommitRef.current = commit;
      return true;
    },
    [],
  );
  const commitDeferredInvalidInput = React.useCallback(() => {
    const commit = deferredInvalidCommitRef.current;
    deferredInvalidCommitRef.current = null;
    commit?.();
  }, []);
  const handleRootBlur = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const nextTarget = event.relatedTarget;
      const focusLeftRoot =
        nextTarget instanceof Node
          ? !event.currentTarget.contains(nextTarget)
          : !hasInternalPointerDownRef.current;
      if (focusLeftRoot) {
        commitDeferredInvalidInput();
        endpointIntentRef.current = null;
        calendarSelectionEndpointRef.current = null;
      }
      onBlur?.(event);
    },
    [commitDeferredInvalidInput, onBlur],
  );

  React.useEffect(() => {
    let pointerResetTimer: ReturnType<typeof setTimeout> | null = null;

    function clearPointerResetTimer() {
      if (pointerResetTimer !== null) {
        clearTimeout(pointerResetTimer);
        pointerResetTimer = null;
      }
    }

    function handlePointerDown(event: PointerEvent) {
      clearPointerResetTimer();
      commitDeferredInvalidInput();
      const rootElement = rootElementRef.current;
      const target = event.target;
      const startedInside =
        rootElement !== null &&
        target instanceof Node &&
        rootElement.contains(target);
      hasInternalPointerDownRef.current = startedInside;
      calendarSelectionEndpointRef.current =
        startedInside && isEnabledCalendarDay(target)
          ? endpointIntentRef.current
          : null;
      if (!startedInside) {
        endpointIntentRef.current = null;
      }
    }

    function handlePointerUp() {
      clearPointerResetTimer();
      // WebKit can emit focusout(null) after pointerup but before click.
      // Keep the internal handoff through the remainder of that event turn.
      pointerResetTimer = setTimeout(() => {
        hasInternalPointerDownRef.current = false;
        commitDeferredInvalidInput();
        calendarSelectionEndpointRef.current = null;
        pointerResetTimer = null;
      }, 0);
    }

    function handlePointerCancel() {
      clearPointerResetTimer();
      hasInternalPointerDownRef.current = false;
      commitDeferredInvalidInput();
      calendarSelectionEndpointRef.current = null;
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("pointerup", handlePointerUp, true);
    document.addEventListener("pointercancel", handlePointerCancel, true);
    return () => {
      clearPointerResetTimer();
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("pointerup", handlePointerUp, true);
      document.removeEventListener("pointercancel", handlePointerCancel, true);
    };
  }, [commitDeferredInvalidInput]);

  return {
    clearRangeEndpointIntent,
    consumeRangeEndpointIntent,
    deferRangeEndpointInvalidCommit,
    handleRootBlur,
    setRangeEndpointIntent,
    setRootRef,
  };
}
