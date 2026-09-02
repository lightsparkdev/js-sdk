import styled from "@emotion/styled";
import { Badge, Button, Card, Tabs } from "@lightsparkdev/origin";
import { useCallback, useEffect, useState } from "react";

import { RawExpander } from "../../components/RawExpander";
import { fetchBalance } from "../../flows/customer";
import { currencyCode, formatMoney } from "../../lib/format-money";
import { useAppState } from "../../state/store";
import { Activity } from "./Activity";
import { Fund } from "./Fund";
import { Pay } from "./Pay";
import { Settings } from "./Settings";
import { Transactions } from "./Transactions";

type Section =
  | "wallet"
  | "fund"
  | "pay"
  | "activity"
  | "transactions"
  | "settings";

const SECTIONS: { value: Section; label: string }[] = [
  { value: "wallet", label: "Wallet" },
  { value: "fund", label: "Fund" },
  { value: "pay", label: "Pay" },
  { value: "activity", label: "Activity" },
  { value: "transactions", label: "Transactions" },
  { value: "settings", label: "Settings" },
];

export interface AccountBalance {
  id: unknown;
  /** Currency metadata `{ code, name, symbol, decimals }` from `balance.currency`. */
  currency: unknown;
  /** Amount in minor units (per `currency.decimals`). */
  balance: number;
}

/**
 * Wallet home (logged-in state). The consumer surface for the active customer:
 * a balance hero + account list, with tab navigation into Fund / Pay / Activity
 * / Settings. Balance comes from `fetchBalance` (real GET) scoped to the active
 * customer; the money + settings flows act on the customer's `accountId` and
 * the live session established at login.
 */
export function WalletHome() {
  const { activeCustomer, platformAuth, reporter, signOut } = useAppState();
  const [section, setSection] = useState<Section>("wallet");
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [rawBalance, setRawBalance] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const customerId = activeCustomer?.id ?? "";

  const refresh = useCallback(async () => {
    if (!platformAuth || !customerId) return;
    setLoading(true);
    try {
      const { rows, raw } = await fetchBalance(
        reporter,
        platformAuth,
        customerId,
      );
      setAccounts(rows);
      setRawBalance(raw);
    } catch (err) {
      reporter.status(
        err instanceof Error ? err.message : "Couldn't load balance.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [platformAuth, customerId, reporter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const primary = accounts[0];

  return (
    <Stack>
      <HeroCard variant="structured">
        <Card.Body>
          <HeroTop>
            <div>
              <HeroLabel>Total balance</HeroLabel>
              <HeroAmount>
                {primary ? formatMoney(primary.balance, primary.currency) : "—"}
              </HeroAmount>
            </div>
            <Button
              variant="outline"
              size="compact"
              onClick={() => void refresh()}
              loading={loading}
            >
              Refresh
            </Button>
          </HeroTop>

          <Accounts>
            {accounts.length === 0 ? (
              <EmptyAccounts>
                {loading
                  ? "Loading accounts…"
                  : "No accounts found for this customer."}
              </EmptyAccounts>
            ) : (
              accounts.map((a, i) => (
                <AccountRow key={String(a.id) || i}>
                  <AccountLeft>
                    <CurrencyBadge
                      variant={i === 0 ? "blue" : "gray"}
                      vibrant={i === 0}
                    >
                      {currencyCode(a.currency) || "—"}
                    </CurrencyBadge>
                    <AccountId title={String(a.id)}>{String(a.id)}</AccountId>
                  </AccountLeft>
                  <AccountBalanceText>
                    {formatMoney(a.balance, a.currency)}
                  </AccountBalanceText>
                </AccountRow>
              ))
            )}
          </Accounts>

          <RawExpander value={rawBalance} label="Raw balance response" />
        </Card.Body>
        <Card.Footer>
          <FooterRow>
            <Button
              variant="filled"
              size="compact"
              onClick={() => setSection("fund")}
            >
              Fund
            </Button>
            <Button
              variant="outline"
              size="compact"
              onClick={() => setSection("pay")}
            >
              Pay
            </Button>
            <Spacer />
            <Button variant="ghost" size="compact" onClick={() => signOut()}>
              Sign out
            </Button>
          </FooterRow>
        </Card.Footer>
      </HeroCard>

      <Nav>
        <Tabs.Root
          value={section}
          onValueChange={(v) => setSection(v as Section)}
        >
          <Tabs.List variant="default">
            {SECTIONS.map(({ value, label }) => (
              <Tabs.Tab key={value} value={value}>
                {label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.Root>
      </Nav>

      {section === "wallet" && <WalletOverview />}
      {section === "fund" && (
        <Fund accounts={accounts} onDone={() => void refresh()} />
      )}
      {section === "pay" && (
        <Pay accounts={accounts} onDone={() => void refresh()} />
      )}
      {section === "activity" && <Activity />}
      {section === "transactions" && <Transactions />}
      {section === "settings" && <Settings accounts={accounts} />}
    </Stack>
  );
}

/** The "Wallet" tab body: a short orientation card + recent activity preview. */
function WalletOverview() {
  return (
    <Card.Root variant="structured">
      <Card.Header>
        <Card.TitleGroup>
          <Card.Title>Recent activity</Card.Title>
          <Card.Subtitle>
            Funding, payments, and session events from this session.
          </Card.Subtitle>
        </Card.TitleGroup>
      </Card.Header>
      <Card.Body fullwidth>
        <Activity compact />
      </Card.Body>
    </Card.Root>
  );
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 24px);
`;

const HeroCard = styled(Card.Root)`
  background: linear-gradient(
    160deg,
    var(--surface-primary, #fff) 0%,
    color-mix(
        in srgb,
        var(--brand-blue, #2563eb) 5%,
        var(--surface-primary, #fff)
      )
      100%
  );
`;

const HeroTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md, 16px);
  margin-bottom: var(--spacing-lg, 24px);
`;

const HeroLabel = styled.div`
  font-size: var(--font-size-xs, 12px);
  font-weight: var(--font-weight-medium, 500);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-tertiary, #8a8a8a);
  margin-bottom: var(--spacing-2xs, 6px);
`;

const HeroAmount = styled.div`
  font-size: 38px;
  font-weight: var(--font-weight-semibold, 600);
  letter-spacing: -0.5px;
  color: var(--text-primary, #1a1a1a);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
`;

const Accounts = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs, 6px);
`;

const EmptyAccounts = styled.div`
  font-size: var(--font-size-sm, 13px);
  color: var(--text-tertiary, #8a8a8a);
  padding: var(--spacing-sm, 12px) 0;
`;

const AccountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md, 16px);
  padding: var(--spacing-sm, 12px) 0;
  border-top: var(--stroke-xs, 1px) solid var(--border-primary, #e6e6e9);

  &:first-of-type {
    border-top: none;
  }
`;

const AccountLeft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
  min-width: 0;
`;

const CurrencyBadge = styled(Badge)`
  font-variant-numeric: tabular-nums;
`;

const AccountId = styled.span`
  font-size: var(--font-size-xs, 11px);
  color: var(--text-tertiary, #8a8a8a);
  font-variant-numeric: tabular-nums;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AccountBalanceText = styled.span`
  font-size: var(--font-size-sm, 13px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-primary, #1a1a1a);
  font-variant-numeric: tabular-nums;
`;

const FooterRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
  width: 100%;
`;

const Spacer = styled.div`
  flex: 1;
`;

const Nav = styled.div`
  display: flex;
`;
