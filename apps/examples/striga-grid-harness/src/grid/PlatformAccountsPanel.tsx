import { Button } from "@lightsparkdev/origin";
import { useState } from "react";

import { gridPath, parseJsonField } from "../api";
import { ButtonRow, Note, Panel } from "../sca/ui";
import { JsonField, pickId, TextField, type CallFn } from "./common";

const PLATFORM_EXTERNAL_TEMPLATE = JSON.stringify(
  {
    currency: "EUR",
    platformAccountId: "harness-platform-eur",
    accountInfo: {
      accountType: "EUR_ACCOUNT",
      iban: "DE89370400440532013000",
      swiftCode: "COBADEFFXXX",
      beneficiary: {
        beneficiaryType: "BUSINESS",
        fullName: "Harness Platform Ltd",
        address: {
          line1: "Friedrichstrasse 123",
          city: "Berlin",
          postalCode: "10117",
          country: "DE",
        },
      },
    },
  },
  null,
  2,
);

const INTERNAL_UPDATE_TEMPLATE = JSON.stringify(
  { privateEnabled: true },
  null,
  2,
);

export function PlatformAccountsPanel({ call }: { call: CallFn }) {
  const [externalBody, setExternalBody] = useState(PLATFORM_EXTERNAL_TEMPLATE);
  const [platformExternalId, setPlatformExternalId] = useState("");
  const [internalAccountId, setInternalAccountId] = useState("");
  const [internalUpdateBody, setInternalUpdateBody] = useState(
    INTERNAL_UPDATE_TEMPLATE,
  );
  const [clientPublicKey, setClientPublicKey] = useState("");

  const createExternal = async () => {
    const r = await call(
      "POST",
      gridPath("/platform/external-accounts"),
      parseJsonField(externalBody),
    );
    const id = pickId(r.json);
    if (id) setPlatformExternalId(id);
  };

  const externalById = (method: "GET" | "DELETE") => {
    const id = platformExternalId.trim();
    if (!id) return;
    void call(
      method,
      gridPath(`/platform/external-accounts/${encodeURIComponent(id)}`),
    );
  };

  // The export response is encrypted to this key. Grid wants an uncompressed
  // SEC1 P-256 point (130 hex chars, "04" prefix), which is what exporting an
  // ECDH public key as raw yields.
  const generateExportKey = async () => {
    const pair = await crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveBits"],
    );
    const raw = await crypto.subtle.exportKey("raw", pair.publicKey);
    setClientPublicKey(
      [...new Uint8Array(raw)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    );
  };

  const internalAction = (
    method: "PATCH" | "POST",
    suffix: string,
    body?: unknown,
  ) => {
    const id = internalAccountId.trim();
    if (!id) return;
    void call(
      method,
      gridPath(`/internal-accounts/${encodeURIComponent(id)}${suffix}`),
      body,
    );
  };

  return (
    <Panel
      title="Platform accounts"
      subtitle="Platform-owned internal balances + external destinations, and internal-account admin."
    >
      <ButtonRow>
        <Button
          variant="secondary"
          onClick={() =>
            void call("GET", gridPath("/platform/internal-accounts"))
          }
        >
          List platform internal accounts
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            void call("GET", gridPath("/platform/external-accounts"))
          }
        >
          List platform external accounts
        </Button>
      </ButtonRow>
      <JsonField
        label={`Platform external account — POST ${gridPath(
          "/platform/external-accounts",
        )}`}
        value={externalBody}
        onChange={setExternalBody}
        rows={12}
      />
      <ButtonRow>
        <Button onClick={() => void createExternal()}>
          Create platform external account
        </Button>
      </ButtonRow>
      <TextField
        label="Platform external account id (get / delete)"
        value={platformExternalId}
        onChange={setPlatformExternalId}
      />
      <ButtonRow>
        <Button variant="secondary" onClick={() => externalById("GET")}>
          Get
        </Button>
        <Button variant="ghost" onClick={() => externalById("DELETE")}>
          Delete
        </Button>
      </ButtonRow>
      <Note>
        Update and export both open a signed-retry flow: the first call returns
        202 with a SignedRequestChallenge (payloadToSign + requestId), and the
        retry must carry a Grid-Wallet-Signature stamped by the embedded
        wallet&apos;s key. The harness holds no wallet key, so it stops at the
        202 and shows the challenge in the log.
      </Note>
      <TextField
        label="Internal account id"
        value={internalAccountId}
        onChange={setInternalAccountId}
      />
      <JsonField
        label="Update body (PATCH)"
        value={internalUpdateBody}
        onChange={setInternalUpdateBody}
        rows={4}
      />
      <ButtonRow>
        <Button
          variant="secondary"
          onClick={() =>
            internalAction("PATCH", "", parseJsonField(internalUpdateBody))
          }
        >
          Update internal account
        </Button>
      </ButtonRow>
      <TextField
        label="clientPublicKey (export)"
        value={clientPublicKey}
        onChange={setClientPublicKey}
        placeholder="04… (130 hex chars)"
      />
      <ButtonRow>
        <Button variant="outline" onClick={() => void generateExportKey()}>
          Generate key
        </Button>
        <Button
          variant="outline"
          disabled={!clientPublicKey.trim()}
          onClick={() =>
            internalAction("POST", "/export", {
              clientPublicKey: clientPublicKey.trim(),
            })
          }
        >
          Export
        </Button>
      </ButtonRow>
      <Note>
        clientPublicKey is bound into the challenge as the export target, so a
        completed retry would return credentials encrypted to it.
      </Note>
    </Panel>
  );
}
