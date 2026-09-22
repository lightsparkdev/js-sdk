import styled from "@emotion/styled";
import { Collapsible } from "@lightsparkdev/origin";

import { useAppState } from "../state/store";

export interface RawExpanderProps {
  /** Raw payload to pretty-print. Anything JSON-serializable (objects, arrays). */
  value: unknown;
  /** Trigger label. Defaults to "Raw response". */
  label?: string;
}

/**
 * A reusable disclosure that reveals a raw JSON blob — but only when debug mode
 * is on. Off by default and renders nothing when debug is off, so it can be
 * dropped next to a polished value without leaking the plumbing into the
 * happy-path UI. Collapsed by default when shown.
 *
 * Used to attach the real API payload behind a value the user already sees
 * formatted (e.g. a balance, a connection summary), so the demo can show "here's
 * the pretty number, and here's exactly what the API returned".
 */
export function RawExpander({
  value,
  label = "Raw response",
}: RawExpanderProps) {
  const { debugOn } = useAppState();
  if (!debugOn) return null;

  const json = stringify(value);

  return (
    <Root>
      <Collapsible.Root>
        <Trigger>
          <TriggerInner>
            <Spark aria-hidden />
            <TriggerLabel>{label}</TriggerLabel>
          </TriggerInner>
        </Trigger>
        <Collapsible.Panel>
          <Pre>
            <code>{json}</code>
          </Pre>
        </Collapsible.Panel>
      </Collapsible.Root>
    </Root>
  );
}

/** Pretty-print, falling back gracefully on cyclic / non-serializable input. */
function stringify(value: unknown): string {
  if (value === undefined) return "undefined";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

const Root = styled.div`
  margin-top: var(--spacing-sm, 12px);
`;

const Trigger = styled(Collapsible.Trigger)`
  /* Override the default Collapsible trigger to a compact, monospace "dev" tag
     so it reads as instrumentation rather than primary content. The base
     component already rotates its chevron on open via .root[data-open]. */
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-3xs, 4px);
  width: auto;
  padding: var(--spacing-3xs, 4px) var(--spacing-xs, 8px);
  background: var(--surface-secondary, #f0f0ee);
  border: var(--stroke-xs, 0.5px) solid
    var(--border-primary, rgba(38, 38, 35, 0.1));
  border-radius: var(--corner-radius-sm, 6px);
  cursor: pointer;
  color: var(--text-secondary, #555);

  &:hover {
    background: var(--surface-tertiary, #c1c0b8);
    color: var(--text-primary, #1a1a1a);
  }

  /* Suppress the base trigger's underline-on-hover; this reads as a tag. */
  span {
    flex: 0 0 auto;
  }
  &:hover span {
    text-decoration: none;
  }

  /* Shrink the oversized 24px chevron to fit the compact tag. */
  [class*="icon"] svg {
    width: 14px;
    height: 14px;
  }
  [class*="icon"] {
    width: auto;
    height: auto;
  }
`;

const TriggerInner = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs, 6px);
`;

const Spark = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 1px;
  background: var(--surface-blue-strong, #0072db);
  transform: rotate(45deg);
`;

const TriggerLabel = styled.span`
  font-family: var(--font-family-mono, ui-monospace, monospace);
  font-size: var(--font-size-2xs, 10px);
  font-weight: var(--font-weight-medium, 500);
  letter-spacing: 0.4px;
  text-transform: uppercase;
`;

const Pre = styled.pre`
  margin: var(--spacing-2xs, 6px) 0 0;
  padding: var(--spacing-sm, 12px);
  /* Fixed dark "terminal" surface, not the mode-flipping --surface-inverse:
   * the light-green text would vanish on its near-white value in dark mode. */
  background: #16161a;
  color: #d6f7c2;
  border-radius: var(--corner-radius-md, 8px);
  font-family: var(--font-family-mono, ui-monospace, monospace);
  font-size: var(--font-size-2xs, 10px);
  line-height: 1.55;
  overflow: auto;
  max-height: 280px;
  white-space: pre;
  tab-size: 2;

  code {
    font-family: inherit;
  }
`;
