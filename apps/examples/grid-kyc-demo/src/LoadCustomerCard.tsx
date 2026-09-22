import styled from "@emotion/styled";
import {
  Alert,
  Badge,
  Button,
  Card,
  CentralIcon,
  Field,
  Input,
} from "@lightsparkdev/origin";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { GridEnv, RunCall } from "./api";
import {
  displayName,
  isGridCustomerId,
  matchesName,
  verificationStatus,
  type CustomerListResponse,
  type CustomerResponse,
} from "./loadCustomer";
import { ButtonRow, Divider, Row, SecondaryButton } from "./ui";

const RECENT_LIMIT = 100;

type Status = { kind: "ok" | "err"; message: string } | null;

interface RecentPages {
  rows: CustomerResponse[];
  nextCursor: string | null;
  totalCount: number | null;
}

export function LoadCustomerCard({
  env,
  runCall,
  onLoaded,
}: {
  env: GridEnv;
  runCall: RunCall;
  onLoaded: (customer: CustomerResponse) => void;
}) {
  const [lookupId, setLookupId] = useState("");
  const [lookupStatus, setLookupStatus] = useState<Status>(null);
  const [recent, setRecent] = useState<RecentPages | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recentStatus, setRecentStatus] = useState<Status>(null);
  const [nameFilter, setNameFilter] = useState("");

  // Rows belong to the environment they were fetched from. Drop them on an
  // env switch, and ignore responses from requests started under the old env
  // so a slow prod reply cannot land after the user has moved to dev.
  const requestEnv = useRef(env);
  useEffect(() => {
    requestEnv.current = env;
    setRecent(null);
    setLookupStatus(null);
    setRecentStatus(null);
  }, [env]);
  const isCurrent = useCallback(
    (startedIn: GridEnv) => startedIn === requestEnv.current,
    [],
  );

  const applyCustomer = useCallback(
    (customer: CustomerResponse) => {
      onLoaded(customer);
      setLookupStatus({
        kind: "ok",
        message: `${customer.customerType} ${customer.platformCustomerId} — ${
          verificationStatus(customer) || "no status"
        }. Form updated.`,
      });
    },
    [onLoaded],
  );

  const onLookup = useCallback(async () => {
    setLookupStatus(null);
    const value = lookupId.trim();
    if (!value) {
      setLookupStatus({ kind: "err", message: "Enter a customer id first." });
      return;
    }
    const startedIn = env;
    try {
      if (isGridCustomerId(value)) {
        const customer = await runCall<CustomerResponse>(
          "GET",
          `/customers/${encodeURIComponent(value)}`,
        );
        if (customer && isCurrent(startedIn)) applyCustomer(customer);
        return;
      }
      const list = await runCall<CustomerListResponse>(
        "GET",
        `/customers?platformCustomerId=${encodeURIComponent(value)}&limit=1`,
      );
      if (!isCurrent(startedIn)) return;
      const customer = list?.data?.[0];
      if (!customer) {
        setLookupStatus({
          kind: "err",
          message: `No customer with platform customer id "${value}".`,
        });
        return;
      }
      applyCustomer(customer);
    } catch (err) {
      if (isCurrent(startedIn))
        setLookupStatus({ kind: "err", message: (err as Error).message });
    }
  }, [applyCustomer, env, isCurrent, lookupId, runCall]);

  const fetchPage = useCallback(
    async (cursor: string | null) => {
      const query = new URLSearchParams({ limit: String(RECENT_LIMIT) });
      if (cursor) query.set("cursor", cursor);
      return runCall<CustomerListResponse>("GET", `/customers?${query}`);
    },
    [runCall],
  );

  const onLoadRecent = useCallback(async () => {
    setRecentStatus(null);
    const startedIn = env;
    try {
      const list = await fetchPage(null);
      if (list && isCurrent(startedIn))
        setRecent({
          rows: list.data,
          nextCursor: list.hasMore ? list.nextCursor ?? null : null,
          totalCount: list.totalCount ?? null,
        });
    } catch (err) {
      if (isCurrent(startedIn))
        setRecentStatus({ kind: "err", message: (err as Error).message });
    }
  }, [env, fetchPage, isCurrent]);

  const onLoadMore = useCallback(async () => {
    if (!recent?.nextCursor) return;
    setRecentStatus(null);
    setLoadingMore(true);
    const startedIn = env;
    try {
      const list = await fetchPage(recent.nextCursor);
      if (list && isCurrent(startedIn))
        setRecent({
          rows: [...recent.rows, ...list.data],
          nextCursor: list.hasMore ? list.nextCursor ?? null : null,
          totalCount: list.totalCount ?? recent.totalCount,
        });
    } catch (err) {
      if (isCurrent(startedIn))
        setRecentStatus({ kind: "err", message: (err as Error).message });
    } finally {
      setLoadingMore(false);
    }
  }, [env, fetchPage, isCurrent, recent]);

  const visible = useMemo(
    () => (recent?.rows ?? []).filter((c) => matchesName(c, nameFilter)),
    [nameFilter, recent],
  );

  return (
    <Card.Root variant="structured">
      <Card.Header>
        <Card.TitleGroup>
          <Card.Title>Load existing customer</Card.Title>
          <Card.Subtitle>
            Reload a customer into the form to finish its verification. The
            identifier is never returned by the API, so it shows as a
            placeholder and is left untouched on update.
          </Card.Subtitle>
        </Card.TitleGroup>
      </Card.Header>
      <Card.Body>
        <Stack>
          <Inputs>
            <Field.Root>
              <Field.Label>Customer ID or platform customer ID</Field.Label>
              <Row>
                <Input
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="Customer:01a0… / uuid / ind-abc123"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void onLookup();
                  }}
                />
                <ButtonRow>
                  <Button onClick={onLookup}>Load by ID</Button>
                </ButtonRow>
              </Row>
              <Field.Description>
                <code>Customer:…</code> or a UUID calls{" "}
                <code>GET /customers/&lt;id&gt;</code>; anything else is treated
                as a platform customer id and calls{" "}
                <code>GET /customers?platformCustomerId=…</code>.
              </Field.Description>
            </Field.Root>
            {lookupStatus && (
              <Alert
                variant={lookupStatus.kind === "ok" ? "default" : "critical"}
                title={
                  lookupStatus.kind === "ok" ? "Customer loaded" : "Load failed"
                }
                description={lookupStatus.message}
              />
            )}

            <Divider />

            <Row>
              <Field.Root>
                <Field.Label>Filter recent by name</Field.Label>
                <Input
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Jane / Acme"
                  disabled={!recent}
                />
              </Field.Root>
              <ButtonRow>
                <SecondaryButton onClick={onLoadRecent}>
                  {recent
                    ? "Reload recent"
                    : `Load recent (latest ${RECENT_LIMIT})`}
                </SecondaryButton>
              </ButtonRow>
            </Row>
            {recentStatus && (
              <Alert
                variant="critical"
                title="Could not list customers"
                description={recentStatus.message}
              />
            )}
          </Inputs>
          {recent && (
            <>
              <Hint>
                Showing {visible.length} of {recent.rows.length} fetched
                {recent.totalCount != null
                  ? ` (${recent.totalCount} on the platform)`
                  : ""}
                . Name filtering is client-side over the fetched rows only.
              </Hint>
              <List>
                {visible.length === 0 ? (
                  <Empty>No matching customers.</Empty>
                ) : (
                  visible.map((c) => (
                    <Item key={c.id} data-item>
                      <ItemHead>
                        <ItemName>{displayName(c) || "—"}</ItemName>
                        <Muted>{c.customerType}</Muted>
                        {verificationStatus(c) ? (
                          <Badge>{verificationStatus(c)}</Badge>
                        ) : null}
                        <Muted>{c.createdAt?.slice(0, 10) ?? ""}</Muted>
                        <UseSlot>
                          <Button
                            variant="outline"
                            size="compact"
                            onClick={() => applyCustomer(c)}
                          >
                            Use
                          </Button>
                        </UseSlot>
                      </ItemHead>
                      <ItemIds>
                        <CopyableId
                          label="platform"
                          value={c.platformCustomerId}
                        />
                        <CopyableId label="customer" value={c.id} />
                      </ItemIds>
                    </Item>
                  ))
                )}
              </List>
              {recent.nextCursor && (
                <ButtonRow>
                  <SecondaryButton onClick={onLoadMore} loading={loadingMore}>
                    Load {RECENT_LIMIT} more
                  </SecondaryButton>
                </ButtonRow>
              )}
            </>
          )}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 12px);
