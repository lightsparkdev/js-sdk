"use client";

import * as React from "react";
import clsx from "clsx";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import { useResizeWidth } from "./hooks";
import { useMergedRef } from "./useMergedRef";
import {
  type SankeyData,
  type LayoutNode,
  type LayoutLink,
  computeSankeyLayout,
  sankeyLinkPath,
} from "./sankeyLayout";
import { SERIES_COLORS } from "./types";
import { ChartWrapper } from "./ChartWrapper";
import { measureLabelWidth } from "./utils";
import styles from "./Chart.module.scss";

export type { SankeyData, LayoutNode, LayoutLink } from "./sankeyLayout";
export type { SankeyNode, SankeyLink } from "./sankeyLayout";

export interface SankeyChartProps
  extends React.ComponentPropsWithoutRef<"div"> {
  data: SankeyData;
  /**
   * Pre-measurement width in pixels. Used as a fallback before
   * ResizeObserver fires, enabling server-side rendering.
   */
  initialWidth?: number;
  nodeWidth?: number;
  nodePadding?: number;
  height?: number;
  animate?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  stages?: string[];
  loading?: boolean;
  empty?: React.ReactNode;
  ariaLabel?: string;
  formatValue?: (value: number) => string;
  tooltip?: boolean;
  onClickNode?: (node: LayoutNode) => void;
  onClickLink?: (link: LayoutLink) => void;
  analyticsName?: string;
}

type ActiveElement =
  | { type: "node"; id: string }
  | { type: "link"; sourceId: string; targetId: string }
  | null;

const LABEL_GAP = 8;
const STAGE_HEIGHT = 16;
const STAGE_GAP = 20;
const PAD_BOTTOM = 8;
const LINK_OPACITY = 0.5;
const LINK_OPACITY_DIM = 0.06;
const NODE_OPACITY_DIM = 0.15;

const sankeyNodeClickMeta = (node: LayoutNode) => ({ id: node.id });
const sankeyLinkClickMeta = (link: LayoutLink) => ({
  source: link.source,
  target: link.target,
});

