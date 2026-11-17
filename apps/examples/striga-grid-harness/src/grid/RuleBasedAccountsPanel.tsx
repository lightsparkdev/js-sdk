import { Button, Field } from "@lightsparkdev/origin";
import { useState } from "react";

import { gridPath } from "../api";
import { ButtonRow, CopyableId, EnumSelect, Note, Panel } from "../sca/ui";
import { TextField, type CallFn } from "./common";
import {
  buildRuleBasedCreateBody,
  CreateKeyStore,
  endpointUnavailable,
  gatherPages,
  summarizeRuleBasedAccounts,
  sweepsOf,
  type RuleBasedAccountRow,
  type SweepRow,
} from "./ruleBasedAccounts";

// EUR sweeps to a crypto destination; USDC and BTC sweep to an EUR destination.
const CURRENCIES = ["EUR", "USDC", "BTC"] as const;
// Passkey challenges need a WebAuthn ceremony, which this panel does not run.
const CREATE_SCA_FACTORS = ["SMS_OTP", "TOTP"] as const;

// Outlives the panel, which remounts per customer and per page visit.
const createKeys = new CreateKeyStore();

const UNAVAILABLE =
  "Rule-based accounts are not available on this server. Point the harness at an environment that serves POST /internal-accounts.";

export function RuleBasedAccountsPanel({
  call,
  connection,
  customerId,
}: {
  call: CallFn;
  connection: string;
  customerId: string;
}) {
  const [currency, setCurrency] = useState<string>("EUR");
  const [label, setLabel] = useState("");
  const [destination, setDestination] = useState("");
  const [scaFactor, setScaFactor] = useState<string>("SMS_OTP");
  const [accountId, setAccountId] = useState("");
  const [code, setCode] = useState("123456");
  const [fundAmount, setFundAmount] = useState("1000");
  const [rows, setRows] = useState<RuleBasedAccountRow[] | null>(null);
  const [sweeps, setSweeps] = useState<{
    accountId: string;
    rows: SweepRow[];
    truncated: boolean;
  } | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [listTruncated, setListTruncated] = useState(false);

  const report = (r: { ok: boolean; status: number; json: unknown }) => {
    if (endpointUnavailable(r)) setStatus(UNAVAILABLE);
    else if (!r.ok) setStatus(`HTTP ${r.status || "error"} — see the log`);
    else setStatus(null);
  };

  const showAccount = (json: unknown) => {
    const found = summarizeRuleBasedAccounts(json);
    if (found[0]) setAccountId(found[0].id);
    setRows(found);
  };

  const create = async () => {
    const body = buildRuleBasedCreateBody({
      customerId,
      currency,
      label,
      destinationAccountId: destination,
      scaFactor,
    });
    const scope = `${connection}|${customerId}`;
    const key = createKeys.keyFor(scope, body);
    const r = await call("POST", gridPath("/internal-accounts"), body, {
      "Idempotency-Key": key,
    });
    // A failed retry says nothing about an earlier attempt that may have landed.
    if (r.ok) createKeys.release(scope, body, key);
    report(r);
    if (r.ok) showAccount(r.json);
  };

  // Grid has no single-account read, so inspecting re-lists and keeps the one.
  const list = async (onlyId?: string) => {
    const base =
      gridPath(
        "/customers/internal-accounts?type=RULE_BASED&limit=100&customerId=",
      ) + encodeURIComponent(customerId);
    const r = await gatherPages((cursor) =>
      call(
        "GET",
        cursor ? `${base}&cursor=${encodeURIComponent(cursor)}` : base,
      ),
    );
    report(r);
    if (!r.ok) return;
    setListTruncated(Boolean(r.truncated));
    const found = summarizeRuleBasedAccounts(r.json);
    setRows(onlyId ? found.filter((row) => row.id === onlyId) : found);
  };

  const accountPath = (suffix: string) =>
    gridPath(
      `/internal-accounts/${encodeURIComponent(accountId.trim())}${suffix}`,
    );

  const authorize = async () => {
    const r = await call("POST", accountPath("/authorize"), {
      code: code.trim(),
    });
    report(r);
    if (r.ok) showAccount(r.json);
  };

  const resend = async () => {
    report(await call("POST", accountPath("/authorize/resend")));
  };

  const fund = async () => {
    const r = await call(
      "POST",
      gridPath(
        `/sandbox/internal-accounts/${encodeURIComponent(
          accountId.trim(),
        )}/fund`,
      ),
      { amount: Number(fundAmount) },
    );
    report(r);
  };

  const watchSweeps = async () => {
    const forAccount = accountId.trim();
    const base =
      gridPath("/transactions?limit=100&customerId=") +
      encodeURIComponent(customerId);
    const r = await gatherPages((cursor) =>
      call(
        "GET",
        cursor ? `${base}&cursor=${encodeURIComponent(cursor)}` : base,
      ),
    );
    report(r);
    if (r.ok) {
      setSweeps({
        accountId: forAccount,
        rows: sweepsOf(r.json, forAccount),
        truncated: Boolean(r.truncated),
      });
    }
  };

  const hasAccount = Boolean(accountId.trim());
  const shownSweeps =
    sweeps && sweeps.accountId === accountId.trim() ? sweeps : null;

  return (
    <Panel
      title="Rule-based accounts"
      subtitle="Standing orders: an extra account number whose deposits sweep to a destination."
    >
      <Field.Root>
        <Field.Label>Currency</Field.Label>
        <EnumSelect
          value={currency}
          onValueChange={setCurrency}
          options={CURRENCIES}
        />
      </Field.Root>
      <TextField
        label="Sweep destination account id"
        value={destination}
        onChange={setDestination}
        placeholder="InternalAccount:… or ExternalAccount:…"
      />
      <TextField label="Label (optional)" value={label} onChange={setLabel} />
      <Field.Root>
        <Field.Label>SCA factor</Field.Label>
        <EnumSelect
          value={scaFactor}
          onValueChange={setScaFactor}
          options={CREATE_SCA_FACTORS}
        />
      </Field.Root>
      <ButtonRow>
        <Button
          disabled={!customerId || !destination.trim()}
          onClick={() => void create()}
        >
          Create rule-based account
        </Button>
        <Button
          variant="secondary"
          disabled={!customerId}
          onClick={() => void list()}
        >
          List rule-based accounts
        </Button>
      </ButtonRow>
      <Note>
        An EUR account sweeps to a crypto destination, and a USDC or BTC account
        sweeps to an EUR one. An external destination must already be a trusted
        beneficiary. The account opens as PENDING_AUTHORIZATION with an SCA
        challenge; authorize it below to make it ACTIVE.
      </Note>

      {rows && listTruncated && (
        <Note>
          Only the first pages of accounts were read, so some may be missing.
        </Note>
      )}
      {rows && rows.length === 0 && <Note>No rule-based accounts.</Note>}
      {rows?.map((row) => (
        <Note key={row.id}>
          <CopyableId value={row.id} /> · {row.status ?? "?"}
          {row.currency ? ` · ${row.currency}` : ""}
          {row.label ? ` · ${row.label}` : ""}
          {row.destination ? ` → ${row.destination}` : ""}
          {row.challengeFactor
            ? ` · challenge ${row.challengeFactor}`
            : ""}{" "}
          <Button variant="ghost" onClick={() => setAccountId(row.id)}>
            Select
          </Button>
        </Note>
      ))}

      <TextField
        label="Rule-based account id"
        value={accountId}
        onChange={setAccountId}
      />
      <ButtonRow>
        <Button
          variant="secondary"
          disabled={!hasAccount || !customerId}
          onClick={() => void list(accountId.trim())}
        >
          Inspect
        </Button>
      </ButtonRow>
      <TextField label="SCA code" value={code} onChange={setCode} />
      <ButtonRow>
        <Button disabled={!hasAccount} onClick={() => void authorize()}>
          Authorize
        </Button>
        <Button
          variant="secondary"
          disabled={!hasAccount}
          onClick={() => void resend()}
        >
          Resend SMS code
        </Button>
      </ButtonRow>
      <TextField
        label="Sandbox fund amount (smallest unit)"
        value={fundAmount}
        onChange={setFundAmount}
      />
      <ButtonRow>
        <Button
          variant="outline"
          disabled={!hasAccount || !Number(fundAmount)}
          onClick={() => void fund()}
        >
          Sandbox fund
        </Button>
        <Button
          variant="outline"
          disabled={!hasAccount || !customerId}
          onClick={() => void watchSweeps()}
        >
          Show sweeps
        </Button>
      </ButtonRow>
      <Note>
        Funding stands in for a settled deposit and triggers the sweep. Show
        sweeps lists the customer&apos;s transactions that carry this
        account&apos;s ruleBasedAccountId; press it again to follow one to a
        final status. A very small amount rehearses SWEEP_AMOUNT_OUT_OF_RANGE.
      </Note>
      {shownSweeps && shownSweeps.rows.length === 0 && (
        <Note>No sweeps yet.</Note>
      )}
      {shownSweeps?.truncated && (
        <Note>
          Only the newest transactions were read, so older sweeps may be
          missing.
        </Note>
      )}
      {shownSweeps?.rows.map((s) => (
        <Note key={s.id}>
          <CopyableId value={s.id} /> · {s.status ?? "?"}
          {s.failureReason ? ` · ${s.failureReason}` : ""}
        </Note>
      ))}
      {status && <Note>{status}</Note>}
    </Panel>
  );
}
