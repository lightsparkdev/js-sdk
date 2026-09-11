// Money movement: external account, quote, sign payload, execute.
//
// DOM-free operation functions. The React layer collects the form values
// (account type + fields, amounts) and renders results; this module builds the
// request bodies, talks to Grid + Turnkey, and emits log events through the
// injected `Reporter`.

import { SANDBOX_SIG, type Mode } from "../config";
import { apiGet, apiPost, type ApiAuth } from "../api-client";
import type { Reporter } from "../lib/reporter";
import { turnkeyStamp } from "../turnkey";

export interface BankExternalAccount {
  kind: "bank";
  accountNumber: string;
  routingNumber: string;
  beneficiaryName?: string;
}

export type ExternalAccountParams = BankExternalAccount;

export interface CreateExternalAccountResult {
  data: unknown;
  externalAccountId: string | undefined;
}

export async function createExternalAccount(
  reporter: Reporter,
  auth: ApiAuth,
  params: ExternalAccountParams,
): Promise<CreateExternalAccountResult> {
  const accountNumber = params.accountNumber.trim();
  const routingNumber = params.routingNumber.trim();
  const fullName = params.beneficiaryName?.trim() || "Sandbox Test User";
  if (!accountNumber || !routingNumber)
    throw new Error("Account number and routing number are required.");
  const body: Record<string, unknown> = {
    currency: "USD",
    accountInfo: {
      accountType: "USD_ACCOUNT",
      countries: ["US"],
      paymentRails: ["ACH", "WIRE", "RTP", "FEDNOW"],
      accountNumber,
      routingNumber,
      beneficiary: {
        beneficiaryType: "INDIVIDUAL",
        fullName,
        birthDate: "1990-01-15",
        nationality: "US",
        address: {
          line1: "100 Test St",
          city: "SF",
          postalCode: "94102",
          country: "US",
        },
      },
    },
  };
  const { data } = await apiPost(auth, "/platform/external-accounts", body);
  reporter.log({
    level: "response",
    label: "Create External Account",
    detail: data,
  });
  const d = data as Record<string, unknown>;
  const externalAccountId = typeof d.id === "string" ? d.id : undefined;
  return { data, externalAccountId };
}

// ----- Customer-owned external accounts (offramp destination) -----
//
// A customer offramp quote (embedded wallet → external account) requires the
// destination to be owned by that customer, created via
// `POST /customers/external-accounts` with a `customerId`. A platform-owned
// external account (`POST /platform/external-accounts`) does not belong to the
// customer and is rejected with `sparkcore_to_account_id does not belong to the
// specified user`.

export interface CreateCustomerExternalAccountParams {
  /** The customer LSID the external account is created for. */
  customerId: string;
  accountNumber: string;
  routingNumber: string;
  beneficiaryName?: string;
}

/** Build the USD/ACH `accountInfo` body shared by platform + customer creates. */
function usdBankAccountInfo(
  accountNumber: string,
  routingNumber: string,
  fullName: string,
): Record<string, unknown> {
  return {
    accountType: "USD_ACCOUNT",
    countries: ["US"],
    paymentRails: ["ACH", "WIRE", "RTP", "FEDNOW"],
    accountNumber,
    routingNumber,
    beneficiary: {
      beneficiaryType: "INDIVIDUAL",
      fullName,
      birthDate: "1990-01-15",
      nationality: "US",
      address: {
        line1: "100 Test St",
        city: "SF",
        postalCode: "94102",
        country: "US",
      },
    },
  };
}

/**
 * Create a customer-owned USD bank external account
 * (`POST /customers/external-accounts`). Sends `customerId` + `currency: "USD"`
 * + the USD/ACH `accountInfo`, and returns the new external account id.
 */
export async function createCustomerExternalAccount(
  reporter: Reporter,
  auth: ApiAuth,
  params: CreateCustomerExternalAccountParams,
): Promise<string> {
  const customerId = params.customerId.trim();
  const accountNumber = params.accountNumber.trim();
  const routingNumber = params.routingNumber.trim();
  const fullName = params.beneficiaryName?.trim() || "Sandbox Test User";
  if (!customerId) throw new Error("A customer is required.");
  if (!accountNumber || !routingNumber)
    throw new Error("Account number and routing number are required.");
  const body: Record<string, unknown> = {
    customerId,
    currency: "USD",
    accountInfo: usdBankAccountInfo(accountNumber, routingNumber, fullName),
  };
  const { data } = await apiPost(auth, "/customers/external-accounts", body);
  reporter.log({
    level: "response",
    label: "Create Customer External Account",
    detail: data,
  });
  const id = (data as Record<string, unknown>)?.id;
  if (typeof id !== "string" || !id)
    throw new Error("External account create returned no id.");
  return id;
}

