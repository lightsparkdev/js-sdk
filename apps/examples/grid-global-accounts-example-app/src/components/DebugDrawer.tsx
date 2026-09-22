import styled from "@emotion/styled";
import { Badge, Collapsible } from "@lightsparkdev/origin";
import { useState, type ComponentProps } from "react";

import type { LogEntry } from "../lib/reporter";
import { useAppState } from "../state/store";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

/** Map each log level to an Origin badge variant + short tag. */
const LEVEL: Record<LogEntry["level"], { variant: BadgeVariant; tag: string }> =
  {
    info: { variant: "gray", tag: "INFO" },
    error: { variant: "red", tag: "ERR" },
    request: { variant: "blue", tag: "REQ" },
    response: { variant: "green", tag: "RES" },
  };

/**
 * The debug surface's main instrument: a docked panel pinned to the bottom of
 * the viewport that streams the structured `store.log` — one row per entry with
 * a level badge, label, timestamp, and an expandable raw `detail` JSON. Rendered
 * only when debug mode is on, across both personas (wired into the Shell), and
 * non-modal so the app stays fully usable behind it. Collapsible to a slim
 * header bar so it can be parked out of the way.
 */
export function DebugDrawer() {
  const { debugOn, log } = useAppState();
  const [open, setOpen] = useState(true);

  if (!debugOn) return null;

  // Newest first — the reporter appends, so reverse a shallow copy.
  const entries = [...log].reverse();

  return (
    <Dock data-open={open}>
      <Bar onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <BarLeft>
          <Pulse aria-hidden />
          <BarTitle>Debug console</BarTitle>
          <Count>{log.length}</Count>
        </BarLeft>
        <BarRight aria-hidden>{open ? "▾" : "▴"}</BarRight>
      </Bar>

      {open && (
        <Body>
          {entries.length === 0 ? (
            <Empty>
              No events yet. Connect, create a customer, or sign in — every
              request and response lands here.
            </Empty>
          ) : (
            <List>
              {entries.map((entry) => (
                <LogRow key={entry.id} entry={entry} />
              ))}
            </List>
          )}
        </Body>
      )}
    </Dock>
  );
}

function LogRow({ entry }: { entry: LogEntry }) {
  const level = LEVEL[entry.level];
  const hasDetail = entry.detail !== undefined && entry.detail !== null;

  return (
    <Row>
      <RowHead>
        <LevelBadge variant={level.variant} vibrant>
          {level.tag}
        </LevelBadge>
        <RowLabel>{entry.label}</RowLabel>
        <Time>{formatTime(entry.ts)}</Time>
      </RowHead>

      {hasDetail && (
        <Collapsible.Root>
          <DetailTrigger>
            <DetailTriggerLabel>detail</DetailTriggerLabel>
          </DetailTrigger>
          <Collapsible.Panel>
            <Pre>
              <code>{stringify(entry.detail)}</code>
            </Pre>
          </Collapsible.Panel>
        </Collapsible.Root>
      )}
    </Row>
  );
}

function stringify(value: unknown): string {
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

const PANEL_BG = "#16161a";
const PANEL_BORDER = "rgba(255, 255, 255, 0.1)";
const PANEL_TEXT = "rgba(255, 255, 255, 0.92)";
const PANEL_DIM = "rgba(255, 255, 255, 0.45)";

const Dock = styled.aside`
  position: fixed;
  inset: auto 0 0 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  background: ${PANEL_BG};
  color: ${PANEL_TEXT};
  border-top: var(--stroke-sm, 1px) solid ${PANEL_BORDER};
  box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.28);
  font-family: var(--font-family-mono, ui-monospace, monospace);

  /* A hairline of accent at the very top edge, like a live wire. */
  &::before {
    content: "";
    position: absolute;
    top: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--surface-blue-strong, #0072db) 30%,
      #3dd68c 70%,
      transparent
    );
    opacity: 0.7;
  }
`;

const Bar = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm, 12px);
  padding: var(--spacing-xs, 8px) var(--spacing-lg, 20px);
  cursor: pointer;
  user-select: none;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
  &:focus-visible {
    outline: 2px solid var(--surface-blue-strong, #0072db);
    outline-offset: -2px;
  }
`;

const BarLeft = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs, 8px);
`;

const Pulse = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3dd68c;
  box-shadow: 0 0 0 0 rgba(61, 214, 140, 0.6);
  animation: dbg-pulse 2.4s ease-out infinite;

  @keyframes dbg-pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(61, 214, 140, 0.5);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(61, 214, 140, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(61, 214, 140, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const BarTitle = styled.span`
  font-size: var(--font-size-xs, 12px);
  font-weight: var(--font-weight-semibold, 600);
  letter-spacing: 0.6px;
  text-transform: uppercase;
`;

const Count = styled.span`
  font-size: var(--font-size-2xs, 10px);
  color: ${PANEL_DIM};
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 1px var(--spacing-2xs, 6px);
  font-variant-numeric: tabular-nums;
`;

const BarRight = styled.span`
  font-size: var(--font-size-sm, 13px);
  color: ${PANEL_DIM};
`;

const Body = styled.div`
  max-height: min(42vh, 380px);
  overflow: auto;
  border-top: var(--stroke-xs, 0.5px) solid ${PANEL_BORDER};
`;

const Empty = styled.div`
  padding: var(--spacing-md, 16px) var(--spacing-lg, 20px);
  font-size: var(--font-size-xs, 12px);
  color: ${PANEL_DIM};
  line-height: 1.5;
`;

const List = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Row = styled.li`
  padding: var(--spacing-xs, 8px) var(--spacing-lg, 20px);
  border-top: var(--stroke-xs, 0.5px) solid rgba(255, 255, 255, 0.06);

  &:first-of-type {
    border-top: none;
  }
`;

const RowHead = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
`;

const LevelBadge = styled(Badge)`
  flex: 0 0 auto;
  font-family: var(--font-family-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
`;

const RowLabel = styled.span`
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-xs, 12px);
  color: ${PANEL_TEXT};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Time = styled.span`
  flex: 0 0 auto;
  font-size: var(--font-size-2xs, 10px);
  color: ${PANEL_DIM};
  font-variant-numeric: tabular-nums;
`;

const DetailTrigger = styled(Collapsible.Trigger)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-3xs, 4px);
  width: auto;
  margin-top: var(--spacing-3xs, 4px);
  margin-left: 52px; /* align under the label, clear of the badge */
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${PANEL_DIM};

  &:hover {
    color: ${PANEL_TEXT};
  }
  &:hover span {
    text-decoration: none;
  }

  [class*="icon"] svg {
    width: 14px;
    height: 14px;
  }
  [class*="icon"] {
    width: auto;
    height: auto;
    color: currentColor;
  }
`;

const DetailTriggerLabel = styled.span`
  font-size: var(--font-size-2xs, 10px);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  flex: 0 0 auto;
`;

const Pre = styled.pre`
  margin: var(--spacing-3xs, 4px) 0 var(--spacing-2xs, 6px) 52px;
  padding: var(--spacing-sm, 12px);
  background: rgba(0, 0, 0, 0.4);
  border: var(--stroke-xs, 0.5px) solid ${PANEL_BORDER};
  border-radius: var(--corner-radius-md, 8px);
  color: #b8e8ff;
  font-family: var(--font-family-mono, ui-monospace, monospace);
  font-size: var(--font-size-2xs, 10px);
  line-height: 1.55;
  overflow: auto;
  max-height: 240px;
  white-space: pre;
  tab-size: 2;

  code {
    font-family: inherit;
  }
`;
