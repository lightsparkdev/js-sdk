import styled from "@emotion/styled";
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
  Tabs,
} from "@lightsparkdev/origin";
import { useCallback, useEffect, useRef, useState } from "react";

import { type ApiAuth, resolveMode } from "../../api-client";
import { DismissibleAlert } from "../../components/DismissibleAlert";
import { RawExpander } from "../../components/RawExpander";
import type { Mode } from "../../config";
import {
  listPlatformFundingAccounts,
  type PlatformFundingAccount,
} from "../../flows/customer";
import { formatMoney } from "../../lib/format-money";
import { useAppState } from "../../state/store";

/** Funding-account picker state: loading the list, resolved, or fetch failed. */
type FundingState =
  | { kind: "loading" }
  | { kind: "ready"; accounts: PlatformFundingAccount[] }
  | { kind: "error"; message: string };

/**
 * Platform config / auth panel — the entry point for the whole Platform view.
 *
 * Captures the platform API credentials (`clientId` / `clientSecret`) and the
 * target `mode`, then stores them in app state as `platformAuth`. Until that's
 * set, nothing else on the platform side can run (the decoupled flows all take
 * an `ApiAuth` argument). Shows live connection status: disconnected when no
 * auth is held, connected (with a masked summary) once it is.
 */
export function Config() {
  const {
    platformAuth,
    setPlatformAuth,
    platformFundingAccountId,
    setPlatformFundingAccountId,
    reporter,
  } = useAppState();
  const connected = platformAuth !== null;

  // Local draft so the operator can edit credentials without clobbering the
  // live connection mid-keystroke; committed to the store on "Connect".
  const [clientId, setClientId] = useState(platformAuth?.clientId ?? "");
  const [clientSecret, setClientSecret] = useState(
    platformAuth?.clientSecret ?? "",
  );
  const [mode, setMode] = useState<Mode>(platformAuth?.mode ?? "sandbox");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The funding account is chosen — not pasted — from the platform's own funding
  // pool, listed via `GET /platform/internal-accounts` once connected.
  const [funding, setFunding] = useState<FundingState>({ kind: "loading" });
  // Guards against a stale fetch (after disconnect/reconnect) clobbering a newer one.
  const fundingSeq = useRef(0);

  const loadFundingAccounts = useCallback(async () => {
    if (!platformAuth) return;
    const seq = ++fundingSeq.current;
    setFunding({ kind: "loading" });
    try {
      const { accounts } = await listPlatformFundingAccounts(
        reporter,
        platformAuth,
      );
      if (seq !== fundingSeq.current) return; // superseded
      setFunding({ kind: "ready", accounts });
    } catch (err) {
      if (seq !== fundingSeq.current) return;
      setFunding({
        kind: "error",
        message: err instanceof Error ? err.message : "Couldn't load accounts.",
      });
    }
  }, [platformAuth, reporter]);

  // Fetch the funding pool on connect; clear it when disconnected.
  useEffect(() => {
    if (connected) {
      void loadFundingAccounts();
    } else {
      fundingSeq.current++;
      setFunding({ kind: "loading" });
    }
  }, [connected, loadFundingAccounts]);

  function connect() {
    const id = clientId.trim();
    const secret = clientSecret.trim();
    if (!id || !secret) {
      setError("Both a client ID and a client secret are required to connect.");
      return;
    }
    setError(null);
    const auth: ApiAuth = { clientId: id, clientSecret: secret, mode };
    setPlatformAuth(auth);
    setEditing(false);
  }

  function disconnect() {
    setPlatformAuth(null);
    setPlatformFundingAccountId("");
    setClientSecret("");
    setEditing(false);
    setError(null);
  }

  return (
    <Card.Root variant="structured">
      <Card.Header>
        <Card.TitleGroup>
          <EyebrowRow>
            <Badge variant="purple" vibrant>
              Platform
            </Badge>
            <StatusBadge
              variant={connected ? "green" : "gray"}
              vibrant={connected}
            >
              <StatusDot data-connected={connected} aria-hidden />
              {connected ? "Connected" : "Not connected"}
            </StatusBadge>
          </EyebrowRow>
          <Card.Title>Platform configuration</Card.Title>
          <Card.Subtitle>
            Connect with your Grid platform API credentials. These authenticate
            every platform-side request — creating customers, reading config —
            and never leave the browser.
          </Card.Subtitle>
        </Card.TitleGroup>
      </Card.Header>

      <Card.Body>
        {connected && !editing ? (
          <Summary>
            <SummaryGrid>
              <SummaryItem>
                <SummaryLabel>Client ID</SummaryLabel>
                <SummaryValue>{maskMiddle(platformAuth.clientId)}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Client secret</SummaryLabel>
                <SummaryValue>••••••••••••</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Mode</SummaryLabel>
                <SummaryValue>
                  <Badge
                    variant={
                      platformAuth.mode === "production" ? "yellow" : "sky"
                    }
                  >
                    {platformAuth.mode}
                  </Badge>
                </SummaryValue>
              </SummaryItem>
            </SummaryGrid>

            <FundingPicker
              state={funding}
              selectedId={platformFundingAccountId}
              onSelect={setPlatformFundingAccountId}
              onRetry={() => void loadFundingAccounts()}
            />

            <RawExpander
              value={{
                clientId: platformAuth.clientId,
                clientSecret: "••••••••••••",
                mode: platformAuth.mode,
                platformFundingAccountId: platformFundingAccountId || null,
              }}
              label="Raw connection"
            />
          </Summary>
        ) : (
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              connect();
            }}
          >
            {error && (
              <DismissibleAlert
                variant="critical"
                title="Can't connect"
                description={error}
                onClose={() => setError(null)}
              />
            )}

            <Field.Root>
              <Field.Label>Client ID</Field.Label>
              <Input
                value={clientId}
                placeholder="grid_platform_…"
                autoComplete="off"
                onChange={(e) => setClientId(e.target.value)}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Client secret</Field.Label>
              <Input
                type="password"
                value={clientSecret}
                placeholder="Paste your platform client secret"
                autoComplete="off"
                onChange={(e) => setClientSecret(e.target.value)}
              />
              <Field.Description>
                Stored only in this tab's memory for the session.
              </Field.Description>
            </Field.Root>

            <Field.Root>
              <Field.Label>Mode</Field.Label>
              <Tabs.Root
                value={mode}
                onValueChange={(value) => setMode(resolveMode(value))}
              >
                <Tabs.List variant="default">
                  <Tabs.Tab value="sandbox">Sandbox</Tabs.Tab>
                  <Tabs.Tab value="production">Production</Tabs.Tab>
                </Tabs.List>
              </Tabs.Root>
              <Field.Description>
                Sandbox accepts magic values; production requires real
                ceremonies.
              </Field.Description>
            </Field.Root>

            <PickerNote>
              You'll pick the platform funding account from your funded accounts
              once connected.
            </PickerNote>
          </Form>
        )}
      </Card.Body>

      <Card.Footer>
        {connected && !editing ? (
          <FooterRow>
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit credentials
            </Button>
            <Button variant="ghost" onClick={disconnect}>
              Disconnect
            </Button>
          </FooterRow>
        ) : (
          <FooterRow>
            <Button variant="filled" onClick={connect}>
              {connected ? "Save & reconnect" : "Connect"}
            </Button>
            {connected && (
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            )}
          </FooterRow>
        )}
      </Card.Footer>
    </Card.Root>
  );
}

