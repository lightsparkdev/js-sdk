import { pick } from "lodash-es";
import { useCallback, useEffect, useRef, useState } from "react";

type ResizeProperties = {
  width: number;
  height: number;
  bottom: number;
  left: number;
  right: number;
  top: number;
  x: number;
  y: number;
};

/* Returns an updated contentRect object with the selected properties when they change.
   Only select the properties you need to avoid running a function on every change to the rect. */
export function useResizeObserver<K extends keyof ResizeProperties>(
  resizeProperties?: K[] | null | undefined,
) {
  type RectType = { [P in K]: ResizeProperties[P] } | null;
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const [rect, setRect] = useState<RectType>(null);
  const [selectedProperties, setSelectedProperties] = useState<RectType>(null);

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
      /* First observation may occur before mounted effect runs - move to bottom of the stack: */
      setTimeout(() => {
        if (mounted.current) {
          const changedRect = entries[0].contentRect;
          setRect(changedRect);
        } else if (resizeObserver.current) {
          resizeObserver.current.disconnect();
        }
      }, 0);
    },
    [setRect],
  );

  const ref = useCallback(
    (node: unknown) => {
      if (
        node &&
        node instanceof Element &&
        resizeProperties &&
        resizeProperties.length > 0
      ) {
        resizeObserver.current = new ResizeObserver(onResize);
        resizeObserver.current.observe(node);
      }
    },
    [onResize, resizeProperties],
  );

  useEffect(() => {
    if (resizeProperties) {
      const selectedProps = pick(rect, resizeProperties);
      if (
        JSON.stringify(selectedProperties) !== JSON.stringify(selectedProps)
      ) {
        setSelectedProperties(selectedProps as RectType);
      }
    }
  }, [rect, resizeProperties, setSelectedProperties, selectedProperties]);

  return {
    ref,
    rect: selectedProperties,
  } as {
    ref: typeof ref;
    rect: RectType;
  };
}

// const C = useResizeObserver(["height"])["rect"]["width"];
// const B = useResizeObserver(["height"])["rect"]["height"];
// const C = useResizeObserver(["height", "bottom"])["rect"]["bottom"];
