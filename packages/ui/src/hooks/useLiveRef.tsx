import type { MutableRefObject, RefCallback } from "react";
import { useCallback, useRef, useState } from "react";

/* For use when you need a rerender when the ref is actually assigned.
   Usually ref assignment does not trigger rerenders. */
export function useLiveRef<T = HTMLElement>(): [
  MutableRefObject<T | null>,
  RefCallback<T>,
] {
  const [ready, setReady] = useState(false);
  const ref = useRef<T | null>(null);
  const refCb = useCallback((node: T | null) => {
    if (node !== null) {
      ref.current = node;
      setReady(true);
    }
  }, []);

  return [ready ? ref : { current: null }, refCb];
}
