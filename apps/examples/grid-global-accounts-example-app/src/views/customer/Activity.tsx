import styled from "@emotion/styled";
import { Badge, Card } from "@lightsparkdev/origin";

import { useAppState } from "../../state/store";
import type { LogEntry } from "../../lib/reporter";

// Labels emitted by the flows that read as customer-facing wallet activity.
// (The full request/response log lives behind the Debug drawer in Task 5; this
// is the curated, human-readable slice.)
const ACTIVITY_LABELS = new Set([
  "Create Quote",
  "Execute Quote",
  "Create External Account",
  "V3 Verify leg 2 (expect 200 session)",
  "OAUTH Verify",
  "PASSKEY Verify",
  "Wallet Export",
  "Wallet Export (retry)",
  "Delete Credential (retry)",
  "Delete Session (retry)",
]);

// Friendly title + tone per raw flow label.
const TITLES: Record<
  string,
  { title: string; tone: "blue" | "green" | "gray" | "yellow" }
> = {
  "Create Quote": { title: "Quote created", tone: "gray" },
  "Execute Quote": { title: "Payment executed", tone: "green" },
  "Create External Account": { title: "External account added", tone: "blue" },
  "V3 Verify leg 2 (expect 200 session)": {
    title: "Signed in (Email OTP)",
    tone: "blue",
  },
  "OAUTH Verify": { title: "Signed in (OAuth)", tone: "blue" },
  "PASSKEY Verify": { title: "Signed in (Passkey)", tone: "blue" },
  "Wallet Export": { title: "Wallet export started", tone: "yellow" },
  "Wallet Export (retry)": { title: "Wallet exported", tone: "yellow" },
  "Delete Credential (retry)": { title: "Credential removed", tone: "gray" },
  "Delete Session (retry)": { title: "Session revoked", tone: "gray" },
};

/**
 * Activity feed — a curated, human-readable slice of the reporter log scoped to
 * customer-facing wallet events (funding, payments, sign-ins, exports). Newest
 * first. `compact` trims it to the latest few for the wallet overview.
 */
export function Activity({ compact = false }: { compact?: boolean }) {
  const { log } = useAppState();
  const events = selectActivity(log);
  const shown = compact ? events.slice(0, 4) : events;

  if (shown.length === 0) {
    const empty = (
      <Empty>
        <EmptyTitle>No activity yet</EmptyTitle>
        <EmptyBody>
          Funding, payments, and account changes appear here.
        </EmptyBody>
      </Empty>
    );
    return compact ? (
      empty
    ) : (
      <Card.Root variant="structured">
        <Card.Body>{empty}</Card.Body>
      </Card.Root>
    );
  }

  const list = (
    <List>
      {shown.map((e) => {
        const meta = TITLES[e.label] ?? {
          title: e.label,
          tone: "gray" as const,
        };
        return (
          <Row key={e.id}>
            <RowLeft>
              <Dot data-tone={meta.tone} aria-hidden />
              <RowTitle>{meta.title}</RowTitle>
            </RowLeft>
            <RowRight>
              <Badge variant={meta.tone}>{e.level}</Badge>
              <When>{formatTime(e.ts)}</When>
            </RowRight>
          </Row>
        );
      })}
    </List>
  );

  if (compact) return list;
  return (
    <Card.Root variant="structured">
      <Card.Header>
        <Card.TitleGroup>
          <Card.Title>Activity</Card.Title>
          <Card.Subtitle>
            Wallet events from this session, newest first.
          </Card.Subtitle>
        </Card.TitleGroup>
      </Card.Header>
      <Card.Body fullwidth>{list}</Card.Body>
    </Card.Root>
  );
}

function selectActivity(log: LogEntry[]): LogEntry[] {
  return log
    .filter((e) => ACTIVITY_LABELS.has(e.label))
    .slice()
    .reverse();
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md, 16px);
  padding: var(--spacing-sm, 12px) var(--spacing-md, 16px);
  border-top: var(--stroke-xs, 1px) solid var(--border-primary, #e6e6e9);

  &:first-of-type {
    border-top: none;
  }
`;

const RowLeft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
  min-width: 0;
`;

const Dot = styled.span`
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-tertiary, #8a8a8a);

  &[data-tone="green"] {
    background: var(--brand-green, #16a34a);
  }
  &[data-tone="blue"] {
    background: var(--brand-blue, #2563eb);
  }
  &[data-tone="yellow"] {
    background: var(--brand-yellow, #d97706);
  }
`;

const RowTitle = styled.span`
  font-size: var(--font-size-sm, 13px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-primary, #1a1a1a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowRight = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
`;

const When = styled.span`
  font-size: var(--font-size-xs, 11px);
  color: var(--text-tertiary, #8a8a8a);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xs, 6px);
  text-align: center;
  padding: var(--spacing-2xl, 40px) var(--spacing-lg, 24px);
`;

const EmptyTitle = styled.div`
  font-size: var(--font-size-sm, 13px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary, #1a1a1a);
`;

const EmptyBody = styled.div`
  font-size: var(--font-size-sm, 13px);
  color: var(--text-tertiary, #8a8a8a);
  max-width: 320px;
  line-height: 1.45;
`;
