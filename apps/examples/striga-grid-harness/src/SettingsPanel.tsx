// Point the harness at an environment without re-seeding.
//
// seed.py provisions a platform in the local DB and writes .grid-creds.json. For
// dev/prod there is nothing to seed — the platform already exists — so this panel
// takes the three values that cannot be discovered (target base URL and the API
// token pair) and lets the UI discover the rest through the same endpoints the
// other panels use.
//
// Secrets travel one way: they are POSTed to the dev server, which stores them and
// injects the auth header on proxied requests. They are never read back into the
// browser, so this panel shows only whether a token is configured.

import styled from "@emotion/styled";
import { Alert, Button, Field, Input } from "@lightsparkdev/origin";
import { useState } from "react";

import {
  apiPrefixValue,
  gridPath,
  saveCreds,
  type CallResult,
  type HarnessCreds,
  type HarnessCredsPatch,
  type HttpMethod,
} from "./api";

type CallFn = <T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
) => Promise<CallResult<T>>;

/** Origin of a base URL, or "" when unset/unparseable. */
function originOf(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

export function SettingsPanel({
  creds,
  call,
  onCredsChange,
  onCustomerDiscovered,
}: {
  creds: HarnessCreds;
  call: CallFn;
  onCredsChange: (next: HarnessCreds) => void;
  onCustomerDiscovered: (ids: string[]) => void;
}) {
  // The panel renders before the creds load resolves, so hold only the
  // operator's edit and fall back to the value the server reports.
  const [baseUrlEdit, setBaseUrlEdit] = useState<string | null>(null);
  const baseUrl = baseUrlEdit ?? creds.base_url ?? "";
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ title: string; detail: string } | null>(
    null,
  );
  const [note, setNote] = useState<string | null>(null);

  const save = async (patch: Parameters<typeof saveCreds>[0], okNote: string) => {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const next = await saveCreds(patch);
      onCredsChange(next);
      setNote(okNote);
      return next;
    } catch (err) {
      setError({
        title: "Could not save",
        detail: err instanceof Error ? err.message : String(err),
      });
      return null;
    } finally {
      setBusy(false);
    }
  };

  const connect = async () => {
    const originChanged = originOf(baseUrl) !== originOf(creds.base_url);
    // An empty field means "keep the stored value": sending it would rebuild
    // the token from a blank half and fail verification.
    const patch: HarnessCredsPatch = { base_url: baseUrl.trim() };
    const id = clientId.trim();
    const secret = clientSecret.trim();
    if (id) patch.client_id = id;
    if (secret) patch.client_secret = secret;
    const saved = await save(
      patch,
      originChanged
        ? "Credentials verified. Restart the dev server to finish switching — " +
            "its proxy target is fixed at startup, so requests are blocked until " +
            "you do (rather than silently hitting the previous environment)."
        : "Connected — credentials verified against the target.",
    );
    if (!saved) return;
    // Clear the secret from component state once the server holds it; the field
    // is write-only from here on.
    setClientSecret("");
    // A host change needs a restart before any /grid call will go through, so
    // discovering customers now would only produce a confusing 409.
    if (originChanged) return;
    // Read the selection off the save response, not the `creds` prop: the server
    // drops an environment-scoped customer when the connection changes, and the
    // prop still holds the pre-save value at this point.
    await discoverCustomers(saved.customer_id);
  };

  // Uses the same endpoint the Customers panel does, so whatever the token can
  // see is what the harness will operate on.
  const discoverCustomers = async (currentCustomerId?: string) => {
    setError(null);
    const path = gridPath("/customers");
    const r = await call<{ data?: { id?: string }[] }>("GET", path);
    // A 401, a restart-guard 409 and a network failure all arrive as ok:false
    // with no customers, which is not the same as an empty environment.
    if (!r.ok) {
      const detail = r.error ?? r.text.slice(0, 300);
      setError({
        title: "Could not list customers",
        detail: `GET ${path} failed with ${r.status || "no response"}${
          detail ? ` — ${detail}` : ""
        }`,
      });
      return;
    }
    const ids = (r.json?.data ?? [])
      .map((c) => c.id)
      .filter((id): id is string => Boolean(id));
    if (!ids.length) {
      setNote(
        "Connected, but this token returned no customers — create one in the Customers panel.",
      );
      return;
    }
    onCustomerDiscovered(ids);
    // Only auto-select when nothing valid is selected for THIS environment, and
    // never keep a selection the environment does not actually list.
    const selected = currentCustomerId ?? creds.customer_id;
    if (!selected || !ids.includes(selected)) await useCustomer(ids[0]);
  };

  const useCustomer = async (id: string) =>
    save({ customer_id: id }, `Saved active customer ${id}.`);

  const connected = Boolean(creds.has_credentials);

  return (
    <Wrapper>
      <Row>
        <Field.Root>
          <Field.Label>Grid API base URL (including version prefix)</Field.Label>
          <Input
            value={baseUrl}
            placeholder="http://localhost:5000/grid/rc"
            onChange={(e) => setBaseUrlEdit(e.target.value)}
          />
        </Field.Root>
      </Row>
      <Row>
        <Field.Root>
          <Field.Label>Client ID</Field.Label>
          <Input
            value={clientId}
            placeholder={connected ? "(stored — enter to replace)" : ""}
            onChange={(e) => setClientId(e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Client secret</Field.Label>
          <Input
            type="password"
            value={clientSecret}
            placeholder={connected ? "(stored — enter to replace)" : ""}
            onChange={(e) => setClientSecret(e.target.value)}
          />
        </Field.Root>
      </Row>

      <Buttons>
        <Button disabled={busy} onClick={() => void connect()}>
          {busy ? "Verifying…" : "Save & connect"}
        </Button>
        <Button
          variant="secondary"
          disabled={busy || !connected}
          onClick={() => void discoverCustomers()}
        >
          Re-discover customers
        </Button>
      </Buttons>

      <Status>
        token {connected ? "configured" : "not configured"} · requests go to{" "}
        <Mono>{apiPrefixValue()}</Mono>
        {creds.customer_id ? (
          <>
            {" "}
            · active customer <Mono>{creds.customer_id}</Mono>
          </>
        ) : null}
      </Status>

      {note && !error && (
        <Alert variant="default" title="Connection saved" description={note} />
      )}
      {error && (
        <Alert
          variant="critical"
          title={error.title}
          description={error.detail}
        />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 12px);
`;

const Row = styled.div`
  display: flex;
  gap: var(--spacing-sm, 12px);
  flex-wrap: wrap;

  > * {
    flex: 1 1 220px;
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: var(--spacing-xs, 8px);
  flex-wrap: wrap;
`;

const Status = styled.div`
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary, #666);
  line-height: 1.5;
`;

const Mono = styled.span`
  font-family: var(--font-family-mono);
  word-break: break-all;
  color: var(--text-primary);
`;
