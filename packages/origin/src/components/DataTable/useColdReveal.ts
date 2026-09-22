"use client";

import * as React from "react";

interface ColdRevealInput {
  coldLoading: boolean;
  loading: boolean;
  hasRows: boolean;
}

export function useColdReveal({
  coldLoading,
  loading,
  hasRows,
}: ColdRevealInput) {
  const revealConsumedRef = React.useRef(!coldLoading);
  const tableRef = React.useRef<HTMLTableElement>(null);
  const [coldReveal, setColdReveal] = React.useState(false);

  React.useLayoutEffect(() => {
    if (revealConsumedRef.current || coldLoading || (loading && !hasRows)) {
      return;
    }
    revealConsumedRef.current = true;
    if (
      hasRows &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setColdReveal(true);
    }
  }, [coldLoading, hasRows, loading]);

  const handleAnimationComplete = React.useCallback((event: Event) => {
    if (event.target === event.currentTarget) {
      setColdReveal(false);
    }
  }, []);

  React.useLayoutEffect(() => {
    const tableElement = tableRef.current;
    if (!tableElement) {
      return;
    }
    tableElement.addEventListener("animationend", handleAnimationComplete);
    tableElement.addEventListener("animationcancel", handleAnimationComplete);
    return () => {
      tableElement.removeEventListener("animationend", handleAnimationComplete);
      tableElement.removeEventListener(
        "animationcancel",
        handleAnimationComplete,
      );
    };
  }, [handleAnimationComplete]);

  return { coldReveal, tableRef };
}
