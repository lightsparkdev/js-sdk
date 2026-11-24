// Per-transaction SCA is authorized on the QUOTE (there is no
// /transactions/{id}/authorize). Executing a quote that requires SCA returns
// PENDING_AUTHORIZATION with the challenge to satisfy here.
//
// The challenge arrives from the Send page's execute and is held in App state,
// because it is delivered exactly once: GET /quotes/{id} does not carry it, and
// authorize/resend answers 204 and refuses passkey challenges outright. Pick the
// factor before executing — SMS_OTP is the default and TOTP is rejected here.

import { Button } from "@lightsparkdev/origin";
import { useCallback, useRef, useState } from "react";

import { normalizeOtpCode, OtpCodeField } from "./otpCode";
import { signLoginPasskey } from "./passkeyLogin";
import { quotePath, type ScaChallengeView, type ScaPanelProps } from "./scaApi";
import { ButtonRow, CopyableId, Mono, Note, Panel } from "./ui";

interface AuthorizeResponse {
  status?: string;
  scaChallenge?: ScaChallengeView | null;
}

export function PerTxAuthorizePanel({
  call,
  quoteId,
  challenge,
  onChallenge,
  result,
  onResult,
  subtitle = "Satisfies the challenge from the Send page's execute. Choose the factor there before executing.",
}: ScaPanelProps & {
  quoteId: string | null;
  challenge: ScaChallengeView | null;
  onChallenge: (next: ScaChallengeView | null) => void;
  result?: string | null;
  onResult?: (next: string | null) => void;
  subtitle?: string;
}) {
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const status = onResult ? (result ?? null) : localStatus;
  const setStatus = onResult ?? setLocalStatus;
  const [code, setCode] = useState("123456");

  const isPasskey = challenge?.factor === "PASSKEY";
  const currentQuote = useRef(quoteId);
  currentQuote.current = quoteId;

  const authorize = useCallback(async () => {
    if (!quoteId || !challenge) return;
    const body: Record<string, unknown> = {};
    if (challenge.factor === "PASSKEY") {
      const options = challenge.passkeyAssertionOptions;
      if (!options) {
        setStatus("passkey challenge carries no assertion options");
        return;
      }
      try {
        body.passkeyAssertion = await signLoginPasskey(options);
      } catch (err) {
        // A cancelled ceremony never reaches the network, so without this the
        // click would look like it did nothing at all.
        setStatus(err instanceof Error ? err.message : String(err));
        return;
      }
      // Per-transaction challenges omit passkeyAllowedOrigins, so the origin is
      // wherever the ceremony ran; it must match the options' relying party.
      body.origin = location.origin;
    } else {
      body.code = normalizeOtpCode(code);
    }
    const r = await call<AuthorizeResponse>(
      "POST",
      quotePath(quoteId, "/authorize"),
      body,
    );
    if (currentQuote.current !== quoteId) return;
    // A two-leg movement re-pauses with the next leg's challenge; replacing it
    // here keeps the panel pointed at whatever still needs authorizing. A wrong
    // code leaves the challenge open, so a rejection keeps it for a retry.
    if (r.ok) onChallenge(r.json?.scaChallenge ?? null);
    setStatus(
      r.ok
        ? `authorized · quote ${r.json?.status ?? "?"}`
        : "rejected — see log",
    );
  }, [call, quoteId, challenge, code, onChallenge, setStatus]);

  const resend = useCallback(async () => {
    if (!quoteId) return;
    await call("POST", quotePath(quoteId, "/authorize/resend"));
  }, [call, quoteId]);

  return (
    <Panel title="Per-transaction authorize" subtitle={subtitle}>
      {!challenge && (
        <Note>
          No pending challenge. Execute a quote on the Send page — pick
          scaFactor there — and its challenge lands here.
        </Note>
      )}
      {challenge && (
        <Note>
          quote: <CopyableId value={quoteId} />
          <br />
          factor: <Mono>{challenge.factor ?? "—"}</Mono>
          {challenge.availableFactors?.length
            ? ` · available: ${challenge.availableFactors.join(", ")}`
            : ""}
          {challenge.expiresAt ? ` · expires ${challenge.expiresAt}` : ""}
          {isPasskey && (
            <>
              <br />
              origin: <Mono>{location.origin}</Mono>
            </>
          )}
        </Note>
      )}
      {challenge && !isPasskey && (
        <OtpCodeField value={code} onChange={setCode} />
      )}
      <ButtonRow>
        <Button disabled={!challenge} onClick={() => void authorize()}>
          {isPasskey ? "Authorize (passkey)" : "Authorize"}
        </Button>
        <Button
          variant="secondary"
          disabled={!challenge || isPasskey}
          onClick={() => void resend()}
        >
          Resend code
        </Button>
      </ButtonRow>
      {status && <Note>{status}</Note>}
    </Panel>
  );
}
