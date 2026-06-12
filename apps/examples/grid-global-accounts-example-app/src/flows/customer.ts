// Shared setup: create customer, platform config (OTP + branding), balance.
//
// DOM-free operation functions: each takes the platform `auth`, the form values
// it needs, and a `Reporter` to emit request/response log events through, then
// returns its result. The React layer collects the inputs and renders.

import { apiGet, apiPatch, apiPost, type ApiAuth } from "../api-client";
import type { Reporter } from "../lib/reporter";
import { setCtxAccount } from "./context";

export interface CreateCustomerParams {
  platformCustomerId?: string;
  fullName?: string;
  email?: string;
}

export interface CreateCustomerResult {
  customer: unknown;
  accounts: unknown;
  customerId: string;
  accountId: string | null;
}

// ----- Create customer -----

export async function createCustomer(
  reporter: Reporter,
  auth: ApiAuth,
  params: CreateCustomerParams,
): Promise<CreateCustomerResult> {
  const platformCustomerId =
    params.platformCustomerId?.trim() || `test-${Date.now()}`;
  const fullName = params.fullName?.trim() || "Test User";
  const email = params.email?.trim();
  const body: Record<string, unknown> = {
    customerType: "BUSINESS",
    platformCustomerId,
    region: "US",
    currencies: ["USDB"],
    businessInfo: {
      legalName: fullName,
      taxId: "12-3456789",
      incorporatedOn: "2020-01-01",
    },
  };
  if (email) body.email = email;
  reporter.log({ level: "request", label: "POST /customers", detail: body });
  const { data: customer } = await apiPost(auth, "/customers", body);
  reporter.log({
    level: "response",
    label: "Create Customer",
    detail: customer,
  });
  const customerId = (customer as Record<string, unknown>).id as string;

  const accounts = (await apiGet(
    auth,
    `/customers/internal-accounts?customerId=${customerId}&currency=USDB`,
  )) as { data: Array<{ id: string }> };
  reporter.log({
    level: "response",
    label: "Internal Accounts",
    detail: accounts,
  });

  let accountId: string | null = null;
  if (accounts.data && accounts.data.length > 0) {
    accountId = accounts.data[0].id;
    setCtxAccount(accountId);
  }
  return { customer, accounts, customerId, accountId };
}

// ----- All customer internal accounts (one fetch → every customer) -----

/** A single internal account projected to the fields the platform table needs. */
export interface ParsedInternalAccount {
  /** LSID, e.g. `InternalAccount:<uuid>`. */
  id: string;
  /** Owning customer's LSID. Empty string means platform-owned. */
  customerId: string;
  /** `INTERNAL_FIAT` / `INTERNAL_CRYPTO` / `EMBEDDED_WALLET`, when present. */
  type: string;
  /** `ACTIVE` / `PENDING` / `CLOSED` / `FROZEN`, when present. */
  status: string;
  /** Balance in minor units (per `currency.decimals`), per `CurrencyAmount.amount`. */
  amount: number;
  /** Currency metadata: `{ code, name, symbol, decimals }` (any may be absent). */
  currency: Record<string, unknown>;
}

/** One customer's wallet row, derived from grouping internal accounts by owner. */
export interface CustomerWallet {
  /** Owning customer's LSID. */
  customerId: string;
  /** The wallet account's LSID (act-as / fund destination). */
  accountId: string;
  /** Currency metadata for the wallet balance. */
  currency: Record<string, unknown>;
  /** Wallet balance in minor units. */
  amount: number;
}

export interface ListAllInternalAccountsResult {
  accounts: ParsedInternalAccount[];
  /** True if pagination was capped before the API ran out of pages. */
  truncated: boolean;
}

// Stop after this many pages / accounts so a misbehaving or huge tenant can't
// spin forever; the caller is told (via `truncated`) rather than silently cut.
const MAX_PAGES = 10;
const PAGE_LIMIT = 100;
const MAX_ACCOUNTS = MAX_PAGES * PAGE_LIMIT;

