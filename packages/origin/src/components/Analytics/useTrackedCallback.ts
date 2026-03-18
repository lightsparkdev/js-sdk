import * as React from "react";
import { useAnalyticsContext } from "./AnalyticsContext";
import type { InteractionType } from "./AnalyticsContext";

export function useTrackedCallback<Args extends unknown[]>(
  analyticsName: string | undefined,
  component: string,
  interaction: InteractionType,
  callback: ((...args: Args) => void) | undefined,
  getMetadata?: (...args: Args) => Record<string, unknown> | undefined,
): (...args: Args) => void {
  const handler = useAnalyticsContext();

  return React.useCallback(
    (...args: Args) => {
      if (analyticsName && handler) {
        handler.onInteraction({
          name: analyticsName,
          component,
          interaction,
          metadata: getMetadata?.(...args),
        });
      }
      callback?.(...args);
    },
    [analyticsName, handler, component, interaction, callback, getMetadata],
  );
}
