import styled from "@emotion/styled";

import { useAppState } from "../state/store";

/**
 * The active-context indicator in the Shell header. Normally a quiet chip
 * naming the customer the app is acting as (or "No customer" before one is
 * picked). When debug mode is on it expands to reveal the actual identifiers
 * the plumbing runs on — customer id, account id (if provisioned), and session
 * id (if signed in) — inline as monospace key/value pairs.
 *
 * Nothing identifying is shown in the normal (non-debug) state, keeping the
 * polished persona views free of raw IDs.
 */
export function ContextChip() {
  const { activeCustomer, session, debugOn } = useAppState();

  const name = activeCustomer?.name || activeCustomer?.email || null;
  const sessionId = extractSessionId(session);

  if (!activeCustomer) {
    // Nothing to anchor to before a customer is active — stay out of the way.
    if (!debugOn) return null;
    return (
      <Chip data-debug>
        <Dot data-on={false} aria-hidden />
        <Name data-debug>No customer</Name>
      </Chip>
    );
  }

  return (
    <Chip data-debug={debugOn || undefined}>
      <Dot data-on={!!session} aria-hidden />
      <Name data-debug={debugOn || undefined}>{name}</Name>

      {debugOn && (
        <Ids>
          <Id>
            <K>cust</K>
            <V title={activeCustomer.id}>{activeCustomer.id}</V>
          </Id>
          {activeCustomer.accountId && (
            <Id>
              <K>acct</K>
              <V title={activeCustomer.accountId}>{activeCustomer.accountId}</V>
            </Id>
          )}
          {sessionId && (
            <Id>
              <K>sess</K>
              <V title={sessionId}>{sessionId}</V>
            </Id>
          )}
        </Ids>
      )}
    </Chip>
  );
}

/**
 * The session is held as `unknown` (the concrete bundle shape is owned by the
 * reused login flows). Best-effort dig for a likely identifier so debug mode
 * can surface *something* without coupling to one provider's shape; falls back
 * to null when there's nothing id-like to show.
 */
function extractSessionId(session: unknown): string | null {
  if (!session || typeof session !== "object") return null;
  const s = session as Record<string, unknown>;
  const candidates = [
    s.id,
    s.sessionId,
    s.session_id,
    s.credentialId,
    s.credential_id,
    (s.session as Record<string, unknown> | undefined)?.id,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.length > 0) return c;
  }
  return null;
}

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs, 6px);
  min-width: 0;
  max-width: 360px;
  padding: var(--spacing-3xs, 4px) var(--spacing-xs, 8px);
  border-radius: var(--corner-radius-md, 8px);
  background: var(--surface-secondary, #f0f0ee);
  border: var(--stroke-xs, 0.5px) solid
    var(--border-primary, rgba(38, 38, 35, 0.1));

  &[data-debug] {
    /* Fixed dark "console" surface (matches DebugDrawer's PANEL_BG), not the
     * mode-flipping --surface-inverse — its light text would vanish on the
     * near-white --surface-inverse in dark mode. */
    background: #16161a;
    border-color: rgba(255, 255, 255, 0.14);
  }

  @media (width <= 760px) {
    display: none;
  }
`;

const Dot = styled.span`
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-tertiary, #8a8a8a);

  &[data-on="true"] {
    background: #3dd68c;
    box-shadow: 0 0 0 3px rgba(61, 214, 140, 0.22);
  }
`;

const Name = styled.span`
  flex: 0 0 auto;
  font-size: var(--font-size-xs, 12px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-primary, #1a1a1a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &[data-debug] {
    color: rgba(255, 255, 255, 0.92);
  }
`;

const Ids = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs, 6px);
  padding-left: var(--spacing-2xs, 6px);
  margin-left: var(--spacing-3xs, 4px);
  border-left: var(--stroke-xs, 0.5px) solid rgba(255, 255, 255, 0.16);
  min-width: 0;
`;

const Id = styled.span`
  display: inline-flex;
  align-items: baseline;
  gap: var(--spacing-3xs, 4px);
  min-width: 0;
`;

const K = styled.span`
  flex: 0 0 auto;
  font-family: var(--font-family-mono, ui-monospace, monospace);
  font-size: var(--font-size-2xs, 10px);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: rgba(255, 255, 255, 0.45);
`;

const V = styled.span`
  font-family: var(--font-family-mono, ui-monospace, monospace);
  font-size: var(--font-size-2xs, 10px);
  color: #b8e8ff;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
`;