export const Sankey = React.forwardRef<HTMLDivElement, SankeyChartProps>(
  function Sankey(
    {
      data,
      nodeWidth = 8,
      nodePadding = 12,
      height = 350,
      animate = true,
      showLabels = true,
      showValues = false,
      stages,
      tooltip = true,
      loading,
      empty,
      ariaLabel,
      formatValue,
      onClickNode,
      onClickLink,
      analyticsName,
      initialWidth,
      className,
      ...props
    },
    ref,
  ) {
    const trackedClickNode = useTrackedCallback(
      analyticsName,
      "Chart.Sankey",
      "click",
      onClickNode,
      onClickNode ? sankeyNodeClickMeta : undefined,
    );
    const trackedClickLink = useTrackedCallback(
      analyticsName,
      "Chart.Sankey",
      "click",
      onClickLink,
      onClickLink ? sankeyLinkClickMeta : undefined,
    );

    const { width, attachRef } = useResizeWidth(initialWidth);
    const [active, setActive] = React.useState<ActiveElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const rootRef = React.useRef<HTMLDivElement | null>(null);

    const resizeRef = useMergedRef(ref, attachRef);
    const mergedRef = useMergedRef(resizeRef, rootRef);

    const hasStages = stages !== undefined && stages.length > 0;

    const fmtValue = React.useCallback(
      (v: number) => (formatValue ? formatValue(v) : String(v)),
      [formatValue],
    );

    const labelPad = React.useMemo(() => {
      if (!showLabels) return { left: 0, right: 0, visible: false };
      const sourceIds = new Set<string>();
      const targetIds = new Set<string>();
      for (const link of data.links) {
        targetIds.add(link.target);
        sourceIds.add(link.source);
      }
      const leftNodes = data.nodes.filter((n) => !targetIds.has(n.id));
      const rightNodes = data.nodes.filter((n) => !sourceIds.has(n.id));

      const left =
        leftNodes.length > 0
          ? Math.ceil(
              Math.max(...leftNodes.map((n) => measureLabelWidth(n.label))),
            ) + LABEL_GAP
          : 0;

      let right = 0;
      if (rightNodes.length > 0) {
        const nodeValues = new Map<string, number>();
        for (const node of data.nodes) {
          const sumIn = data.links
            .filter((l) => l.target === node.id)
            .reduce((s, l) => s + l.value, 0);
          const sumOut = data.links
            .filter((l) => l.source === node.id)
            .reduce((s, l) => s + l.value, 0);
          nodeValues.set(node.id, Math.max(sumIn, sumOut));
        }
        right =
          Math.ceil(
            Math.max(
              ...rightNodes.map((n) => {
                const base = measureLabelWidth(n.label);
                if (!showValues) return base;
                const val = nodeValues.get(n.id) ?? 0;
                return base + measureLabelWidth(`  ${fmtValue(val)}`);
              }),
            ),
          ) + LABEL_GAP;
      }

      if (width > 0 && left + right > width * 0.4) {
        return { left: 0, right: 0, visible: false };
      }

      return { left, right, visible: true };
    }, [data.nodes, data.links, showLabels, showValues, fmtValue, width]);

    const padTop = hasStages ? STAGE_HEIGHT + STAGE_GAP : 8;

    const layout = React.useMemo(() => {
      const plotWidth = width - labelPad.left - labelPad.right;
      const plotHeight = height - padTop - PAD_BOTTOM;
      if (plotWidth <= 0 || plotHeight <= 0) return null;
      return computeSankeyLayout(
        data,
        plotWidth,
        plotHeight,
        nodeWidth,
        nodePadding,
      );
    }, [data, width, height, nodeWidth, nodePadding, labelPad, padTop]);

    const maxColumn = React.useMemo(
      () => (layout ? Math.max(...layout.nodes.map((n) => n.column), 0) : 0),
      [layout],
    );

    const nodesByColumn = React.useMemo(() => {
      if (!layout) return new Map<number, LayoutNode[]>();
      const map = new Map<number, LayoutNode[]>();
      for (const node of layout.nodes) {
        if (!map.has(node.column)) map.set(node.column, []);
        map.get(node.column)!.push(node);
      }
      for (const col of map.values()) {
        col.sort((a, b) => a.y0 - b.y0);
      }
      return map;
    }, [layout]);

    const isNodeConnected = React.useCallback(
      (node: LayoutNode): boolean => {
        if (!active) return true;
        if (active.type === "node") {
          if (node.id === active.id) return true;
          return (
            node.sourceLinks.some((l) => l.target === active.id) ||
            node.targetLinks.some((l) => l.source === active.id)
          );
        }
        return node.id === active.sourceId || node.id === active.targetId;
      },
      [active],
    );

    const isLinkConnected = React.useCallback(
      (link: LayoutLink): boolean => {
        if (!active) return true;
        if (active.type === "link") {
          return (
            link.source === active.sourceId && link.target === active.targetId
          );
        }
        return link.source === active.id || link.target === active.id;
      },
      [active],
    );

    const handleMouseLeave = React.useCallback(() => {
      setActive(null);
      const tip = tooltipRef.current;
      if (tip) tip.style.display = "none";
    }, []);

    const positionTooltip = React.useCallback(
      (e: React.MouseEvent) => {
        const tip = tooltipRef.current;
        const root = rootRef.current;
        if (!tip || !root) return;
        const rect = root.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        tip.style.display = "";
        const tipW = tip.offsetWidth;
        const gap = 12;
        const fitsRight = x + gap + tipW <= width;
        const fitsLeft = x - gap - tipW >= 0;
        const preferRight = x <= width / 2;
        tip.style.left = `${x}px`;
        tip.style.top = `${y}px`;
        if ((preferRight && fitsRight) || !fitsLeft) {
          tip.style.transform = `translate(${gap}px, -50%)`;
        } else {
          tip.style.transform = `translate(calc(-100% - ${gap}px), -50%)`;
        }
      },
      [width],
    );

    const tooltipContent = React.useMemo(() => {
      if (!active || !layout) return null;
      if (active.type === "node") {
        const node = layout.nodes.find((n) => n.id === active.id);
        if (!node) return null;
        return { label: node.label, value: fmtValue(node.value) };
      }
      const link = layout.links.find(
        (l) => l.source === active.sourceId && l.target === active.targetId,
      );
      if (!link) return null;
      return {
        label: `${link.sourceNode.label} \u2192 ${link.targetNode.label}`,
        value: fmtValue(link.value),
      };
    }, [active, layout, fmtValue]);

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (!layout || layout.nodes.length === 0) return;

        const activeNode =
          active?.type === "node"
            ? layout.nodes.find((n) => n.id === active.id)
            : null;

        let nextNode: LayoutNode | undefined;

        if (!activeNode) {
          nextNode = nodesByColumn.get(0)?.[0];
        } else {
          const col = nodesByColumn.get(activeNode.column) ?? [];
          const idx = col.findIndex((n) => n.id === activeNode.id);

          switch (e.key) {
            case "ArrowDown":
              nextNode = col[Math.min(col.length - 1, idx + 1)];
              break;
            case "ArrowUp":
              nextNode = col[Math.max(0, idx - 1)];
              break;
            case "ArrowRight": {
              const next = nodesByColumn.get(activeNode.column + 1);
              nextNode = next?.[0];
              break;
            }
            case "ArrowLeft": {
              const prev = nodesByColumn.get(activeNode.column - 1);
              nextNode = prev?.[0];
              break;
            }
            case "Home":
              nextNode = nodesByColumn.get(0)?.[0];
              break;
            case "End": {
              const lastCol = nodesByColumn.get(maxColumn) ?? [];
              nextNode = lastCol[lastCol.length - 1];
              break;
            }
            case "Enter":
            case " ": {
              if (onClickNode && activeNode) {
                e.preventDefault();
                trackedClickNode(activeNode);
              }
              return;
            }
            case "Escape":
              handleMouseLeave();
              return;
            default:
              return;
          }
        }

        if (nextNode) {
          e.preventDefault();
          setActive({ type: "node", id: nextNode.id });
          const tip = tooltipRef.current;
          if (tip) {
            const x = labelPad.left + (nextNode.x0 + nextNode.x1) / 2;
            const y = padTop + (nextNode.y0 + nextNode.y1) / 2;
            tip.style.display = "";
            const tipW = tip.offsetWidth;
            const gap = 12;
            const fitsRight = x + gap + tipW <= width;
            const fitsLeft = x - gap - tipW >= 0;
            const preferRight = x <= width / 2;
            tip.style.left = `${x}px`;
            tip.style.top = `${y}px`;
            if ((preferRight && fitsRight) || !fitsLeft) {
              tip.style.transform = `translate(${gap}px, -50%)`;
            } else {
              tip.style.transform = `translate(calc(-100% - ${gap}px), -50%)`;
            }
          }
        }
      },
      [
        active,
        layout,
        nodesByColumn,
        maxColumn,
        labelPad,
        padTop,
        width,
        onClickNode,
        trackedClickNode,
        handleMouseLeave,
      ],
    );

    const ready = width > 0 && layout;

    const svgDesc = layout
      ? `Flow diagram with ${layout.nodes.length} nodes and ${layout.links.length} connections.`
      : undefined;

    return (
      <ChartWrapper
        ref={mergedRef}
        loading={loading}
        empty={empty}
        isEmpty={data.nodes.length === 0}
        dataLength={data.nodes.length}
        height={height}
        className={className}
      >
        <div
          ref={mergedRef}
          className={clsx(styles.root, className)}
          style={{ height }}
          {...props}
        >
          {ready && (
            <>
              <svg
                role="graphics-document document"
                aria-roledescription="Flow diagram"
                aria-label={ariaLabel ?? svgDesc ?? "Sankey diagram"}
                width={width}
                height={height}
                className={styles.svg}
                tabIndex={0}
                onMouseLeave={handleMouseLeave}
                onTouchEnd={handleMouseLeave}
                onTouchCancel={handleMouseLeave}
                onKeyDown={handleKeyDown}
              >
                {svgDesc && <desc>{svgDesc}</desc>}

                {hasStages && (
                  <g className={styles.sankeyStages}>
                    {stages.map((label, i) => {
                      const col = nodesByColumn.get(i);
                      if (!col || col.length === 0) return null;
                      const cx = labelPad.left + (col[0].x0 + col[0].x1) / 2;
                      return (
                        <text
                          key={`stage-${i}`}
                          x={cx}
                          y={STAGE_HEIGHT / 2}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className={styles.sankeyStageLabel}
                        >
                          {label}
                        </text>
                      );
                    })}
                  </g>
                )}

                <g transform={`translate(${labelPad.left},${padTop})`}>
                  <g className={styles.sankeyLinks}>
                    {layout.links.map((link, i) => {
                      const connected = isLinkConnected(link);
                      const colDelay = Math.min(
                        link.sourceNode.column * 100,
                        400,
                      );
                      return (
                        <path
                          key={`${link.source}-${link.target}-${i}`}
                          d={sankeyLinkPath(link)}
                          fill="none"
                          stroke={
                            link.color ??
                            link.sourceNode.color ??
                            SERIES_COLORS[0]
                          }
                          strokeWidth={Math.max(1, link.width)}
                          strokeOpacity={
                            connected ? LINK_OPACITY : LINK_OPACITY_DIM
                          }
                          role="graphics-symbol"
                          aria-roledescription="Flow"
                          aria-label={`${link.sourceNode.label} to ${
                            link.targetNode.label
                          }: ${fmtValue(link.value)}`}
                          className={clsx(
                            styles.sankeyLink,
                            animate && styles.sankeyAnimate,
                          )}
                          style={
                            animate
                              ? { animationDelay: `${colDelay}ms` }
                              : undefined
                          }
                          onMouseEnter={(e) => {
                            setActive({
                              type: "link",
                              sourceId: link.source,
                              targetId: link.target,
                            });
                            positionTooltip(e);
                          }}
                          onMouseMove={positionTooltip}
                          onClick={
                            onClickLink
                              ? () => trackedClickLink(link)
                              : undefined
                          }
                        />
                      );
                    })}
                  </g>

                  <g className={styles.sankeyNodes}>
                    {layout.nodes.map((node) => {
                      const connected = isNodeConnected(node);
                      const colDelay = Math.min(node.column * 100, 400);
                      return (
                        <rect
                          key={node.id}
                          x={node.x0}
                          y={node.y0}
                          width={node.x1 - node.x0}
                          height={Math.max(1, node.y1 - node.y0)}
                          fill={node.color ?? SERIES_COLORS[0]}
                          opacity={connected ? 1 : NODE_OPACITY_DIM}
                          role="graphics-symbol"
                          aria-roledescription="Node"
                          aria-label={`${node.label}: ${fmtValue(node.value)}`}
                          className={clsx(
                            styles.sankeyNode,
                            animate && styles.sankeyAnimate,
                          )}
                          style={
                            animate
                              ? { animationDelay: `${colDelay}ms` }
                              : undefined
                          }
                          onMouseEnter={(e) => {
                            setActive({ type: "node", id: node.id });
                            positionTooltip(e);
                          }}
                          onMouseMove={positionTooltip}
                          onClick={
                            onClickNode
                              ? () => trackedClickNode(node)
                              : undefined
                          }
                        />
                      );
                    })}
                  </g>

                  {labelPad.visible && (
                    <g className={styles.sankeyLabels}>
                      {layout.nodes.map((node) => {
                        const isFirst = node.column === 0;
                        const isLast = node.column === maxColumn;
                        const midY = (node.y0 + node.y1) / 2;

                        let lx: number;
                        let ly: number;
                        let anchor: "start" | "middle" | "end";

                        if (isFirst) {
                          lx = node.x0 - LABEL_GAP;
                          ly = midY;
                          anchor = "end";
                        } else if (isLast) {
                          lx = node.x1 + LABEL_GAP;
                          ly = midY;
                          anchor = "start";
                        } else {
                          lx = node.x1 + LABEL_GAP;
                          ly = midY;
                          anchor = "start";
                        }

                        return (
                          <text
                            key={`label-${node.id}`}
                            x={lx}
                            y={ly}
                            textAnchor={anchor}
                            dominantBaseline="central"
                            className={styles.sankeyLabel}
                          >
                            {node.label}
                            {showValues && isLast && (
                              <tspan className={styles.sankeyValueLabel}>
                                {"  "}
                                {fmtValue(node.value)}
                              </tspan>
                            )}
                          </text>
                        );
                      })}
                    </g>
                  )}
                </g>
              </svg>

              {tooltip !== false && (
                <div
                  ref={tooltipRef}
                  className={styles.tooltip}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    pointerEvents: "none",
                    display: "none",
                  }}
                >
                  {tooltipContent && (
                    <div className={styles.tooltipItems}>
                      <div className={styles.tooltipItem}>
                        <span className={styles.tooltipName}>
                          {tooltipContent.label}
                        </span>
                        <span className={styles.tooltipValue}>
                          {tooltipContent.value}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className={styles.srOnly}
              >
                {tooltipContent
                  ? `${tooltipContent.label}: ${tooltipContent.value}`
                  : ""}
              </div>
            </>
          )}
        </div>
      </ChartWrapper>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Sankey.displayName = "Chart.Sankey";
}
