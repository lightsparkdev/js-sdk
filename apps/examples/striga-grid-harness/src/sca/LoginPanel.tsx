// SCA session login (180-day exemption). Start issues a challenge for the chosen
// factor; complete submits the proof. SMS_OTP/TOTP use the sandbox code; the
// SMS_OTP challengeId from start is echoed back on complete automatically.
// PASSKEY drives a real WebAuthn ceremony: start returns request options + the
// allowed origin, complete submits the signed assertion.
//
// Login start names its options `passkeyOptions`, while factor-enrollment start
// names the same shape `options` — the two are not interchangeable.

import { Button, Field, Input } from "@lightsparkdev/origin";
import { useCallback, useState } from "react";

import { type LoginPasskeyOptions, signLoginPasskey } from "./passkeyLogin";
import { SCA_FACTORS, scaPath, type ScaPanelProps } from "./scaApi";
import { ButtonRow, EnumSelect, Mono, Note, Panel } from "./ui";

interface LoginStartResponse {
  challengeId?: string;
  passkeyOptions?: LoginPasskeyOptions;
  allowedOrigins?: string[];
}

// login/complete requires a syntactically valid IP; loopback satisfies it for a
// local harness run, and the field is editable for a real end-user address.
const DEFAULT_END_USER_IP = "127.0.0.1";

export function LoginPanel({ call, customerId, code }: ScaPanelProps) {
  const [factor, setFactor] = useState<string>("SMS_OTP");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [passkeyOptions, setPasskeyOptions] =
    useState<LoginPasskeyOptions | null>(null);
  const [allowedOrigins, setAllowedOrigins] = useState<string[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [endUserIp, setEndUserIp] = useState(DEFAULT_END_USER_IP);

  const start = useCallback(async () => {
    const r = await call<LoginStartResponse>(
      "POST",
      scaPath("/login/start", customerId),
      { factor },
    );
    setChallengeId(r.json?.challengeId ?? null);
    setPasskeyOptions(r.json?.passkeyOptions ?? null);
    setAllowedOrigins(r.json?.allowedOrigins ?? null);
    setStatus(null);
  }, [call, customerId, factor]);

  const complete = useCallback(async () => {
    const body: Record<string, unknown> = {
      factor,
      endUserIpAddress: endUserIp.trim(),
    };
    if (factor === "PASSKEY") {
      if (!passkeyOptions) {
        setStatus("run login start first");
        return;
      }
      try {
        body.passkeyAssertion = await signLoginPasskey(passkeyOptions);
      } catch (err) {
        // A cancelled ceremony never reaches the network, so without this the
        // click would look like it did nothing at all.
        setStatus(err instanceof Error ? err.message : String(err));
        return;
      }
      body.origin = allowedOrigins?.[0] ?? location.origin;
    } else {
      body.code = code;
      if (challengeId) body.challengeId = challengeId;
    }
    const r = await call<{ status?: string }>(
      "POST",
      scaPath("/login/complete", customerId),
      body,
    );
    setStatus(r.json?.status ?? (r.ok ? "ok" : "error"));
  }, [
    call,
    customerId,
    factor,
    code,
    challengeId,
    passkeyOptions,
    allowedOrigins,
    endUserIp,
  ]);

  return (
    <Panel
      title="Login — session"
      subtitle="Start a login challenge, then complete it."
    >
      <Field.Root>
        <Field.Label>Factor</Field.Label>
        <EnumSelect
          value={factor}
          onValueChange={setFactor}
          options={SCA_FACTORS}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>endUserIpAddress (required by login/complete)</Field.Label>
        <Input
          value={endUserIp}
          onChange={(e) => setEndUserIp(e.target.value)}
        />
      </Field.Root>
      <ButtonRow>
        <Button onClick={() => void start()}>Login start</Button>
        <Button variant="secondary" onClick={() => void complete()}>
          {factor === "PASSKEY"
            ? "Login complete (passkey)"
            : `Login complete (${code})`}
        </Button>
      </ButtonRow>
      {challengeId && (
        <Note>
          challengeId: <Mono>{challengeId}</Mono>
        </Note>
      )}
      {passkeyOptions && (
        <Note>
          passkey challenge ready · origin:{" "}
          <Mono>{allowedOrigins?.[0] ?? location.origin}</Mono>
        </Note>
      )}
      {status && (
        <Note>
          status: <Mono>{status}</Mono>
        </Note>
      )}
    </Panel>
  );
}
