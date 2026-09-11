// SCA factor enrollment + management. Both factors run end-to-end: the `secret`
// from a TOTP start is threaded into confirm, and a passkey start's options are
// threaded into a real WebAuthn ceremony whose credential confirm submits.
//
// Striga allows one passkey per customer and holds the ceremony server-side with
// a TTL, so a re-enroll needs the old factor deleted first and the two clicks
// have to be back-to-back.

import { Badge, Button, Field, Input, Table } from "@lightsparkdev/origin";
import { useCallback, useState } from "react";

import {
  createEnrollmentPasskey,
  type EnrollPasskeyOptions,
} from "./passkeyEnroll";
import { scaPath, type ScaPanelProps } from "./scaApi";
import { computeTotp } from "./totp";
import { ButtonRow, Mono, Note, Panel, Pre } from "./ui";

interface PasskeyStartResponse {
  options?: EnrollPasskeyOptions;
  allowedOrigins?: string[];
}

interface FactorView {
  factor: string;
  credentialId?: string;
  name?: string;
}

export function FactorsPanel({ call, customerId, code }: ScaPanelProps) {
  const [factors, setFactors] = useState<FactorView[] | null>(null);
  const [totpSecret, setTotpSecret] = useState("");
  const [totpB32, setTotpB32] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [passkeyStart, setPasskeyStart] = useState("");
  const [passkeyOptions, setPasskeyOptions] =
    useState<EnrollPasskeyOptions | null>(null);
  const [allowedOrigins, setAllowedOrigins] = useState<string[] | null>(null);
  const [passkeyStatus, setPasskeyStatus] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState("");

  const listFactors = useCallback(async () => {
    const r = await call<{ factors?: FactorView[] }>(
      "GET",
      scaPath("/factors", customerId),
    );
    // Only render a factor set on success; a 4xx error body has no `factors`
    // and must not read as "none enrolled" (the log carries the real response).
    setFactors(r.ok ? r.json?.factors ?? [] : null);
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
    const r = await call<PasskeyStartResponse>(
      "POST",
      scaPath("/factors", customerId),
      { type: "PASSKEY" },
    );
    setPasskeyStart(r.json ? JSON.stringify(r.json, null, 2) : r.text);
    setPasskeyOptions(r.json?.options ?? null);
    setAllowedOrigins(r.json?.allowedOrigins ?? null);
    setPasskeyStatus(
      r.ok ? "challenge ready — confirm now, it expires" : "start failed",
    );
  }, [call, customerId]);

  const confirmPasskey = useCallback(async () => {
    if (!passkeyOptions) return;
    let credential;
    try {
      credential = await createEnrollmentPasskey(passkeyOptions);
    } catch (err) {
      // A cancelled or unsupported ceremony never reaches the network, so the
      // request log would otherwise show nothing at all.
      setPasskeyStatus(err instanceof Error ? err.message : String(err));
      return;
    }
    const origin = allowedOrigins?.[0] ?? location.origin;
    const r = await call("POST", scaPath("/factors/confirm", customerId), {
      type: "PASSKEY",
      origin,
      credential,
    });
    setPasskeyStatus(r.ok ? "passkey enrolled" : "confirm rejected — see log");
    void listFactors();
  }, [call, customerId, passkeyOptions, allowedOrigins, listFactors]);

  const deleteFactor = useCallback(async () => {
    const id = deleteId.trim();
    if (!id) return;
    await call(
      "DELETE",
      scaPath(`/factors/${encodeURIComponent(id)}`, customerId),
    );
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
        <Button
          variant="outline"
          disabled={!passkeyOptions}
          onClick={() => void confirmPasskey()}
        >
          Confirm passkey (sign)
        </Button>
      </ButtonRow>
      {passkeyStatus && (
        <Note>
          {passkeyStatus}
          {passkeyOptions && (
            <>
              {" · origin: "}
              <Mono>{allowedOrigins?.[0] ?? location.origin}</Mono>
            </>
          )}
        </Note>
      )}
      {passkeyStart && (
        <>
          <Note>passkey start response:</Note>
          <Pre>{passkeyStart}</Pre>
        </>
      )}

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
