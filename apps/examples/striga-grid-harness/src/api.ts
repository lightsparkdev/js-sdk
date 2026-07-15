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
  error?: string;
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
