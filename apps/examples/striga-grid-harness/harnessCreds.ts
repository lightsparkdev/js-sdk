// Server-side logic behind the harness's /harness/creds endpoint: it merges a
// patch into the stored credentials, verifies a changed connection against the
// target before persisting, and strips secrets from what the browser sees.

import { readFileSync, writeFileSync } from "node:fs";

export interface HarnessCreds {
  base_url?: string;
  basic_auth?: string;
  client_id?: string;
  client_secret?: string;
  customer_id?: string;
  [key: string]: unknown;
}

// Credential fields the browser never needs — the proxy injects auth
// server-side, so these stay out of the /harness/creds response. The settings
// panel sends them one way (POST) but never reads them back.
const SECRET_CREDS_FIELDS = ["basic_auth", "client_id", "client_secret"];

// Identifiers that are only valid within one environment, so they must not
// survive a change of target or token.
const ENVIRONMENT_SCOPED_FIELDS = [
  "customer_id",
  "customer_uma",
  "accounts",
  "platform_id",
  "striga_user_id",
  "webhook_path",
] as const;

export interface CredsStore {
  read: () => HarnessCreds & { error?: string };
  write: (creds: HarnessCreds) => void;
}

export interface JsonResponse {
  status: number;
  body: unknown;
}

/**
 * A store over the JSON file the seed script writes. Reads parse fresh on each
 * call so a re-seed or a settings save is picked up without a restart.
 */
export function fileCredsStore(credsPath: string): CredsStore {
  return {
    read: () => {
      try {
        return JSON.parse(readFileSync(credsPath, "utf8")) as HarnessCreds;
      } catch (err) {
        return {
          error: `Could not read .grid-creds.json: ${(err as Error).message}`,
        };
      }
    },
    write: (creds) => {
      writeFileSync(credsPath, `${JSON.stringify(creds, null, 2)}\n`, "utf8");
    },
  };
}

/**
 * Reject a save that did not come from the harness page itself, or null when the
 * request looks legitimate. A page on any other origin can POST here with a
 * simple content type and no preflight; the endpoint would then send the stored
 * token to whatever base_url that page chose.
 */
export function rejectForeignSave(headers: {
  contentType?: string;
  origin?: string;
  host?: string;
}): JsonResponse | null {
  if (!(headers.contentType ?? "").includes("application/json")) {
    return {
      status: 415,
      body: { error: "Expected a Content-Type of application/json." },
    };
  }
  if (headers.origin !== undefined) {
    let originHost: string;
    try {
      originHost = new URL(headers.origin).host;
    } catch {
      originHost = "";
    }
    if (!originHost || originHost !== headers.host) {
      return {
        status: 403,
        body: { error: `Cross-origin save from ${headers.origin} refused.` },
      };
    }
  }
  return null;
}

/** The stored credentials as the browser is allowed to see them. */
export function publicCreds(creds: HarnessCreds): HarnessCreds {
  const shown: HarnessCreds = { ...creds };
  for (const field of SECRET_CREDS_FIELDS) delete shown[field];
  return { ...shown, has_credentials: Boolean(creds.basic_auth) };
}

// Confirm the credentials actually work before persisting them, so a typo
// surfaces here rather than as a puzzling 401 on every later panel action.
async function verifyCredentials(
  baseUrl: string,
  basicAuth: string,
): Promise<string | null> {
  const url = `${baseUrl.replace(/\/+$/, "")}/customers`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${basicAuth}` },
    });
    if (res.ok) return null;
    const body = (await res.text()).slice(0, 200);
    return `${res.status} from GET ${url}${body ? ` — ${body}` : ""}`;
  } catch (err) {
    return `Could not reach ${url}: ${(err as Error).message}`;
  }
}

export async function applyCredsPatch(
  patch: HarnessCreds,
  store: CredsStore,
): Promise<JsonResponse> {
  const existing = store.read();
  delete existing.error;
  const next: HarnessCreds = { ...existing, ...patch };

  // A customer, its uma and its account ids only mean anything in the
  // environment they came from. The merge that keeps credentials alive when
  // saving a customer would carry them the other way too, leaving a customer
  // from the previous environment selected — every later call would then
  // 401/404 on an id the new target has never seen. Drop them whenever the
  // connection itself changes, unless this same request supplies them. Doing it
  // here rather than in the panel also covers the reload-after-restart path,
  // which the panel never sees.
  const connectionChanged =
    (patch.base_url !== undefined && patch.base_url !== existing.base_url) ||
    (patch.client_id !== undefined && patch.client_id !== existing.client_id);
  if (connectionChanged) {
    for (const field of ENVIRONMENT_SCOPED_FIELDS) {
      if (patch[field] === undefined) delete next[field];
    }
  }

  // Recompute basic_auth whenever either half of the token changes, so the
  // value the proxy injects can never drift from the pair the operator entered.
  const tokenChanged =
    patch.client_id !== undefined || patch.client_secret !== undefined;
  if (tokenChanged) {
    const id = next.client_id ?? "";
    const secret = next.client_secret ?? "";
    next.basic_auth = Buffer.from(`${id}:${secret}`).toString("base64");
  }

  // A replaced secret alone is enough to make the stored token unusable, so it
  // is verified like a change of target or client id.
  if (patch.base_url !== undefined || tokenChanged) {
    const failure = await verifyCredentials(
      next.base_url ?? "",
      next.basic_auth ?? "",
    );
    if (failure) {
      return {
        status: 400,
        body: { error: `Credentials rejected: ${failure}` },
      };
    }
  }

  store.write(next);
  return { status: 200, body: publicCreds(next) };
}