/** A customer external account, flattened to the bits the picker renders. */
export interface CustomerExternalAccount {
  id: string;
  /** Human label, e.g. `USD •••6789`. */
  label: string;
}

/**
 * List a customer's external accounts
 * (`GET /customers/external-accounts?customerId=...`), optionally filtered by
 * currency. Returns each account's id and a human label (currency + last-4 of
 * the bank account number when present).
 */
export async function listCustomerExternalAccounts(
  reporter: Reporter,
  auth: ApiAuth,
  customerId: string,
  currency?: string,
): Promise<CustomerExternalAccount[]> {
  const id = customerId.trim();
  if (!id) throw new Error("A customer is required.");
  const query = new URLSearchParams({ customerId: id });
  if (currency) query.set("currency", currency);
  const data = await apiGet(auth, `/customers/external-accounts?${query}`);
  reporter.log({
    level: "response",
    label: "List Customer External Accounts",
    detail: data,
  });
  const rows = ((data as Record<string, unknown> | null)?.data ?? []) as Array<
    Record<string, unknown>
  >;
  const accounts: CustomerExternalAccount[] = [];
  for (const row of rows) {
    if (typeof row.id !== "string" || !row.id) continue;
    accounts.push({ id: row.id, label: externalAccountLabel(row) });
  }
  return accounts;
}

/** Build a `USD •••6789`-style label from an external account response item. */
function externalAccountLabel(row: Record<string, unknown>): string {
  const currency = typeof row.currency === "string" ? row.currency : "";
  const info = row.accountInfo as Record<string, unknown> | undefined;
  const number =
    info && typeof info.accountNumber === "string" ? info.accountNumber : "";
  const last4 = number ? `•••${number.slice(-4)}` : "";
  return [currency, last4].filter(Boolean).join(" ") || (row.id as string);
}

export interface CreateQuoteParams {
  sourceAccountId: string;
  destinationAccountId: string;
  lockedCurrencySide: string;
  lockedCurrencyAmount: number;
  mode: Mode;
}

export interface CreateQuoteResult {
  data: unknown;
  quoteId: string | undefined;
  /** payloadToSign from the EMBEDDED_WALLET payment instruction, if present. */
  payloadToSign: string | undefined;
  /** Pre-filled signature: the magic value in sandbox, blank in production. */
  signature: string;
}

export async function createQuote(
  reporter: Reporter,
  auth: ApiAuth,
  params: CreateQuoteParams,
): Promise<CreateQuoteResult> {
  const destinationAccountId = params.destinationAccountId.trim();
  if (!destinationAccountId || !params.lockedCurrencyAmount)
    throw new Error("Destination external account and amount are required.");
  const { data } = await apiPost(auth, "/quotes", {
    source: { sourceType: "ACCOUNT", accountId: params.sourceAccountId },
    destination: {
      destinationType: "ACCOUNT",
      accountId: destinationAccountId,
    },
    lockedCurrencySide: params.lockedCurrencySide,
    lockedCurrencyAmount: params.lockedCurrencyAmount,
  });
  reporter.log({ level: "response", label: "Create Quote", detail: data });
  const d = data as Record<string, unknown>;
  const quoteId = typeof d.id === "string" ? d.id : undefined;

  // Extract `payloadToSign` from the EMBEDDED_WALLET payment instruction
  // (find by accountType match).
  let payloadToSign: string | undefined;
  const instructions = (d.paymentInstructions ?? []) as Array<
    Record<string, unknown>
  >;
  for (const inst of instructions) {
    const info = inst.accountOrWalletInfo as
      | Record<string, unknown>
      | undefined;
    if (info && info.accountType === "EMBEDDED_WALLET" && info.payloadToSign) {
      payloadToSign = info.payloadToSign as string;
      break;
    }
  }

  // In sandbox mode, pre-fill the magic signature so the user can Execute
  // immediately. In production, leave blank — `signPayload` decrypts the
  // session bundle and stamps the payload.
  const signature = params.mode === "sandbox" ? SANDBOX_SIG : "";
  return { data, quoteId, payloadToSign, signature };
}

