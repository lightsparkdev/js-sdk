// 2FA reset / recovery — liveness-gated. Start returns a resetId + liveness link;
// poll status until LIVENESS_PASSED, then complete. The mobile body is only needed
// for an SMS_OTP reset (leave it blank otherwise).

import { Button, Field, Input, Textarea } from "@lightsparkdev/origin";
import { useCallback, useState } from "react";

import { parseJsonField } from "../api";
import {
  DEFAULT_END_USER_IP,
  SCA_FACTORS,
  scaPath,
  type ScaPanelProps,
} from "./scaApi";
import { ButtonRow, EnumSelect, Mono, Note, Panel } from "./ui";

export function ResetPanel({ call, customerId }: ScaPanelProps) {
  const [factor, setFactor] = useState<string>("TOTP");
  const [resetId, setResetId] = useState<string | null>(null);
  const [verificationLink, setVerificationLink] = useState<string | null>(null);
  const [livenessToken, setLivenessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [mobileBody, setMobileBody] = useState("");
  const [endUserIp, setEndUserIp] = useState(DEFAULT_END_USER_IP);

  const start = useCallback(async () => {
    const r = await call<{
      resetId?: string;
      verificationLink?: string;
      livenessAccessToken?: string;
    }>("POST", scaPath("/factors/reset", customerId), {
      factor,
      endUserIpAddress: endUserIp.trim(),
    });
    setResetId(r.json?.resetId ?? null);
    setVerificationLink(r.json?.verificationLink ?? null);
    setLivenessToken(r.json?.livenessAccessToken ?? null);
    setStatus(null);
  }, [call, customerId, factor, endUserIp]);

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
    const body: Record<string, unknown> = {
      endUserIpAddress: endUserIp.trim(),
    };
    if (mobileBody.trim()) {
      const parsed = parseJsonField(mobileBody);
      // Only `mobile` is read off the pasted JSON: merging it wholesale would let
      // it overwrite endUserIpAddress. parseJsonField also hands back the raw
      // string when it does not parse, which would otherwise silently drop the
      // number rather than reaching the server.
      const mobile =
        typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
          ? (parsed as { mobile?: unknown }).mobile
          : undefined;
      if (mobile === undefined) {
        setStatus('mobile body must be JSON shaped {"mobile": {...}}');
        return;
      }
      body.mobile = mobile;
    }
    await call(
      "POST",
      scaPath(
        `/factors/reset/${encodeURIComponent(resetId)}/complete`,
        customerId,
      ),
      body,
    );
  }, [call, customerId, resetId, mobileBody, endUserIp]);

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
        <Field.Label>endUserIpAddress</Field.Label>
        <Input
          value={endUserIp}
          onChange={(e) => setEndUserIp(e.target.value)}
        />
      </Field.Root>
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
