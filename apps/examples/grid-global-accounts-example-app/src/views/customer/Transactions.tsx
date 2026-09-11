import styled from "@emotion/styled";
import { Badge, Button, Card } from "@lightsparkdev/origin";
import { useCallback, useEffect, useState } from "react";

import { DismissibleAlert } from "../../components/DismissibleAlert";
import { RawExpander } from "../../components/RawExpander";
import {
  listTransactions,
  type Transaction,
  type TransactionTypeFilter,
} from "../../flows/transactions";
import { formatMoney } from "../../lib/format-money";
import { useAppState } from "../../state/store";

const PAGE_LIMIT = 20;

const FILTERS: { value: TransactionTypeFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "INCOMING", label: "Incoming" },
  { value: "OUTGOING", label: "Outgoing" },
];

/**
 * Transactions tab — the customer's real, server-persisted movement of funds
 * (onramps / offramps / payments) from `GET /transactions`, scoped to the
 * active customer and newest first. Distinct from the Activity tab, which shows
 * this session's client-action log. Supports an All / Incoming / Outgoing
 * filter and cursor-based "Load more" paging.
 */
export function Transactions() {
  const { activeCustomer, platformAuth, reporter } = useAppState();
  const customerId = activeCustomer?.id ?? "";

  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [filter, setFilter] = useState<TransactionTypeFilter>("ALL");

  // Memoized so the mount/refetch effect deps stay stable and we don't refetch
  // on every render. `cursor: null` resets to the first page; a cursor appends.
  const load = useCallback(
    async (cursor: string | null) => {
      if (!platformAuth || !customerId) return;
      const append = cursor !== null;
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const page = await listTransactions(reporter, platformAuth, {
          customerId,
          limit: PAGE_LIMIT,
          cursor,
          type: filter,
        });
        setItems((prev) => (append ? [...prev, ...page.data] : page.data));
        setHasMore(page.hasMore);
        setNextCursor(page.nextCursor);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Couldn't load transactions.",
        );
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    [platformAuth, customerId, filter, reporter],
  );

  // On mount and whenever the customer or filter changes, reset and fetch fresh.
  useEffect(() => {
    setItems([]);
    setHasMore(false);
    setNextCursor(null);
    setError(null);
    void load(null);
  }, [load]);

  if (!customerId || !platformAuth) {
    return (
      <Card.Root variant="structured">
        <Card.Body>
          <Empty>
            <EmptyTitle>Not connected</EmptyTitle>
            <EmptyBody>
              Connect the platform and act as a customer to see their
              transactions.
            </EmptyBody>
          </Empty>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Stack>
      {error && (
        <DismissibleAlert
          variant="critical"
          title="Couldn't load transactions"
          description={error}
          onClose={() => setError(null)}
        />
      )}

      <Card.Root variant="structured">
        <Card.Header>
          <Card.TitleGroup>
            <Card.Title>Transactions</Card.Title>
            <Card.Subtitle>
              Funds moving in and out of this wallet, newest first.
            </Card.Subtitle>
          </Card.TitleGroup>
        </Card.Header>
        <Card.Body fullwidth>
          <Filters>
            {FILTERS.map(({ value, label }) => (
              <Button
                key={value}
                size="compact"
                variant={filter === value ? "filled" : "outline"}
                onClick={() => setFilter(value)}
              >
                {label}
              </Button>
            ))}
          </Filters>

          {loading ? (
            <Notice>Loading transactions…</Notice>
          ) : items.length === 0 ? (
            <Empty>
              <EmptyTitle>No transactions yet</EmptyTitle>
              <EmptyBody>
                Funding, payments, and transfers for this customer appear here.
              </EmptyBody>
            </Empty>
          ) : (
            <List>
              {items.map((tx, i) => (
                <TransactionRow key={tx.id ?? i} tx={tx} />
              ))}
            </List>
          )}

          {hasMore && !loading && (
            <LoadMore>
              <Button
                variant="outline"
                size="compact"
                loading={loadingMore}
                onClick={() => void load(nextCursor)}
              >
                Load more
              </Button>
            </LoadMore>
          )}
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}

/** One transaction row: direction + amount, counterparty, status, date, raw. */
function TransactionRow({ tx }: { tx: Transaction }) {
  const incoming = tx.type === "INCOMING";
  const money = incoming ? tx.receivedAmount : tx.sentAmount;
  const amount = money ?? tx.amount;
  const status = statusBadge(tx.status);

  return (
    <Row>
      <RowMain>
        <RowLeft>
          <Badge variant={incoming ? "green" : "blue"}>
            {incoming ? "Received" : "Sent"}
          </Badge>
          <Counterparty title={counterparty(tx)}>
            {counterparty(tx)}
          </Counterparty>
        </RowLeft>
        <RowRight>
          <Amount data-direction={incoming ? "in" : "out"}>
            {formatSignedAmount(amount, incoming)}
          </Amount>
          <Badge variant={status.variant}>{status.label}</Badge>
          <When>{formatDate(tx.createdAt)}</When>
        </RowRight>
      </RowMain>
      <RawExpander value={tx} label="Raw transaction" />
    </Row>
  );
}

/** Map a transaction status to a label + Badge variant. */
function statusBadge(status: string | undefined): {
  variant: "green" | "yellow" | "red" | "gray";
  label: string;
} {
  const s = (status ?? "").toUpperCase();
  const label = status || "Unknown";
  if (s === "COMPLETED" || s === "SETTLED" || s === "SUCCEEDED")
    return { variant: "green", label };
  if (s === "PENDING" || s === "PROCESSING" || s === "CREATED")
    return { variant: "yellow", label };
  if (s === "FAILED" || s === "REJECTED" || s === "CANCELLED")
    return { variant: "red", label };
  return { variant: "gray", label };
}

/**
 * Extract a readable counterparty identifier. Incoming reads `source`, outgoing
 * reads `destination`; both are a OneOf keyed by `sourceType`/`destinationType`.
 * Prefer a UMA address, then an account id; fall back to the OneOf's type tag.
 */
function counterparty(tx: Transaction): string {
  const incoming = tx.type === "INCOMING";
  const party = incoming ? tx.source : tx.destination;
  if (!party || typeof party !== "object") return "—";
  const p = party as Record<string, unknown>;
  if (typeof p.umaAddress === "string" && p.umaAddress) return p.umaAddress;
  if (typeof p.accountId === "string" && p.accountId) return p.accountId;
  const tag = incoming ? p.sourceType : p.destinationType;
  return typeof tag === "string" && tag ? tag : "—";
}

/** Signed major-unit amount, e.g. `+ 12.50 USD` / `− 3.000000 USDB`. */
function formatSignedAmount(
  amount: { amount?: number; currency?: unknown } | undefined,
  incoming: boolean,
): string {
  if (!amount || typeof amount.amount !== "number") return "—";
  const sign = incoming ? "+" : "−";
  return `${sign} ${formatMoney(amount.amount, amount.currency)}`;
}

/** Locale date + time; guards an invalid/missing timestamp. */
function formatDate(value: string | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
`;

const Filters = styled.div`
  display: flex;
  gap: var(--spacing-2xs, 6px);
  padding: 0 var(--spacing-md, 16px) var(--spacing-sm, 12px);
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs, 6px);
  padding: var(--spacing-sm, 12px) var(--spacing-md, 16px);
  border-top: var(--stroke-xs, 1px) solid var(--border-primary, #e6e6e9);

  &:first-of-type {
    border-top: none;
  }
`;

const RowMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md, 16px);
`;

const RowLeft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
  min-width: 0;
`;

const RowRight = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
  flex: none;
`;

const Counterparty = styled.span`
  font-size: var(--font-size-sm, 13px);
  color: var(--text-secondary, #555);
  font-variant-numeric: tabular-nums;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Amount = styled.span`
  font-size: var(--font-size-sm, 13px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-primary, #1a1a1a);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;

  &[data-direction="in"] {
    color: var(--text-green, var(--text-primary, #1a1a1a));
  }
`;

const When = styled.span`
  font-size: var(--font-size-xs, 11px);
  color: var(--text-tertiary, #8a8a8a);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const LoadMore = styled.div`
  display: flex;
  justify-content: center;
  padding: var(--spacing-md, 16px);
`;

const Notice = styled.div`
  font-size: var(--font-size-sm, 13px);
  color: var(--text-tertiary, #8a8a8a);
  padding: var(--spacing-md, 16px);
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
