import * as React from "react";
import type { CurveInterpolator } from "./utils";
import type { ChartDatum, TooltipMode } from "./types";
import { PAD_RIGHT, TOOLTIP_GAP } from "./types";

export function useResizeWidth(initialWidth?: number) {
  const [measuredWidth, setMeasuredWidth] = React.useState<number | null>(null);
  const observerRef = React.useRef<ResizeObserver | null>(null);

  const attachRef = React.useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (node) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) setMeasuredWidth(entry.contentRect.width);
      });
      observer.observe(node);
      observerRef.current = observer;
      setMeasuredWidth(node.clientWidth);
    }
  }, []);

  React.useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  const width = measuredWidth !== null ? measuredWidth : initialWidth ?? 0;
  return { width, attachRef };
}

export interface ChartInteractionOptions {
  dataLength: number;
  seriesCount: number;
  plotWidth: number;
  padLeft: number;
  tooltipMode: TooltipMode;
  interpolatorsRef: React.RefObject<CurveInterpolator[]>;
  data: ChartDatum[];
  onActiveChange?: (index: number | null, datum: ChartDatum | null) => void;
  onActivate?: (index: number, datum: ChartDatum) => void;
}

export function useChartInteraction(opts: ChartInteractionOptions) {
  const {
    dataLength,
    seriesCount,
    plotWidth,
    padLeft,
    tooltipMode,
    interpolatorsRef,
    data,
    onActiveChange,
    onActivate,
  } = opts;

  const cursorRef = React.useRef<SVGLineElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const dotRefs = React.useRef<(SVGCircleElement | null)[]>([]);
  const clipLeftRef = React.useRef<SVGRectElement>(null);
  const clipRightRef = React.useRef<SVGRectElement>(null);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    dotRefs.current.length = seriesCount;
  }, [seriesCount]);

  React.useEffect(() => {
    setActiveIndex(null);
  }, [data.length]);

  const dataRef = React.useRef(data);
  React.useLayoutEffect(() => {
    dataRef.current = data;
  }, [data]);

  const onActiveChangeRef = React.useRef(onActiveChange);
  React.useLayoutEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  }, [onActiveChange]);

  React.useEffect(() => {
    onActiveChangeRef.current?.(
      activeIndex,
      activeIndex !== null && activeIndex < data.length
        ? data[activeIndex]
        : null,
    );
  }, [activeIndex, data]);

  const updateHover = React.useCallback(
    (clientX: number, svgEl: SVGSVGElement) => {
      if (dataLength === 0 || plotWidth <= 0) return;
      const rect = svgEl.getBoundingClientRect();
      const rawX = clientX - rect.left - padLeft;
      const clampedX = Math.max(0, Math.min(plotWidth, rawX));

      const cursor = cursorRef.current;
      if (cursor) {
        cursor.setAttribute("x1", String(clampedX));
        cursor.setAttribute("x2", String(clampedX));
        cursor.style.display = "";
      }

      const clipL = clipLeftRef.current;
      if (clipL) clipL.setAttribute("width", String(clampedX));
      const clipR = clipRightRef.current;
      if (clipR) {
        clipR.setAttribute("x", String(clampedX));
        clipR.setAttribute("width", String(plotWidth - clampedX + PAD_RIGHT));
      }

      const interps = interpolatorsRef.current;
      dotRefs.current.forEach((dot, i) => {
        const interp = interps?.[i];
        if (dot && interp) {
          const dotY = interp(clampedX);
          dot.setAttribute("cx", String(clampedX));
          dot.setAttribute("cy", String(dotY));
          dot.style.display = "";
        }
      });

      const tip = tooltipRef.current;
      if (tip) {
        const absX = padLeft + clampedX;
        const totalW = padLeft + plotWidth + PAD_RIGHT;
        if (tooltipMode === "compact") {
          tip.style.display = "";
          const tipW = tip.offsetWidth;
          const centered = absX - tipW / 2 + 6;
          const left = Math.max(
            padLeft,
            Math.min(padLeft + plotWidth - tipW, centered),
          );
          tip.style.left = `${left}px`;
          tip.style.transform = "none";
        } else {
          tip.style.display = "";
          const tipW = tip.offsetWidth;
          const fitsRight = absX + TOOLTIP_GAP + tipW <= totalW;
          const fitsLeft = absX - TOOLTIP_GAP - tipW >= 0;
          const preferRight = clampedX <= plotWidth / 2;
          tip.style.left = `${absX}px`;
          if ((preferRight && fitsRight) || !fitsLeft) {
            tip.style.transform = `translateX(${TOOLTIP_GAP}px)`;
          } else {
            tip.style.transform = `translateX(calc(-100% - ${TOOLTIP_GAP}px))`;
          }
        }
      }

      const step = dataLength === 1 ? plotWidth : plotWidth / (dataLength - 1);
      const index = Math.max(
        0,
        Math.min(dataLength - 1, Math.round(rawX / step)),
      );
      setActiveIndex((prev) => (prev === index ? prev : index));
    },
    [dataLength, plotWidth, padLeft, tooltipMode, interpolatorsRef],
  );

  const hideHover = React.useCallback(() => {
    const cursor = cursorRef.current;
    if (cursor) cursor.style.display = "none";
    dotRefs.current.forEach((dot) => {
      if (dot) dot.style.display = "none";
    });
    const tip = tooltipRef.current;
    if (tip) tip.style.display = "none";
    const clipL = clipLeftRef.current;
    if (clipL) clipL.setAttribute("width", String(plotWidth + PAD_RIGHT));
    const clipR = clipRightRef.current;
    if (clipR) {
      clipR.setAttribute("x", String(plotWidth + PAD_RIGHT));
      clipR.setAttribute("width", "0");
    }
    setActiveIndex(null);
  }, [plotWidth]);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<SVGSVGElement>) =>
      updateHover(e.clientX, e.currentTarget),
    [updateHover],
  );

  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (e.touches.length > 0)
        updateHover(e.touches[0].clientX, e.currentTarget);
    },
    [updateHover],
  );

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (e.touches.length > 0)
        updateHover(e.touches[0].clientX, e.currentTarget);
    },
    [updateHover],
  );

  const positionAtIndex = React.useCallback(
    (index: number) => {
      if (dataLength === 0 || plotWidth <= 0) return;
      const step = dataLength === 1 ? plotWidth : plotWidth / (dataLength - 1);
      const x = index * step;

      const cursor = cursorRef.current;
      if (cursor) {
        cursor.setAttribute("x1", String(x));
        cursor.setAttribute("x2", String(x));
        cursor.style.display = "";
      }

      const clipL = clipLeftRef.current;
      if (clipL) clipL.setAttribute("width", String(x));
      const clipR = clipRightRef.current;
      if (clipR) {
        clipR.setAttribute("x", String(x));
        clipR.setAttribute("width", String(plotWidth - x + PAD_RIGHT));
      }

      const interps = interpolatorsRef.current;
      dotRefs.current.forEach((dot, i) => {
        const interp = interps?.[i];
        if (dot && interp) {
          const dotY = interp(x);
          dot.setAttribute("cx", String(x));
          dot.setAttribute("cy", String(dotY));
          dot.style.display = "";
        }
      });

      const tip = tooltipRef.current;
      if (tip) {
        const absX = padLeft + x;
        const totalW = padLeft + plotWidth + PAD_RIGHT;
        if (tooltipMode === "compact") {
          tip.style.display = "";
          const tipW = tip.offsetWidth;
          const centered = absX - tipW / 2 + 6;
          const left = Math.max(
            padLeft,
            Math.min(padLeft + plotWidth - tipW, centered),
          );
          tip.style.left = `${left}px`;
          tip.style.transform = "none";
        } else {
          tip.style.display = "";
          const tipW = tip.offsetWidth;
          const fitsRight = absX + TOOLTIP_GAP + tipW <= totalW;
          const fitsLeft = absX - TOOLTIP_GAP - tipW >= 0;
          const preferRight = x <= plotWidth / 2;
          tip.style.left = `${absX}px`;
          if ((preferRight && fitsRight) || !fitsLeft) {
            tip.style.transform = `translateX(${TOOLTIP_GAP}px)`;
          } else {
            tip.style.transform = `translateX(calc(-100% - ${TOOLTIP_GAP}px))`;
          }
        }
      }
    },
    [dataLength, plotWidth, padLeft, tooltipMode, interpolatorsRef],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<SVGSVGElement>) => {
      if (dataLength === 0) return;
      let next = activeIndex ?? -1;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          next = Math.min(dataLength - 1, next + 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          next = Math.max(0, next - 1);
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = dataLength - 1;
          break;
        case "Enter":
        case " ":
          if (onActivate && activeIndex !== null && activeIndex < dataLength) {
            e.preventDefault();
            onActivate(activeIndex, dataRef.current[activeIndex]);
          }
          return;
        case "Escape":
          hideHover();
          return;
        default:
          return;
      }
      e.preventDefault();
      setActiveIndex(next);
      positionAtIndex(next);
    },
    [dataLength, activeIndex, hideHover, positionAtIndex, onActivate],
  );

  return {
    cursorRef,
    tooltipRef,
    dotRefs,
    clipLeftRef,
    clipRightRef,
    activeIndex,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleKeyDown,
    hideHover,
  };
}
