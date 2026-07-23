// SCA session login (180-day exemption). Start issues a challenge for the chosen
// factor; complete submits the proof. SMS_OTP/TOTP use the sandbox code; the
// SMS_OTP challengeId from start is echoed back on complete automatically.
// PASSKEY drives a real WebAuthn ceremony: start returns request options + the
// allowed origin, complete submits the signed assertion.

import { Button, Field } from "@lightsparkdev/origin";
import { useCallback, useState } from "react";

import { type LoginPasskeyOptions, signLoginPasskey } from "./passkeyLogin";
import { SCA_FACTORS, scaPath, type ScaPanelProps } from "./scaApi";
import { ButtonRow, EnumSelect, Mono, Note, Panel } from "./ui";

interface LoginStartResponse {
  challengeId?: string;
  options?: LoginPasskeyOptions;
  allowedOrigins?: string[];
}

export function LoginPanel({ call, customerId, code }: ScaPanelProps) {
  const [factor, setFactor] = useState<string>("SMS_OTP");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [passkeyOptions, setPasskeyOptions] =
    useState<LoginPasskeyOptions | null>(null);
  const [allowedOrigins, setAllowedOrigins] = useState<string[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const start = useCallback(async () => {
    const r = await call<LoginStartResponse>(
      "POST",
      scaPath("/login/start", customerId),
      { factor },
    );
    setChallengeId(r.json?.challengeId ?? null);
    setPasskeyOptions(r.json?.options ?? null);
    setAllowedOrigins(r.json?.allowedOrigins ?? null);
    setStatus(null);
  }, [call, customerId, factor]);

  const complete = useCallback(async () => {
    const body: Record<string, unknown> = { factor };
    if (factor === "PASSKEY") {
      if (!passkeyOptions) {
        setStatus("run login start first");
        return;
      }
      body.passkeyAssertion = await signLoginPasskey(passkeyOptions);
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
