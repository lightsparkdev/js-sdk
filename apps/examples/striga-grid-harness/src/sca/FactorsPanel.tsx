// SCA factor enrollment + management. TOTP is driven end-to-end with the sandbox
// OTP; PASSKEY start/list/delete are callable but the WebAuthn credential blob is
// entered by hand (no automated ceremony). The `secret` from a TOTP start is
// threaded into confirm automatically so the two clicks complete an enrollment.

import { Badge, Button, Field, Input, Table, Textarea } from "@lightsparkdev/origin";
import { useCallback, useState } from "react";

import { parseJsonField } from "../api";
import { scaPath, type ScaPanelProps } from "./scaApi";
import { computeTotp } from "./totp";
import { ButtonRow, Mono, Note, Panel, Pre } from "./ui";

interface FactorView {
  factor: string;
  credentialId?: string;
  name?: string;
}

const PASSKEY_CONFIRM_TEMPLATE = JSON.stringify(
  { type: "PASSKEY", origin: "", credential: {} },
  null,
  2,
);

export function FactorsPanel({ call, customerId, code }: ScaPanelProps) {
  const [factors, setFactors] = useState<FactorView[] | null>(null);
  const [totpSecret, setTotpSecret] = useState("");
  const [totpB32, setTotpB32] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [passkeyStart, setPasskeyStart] = useState("");
  const [passkeyConfirmBody, setPasskeyConfirmBody] = useState(
    PASSKEY_CONFIRM_TEMPLATE,
  );
  const [deleteId, setDeleteId] = useState("");

  const listFactors = useCallback(async () => {
    const r = await call<{ factors?: FactorView[] }>(
      "GET",
      scaPath("/factors", customerId),
    );
    // Only render a factor set on success; a 4xx error body has no `factors`
    // and must not read as "none enrolled" (the log carries the real response).
    setFactors(r.ok ? (r.json?.factors ?? []) : null);
  }, [call, customerId]);

  const enrollTotp = useCallback(async () => {
    const r = await call<{
      secret?: string;
      secretBase32Encoded?: string;
      totpUri?: string;
    }>("POST", scaPath("/factors", customerId), { type: "TOTP" });
    setTotpSecret(r.json?.secret ?? "");
    setTotpB32(r.json?.secretBase32Encoded ?? "");
    setTotpUri(r.json?.totpUri ?? "");
    setRecoveryCodes(null);
  }, [call, customerId]);

  // TOTP confirm needs the real time-based code (the sandbox rejects 123456),
  // so derive it from the enroll-start secret; the shared code is the fallback.
  const confirmTotp = useCallback(async () => {
    const otp = totpB32 ? await computeTotp(totpB32) : code;
    const r = await call<{ recoveryCodes?: string[] }>(
      "POST",
      scaPath("/factors/confirm", customerId),
      { type: "TOTP", secret: totpSecret, code: otp },
    );
    setRecoveryCodes(r.json?.recoveryCodes ?? null);
    void listFactors();
  }, [call, customerId, totpSecret, totpB32, code, listFactors]);

  const enrollPasskey = useCallback(async () => {
    const r = await call("POST", scaPath("/factors", customerId), {
      type: "PASSKEY",
    });
    setPasskeyStart(r.json ? JSON.stringify(r.json, null, 2) : r.text);
    setPasskeyConfirmBody(PASSKEY_CONFIRM_TEMPLATE);
  }, [call, customerId]);

  const confirmPasskey = useCallback(async () => {
    await call(
      "POST",
      scaPath("/factors/confirm", customerId),
      parseJsonField(passkeyConfirmBody),
    );
    void listFactors();
  }, [call, customerId, passkeyConfirmBody, listFactors]);

  const deleteFactor = useCallback(async () => {
    const id = deleteId.trim();
    if (!id) return;
    await call("DELETE", scaPath(`/factors/${encodeURIComponent(id)}`, customerId));
    void listFactors();
  }, [call, customerId, deleteId, listFactors]);

  return (
    <Panel
      title="Factors — enroll / list / delete"
      subtitle="TOTP end-to-end (auto-computed from secret); passkey blobs are manual."
    >
      <ButtonRow>
        <Button variant="secondary" onClick={() => void listFactors()}>
          List factors
        </Button>
      </ButtonRow>
      <FactorTable factors={factors} />

      <ButtonRow>
        <Button onClick={() => void enrollTotp()}>Enroll TOTP</Button>
        <Button
          variant="secondary"
          disabled={!totpSecret}
          onClick={() => void confirmTotp()}
        >
          Confirm TOTP (auto)
        </Button>
      </ButtonRow>
      {totpUri && (
        <Note>
          otpauth: <Mono>{totpUri}</Mono>
        </Note>
      )}
      {recoveryCodes && (
        <Note>
          recovery codes: <Mono>{recoveryCodes.join(", ")}</Mono>
        </Note>
      )}

      <ButtonRow>
        <Button variant="outline" onClick={() => void enrollPasskey()}>
          Enroll passkey (start)
        </Button>
        <Button variant="outline" onClick={() => void confirmPasskey()}>
          Confirm passkey
        </Button>
      </ButtonRow>
      {passkeyStart && (
        <>
          <Note>passkey start response (build the assertion from this):</Note>
          <Pre>{passkeyStart}</Pre>
        </>
      )}
      <Field.Root>
        <Field.Label>Passkey confirm body (manual)</Field.Label>
        <Textarea
          rows={5}
          value={passkeyConfirmBody}
          onChange={(e) => setPasskeyConfirmBody(e.target.value)}
        />
      </Field.Root>

      <Field.Root>
        <Field.Label>Delete factor — credentialId</Field.Label>
        <Input value={deleteId} onChange={(e) => setDeleteId(e.target.value)} />
      </Field.Root>
      <ButtonRow>
        <Button variant="ghost" onClick={() => void deleteFactor()}>
          Delete factor
        </Button>
      </ButtonRow>
    </Panel>
  );
}

function FactorTable({ factors }: { factors: FactorView[] | null }) {
  if (!factors) return <Note>—</Note>;
  if (!factors.length) return <Note>no factors enrolled</Note>;
  return (
    <Table.Root size="compact">
      <Table.Header>
        <Table.HeaderRow>
          <Table.HeaderCell>factor</Table.HeaderCell>
          <Table.HeaderCell>credentialId</Table.HeaderCell>
          <Table.HeaderCell>name</Table.HeaderCell>
        </Table.HeaderRow>
      </Table.Header>
      <Table.Body>
        {factors.map((f, i) => (
          <Table.Row key={(f.credentialId ?? f.factor) + i}>
            <Table.Cell>
              <Badge variant="gray">{f.factor}</Badge>
            </Table.Cell>
            <Table.Cell>
              <Mono>{f.credentialId ?? "—"}</Mono>
            </Table.Cell>
            <Table.Cell>{f.name ?? "—"}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
