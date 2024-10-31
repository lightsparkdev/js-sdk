import { useCallback, useMemo, useRef, useState } from "react";

const defaultRef = { current: null };

/* For use when you need a rerender when the ref is actually assigned.
   Usually ref assignment does not trigger rerenders. */
export function useLiveRef<T = HTMLElement>() {
  const [ready, setReady] = useState(false);
  const ref = useRef<T | null>(null);
  const refCb = useCallback((node: T | null) => {
    if (node !== null) {
      ref.current = node;
      setReady(true);
    }
  }, []);

  const value = useMemo(
    () => [ready ? ref : defaultRef, refCb] as const,
    [ready, ref, refCb],
  );

  return value;
}
