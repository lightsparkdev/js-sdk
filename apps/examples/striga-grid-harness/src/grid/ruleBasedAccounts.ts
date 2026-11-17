// Request building and response reading for rule-based internal accounts (a
// Striga standing order behind each one). Kept apart from the panel so the
// shapes the harness depends on are tested without rendering.

export interface RuleBasedCreateInput {
  customerId?: string;
  currency: string;
  label?: string;
  destinationAccountId: string;
  paymentRail?: string;
  scaFactor?: string;
}

export interface RuleBasedCreateBody {
  customerId?: string;
  type: "RULE_BASED";
  currency: string;
  label?: string;
  sweepRule: { destination: { accountId: string; paymentRail?: string } };
  scaFactor?: string;
}

export function buildRuleBasedCreateBody(
  input: RuleBasedCreateInput,
): RuleBasedCreateBody {
  const customerId = input.customerId?.trim();
  const label = input.label?.trim();
  const paymentRail = input.paymentRail?.trim();
  const scaFactor = input.scaFactor?.trim();
  const destination: { accountId: string; paymentRail?: string } = {
    accountId: input.destinationAccountId.trim(),
  };
  if (paymentRail) destination.paymentRail = paymentRail;
  return {
    ...(customerId ? { customerId } : {}),
    type: "RULE_BASED",
    currency: input.currency.trim().toUpperCase(),
    ...(label ? { label } : {}),
    sweepRule: { destination },
    ...(scaFactor ? { scaFactor } : {}),
  };
}

export interface RuleBasedAccountRow {
  id: string;
  status?: string;
  label?: string;
  currency?: string;
  destination?: string;
  challengeFactor?: string;
}

type Rec = Record<string, unknown>;

function asRec(value: unknown): Rec | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Rec)
    : null;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function toRow(account: Rec): RuleBasedAccountRow | null {
  const id = str(account.id);
  if (!id || account.type !== "RULE_BASED") return null;
  const currency = asRec(asRec(account.balance)?.currency);
  const destination = asRec(asRec(account.sweepRule)?.destination);
  const challenge = asRec(account.scaChallenge);
  const row: RuleBasedAccountRow = { id };
  const fields: Array<[keyof RuleBasedAccountRow, string | undefined]> = [
    ["status", str(account.status)],
    ["label", str(account.label)],
    ["currency", str(currency?.code)],
    ["destination", str(destination?.accountId)],
    ["challengeFactor", str(challenge?.factor)],
  ];
  for (const [key, value] of fields) if (value) row[key] = value;
  return row;
}

/** Reads either a list response (`{data: [...]}`) or a single account. */
export function summarizeRuleBasedAccounts(
  response: unknown,
): RuleBasedAccountRow[] {
  const rec = asRec(response);
  if (!rec) return [];
  const items = "data" in rec ? rec.data : [rec];
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => {
    const account = asRec(item);
    const row = account && toRow(account);
    return row ? [row] : [];
  });
}

export interface SweepRow {
  id: string;
  status?: string;
  failureReason?: string;
}

/** The transactions in a list response that sweep `ruleBasedAccountId`. */
export function sweepsOf(
  response: unknown,
  ruleBasedAccountId: string,
): SweepRow[] {
  const data = asRec(response)?.data;
  if (!Array.isArray(data)) return [];
  return data.flatMap((item) => {
    const tx = asRec(item);
    const id = str(tx?.id);
    if (!tx || !id || tx.ruleBasedAccountId !== ruleBasedAccountId) return [];
    const row: SweepRow = { id };
    const status = str(tx.status);
    const failureReason = str(tx.failureReason);
    if (status) row.status = status;
    if (failureReason) row.failureReason = failureReason;
    return [row];
  });
}

/**
 * Whether a response means the server has no such route, as against a request
 * it understood and refused. Grid answers a missing resource with a 404 that
 * carries an error `code`; a route it does not serve returns no Grid error.
 */
export function endpointUnavailable(result: {
  status: number;
  json: unknown;
}): boolean {
  if (result.status === 405 || result.status === 501) return true;
  if (result.status !== 404) return false;
  return !str(asRec(result.json)?.code);
}

export interface PageResult {
  ok: boolean;
  status: number;
  json: unknown;
  /** Set when the read stopped with pages it could not reach. */
  truncated?: true;
}

// A guard against a server that keeps returning a cursor.
const MAX_PAGES = 50;

/**
 * Reads every page of a cursor-paged list into one `{data}` response. The
 * first failed page is returned as is, so callers branch on it like any call.
 */
export async function gatherPages(
  fetchPage: (cursor: string | undefined) => Promise<PageResult>,
): Promise<PageResult> {
  const data: unknown[] = [];
  let cursor: string | undefined;
  let last: PageResult | null = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    if (page > 0 && !cursor) break;
    last = await fetchPage(cursor);
    if (!last.ok) return last;
    const rec = asRec(last.json);
    if (Array.isArray(rec?.data)) data.push(...rec.data);
    cursor = rec?.hasMore === true ? str(rec.nextCursor) : undefined;
    if (rec?.hasMore === true && !cursor) {
      return { ok: true, status: last.status, json: { data }, truncated: true };
    }
  }
  return {
    ok: true,
    status: last?.status ?? 200,
    json: { data },
    ...(cursor ? { truncated: true as const } : {}),
  };
}

/**
 * Idempotency-Keys for creates that have not yet succeeded. Creating mints
 * an account number that cannot be reversed. A retry of the same create must
 * reuse its key even after the panel that sent it has unmounted.
 */
export class CreateKeyStore {
  private readonly keys = new Map<string, string>();

  constructor(
    private readonly newKey: () => string = () => crypto.randomUUID(),
  ) {}

  private slot(scope: string, body: RuleBasedCreateBody): string {
    return `${scope}\n${JSON.stringify(body)}`;
  }

  keyFor(scope: string, body: RuleBasedCreateBody): string {
    const slot = this.slot(scope, body);
    let key = this.keys.get(slot);
    if (!key) {
      key = this.newKey();
      this.keys.set(slot, key);
    }
    return key;
  }

  /** Releases `key` once its create succeeded, unless a newer key took the slot. */
  release(scope: string, body: RuleBasedCreateBody, key: string): void {
    const slot = this.slot(scope, body);
    if (this.keys.get(slot) === key) this.keys.delete(slot);
  }
}
