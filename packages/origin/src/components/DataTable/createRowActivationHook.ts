"use client";

import * as React from "react";
import type { RowActivationEvent } from "../Table";

export type { RowActivationEvent } from "../Table";

export interface CreateRowActivationHookConfig<TTarget> {
  useNavigateTarget: () => (target: TTarget) => void;
  toHref: (target: TTarget) => string;
}

export interface RowActivation<TTarget> {
  activateRow: (event: RowActivationEvent, target: TTarget) => void;
}

export type RowActivationHook<TTarget> = () => RowActivation<TTarget>;

export function createRowActivationHook<TTarget>(
  config: CreateRowActivationHookConfig<TTarget>,
): RowActivationHook<TTarget> {
  const { useNavigateTarget: useTargetNavigation } = config;

  return function useRowActivation() {
    const navigateTarget = useTargetNavigation();
    const activateRow = React.useCallback(
      (event: RowActivationEvent, target: TTarget) => {
        if (event.metaKey || event.ctrlKey) {
          window.open(config.toHref(target), "_blank", "noopener");
          return;
        }
        navigateTarget(target);
      },
      [navigateTarget],
    );
    return React.useMemo(() => ({ activateRow }), [activateRow]);
  };
}