/** Project a single internal-account row to the fields the table groups on. */
export function parseInternalAccount(
  row: unknown,
): ParsedInternalAccount | null {
  if (!row || typeof row !== "object") return null;
  const a = row as Record<string, unknown>;
  const id = typeof a.id === "string" ? a.id : "";
  if (!id) return null;

  const balance = a.balance as Record<string, unknown> | undefined;
  const amount =
    balance && typeof balance.amount === "number" ? balance.amount : 0;
  const currency =
    balance && balance.currency && typeof balance.currency === "object"
      ? (balance.currency as Record<string, unknown>)
      : {};
  return {
    id,
    customerId: typeof a.customerId === "string" ? a.customerId : "",
    type: typeof a.type === "string" ? a.type : "",
    status: typeof a.status === "string" ? a.status : "",
    amount,
    currency,
  };
}

/**
 * Page `GET /customers/internal-accounts` (no `customerId` — the param is an
 * optional filter, see `GridListCustomerInternalAccountsRequestArgs.customer_id`
 * in `list_customer_internal_accounts.py`) to return EVERY customer account in
 * one sweep. The handler reports `hasMore` / `nextCursor`; we follow the cursor
 * until exhausted, capped at `MAX_ACCOUNTS` so we never loop unbounded — if the
 * cap is hit we set `truncated` and log it rather than silently dropping pages.
 */
export async function listAllInternalAccounts(
  reporter: Reporter,
  auth: ApiAuth,
): Promise<ListAllInternalAccountsResult> {
  const accounts: ParsedInternalAccount[] = [];
  let cursor: string | null = null;
  let truncated = false;

  for (let page = 0; page < MAX_PAGES; page++) {
    const query = cursor
      ? `/customers/internal-accounts?limit=${PAGE_LIMIT}&cursor=${encodeURIComponent(
          cursor,
        )}`
      : `/customers/internal-accounts?limit=${PAGE_LIMIT}`;
    const raw = await apiGet(auth, query);
    reporter.log({
      level: "response",
      label: "GET /customers/internal-accounts",
      detail: raw,
    });

    const env = (raw && typeof raw === "object" ? raw : {}) as Record<
      string,
      unknown
    >;
    const rows = Array.isArray(raw)
      ? raw
      : Array.isArray(env.data)
      ? env.data
      : [];
    for (const row of rows) {
      const parsed = parseInternalAccount(row);
      if (parsed) accounts.push(parsed);
    }

    const hasMore = env.hasMore === true;
    cursor = typeof env.nextCursor === "string" ? env.nextCursor : null;
    if (!hasMore || !cursor) break;
    if (page === MAX_PAGES - 1) truncated = true;
  }

  if (truncated) {
    reporter.log({
      level: "response",
      label: "Internal accounts truncated",
      detail: { cappedAt: MAX_ACCOUNTS, returned: accounts.length },
    });
  }
  return { accounts, truncated };
}

/** True for a customer's spendable wallet account (USDB or embedded-wallet). */
function isCustomerWalletAccount(a: ParsedInternalAccount): boolean {
  return (
    a.type === "EMBEDDED_WALLET" ||
    String((a.currency as { code?: unknown }).code ?? "").toUpperCase() ===
      "USDB"
  );
}

/**
 * Group internal accounts into one wallet row per customer. Platform-owned
 * accounts (empty `customerId`) are dropped, leaving only customer wallets. Of a
 * customer's accounts we keep the spendable wallet — the `EMBEDDED_WALLET` /
 * USDB account — preferring an explicit `EMBEDDED_WALLET` when several qualify.
 * Customers with no wallet account yet are omitted (no row to show a balance on).
 */
export function groupCustomerWallets(
  accounts: ParsedInternalAccount[],
): CustomerWallet[] {
  const byCustomer = new Map<string, ParsedInternalAccount>();
  for (const a of accounts) {
    if (!a.customerId) continue; // platform-owned
    if (!isCustomerWalletAccount(a)) continue;
    const existing = byCustomer.get(a.customerId);
    // Prefer an explicit embedded wallet when a customer has several candidates.
    if (
      !existing ||
      (existing.type !== "EMBEDDED_WALLET" && a.type === "EMBEDDED_WALLET")
    ) {
      byCustomer.set(a.customerId, a);
    }
  }
  return [...byCustomer.values()].map((a) => ({
    customerId: a.customerId,
    accountId: a.id,
    currency: a.currency,
    amount: a.amount,
  }));
}

