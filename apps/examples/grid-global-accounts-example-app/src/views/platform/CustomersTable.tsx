import styled from "@emotion/styled";
import { Button, Card, Table } from "@lightsparkdev/origin";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  groupCustomerWallets,
  listAllInternalAccounts,
  type CustomerWallet,
} from "../../flows/customer";
import { formatMoney } from "../../lib/format-money";
import { useAppState, type ActiveCustomer } from "../../state/store";
import { CreateCustomer } from "./CreateCustomer";
import { FundCustomer } from "./FundCustomer";

/**
 * Customers table — one row per customer, derived from a SINGLE
 * `GET /customers/internal-accounts` sweep (no `customerId` filter), grouped by
 * owning customer. Each row shows the customer's shortened id (full on hover)
 * and its spendable-wallet balance, both straight from that one fetch — no
 * per-customer follow-up calls. Each row's wallet `accountId` is carried inline,
 * so "Act as" scopes into the Customer view (`setActiveCustomer` +
 * `setPersona("customer")`) without an extra request.
 */
export function CustomersTable() {
  const {
    platformAuth,
    reporter,
    setCustomers,
    setActiveCustomer,
    setPersona,
  } = useAppState();
  const connected = platformAuth !== null;

  const [loading, setLoading] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const [wallets, setWallets] = useState<CustomerWallet[]>([]);
  // Guards against a stale fetch (e.g. after disconnect/reconnect) clobbering a
  // newer one's results.
  const fetchSeq = useRef(0);

  const refresh = useCallback(async () => {
    if (!platformAuth) return;
    const seq = ++fetchSeq.current;
    setLoading(true);
    try {
      const { accounts, truncated } = await listAllInternalAccounts(
        reporter,
        platformAuth,
      );
      if (seq !== fetchSeq.current) return; // superseded
      const grouped = groupCustomerWallets(accounts);
      setWallets(grouped);
      setTruncated(truncated);
      // Mirror the customer ids into the store so other views (ContextChip,
      // CustomerView) and the de-dupe logic stay consistent.
      setCustomers(
        grouped.map((w) => ({
          id: w.customerId,
          name: shortenId(w.customerId),
          accountId: w.accountId,
          status: "Active",
        })),
      );
    } catch (err) {
      if (seq !== fetchSeq.current) return;
      reporter.status(
        err instanceof Error ? err.message : "Couldn't load customers.",
        "error",
      );
    } finally {
      if (seq === fetchSeq.current) setLoading(false);
    }
  }, [platformAuth, reporter, setCustomers]);

  // Fetch on connect (and clear when disconnected).
  useEffect(() => {
    if (connected) {
      void refresh();
    } else {
      fetchSeq.current++;
      setWallets([]);
      setTruncated(false);
      setCustomers([]);
    }
    // setCustomers is stable per the store contract; refresh changes with auth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, refresh]);

  function actAs(wallet: CustomerWallet) {
    // The grouped fetch already carried the wallet account id, so we scope the
    // Customer view directly — no per-customer fetch.
    const customer: ActiveCustomer = {
      id: wallet.customerId,
      name: shortenId(wallet.customerId) || "Customer",
      accountId: wallet.accountId,
      status: "Active",
    };
    setActiveCustomer(customer);
    setPersona("customer");
  }

  const subtitle = buildSubtitle({
    connected,
    loading,
    shown: wallets.length,
    truncated,
  });

  return (
    <Card.Root variant="structured">
      <Card.Header>
        <HeaderLayout>
          <Card.TitleGroup>
            <Card.Title>Customers</Card.Title>
            <Card.Subtitle>{subtitle}</Card.Subtitle>
          </Card.TitleGroup>
          <CreateCustomer onCreated={() => void refresh()} />
        </HeaderLayout>
      </Card.Header>

      <Card.Body fullwidth>
        {wallets.length === 0 ? (
          <Empty>
            {connected ? (
              <>
                <EmptyTitle>
                  {loading ? "Loading customers…" : "No customers yet"}
                </EmptyTitle>
                <EmptyBody>
                  {loading
                    ? "Fetching this platform's customer wallets from the Grid API."
                    : "Create your first customer to provision a wallet and act as them."}
                </EmptyBody>
              </>
            ) : (
              <>
                <EmptyTitle>Connect to get started</EmptyTitle>
                <EmptyBody>
                  Add your platform credentials above to list your customers.
                </EmptyBody>
              </>
            )}
          </Empty>
        ) : (
          <Table.Root>
            <Table.Header>
              <Table.HeaderRow>
                <Table.HeaderCell>Customer</Table.HeaderCell>
                <Table.HeaderCell>
                  <RightAlign>Balance</RightAlign>
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <RightAlign>Action</RightAlign>
                </Table.HeaderCell>
              </Table.HeaderRow>
            </Table.Header>
            <Table.Body>
              {wallets.map((wallet) => (
                <Table.Row key={wallet.customerId}>
                  <Table.Cell>
                    <NameCell>
                      <Avatar aria-hidden>{initials(wallet.customerId)}</Avatar>
                      <CustomerId title={wallet.customerId}>
                        {shortenId(wallet.customerId)}
                      </CustomerId>
                    </NameCell>
                  </Table.Cell>
                  <Table.Cell>
                    <RightAlign>
                      <BalanceText>
                        {formatMoney(wallet.amount, wallet.currency)}
                      </BalanceText>
                    </RightAlign>
                  </Table.Cell>
                  <Table.Cell>
                    <RightAlign>
                      <ActionGroup>
                        <FundCustomer
                          customer={{
                            id: wallet.customerId,
                            name: shortenId(wallet.customerId),
                            accountId: wallet.accountId,
                          }}
                          destinationAccountId={wallet.accountId}
                          currency={wallet.currency}
                          onFunded={() => void refresh()}
                        />
                        <Button
                          variant="outline"
                          size="compact"
                          onClick={() => actAs(wallet)}
                        >
                          Act as
                        </Button>
                      </ActionGroup>
                    </RightAlign>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Card.Body>
    </Card.Root>
  );
}

/** Subtitle: connect prompt, loading, or a "showing N" summary. */
function buildSubtitle(args: {
  connected: boolean;
  loading: boolean;
  shown: number;
  truncated: boolean;
}): string {
  const { connected, loading, shown, truncated } = args;
  if (!connected) return "Connect your platform credentials to list customers.";
  if (shown === 0)
    return loading ? "Loading customers…" : "Customers you create appear here.";
  if (truncated) return `Showing ${shown} customers (more available).`;
  return `${shown} customer${shown === 1 ? "" : "s"}.`;
}

/** Shorten an LSID for display: keep the prefix and the last few id chars. */
function shortenId(id: string): string {
  if (!id) return "";
  const [prefix, rest] = id.includes(":") ? id.split(/:(.*)/s) : ["", id];
  const tail = rest.length > 8 ? `…${rest.slice(-6)}` : rest;
  return prefix ? `${prefix}:${tail}` : tail;
}

/** First letters of the last id segment, uppercased. */
function initials(id: string): string {
  const rest = id.includes(":") ? id.slice(id.indexOf(":") + 1) : id;
  const trimmed = rest.replace(/[^a-zA-Z0-9]/g, "");
  if (!trimmed) return "?";
  return trimmed.slice(0, 2).toUpperCase();
}

const HeaderLayout = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md, 16px);
  width: 100%;
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

const NameCell = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
  min-width: 0;
`;

const Avatar = styled.span`
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: var(--font-weight-semibold, 600);
  letter-spacing: 0.3px;
  /* Pair with --surface-inverse: both flip by mode (dark surface + light text
   * in light mode, light surface + dark text in dark mode). --text-on-primary
   * was undefined and fell back to #fff, going white-on-near-white in dark. */
  color: var(--text-inverse, #f8f8f7);
  background: var(--surface-inverse, #1a1a1a);
`;

const CustomerId = styled.span`
  font-size: var(--font-size-sm, 13px);
  color: var(--text-primary, #1a1a1a);
  font-variant-numeric: tabular-nums;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BalanceText = styled.span`
  font-size: var(--font-size-sm, 13px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-primary, #1a1a1a);
  font-variant-numeric: tabular-nums;
`;

const RightAlign = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ActionGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
`;
