"use client";

import * as React from "react";
import clsx from "clsx";
import { filerp } from "./utils";
import { useMergedRef } from "./useMergedRef";
import styles from "./Chart.module.scss";

export interface LiveValueProps extends React.ComponentPropsWithoutRef<"span"> {
  value: number;
  formatValue?: (v: number) => string;
}

const DEFAULT_FORMAT = (v: number) => String(Math.round(v));
const MAX_DELTA_MS = 50;
const LERP_SPEED = 0.08;

export const LiveValue = React.forwardRef<HTMLSpanElement, LiveValueProps>(
  function LiveValue({ value, formatValue, className, ...props }, ref) {
    const spanRef = React.useRef<HTMLSpanElement>(null);
    const displayRef = React.useRef(value);
    const rafRef = React.useRef(0);
    const lastFrameRef = React.useRef(0);
    const valueRef = React.useRef(value);
    const formatRef = React.useRef(formatValue);

    React.useLayoutEffect(() => {
      valueRef.current = value;
      formatRef.current = formatValue;
    }, [value, formatValue]);

    const tick = React.useCallback(() => {
      const now = performance.now();
      const dt = lastFrameRef.current
        ? Math.min(now - lastFrameRef.current, MAX_DELTA_MS)
        : 16.67;
      lastFrameRef.current = now;

      displayRef.current = filerp(
        displayRef.current,
        valueRef.current,
        LERP_SPEED,
        dt,
      );
      if (Math.abs(displayRef.current - valueRef.current) < 0.01) {
        displayRef.current = valueRef.current;
      }

      const el = spanRef.current;
      if (el) {
        const fmt = formatRef.current ?? DEFAULT_FORMAT;
        el.textContent = fmt(displayRef.current);
      }

      if (displayRef.current !== valueRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = 0;
      }
    }, []);

    React.useEffect(() => {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
      };
    }, [tick]);

    React.useEffect(() => {
      if (!rafRef.current && displayRef.current !== value) {
        lastFrameRef.current = 0;
        rafRef.current = requestAnimationFrame(tick);
      }
    }, [value, tick]);

    const mergedRef = useMergedRef(ref, spanRef);

    const fmt = formatValue ?? DEFAULT_FORMAT;

    return (
      <span
        ref={mergedRef}
        className={clsx(styles.liveValue, className)}
        {...props}
      >
        {fmt(value)}
      </span>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  LiveValue.displayName = "Chart.LiveValue";
}