export interface SignPayloadResult {
  signature: string;
  message: string;
}

export async function signPayload(
  mode: Mode,
  payloadToSign: string,
): Promise<SignPayloadResult> {
  if (mode === "sandbox") {
    return {
      signature: SANDBOX_SIG,
      message: "Mode: sandbox — filled magic signature.",
    };
  }
  const payload = payloadToSign.trim();
  if (!payload)
    throw new Error(
      "payloadToSign is empty — run Create Quote first or paste it manually.",
    );
  const stamp = await turnkeyStamp(payload);
  return { signature: stamp, message: `Stamped (${stamp.length} chars).` };
}

export async function executeQuote(
  reporter: Reporter,
  auth: ApiAuth,
  quoteId: string,
  signature: string,
): Promise<unknown> {
  const id = quoteId.trim();
  const sig = signature.trim();
  if (!id || !sig)
    throw new Error("Quote ID and Grid-Wallet-Signature are required.");
  const { data } = await apiPost(
    auth,
    `/quotes/${encodeURIComponent(id)}/execute`,
    {},
    { "Grid-Wallet-Signature": sig },
  );
  reporter.log({ level: "response", label: "Execute Quote", detail: data });
  return data;
}

// ----- Platform-funded transfer (no wallet signature) -----
//
// Mirrors the proven platform→customer flow in
// `sparkcore/sparkcore/grid/__itests__/test_token_fund_in_live.py`
// (`_gen_create_and_execute_quote`, lines 476-507, and
// `_gen_poll_transaction_status`, lines 373-393):
//   POST /quotes { source: ACCOUNT, destination: ACCOUNT, lockedCurrencySide:
//     "SENDING", lockedCurrencyAmount } → { id }
//   POST /quotes/{id}/execute {}  (EMPTY body, NO Grid-Wallet-Signature — the
//     platform's Basic-auth token authorizes spending its own source account)
//   poll GET /transactions/{transactionId} until status ∈ {COMPLETED, FAILED}.
// Unlike the customer-signed `executeQuote`, the platform funds its own customer
// so there is no embedded-wallet payload to sign.

/** Terminal + happy-path statuses a transaction can reach. */
const TERMINAL_STATUSES = new Set(["COMPLETED", "FAILED"]);

export interface FundCustomerParams {
  /** The platform's funded source internal account LSID. */
  fundingAccountId: string;
  /** The customer's destination internal account LSID. */
  destinationAccountId: string;
  /** Amount to send, in minor units (cents / micro-units / sats per currency). */
  amountMinor: number;
}

/**
 * Coarse stages the fund flow passes through, surfaced to the UI for a staged
 * progress indicator. `quoting` → `executing` → `processing` are the in-flight
 * steps; `completed` / `failed` are terminal. PROCESSING is the only real
 * backend signal, so the bar advances approximately between steps.
 */
export type FundStage =
  | "quoting"
  | "executing"
  | "processing"
  | "completed"
  | "failed";

export interface FundCustomerResult {
  quoteId: string;
  transactionId: string;
  /** The terminal transaction `status` (COMPLETED / FAILED), or the last seen. */
  status: string;
  /** The full transaction payload from the final `GET /transactions/{id}`. */
  transaction: unknown;
}

/**
 * Inject the wait between polls so tests don't sleep on real timers. Production
 * callers leave it defaulted to a real `setTimeout`-backed delay.
 */
export type Sleep = (ms: number) => Promise<void>;
const realSleep: Sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface PollTransactionOptions {
  /** Total time budget before giving up and returning the last seen txn. */
  timeoutMs?: number;
  /** Delay between polls. */
  intervalMs?: number;
  /** Injected sleep (tests pass a no-op / fake-timer-driven one). */
  sleep?: Sleep;
}

/**
 * Poll `GET /transactions/{id}` until `status` is terminal (COMPLETED / FAILED)
 * or the timeout elapses, then return the last-seen transaction. Mirrors
 * `_gen_poll_transaction_status` in the reference itest.
 */