/**
 * Funding-account picker shown once connected. Lets the operator choose the
 * platform's funding source from its own funded accounts (the funding pool)
 * instead of pasting an LSID. Renders the load/empty/error states and, on
 * selection, sets `platformFundingAccountId` from the chosen account.
 */
function FundingPicker({
  state,
  selectedId,
  onSelect,
  onRetry,
}: {
  state: FundingState;
  selectedId: string;
  onSelect: (id: string) => void;
  onRetry: () => void;
}) {
  if (state.kind === "loading") {
    return (
      <PickerSection>
        <SummaryLabel>Funding account</SummaryLabel>
        <PickerNote>Loading your funded accounts…</PickerNote>
      </PickerSection>
    );
  }

  if (state.kind === "error") {
    return (
      <PickerSection>
        <SummaryLabel>Funding account</SummaryLabel>
        <Alert
          variant="critical"
          title="Couldn't load funding accounts"
          description={state.message}
        />
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </PickerSection>
    );
  }

  if (state.accounts.length === 0) {
    return (
      <PickerSection>
        <SummaryLabel>Funding account</SummaryLabel>
        <Alert
          variant="warning"
          title="No funding accounts"
          description="This platform has no funded internal accounts yet. You can still act as customers; funding a customer from the platform needs a funded source account."
        />
      </PickerSection>
    );
  }

  // Value the Select is bound to: the selected LSID, or null when none is set.
  const value = selectedId || null;

  return (
    <Field.Root>
      <Field.Label>Funding account</Field.Label>
      <Select.Root
        value={value}
        onValueChange={(next) => onSelect(typeof next === "string" ? next : "")}
      >
        <Select.Trigger>
          <Select.Value placeholder="Choose a funding account">
            {(selected) =>
              fundingOptionLabel(
                state.accounts.find((a) => a.id === selected),
                selected,
              )
            }
          </Select.Value>
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup>
              <Select.List>
                {state.accounts.map((account) => (
                  <Select.Item key={account.id} value={account.id}>
                    <Select.ItemIndicator />
                    <Select.ItemText>
                      {fundingOptionLabel(account)}
                    </Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      <Field.Description>
        Used as the source when funding a customer from the platform. Leave
        unset if you only act as customers.
      </Field.Description>
    </Field.Root>
  );
}

/**
 * Label an account option as `<short id> · <balance> <currency>`, e.g.
 * `Internal…a1b2 · 1,000.00 USD`, so it's recognizable without the operator
 * reading a raw LSID. Falls back to the raw value when the account is unknown.
 */
function fundingOptionLabel(
  account: PlatformFundingAccount | undefined,
  fallback?: string | null,
): string {
  if (!account) return fallback ?? "";
  return `${maskMiddle(account.id)} · ${formatMoney(
    account.amount,
    account.currency,
  )}`;
}

/** `grid_pl…a1b2` — keep the prefix + tail, hide the middle. */
function maskMiddle(value: string): string {
  const v = value.trim();
  if (v.length <= 10) return v;
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

const EyebrowRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs, 6px);
  margin-bottom: var(--spacing-2xs, 6px);
`;

const StatusBadge = styled(Badge)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs, 6px);
`;

const StatusDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-tertiary, #8a8a8a);

  &[data-connected="true"] {
    background: currentColor;
    box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 22%, transparent);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 24px);
`;

const Summary = styled.div`
  border: var(--stroke-xs, 1px) solid var(--border-primary, #e6e6e9);
  border-radius: var(--corner-radius-lg, 12px);
  background: var(--surface-base, #f5f5f7);
  padding: var(--spacing-md, 16px);
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--spacing-md, 16px);
  margin-bottom: var(--spacing-md, 16px);
`;

const PickerSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 12px);
  align-items: flex-start;
`;

const PickerNote = styled.span`
  font-size: var(--font-size-sm, 13px);
  color: var(--text-secondary, #5a5a5a);
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs, 6px);
  min-width: 0;
`;

const SummaryLabel = styled.span`
  font-size: var(--font-size-xs, 12px);
  font-weight: var(--font-weight-medium, 500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-tertiary, #8a8a8a);
`;

const SummaryValue = styled.span`
  font-size: var(--font-size-sm, 13px);
  color: var(--text-primary, #1a1a1a);
  font-variant-numeric: tabular-nums;
  word-break: break-all;
`;

const FooterRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
`;
