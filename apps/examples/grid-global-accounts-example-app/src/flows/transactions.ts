// List a customer's real, server-persisted transactions (onramps / offramps /
// payments) from the Grid API.
//
// DOM-free: takes the platform `auth`, the query params, and a `Reporter` to
// emit a response log event through, then returns a normalized page. The React
// layer owns paging state + rendering.

import { apiGet, type ApiAuth } from "../api-client";
import type { Reporter } from "../lib/reporter";

/** A money amount: `amount` in minor units + a `currency` block. */
export interface CurrencyAmount {
  amount?: number;
  /** `{ code, name, symbol, decimals }` — drives money formatting. */
  currency?: unknown;
}

/**
 * A permissive transaction shape covering the fields the UI renders. The Grid
 * response is a OneOf of incoming/outgoing transactions; rather than model both
 * exactly, we keep every field optional and read what we need defensively.
 * Outgoing carries `sentAmount`, incoming carries `receivedAmount`.
 */
export interface Transaction {
  id?: string;
  /** "INCOMING" | "OUTGOING". */
  type?: string;
  status?: string;
  /** Outgoing amount (sender's currency). */
  sentAmount?: CurrencyAmount;
  /** Incoming amount (recipient's currency). */
  receivedAmount?: CurrencyAmount;
  /** Generic fallback amount, if a row ever uses a plain `amount` block. */
  amount?: CurrencyAmount;
  /** OneOf: `{ sourceType, accountId | umaAddress, ... }`. */
  source?: unknown;
  /** OneOf: `{ destinationType, accountId | umaAddress, ... }`. */
  destination?: unknown;
  createdAt?: string;
  description?: string;
  [key: string]: unknown;
}

/** One normalized page of transactions. */
export interface TransactionPage {
  data: Transaction[];
  hasMore: boolean;
  nextCursor: string | null;
  totalCount: number;
}

/** Direction filter; "ALL" omits the `type` query param entirely. */
export type TransactionTypeFilter = "ALL" | "INCOMING" | "OUTGOING";

const DEFAULT_LIMIT = 20;

export interface ListTransactionsParams {
  customerId: string;
  limit?: number;
  cursor?: string | null;
  type?: TransactionTypeFilter;
}

/**
 * GET `/transactions` scoped to a customer, newest first. Always sends
 * `customerId`, `limit` (default 20), and `sortOrder=desc`; adds `cursor` when
 * paging and `type` only when filtering to a single direction. Normalizes the
 * `{ data, hasMore, nextCursor, totalCount }` envelope (camelCase, verified
 * against the generated `TransactionListResponse`), coercing a missing `data`
 * to `[]`, `hasMore` to false, and `nextCursor` to null.
 */
export async function listTransactions(
  reporter: Reporter,
  auth: ApiAuth,
  params: ListTransactionsParams,
): Promise<TransactionPage> {
  const limit = params.limit ?? DEFAULT_LIMIT;
  const query = new URLSearchParams({
    customerId: params.customerId,
    limit: String(limit),
    sortOrder: "desc",
  });
  if (params.cursor) query.set("cursor", params.cursor);
  if (params.type && params.type !== "ALL") query.set("type", params.type);

  const detail = await apiGet(auth, `/transactions?${query.toString()}`);
  reporter.log({ level: "response", label: "List Transactions", detail });

  const env = (detail && typeof detail === "object" ? detail : {}) as Record<
    string,
    unknown
  >;
  return {
    data: Array.isArray(env.data) ? (env.data as Transaction[]) : [],
    hasMore: env.hasMore === true,
    nextCursor: typeof env.nextCursor === "string" ? env.nextCursor : null,
    totalCount: typeof env.totalCount === "number" ? env.totalCount : 0,
  };
}