export async function pollTransaction(
  reporter: Reporter,
  auth: ApiAuth,
  transactionId: string,
  opts: PollTransactionOptions = {},
): Promise<{ status: string; transaction: unknown }> {
  const id = transactionId.trim();
  if (!id) throw new Error("Transaction ID is required to poll.");
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const intervalMs = opts.intervalMs ?? 1_000;
  const sleep = opts.sleep ?? realSleep;

  let elapsed = 0;
  let txn: unknown = null;
  let status = "";
  // Poll at least once even if timeoutMs is 0.
  do {
    txn = await apiGet(auth, `/transactions/${encodeURIComponent(id)}`);
    reporter.log({
      level: "response",
      label: "GET /transactions",
      detail: txn,
    });
    const s = (txn as Record<string, unknown> | null)?.status;
    status = typeof s === "string" ? s : "";
    if (TERMINAL_STATUSES.has(status)) return { status, transaction: txn };
    if (elapsed + intervalMs >= timeoutMs) break;
    await sleep(intervalMs);
    elapsed += intervalMs;
  } while (elapsed < timeoutMs);

  return { status, transaction: txn };
}

/**
 * Options for `fundCustomerFromPlatform`: poll tuning + a staged-progress hook.
 */
export interface FundCustomerOptions {
  /** Poll tuning (timeout / interval / injected sleep). */
  poll?: PollTransactionOptions;
  /**
   * Stage callback for a staged UI indicator. Invoked with `quoting` before the
   * quote, `executing` before execute, `processing` before the poll, then the
   * terminal `completed` / `failed` (or left at `processing` if the poll times
   * out before a terminal status).
   */
  onStage?: (stage: FundStage) => void;
}

/**
 * Fund a customer from the platform's own funded internal account:
 * quote (RECEIVING-locked) → execute (empty body, platform Basic auth, no
 * signature) → poll the transaction to a terminal status. Returns the quote id,
 * transaction id, and final status. The caller refreshes the customer's balance
 * and surfaces the status. DOM-free: takes a `Reporter`, `auth`, and params.
 */
export async function fundCustomerFromPlatform(
  reporter: Reporter,
  auth: ApiAuth,
  params: FundCustomerParams,
  opts: FundCustomerOptions = {},
): Promise<FundCustomerResult> {
  const onStage = opts.onStage ?? (() => {});
  const fundingAccountId = params.fundingAccountId.trim();
  const destinationAccountId = params.destinationAccountId.trim();
  if (!fundingAccountId)
    throw new Error("A platform funding account is required.");
  if (!destinationAccountId)
    throw new Error("The customer has no internal account to fund.");
  if (!params.amountMinor || params.amountMinor <= 0)
    throw new Error("Enter an amount to fund.");

  // 1) Quote: platform source → customer destination. The amount is in the
  // customer's (receiving) currency, so lock RECEIVING and let the quote derive
  // the source amount.
  onStage("quoting");
  const quoteBody = {
    source: { sourceType: "ACCOUNT", accountId: fundingAccountId },
    destination: {
      destinationType: "ACCOUNT",
      accountId: destinationAccountId,
    },
    lockedCurrencySide: "RECEIVING",
    lockedCurrencyAmount: params.amountMinor,
  };
  reporter.log({ level: "request", label: "POST /quotes", detail: quoteBody });
  const { data: quoteData } = await apiPost(auth, "/quotes", quoteBody);
  reporter.log({ level: "response", label: "Create Quote", detail: quoteData });
  const quoteId = (quoteData as Record<string, unknown>)?.id;
  if (typeof quoteId !== "string" || !quoteId)
    throw new Error("Quote creation returned no id.");

  // 2) Execute: EMPTY body, NO Grid-Wallet-Signature. Platform Basic auth
  // authorizes spending its own source account.
  onStage("executing");
  reporter.log({
    level: "request",
    label: "POST /quotes/{id}/execute",
    detail: {},
  });
  const { data: execData } = await apiPost(
    auth,
    `/quotes/${encodeURIComponent(quoteId)}/execute`,
    {},
  );
  reporter.log({ level: "response", label: "Execute Quote", detail: execData });
  const transactionId = (execData as Record<string, unknown>)?.transactionId;
  if (typeof transactionId !== "string" || !transactionId)
    throw new Error("Execute returned no transactionId.");

  // 3) Poll the transaction to a terminal status.
  onStage("processing");
  const { status, transaction } = await pollTransaction(
    reporter,
    auth,
    transactionId,
    opts.poll,
  );

  // Terminal stage: COMPLETED / FAILED flip to that stage; a poll timeout leaves
  // the indicator at `processing` (the balance may still settle).
  if (status === "COMPLETED") onStage("completed");
  else if (status === "FAILED") onStage("failed");

  return { quoteId, transactionId, status, transaction };
}
