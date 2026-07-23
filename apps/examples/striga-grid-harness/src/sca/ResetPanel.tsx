// 2FA reset / recovery — liveness-gated. Start returns a resetId + liveness link;
// poll status until LIVENESS_PASSED, then complete. The mobile body is only needed
// for an SMS_OTP reset (leave it blank otherwise).

import { Button, Field, Textarea } from "@lightsparkdev/origin";
import { useCallback, useState } from "react";

import { parseJsonField } from "../api";
import { SCA_FACTORS, scaPath, type ScaPanelProps } from "./scaApi";
import { ButtonRow, EnumSelect, Mono, Note, Panel } from "./ui";

export function ResetPanel({ call, customerId }: ScaPanelProps) {
  const [factor, setFactor] = useState<string>("TOTP");
  const [resetId, setResetId] = useState<string | null>(null);
  const [verificationLink, setVerificationLink] = useState<string | null>(null);
  const [livenessToken, setLivenessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [mobileBody, setMobileBody] = useState("");

  const start = useCallback(async () => {
    const r = await call<{
      resetId?: string;
      verificationLink?: string;
      livenessAccessToken?: string;
    }>("POST", scaPath("/factors/reset", customerId), { factor });
    setResetId(r.json?.resetId ?? null);
    setVerificationLink(r.json?.verificationLink ?? null);
    setLivenessToken(r.json?.livenessAccessToken ?? null);
    setStatus(null);
  }, [call, customerId, factor]);

  const pollStatus = useCallback(async () => {
    if (!resetId) return;
    const r = await call<{ status?: string }>(
      "GET",
      scaPath(`/factors/reset/${encodeURIComponent(resetId)}`, customerId),
    );
    setStatus(r.json?.status ?? null);
  }, [call, customerId, resetId]);

  const complete = useCallback(async () => {
    if (!resetId) return;
    const body = mobileBody.trim() ? parseJsonField(mobileBody) : undefined;
    await call(
      "POST",
      scaPath(
        `/factors/reset/${encodeURIComponent(resetId)}/complete`,
        customerId,
      ),
      body,
    );
  }, [call, customerId, resetId, mobileBody]);

  return (
    <Panel
      title="2FA reset"
      subtitle="Liveness-gated recovery: start → poll → complete."
    >
      <Field.Root>
        <Field.Label>Factor to reset</Field.Label>
        <EnumSelect
          value={factor}
          onValueChange={setFactor}
          options={SCA_FACTORS}
        />
      </Field.Root>
      <ButtonRow>
        <Button onClick={() => void start()}>Reset start</Button>
        <Button
          variant="secondary"
          disabled={!resetId}
          onClick={() => void pollStatus()}
        >
          Poll status
        </Button>
        <Button
          variant="outline"
          disabled={!resetId}
          onClick={() => void complete()}
        >
          Reset complete
        </Button>
      </ButtonRow>
      {resetId && (
        <Note>
          resetId: <Mono>{resetId}</Mono>
          {status ? ` · status: ${status}` : ""}
        </Note>
      )}
      {verificationLink && (
        <Note>
          liveness link:{" "}
          <a href={verificationLink} target="_blank" rel="noreferrer">
            <Mono>{verificationLink}</Mono>
          </a>
        </Note>
      )}
      {livenessToken && (
        <Note>
          livenessAccessToken: <Mono>{livenessToken}</Mono>
        </Note>
      )}
      <Field.Root>
        <Field.Label>
          Mobile body — SMS_OTP reset only, e.g. {"{"}"mobile":{"{"}
          "countryCode":"+49","number":"15123456789"{"}"}
          {"}"}
        </Field.Label>
        <Textarea
          rows={3}
          value={mobileBody}
          onChange={(e) => setMobileBody(e.target.value)}
        />
      </Field.Root>
    </Panel>
  );
}
