// Fills the quote template with the customer's real internal accounts. The
// larger balance in major units is the source, so a sats-denominated balance
// does not outrank a cents-denominated one by raw count. Balances stay integer
// minor units and are compared exactly at a common scale.

export interface QuoteAccounts {
  source: string;
  destination: string;
}

interface Candidate {
  id: string;
  minor: bigint;
  decimals: number;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function listOf(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const rec = asRecord(data);
  for (const k of ["data", "accounts", "internalAccounts", "items"]) {
    if (rec && Array.isArray(rec[k])) return rec[k] as unknown[];
  }
  return [];
}

// Embedded wallets need a device signature on execute, and rule-based or bulk
// settlement accounts only collect and sweep, so neither fits a plain quote.
const QUOTABLE_TYPES = new Set(["INTERNAL_FIAT", "INTERNAL_CRYPTO"]);

function toCandidate(raw: unknown): Candidate | null {
  const a = asRecord(raw);
  if (!a || a.status !== "ACTIVE" || typeof a.id !== "string") return null;
  if (a.type !== undefined && !QUOTABLE_TYPES.has(String(a.type))) return null;
  const balance = asRecord(a.balance);
  const rawAmount = balance?.amount ?? 0;
  const decimals = Number(asRecord(balance?.currency)?.decimals ?? 0);
  if (!Number.isInteger(decimals) || decimals < 0) return null;
  if (typeof rawAmount !== "number" && typeof rawAmount !== "string") {
    return null;
  }
  let minor: bigint;
  try {
    minor = BigInt(rawAmount);
  } catch {
    return null;
  }
  return { id: a.id, minor, decimals };
}

// Positive when x holds more than y in major units.
function compareMajor(x: Candidate, y: Candidate): number {
  const scale = Math.max(x.decimals, y.decimals);
  const xs = x.minor * 10n ** BigInt(scale - x.decimals);
  const ys = y.minor * 10n ** BigInt(scale - y.decimals);
  return xs === ys ? 0 : xs > ys ? 1 : -1;
}

export function pickQuoteAccounts(data: unknown): QuoteAccounts | null {
  const active = listOf(data)
    .map(toCandidate)
    .filter((c): c is Candidate => c !== null);
  if (active.length < 2) return null;
  const [first, second] = [...active].sort((x, y) => compareMajor(y, x));
  return { source: first.id, destination: second.id };
}

const isPlaceholder = (id: unknown) =>
  typeof id === "string" && /^<.*>$/.test(id.trim());

// Returns the rewritten body, or null when it should be left as-is. An id is
// replaced only when it is a placeholder or the previous auto-pick in the same
// slot, so a hand edit survives a balance refresh.
export function applyQuoteAccounts(
  body: string,
  pick: QuoteAccounts,
  previous: QuoteAccounts | null,
): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return null;
  }
  const source = asRecord(asRecord(parsed)?.source);
  const destination = asRecord(asRecord(parsed)?.destination);
  if (!source || !destination) return null;

  const replaceable = (id: unknown, autoId: string | undefined) =>
    isPlaceholder(id) || (autoId !== undefined && id === autoId);
  if (
    !replaceable(source.accountId, previous?.source) ||
    !replaceable(destination.accountId, previous?.destination)
  ) {
    return null;
  }
  if (
    source.accountId === pick.source &&
    destination.accountId === pick.destination
  ) {
    return null;
  }
  source.accountId = pick.source;
  destination.accountId = pick.destination;
  return JSON.stringify(parsed, null, 2);
}
