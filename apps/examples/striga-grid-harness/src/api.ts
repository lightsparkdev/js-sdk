// Grid REST API helpers for the harness UI. All requests are same-origin: the
// harness proxy (scripts/striga_harness/proxy.py) injects Basic auth and
// forwards /grid/* to the local Grid server, and serves /harness/creds. The UI
// therefore never handles credentials itself.

export interface HarnessCreds {
  platform_id?: string;
  customer_id?: string;
  customer_uma?: string;
  base_url?: string;
  basic_auth?: string;
  accounts?: Record<string, string>;
  // Set by the dev server so the UI can show whether a token is configured
  // without the secret itself ever reaching the browser.
  has_credentials?: boolean;
  error?: string;
}

// What the settings panel sends. Secrets travel one way: they are POSTed to the
// dev server, which stores them and injects the auth header itself.
export interface HarnessCredsPatch {
  base_url?: string;
  client_id?: string;
  client_secret?: string;
  customer_id?: string;
  platform_id?: string;
}

// The Grid API version prefix. Environments do not all serve the same one —
// there is a `/grid/rc` blueprint and a dated `/grid/2025-10-13` — so it is taken
// from the configured base_url's path rather than hardcoded at each call site.
const DEFAULT_API_PREFIX = "/grid/rc";
let apiPrefix = DEFAULT_API_PREFIX;

export function setApiPrefixFromBaseUrl(baseUrl: string | undefined): string {
  apiPrefix = DEFAULT_API_PREFIX;
  if (baseUrl) {
    try {
      const trimmed = new URL(baseUrl).pathname.replace(/\/+$/, "");
      if (trimmed) apiPrefix = trimmed;
    } catch {
      // Not a parseable URL — keep the default rather than build broken paths.
    }
  }
  return apiPrefix;
}

export function apiPrefixValue(): string {
  return apiPrefix;
}

/** Build a Grid API path. `suffix` starts with "/" (e.g. "/customers"). */
export function gridPath(suffix: string): string {
  return `${apiPrefix}${suffix}`;
}

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface LogEntry {
  id: number;
  ts: string;
  method: HttpMethod;
  path: string;
  requestBody?: string;
  status?: number;
  responseBody?: string;
  error?: string;
}

export interface CallResult<T = unknown> {
  ok: boolean;
  status: number;
  text: string;
  json: T | null;
  error?: string;
}

let logSeq = 0;

export function nowTs(): string {
  return new Date().toLocaleTimeString();
}

export async function loadCreds(): Promise<HarnessCreds> {
  const res = await fetch("/harness/creds");
  const creds = (await res.json()) as HarnessCreds;
  if (creds && creds.error) throw new Error(creds.error);
  setApiPrefixFromBaseUrl(creds.base_url);
  return creds;
}

/**
 * Persist a connection or customer selection. The dev server verifies the
 * credentials against the target before writing, so a rejected token throws here
 * instead of failing later on every panel action.
 */
export async function saveCreds(patch: HarnessCredsPatch): Promise<HarnessCreds> {
  const res = await fetch("/harness/creds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const creds = (await res.json()) as HarnessCreds;
  if (!res.ok || creds.error) {
    throw new Error(creds.error ?? `Save failed with ${res.status}`);
  }
  setApiPrefixFromBaseUrl(creds.base_url);
  return creds;
}

// Perform a Grid API call and emit a log record via onLog. Never throws — a
// failed request resolves with ok:false so callers can branch on the result.
export async function callGrid<T = unknown>(
  method: HttpMethod,
  path: string,
  body: unknown | undefined,
  onLog: (entry: LogEntry) => void,
): Promise<CallResult<T>> {
  const ts = nowTs();
  const init: RequestInit = { method, headers: {} };
  let requestBody: string | undefined;
  if (body !== undefined && body !== null) {
    requestBody =
      typeof body === "string" ? body : JSON.stringify(body, null, 2);
    (init.headers as Record<string, string>)["Content-Type"] =
      "application/json";
    init.body = requestBody;
  }

  try {
    const res = await fetch(path, init);
    const text = await res.text();
    let json: T | null = null;
    try {
      json = text ? (JSON.parse(text) as T) : null;
    } catch {
      // non-JSON response — leave json null, keep raw text
    }
    onLog({
      id: ++logSeq,
      ts,
      method,
      path,
      requestBody,
      status: res.status,
      responseBody: prettyJson(text),
    });
    return { ok: res.ok, status: res.status, text, json };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    onLog({ id: ++logSeq, ts, method, path, requestBody, error: message });
    return { ok: false, status: 0, text: "", json: null, error: message };
  }
}

function prettyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

// Parse a JSON textarea; on failure return the raw string so the server can
// surface the validation error rather than the UI swallowing it.
export function parseJsonField(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