// ----- Platform funding accounts -----

/** A platform-owned internal account projected to the funding-picker fields. */
export interface PlatformFundingAccount {
  /** LSID, e.g. `InternalAccount:<uuid>` — used as the funding `source`. */
  id: string;
  /** Balance in minor units (cents / satoshis), per `CurrencyAmount.amount`. */
  amount: number;
  /** Currency metadata: `{ code, name, symbol, decimals }` (any may be absent). */
  currency: Record<string, unknown>;
}

/**
 * Project a single `GET /platform/internal-accounts` row (an `InternalAccount`,
 * see `gen_internal_account_from_entity`) to the funding-picker shape: the LSID
 * plus its `balance` (`{ amount, currency }`). Rows without an `id` are dropped.
 */
export function parsePlatformFundingAccount(
  row: unknown,
): PlatformFundingAccount | null {
  if (!row || typeof row !== "object") return null;
  const a = row as Record<string, unknown>;
  const id = typeof a.id === "string" ? a.id : "";
  if (!id) return null;

  const balance = a.balance as Record<string, unknown> | undefined;
  const amount =
    balance && typeof balance.amount === "number" ? balance.amount : 0;
  const currency =
    balance && balance.currency && typeof balance.currency === "object"
      ? (balance.currency as Record<string, unknown>)
      : {};
  return { id, amount, currency };
}

/**
 * List the platform's own (non-customer) internal accounts — the funding pool —
 * via `GET /platform/internal-accounts`, which scopes to accounts owned by the
 * authenticated platform itself (`is_customers=False` in
 * `get_internal_accounts_query`). Unwraps the `{ data: [...] }` envelope
 * (`PlatformInternalAccountListResponse`); tolerates a missing/empty payload by
 * returning [] so the picker can render an empty state.
 */
export async function listPlatformFundingAccounts(
  reporter: Reporter,
  auth: ApiAuth,
): Promise<{ accounts: PlatformFundingAccount[]; raw: unknown }> {
  const raw = await apiGet(auth, "/platform/internal-accounts");
  reporter.log({
    level: "response",
    label: "GET /platform/internal-accounts",
    detail: raw,
  });

  let rows: unknown[] = [];
  if (Array.isArray(raw)) {
    rows = raw;
  } else if (raw && typeof raw === "object") {
    const data = (raw as Record<string, unknown>).data;
    if (Array.isArray(data)) rows = data;
  }

  const accounts = rows
    .map(parsePlatformFundingAccount)
    .filter((a): a is PlatformFundingAccount => a !== null);
  return { accounts, raw };
}

// ----- Fetch balance -----

/** A wallet balance row: account id, minor-unit amount, and currency block. */
export interface BalanceRow {
  id: unknown;
  /** Currency metadata `{ code, name, symbol, decimals }` — drives formatting. */
  currency: unknown;
  /** Amount in minor units (per `currency.decimals`), as returned by the API. */
  balance: number;
}

export interface FetchBalanceResult {
  /** Projected rows the wallet UI renders. */
  rows: BalanceRow[];
  /** The unmodified API response, for the debug raw-payload expander. */
  raw: unknown;
}

/**
 * Map one `GET /customers/internal-accounts` row to a wallet balance row. The
 * account's `balance` is a `CurrencyAmount` — `{ amount, currency }` where
 * `amount` is minor units and `currency` is `{ code, name, symbol, decimals }`.
 * So `currency` comes from `balance.currency` (NOT the top level) and `balance`
 * is the minor-unit `balance.amount`. Tolerates the fallback where `balance` is
 * already a bare number (then no currency block is present).
 */
export function mapBalanceRow(row: Record<string, unknown>): BalanceRow {
  const balance = row.balance;
  if (typeof balance === "number") {
    return { id: row.id, currency: undefined, balance };
  }
  if (balance && typeof balance === "object") {
    const b = balance as Record<string, unknown>;
    return {
      id: row.id,
      currency: b.currency,
      balance: typeof b.amount === "number" ? b.amount : 0,
    };
  }
  return { id: row.id, currency: undefined, balance: 0 };
}