`;

const Inputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 12px);
  max-width: 720px;
`;

const Hint = styled.div`
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary, #666);
`;

function CopyableId({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <IdCell>
      <Muted>{label}</Muted>
      <Mono>{value}</Mono>
      <Button
        variant="outline"
        size="dense"
        iconOnly
        aria-label={copied ? "Copied" : `Copy ${label} id ${value}`}
        title={copied ? "Copied" : "Copy"}
        onClick={() => {
          navigator.clipboard.writeText(value).then(
            () => setCopied(true),
            () => setCopied(false),
          );
        }}
      >
        <CentralIcon
          name={copied ? "IconCheckmark2Small" : "IconClipboard2"}
          size={14}
        />
      </Button>
    </IdCell>
  );
}

const IdCell = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs, 6px);
  min-width: 0;
`;

const Mono = styled.span`
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs, 12px);
  overflow-wrap: anywhere;
`;

const Muted = styled.span`
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary, #666);
  white-space: nowrap;
`;

// One wrapping block per customer rather than a table. Seven nowrap columns
// overflow the page, and the full ids must stay readable and copyable.
// Wrapping keeps "Use" on screen without horizontal scrolling.
const List = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 560px;
  overflow-y: auto;
  border: var(--stroke-xs, 1px) solid var(--border-primary, #e0e0e0);
  border-radius: var(--corner-radius-sm, 6px);
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs, 6px);
  padding: var(--spacing-xs, 8px) var(--spacing-sm, 12px);
  border-bottom: var(--stroke-xs, 1px) solid var(--border-primary, #e0e0e0);

  &:last-child {
    border-bottom: none;
  }
`;

const ItemHead = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 10px);
  flex-wrap: wrap;
`;

const ItemName = styled.span`
  font-weight: var(--font-weight-medium, 500);
`;

const UseSlot = styled.span`
  margin-left: auto;
`;

const ItemIds = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: var(--spacing-lg, 20px);
  row-gap: var(--spacing-2xs, 6px);
`;

const Empty = styled.div`
  padding: var(--spacing-md, 12px);
  color: var(--text-secondary, #666);
  font-size: var(--font-size-sm, 13px);
`;
