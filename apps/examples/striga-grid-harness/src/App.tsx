import styled from "@emotion/styled";
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
  Switch,
  Table,
  Textarea,
} from "@lightsparkdev/origin";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  callGrid,
  loadCreds,
  nowTs,
  parseJsonField,
  type HarnessCreds,
  type HttpMethod,
  type LogEntry,
} from "./api";

interface AccountRow {
  currency: string;
  balance: string;
  id: string;
  status: string;
}

const POLL_INTERVAL_MS = 5000;

export function App() {
  const [creds, setCreds] = useState<HarnessCreds>({});
  const [credsError, setCredsError] = useState<string | null>(null);

  const [customerIds, setCustomerIds] = useState<string[]>([]);
  const [activeCustomer, setActiveCustomer] = useState("");

  const [createBody, setCreateBody] = useState("");
  const [quoteSource, setQuoteSource] = useState("");
  const [quoteBody, setQuoteBody] = useState("");
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [fundAccount, setFundAccount] = useState("");
  const [fundBody, setFundBody] = useState("");
  const [transferBody, setTransferBody] = useState("");
  const [confirmCode, setConfirmCode] = useState("123456");

  const [accounts, setAccounts] = useState<AccountRow[] | null>(null);
  const [stateNote, setStateNote] = useState("");
  const [poll, setPoll] = useState(false);

  const [log, setLog] = useState<LogEntry[]>([]);

  const appendLog = useCallback((entry: LogEntry) => {
    setLog((prev) => [entry, ...prev]);
  }, []);

  const call = useCallback(
    <T,>(method: HttpMethod, path: string, body?: unknown) =>
      callGrid<T>(method, path, body, appendLog),
    [appendLog],
  );

  // Keep a ref to the active customer so the polling interval always reads the
  // latest value without re-subscribing on every change.
  const activeCustomerRef = useRef(activeCustomer);
  activeCustomerRef.current = activeCustomer;

  const addCustomerId = useCallback((id: string) => {
    setCustomerIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveCustomer(id);
  }, []);

  /* ---- State panel ---- */
  const refreshState = useCallback(
    async (cidArg?: string) => {
      const cid = cidArg ?? activeCustomerRef.current;
      if (!cid) {
        setAccounts(null);
        setStateNote("no active customer");
        return;
      }
      const r = await call(
        "GET",
        "/grid/rc/customers/internal-accounts?customerId=" +
          encodeURIComponent(cid),
      );
      setAccounts(parseAccounts(r.json));
      setStateNote(`updated ${nowTs()} · customer ${cid}`);
    },
    [call],
  );

  /* ---- Bootstrap ---- */
  useEffect(() => {
    void (async () => {
      let loaded: HarnessCreds = {};
      try {
        loaded = await loadCreds();
      } catch (err) {
        setCredsError(err instanceof Error ? err.message : String(err));
      }
      setCreds(loaded);
      if (loaded.customer_id) {
        setCustomerIds([loaded.customer_id]);
        setActiveCustomer(loaded.customer_id);
      }
      prefill(loaded, {
        setCreateBody,
        setQuoteSource,
        setQuoteBody,
        setFundAccount,
        setFundBody,
        setTransferBody,
      });
      if (loaded.customer_id) void refreshState(loaded.customer_id);
    })();
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Polling ---- */
  useEffect(() => {
    if (!poll) return;
    void refreshState();
    const t = setInterval(() => void refreshState(), POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [poll, refreshState]);

  /* ---- Actions ---- */
  const listCustomers = useCallback(async () => {
    const r = await call("GET", "/grid/rc/customers");
    if (r.json) {
      for (const id of extractCustomerIds(r.json)) addCustomerId(id);
      // Restore selection to the creds customer if present.
      if (creds.customer_id) setActiveCustomer(creds.customer_id);
    }
  }, [call, addCustomerId, creds.customer_id]);

  const createCustomer = useCallback(async () => {
    const r = await call<Record<string, string>>(
      "POST",
      "/grid/rc/customers",
      parseJsonField(createBody),
    );
    const j = r.json;
    const id = j && (j.id || j.customerId || j.customer_id);
    if (id) addCustomerId(id);
    void refreshState();
  }, [call, createBody, addCustomerId, refreshState]);

  const createQuote = useCallback(async () => {
    const r = await call<Record<string, string>>(
      "POST",
      "/grid/rc/quotes",
      parseJsonField(quoteBody),
    );
    const j = r.json;
    const id = j && (j.id || j.quoteId || j.quote_id);
    if (id) setQuoteId(id);
  }, [call, quoteBody]);

  const executeQuote = useCallback(async () => {
    if (!quoteId) return;
    await call(
      "POST",
      `/grid/rc/quotes/${encodeURIComponent(quoteId)}/execute`,
    );
    void refreshState();
  }, [call, quoteId, refreshState]);

  const sandboxFund = useCallback(async () => {
    const acct = fundAccount.trim();
    if (!acct) return;
    await call(
      "POST",
      `/grid/rc/sandbox/internal-accounts/${encodeURIComponent(acct)}/fund`,
      parseJsonField(fundBody),
    );
    void refreshState();
  }, [call, fundAccount, fundBody, refreshState]);

  const transferOut = useCallback(async () => {
    await call("POST", "/grid/rc/transfer-out", parseJsonField(transferBody));
    void refreshState();
  }, [call, transferBody, refreshState]);

  const custPath = useCallback(
    (suffix: string) =>
      `/grid/rc/customers/${encodeURIComponent(activeCustomer)}${suffix}`,
    [activeCustomer],
  );

  const onboardingActions = useMemo(
    () => ({
      kycLink: () => void call("POST", custPath("/kyc-link")),
      verifyEmail: () => void call("POST", custPath("/verify-email")),
      confirmEmail: () =>
        void call("POST", custPath("/verify-email/confirm"), {
          code: confirmCode.trim(),
        }),
      verifyPhone: () => void call("POST", custPath("/verify-phone")),
      confirmPhone: () =>
        void call("POST", custPath("/verify-phone/confirm"), {
          code: confirmCode.trim(),
        }),
    }),
    [call, custPath, confirmCode],
  );

  return (
    <Page>
      <TopBar>
        <TopTitle>Striga Grid Harness</TopTitle>
        <Meta>
          <MetaItem label="platform" value={creds.platform_id} />
          <MetaItem label="customer" value={creds.customer_id} />
          <MetaItem label="uma" value={creds.customer_uma} />
          <MetaItem label="base" value={creds.base_url} />
        </Meta>
      </TopBar>

      {credsError && (
        <Alert
          variant="critical"
          title="Could not load /harness/creds"
          description={`${credsError}. The .grid-creds.json file may be missing — panels still work but fields are not prefilled.`}
        />
      )}

      <Layout>
        {/* LEFT: flows */}
        <Col>
          <Panel
            title="1 · Customers"
            subtitle="List existing customers or create a new individual."
          >
            <ButtonRow>
              <Button variant="secondary" onClick={() => void listCustomers()}>
                List customers
              </Button>
            </ButtonRow>
            <Field.Root>
              <Field.Label>Active customer (used by other panels)</Field.Label>
              <CustomerSelect
                value={activeCustomer}
                onValueChange={setActiveCustomer}
                ids={customerIds}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>
                Create individual customer — POST /grid/rc/customers
              </Field.Label>
              <Textarea
                rows={11}
                value={createBody}
                onChange={(e) => setCreateBody(e.target.value)}
              />
            </Field.Root>
            <ButtonRow>
              <Button onClick={() => void createCustomer()}>
                Create individual customer
              </Button>
            </ButtonRow>
          </Panel>

          <Panel
            title="3 · Quotes + execute"
            subtitle="Create a quote, then execute it."
          >
            <Field.Root>
              <Field.Label>Source account id</Field.Label>
              <Input
                value={quoteSource}
                onChange={(e) => setQuoteSource(e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>
                Quote request body — POST /grid/rc/quotes
              </Field.Label>
              <Textarea
                rows={11}
                value={quoteBody}
                onChange={(e) => setQuoteBody(e.target.value)}
              />
            </Field.Root>
            <ButtonRow>
              <Button onClick={() => void createQuote()}>Create quote</Button>
              <Button
                variant="secondary"
                disabled={!quoteId}
                onClick={() => void executeQuote()}
              >
                Execute quote
              </Button>
            </ButtonRow>
            <Note>
              Current quote id: <Mono>{quoteId ?? "—"}</Mono>
            </Note>
          </Panel>

          <Panel
            title="4 · Deposits"
            subtitle="Sandbox shortcut to simulate an inbound deposit."
            badge={<Badge variant="sky">sandbox fund</Badge>}
          >
            <Row>
              <Field.Root>
                <Field.Label>Account id</Field.Label>
                <Input
                  value={fundAccount}
                  onChange={(e) => setFundAccount(e.target.value)}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>Fund body</Field.Label>
                <Textarea
                  rows={4}
                  value={fundBody}
                  onChange={(e) => setFundBody(e.target.value)}
                />
              </Field.Root>
            </Row>
            <ButtonRow>
              <Button onClick={() => void sandboxFund()}>Sandbox fund</Button>
            </ButtonRow>
            <Note>
              Real deposits arrive via Striga webhook → ngrok → balance update.
              This button credits the path account, then refreshes balances.
            </Note>
          </Panel>

          <Panel
            title="5 · Withdrawals"
            subtitle="Transfer out to an external account."
          >
            <Field.Root>
              <Field.Label>
                Transfer-out body — POST /grid/rc/transfer-out
              </Field.Label>
              <Textarea
                rows={11}
                value={transferBody}
                onChange={(e) => setTransferBody(e.target.value)}
              />
            </Field.Root>
            <ButtonRow>
              <Button onClick={() => void transferOut()}>Transfer out</Button>
            </ButtonRow>
          </Panel>

          <Panel
            title="6 · Onboarding"
            subtitle="All actions target the active customer id."
          >
            <SectionLabel>KYC</SectionLabel>
            <ButtonRow>
              <Button variant="secondary" onClick={onboardingActions.kycLink}>
                KYC link
              </Button>
            </ButtonRow>
            <SectionLabel>Email verification</SectionLabel>
            <ButtonRow>
              <Button variant="outline" onClick={onboardingActions.verifyEmail}>
                verify-email
              </Button>
              <Button
                variant="outline"
                onClick={onboardingActions.confirmEmail}
              >
                verify-email/confirm
              </Button>
            </ButtonRow>
            <SectionLabel>Phone verification</SectionLabel>
            <ButtonRow>
              <Button variant="outline" onClick={onboardingActions.verifyPhone}>
                verify-phone
              </Button>
              <Button
                variant="outline"
                onClick={onboardingActions.confirmPhone}
              >
                verify-phone/confirm
              </Button>
            </ButtonRow>
            <Field.Root>
              <Field.Label>
                Confirm code (used by both confirm calls)
              </Field.Label>
              <Input
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
              />
            </Field.Root>
          </Panel>
        </Col>

        {/* RIGHT: state + log */}
        <Col>
          <Sticky>
            <Panel
              title="2 · State — internal accounts"
              badge={
                <PollToggle>
                  <span>poll 5s</span>
                  <Switch checked={poll} onCheckedChange={setPoll} />
                </PollToggle>
              }
            >
              <ButtonRow>
                <Button variant="secondary" onClick={() => void refreshState()}>
                  Refresh
                </Button>
              </ButtonRow>
              <StateTable accounts={accounts} />
              {stateNote && <Note>{stateNote}</Note>}
            </Panel>

            <Panel
              title="Request / response log"
              subtitle="Newest first."
              badge={
                <Button
                  variant="ghost"
                  size="compact"
                  onClick={() => setLog([])}
                  disabled={log.length === 0}
                >
                  Clear
                </Button>
              }
            >
              <RequestLog entries={log} />
            </Panel>
          </Sticky>
        </Col>
      </Layout>
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponents                                                       */
/* ------------------------------------------------------------------ */

function Panel({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card.Root variant="structured">
      <Card.Header>
        <Card.TitleGroup>
          <PanelTitleRow>
            <Card.Title>{title}</Card.Title>
            {badge}
          </PanelTitleRow>
          {subtitle && <Card.Subtitle>{subtitle}</Card.Subtitle>}
        </Card.TitleGroup>
      </Card.Header>
      <Card.Body>
        <PanelBody>{children}</PanelBody>
      </Card.Body>
    </Card.Root>
  );
}

function MetaItem({ label, value }: { label: string; value?: string }) {
  return (
    <MetaKv>
      <span>{label}</span>
      <Mono>{value || "—"}</Mono>
    </MetaKv>
  );
}

function CustomerSelect({
  value,
  onValueChange,
  ids,
}: {
  value: string;
  onValueChange: (next: string) => void;
  ids: string[];
}) {
  const items = ids.length ? ids : value ? [value] : [];
  return (
    <Select.Root
      value={value}
      onValueChange={(next) => {
        if (next != null) onValueChange(String(next));
      }}
    >
      <Select.Trigger>
        <Select.Value>{(v: string) => v || "—"}</Select.Value>
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              {items.map((id) => (
                <Select.Item key={id} value={id}>
                  <Select.ItemIndicator />
                  <Select.ItemText>{id}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

function StateTable({ accounts }: { accounts: AccountRow[] | null }) {
  if (!accounts) return <Note>—</Note>;
  if (!accounts.length) return <Note>no accounts found</Note>;
  return (
    <Table.Root size="compact">
      <Table.Header>
        <Table.HeaderRow>
          <Table.HeaderCell>currency</Table.HeaderCell>
          <Table.HeaderCell>balance</Table.HeaderCell>
          <Table.HeaderCell>id</Table.HeaderCell>
          <Table.HeaderCell>status</Table.HeaderCell>
        </Table.HeaderRow>
      </Table.Header>
      <Table.Body>
        {accounts.map((a, i) => (
          <Table.Row key={a.id + i}>
            <Table.Cell>{a.currency}</Table.Cell>
            <Table.Cell>
              <Mono>{a.balance}</Mono>
            </Table.Cell>
            <Table.Cell>
              <Mono>{a.id}</Mono>
            </Table.Cell>
            <Table.Cell>
              <Badge variant="gray">{a.status}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function RequestLog({ entries }: { entries: LogEntry[] }) {
  if (!entries.length) return <EmptyLog>No requests yet.</EmptyLog>;
  return (
    <LogList>
      {entries.map((e) => (
        <LogRow key={e.id}>
          <LogHeader>
            <Badge variant={statusVariant(e)} vibrant>
              {e.method}
            </Badge>
            <LogPath>{e.path}</LogPath>
            <Badge variant={statusVariant(e)}>
              {e.error ? "ERR" : String(e.status)}
            </Badge>
          </LogHeader>
          {e.requestBody && (
            <>
              <LogSubLabel>request</LogSubLabel>
              <LogPre>{e.requestBody}</LogPre>
            </>
          )}
          <LogSubLabel>response</LogSubLabel>
          <LogPre>{e.error ?? e.responseBody}</LogPre>
          <LogTs>{e.ts}</LogTs>
        </LogRow>
      ))}
    </LogList>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function statusVariant(e: LogEntry): "green" | "yellow" | "red" | "gray" {
  if (e.error) return "red";
  const s = e.status ?? 0;
  if (s >= 200 && s < 300) return "green";
  if (s >= 400 && s < 500) return "yellow";
  if (s >= 500) return "red";
  return "gray";
}

function extractCustomerIds(data: unknown): string[] {
  const list = asArray(data, ["data", "customers", "items"]);
  const ids: string[] = [];
  for (const c of list) {
    if (c && typeof c === "object") {
      const rec = c as Record<string, string>;
      const id = rec.id || rec.customerId || rec.customer_id || rec.lsid;
      if (id) ids.push(id);
    }
  }
  return ids;
}

function parseAccounts(data: unknown): AccountRow[] | null {
  if (!data) return null;
  let accts = asArray(data, ["accounts", "internalAccounts", "data", "items"]);
  // Object keyed by currency, e.g. {EUR: {...}}.
  if (!accts.length && typeof data === "object" && !Array.isArray(data)) {
    accts = Object.entries(data as Record<string, unknown>).map(([k, v]) =>
      v && typeof v === "object"
        ? { currency: k, ...v }
        : { currency: k, balance: v },
    );
  }
  if (!accts.length) return [];
  return accts.map((raw) => {
    const a = raw as Record<string, unknown>;
    // Grid returns balance as { amount, currency: { code } }; fall back to
    // flatter shapes for other endpoints.
    const balObj =
      a.balance && typeof a.balance === "object"
        ? (a.balance as { amount?: unknown; currency?: { code?: string } })
        : null;
    const currency = String(
      a.currency || a.asset || a.ticker || balObj?.currency?.code || "?",
    );
    let balance: string;
    if (balObj && balObj.amount !== undefined) {
      balance = String(balObj.amount);
    } else {
      const balanceRaw =
        a.balance ?? a.availableBalance ?? a.amount ?? a.balances ?? "—";
      balance =
        typeof balanceRaw === "string"
          ? balanceRaw
          : JSON.stringify(balanceRaw);
    }
    return {
      currency,
      balance,
      id: String(a.id || a.accountId || a.account_id || "—"),
      status: String(a.status || a.state || "—"),
    };
  });
}

// Return the first array found: the value itself, or one of the named keys.
function asArray(data: unknown, keys: string[]): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    for (const k of keys) {
      const v = (data as Record<string, unknown>)[k];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

function prefill(
  creds: HarnessCreds,
  set: {
    setCreateBody: (v: string) => void;
    setQuoteSource: (v: string) => void;
    setQuoteBody: (v: string) => void;
    setFundAccount: (v: string) => void;
    setFundBody: (v: string) => void;
    setTransferBody: (v: string) => void;
  },
) {
  const accounts = creds.accounts || {};
  const eur = accounts.EUR || "<EUR-account-id>";
  const btc = accounts.BITCOIN || "<BITCOIN-account-id>";

  set.setCreateBody(
    JSON.stringify(
      {
        customerType: "INDIVIDUAL",
        // Grid validates email deliverability (MX lookup), so use a real-MX domain.
        email: "gridharness" + Date.now() + "@gmail.com",
        // Striga requires a phone number for user creation; must be E.164.
        phoneNumber: "+4915123456789",
        fullName: "Harness Test User",
        region: "DE",
        currencies: ["EUR"],
        birthDate: "1990-01-01",
        nationality: "DE",
        // Striga validates the address on user creation; supply a complete one.
        address: {
          line1: "Friedrichstrasse 123",
          city: "Berlin",
          postalCode: "10117",
          country: "DE",
        },
      },
      null,
      2,
    ),
  );

  set.setQuoteSource(eur);
  set.setQuoteBody(
    JSON.stringify(
      {
        source: { sourceType: "ACCOUNT", accountId: eur },
        destination: { destinationType: "ACCOUNT", accountId: btc },
        lockedCurrencySide: "SENDING",
        lockedCurrencyAmount: 5000,
      },
      null,
      2,
    ),
  );

  set.setFundAccount(eur);
  set.setFundBody(JSON.stringify({ amount: 5000 }, null, 2));

  set.setTransferBody(
    JSON.stringify(
      {
        source: { accountId: eur },
        destination: { accountId: "<external-account-id>" },
        amount: 1000,
        remittanceInformation: "harness test",
      },
      null,
      2,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Styled layout primitives (origin tokens)                            */
/* ------------------------------------------------------------------ */

const Page = styled.div`
  min-height: 100vh;
  background: var(--surface-base, #f5f5f7);
  padding: var(--spacing-lg, 20px);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
  font-family: var(--font-family-sans);
  color: var(--text-primary);
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  gap: var(--spacing-xl, 24px);
  flex-wrap: wrap;
  padding: var(--spacing-sm, 12px) var(--spacing-md, 16px);
  background: var(--surface-primary, #fff);
  border: var(--stroke-xs, 1px) solid var(--border-primary, #e0e0e0);
  border-radius: var(--corner-radius-lg, 12px);
`;

const TopTitle = styled.h1`
  margin: 0;
  font-size: var(--font-size-lg, 16px);
  font-weight: var(--font-weight-semibold, 600);
  letter-spacing: var(--font-tracking-tight, -0.4px);
`;

const Meta = styled.div`
  display: flex;
  gap: var(--spacing-lg, 20px);
  flex-wrap: wrap;
  margin-left: auto;
`;

const MetaKv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary, #666);

  span {
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 10px;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(420px, 1fr) minmax(440px, 1fr);
  gap: var(--spacing-md, 16px);
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
  min-width: 0;
`;

const Sticky = styled.div`
  position: sticky;
  top: var(--spacing-md, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
`;

const PanelBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 12px);
`;

const PanelTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
  width: 100%;

  > *:last-child {
    margin-left: auto;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm, 12px);
  align-items: start;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: var(--spacing-xs, 8px);
  flex-wrap: wrap;
`;

const SectionLabel = styled.div`
  margin-top: var(--spacing-2xs, 6px);
  font-size: var(--font-size-xs, 12px);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-secondary, #666);
  font-weight: var(--font-weight-medium, 500);
`;

const Note = styled.div`
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary, #666);
  line-height: 1.5;
`;

const Mono = styled.span`
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs, 12px);
  word-break: break-all;
  color: var(--text-primary);
`;

const PollToggle = styled.label`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 8px);
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary, #666);
`;

const LogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 12px);
  max-height: 70vh;
  overflow-y: auto;
`;

const LogRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3xs, 4px);
  padding-bottom: var(--spacing-sm, 12px);
  border-bottom: var(--stroke-xs, 1px) solid var(--border-primary, #eee);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const LogHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 8px);
  flex-wrap: wrap;
`;

const LogPath = styled.span`
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs, 12px);
  color: var(--text-primary);
  flex: 1;
  word-break: break-all;
`;

const LogSubLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-tertiary, #999);
`;

const LogPre = styled.pre`
  margin: 0;
  padding: var(--spacing-xs, 8px);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs, 11px);
  white-space: pre-wrap;
  word-break: break-word;
  background: var(--surface-secondary, #f5f5f5);
  border-radius: var(--corner-radius-sm, 6px);
  max-height: 340px;
  overflow: auto;
`;

const LogTs = styled.span`
  font-family: var(--font-family-mono);
  font-size: 10px;
  color: var(--text-tertiary, #999);
`;

const EmptyLog = styled.div`
  color: var(--text-tertiary, #999);
  font-size: var(--font-size-xs, 13px);
  padding: var(--spacing-sm, 12px) 0;
`;