export async function fetchBalance(
  reporter: Reporter,
  auth: ApiAuth,
  customerId: string,
): Promise<FetchBalanceResult> {
  const id = customerId.trim();
  if (!id) throw new Error("Customer ID is required.");
  const data = (await apiGet(
    auth,
    `/customers/internal-accounts?customerId=${encodeURIComponent(id)}`,
  )) as { data: Array<Record<string, unknown>> };
  reporter.log({ level: "response", label: "Fetch Balance", detail: data });
  const rows = data.data?.map(mapBalanceRow) ?? [];
  return { rows, raw: data };
}

// ----- Platform config (OTP + branding) -----

export interface PlatformConfigForm {
  appName?: string;
  otpLength?: number;
  alphanumeric?: boolean;
  expirationSeconds?: number;
  sendFromEmailAddress?: string;
  sendFromEmailSenderName?: string;
  replyToEmailAddress?: string;
  logoUrl?: string;
}

// GET the platform config and project its embedded-wallet block into the form
// shape the React layer renders.
export async function loadPlatformConfig(
  reporter: Reporter,
  auth: ApiAuth,
): Promise<PlatformConfigForm> {
  const cfg = await apiGet(auth, "/config");
  reporter.log({ level: "response", label: "GET /config", detail: cfg });
  const ewc = (cfg as { embeddedWalletConfig?: Record<string, unknown> })
    ?.embeddedWalletConfig;
  const form: PlatformConfigForm = {};
  if (!ewc) return form;
  if (typeof ewc.appName === "string") form.appName = ewc.appName;
  if (typeof ewc.otpLength === "number") form.otpLength = ewc.otpLength;
  if (typeof ewc.alphanumeric === "boolean")
    form.alphanumeric = ewc.alphanumeric;
  if (typeof ewc.expirationSeconds === "number")
    form.expirationSeconds = ewc.expirationSeconds;
  if (typeof ewc.sendFromEmailAddress === "string")
    form.sendFromEmailAddress = ewc.sendFromEmailAddress;
  if (typeof ewc.sendFromEmailSenderName === "string")
    form.sendFromEmailSenderName = ewc.sendFromEmailSenderName;
  if (typeof ewc.replyToEmailAddress === "string")
    form.replyToEmailAddress = ewc.replyToEmailAddress;
  if (typeof ewc.logoUrl === "string") form.logoUrl = ewc.logoUrl;
  return form;
}

// PATCH the platform config with only the fields the caller actually set, so we
// send a real partial (mirrors the original "only non-empty fields" behaviour).
export async function savePlatformConfig(
  reporter: Reporter,
  auth: ApiAuth,
  form: PlatformConfigForm,
): Promise<unknown> {
  const ewc: Record<string, unknown> = {};
  if (form.appName?.trim()) ewc.appName = form.appName.trim();
  if (typeof form.otpLength === "number" && !Number.isNaN(form.otpLength))
    ewc.otpLength = form.otpLength;
  if (typeof form.alphanumeric === "boolean")
    ewc.alphanumeric = form.alphanumeric;
  if (
    typeof form.expirationSeconds === "number" &&
    !Number.isNaN(form.expirationSeconds)
  )
    ewc.expirationSeconds = form.expirationSeconds;
  if (form.sendFromEmailAddress?.trim())
    ewc.sendFromEmailAddress = form.sendFromEmailAddress.trim();
  if (form.sendFromEmailSenderName?.trim())
    ewc.sendFromEmailSenderName = form.sendFromEmailSenderName.trim();
  if (form.replyToEmailAddress?.trim())
    ewc.replyToEmailAddress = form.replyToEmailAddress.trim();
  if (form.logoUrl?.trim()) ewc.logoUrl = form.logoUrl.trim();
  const body = { embeddedWalletConfig: ewc };
  reporter.log({ level: "request", label: "PATCH /config", detail: body });
  const { data } = await apiPatch(auth, "/config", body);
  reporter.log({ level: "response", label: "PATCH /config", detail: data });
  return data;
}
