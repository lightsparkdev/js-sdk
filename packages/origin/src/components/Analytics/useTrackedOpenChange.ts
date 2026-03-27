import * as React from "react";
import { useAnalyticsContext } from "./AnalyticsContext";

export function useTrackedOpenChange<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Cb extends (open: boolean, ...args: any[]) => void,
>(
  analyticsName: string | undefined,
  component: string,
  onOpenChange: Cb | undefined,
): Cb {
  const handler = useAnalyticsContext();
  const openedAtRef = React.useRef<number | null>(null);

  return React.useCallback(
    (open: boolean, ...rest: unknown[]) => {
      if (analyticsName && handler) {
        if (open) {
          openedAtRef.current = Date.now();
          handler.onInteraction({
            name: analyticsName,
            component,
            interaction: "open",
          });
        } else {
          const durationMs =
            openedAtRef.current != null
              ? Date.now() - openedAtRef.current
              : undefined;
          openedAtRef.current = null;
          handler.onInteraction({
            name: analyticsName,
            component,
            interaction: "close",
            metadata:
              durationMs != null ? { duration_ms: durationMs } : undefined,
          });
        }
      }
      onOpenChange?.(open, ...rest);
    },
    [analyticsName, handler, component, onOpenChange],
    // Cast required: useCallback infers (...rest: unknown[]) which can't narrow
    // back to the generic Cb. Type safety is enforced at each call site where Cb
    // is concretely bound to the component's onOpenChange signature.
  ) as unknown as Cb;
}
