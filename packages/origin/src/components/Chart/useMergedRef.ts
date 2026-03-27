import * as React from "react";

export function useMergedRef<T>(
  forwardedRef: React.ForwardedRef<T>,
  localRef: React.MutableRefObject<T | null> | ((node: T | null) => void),
): (node: T | null) => void {
  return React.useCallback(
    (node: T | null) => {
      if (typeof localRef === "function") localRef(node);
      else localRef.current = node;

      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef, localRef],
  );
}
