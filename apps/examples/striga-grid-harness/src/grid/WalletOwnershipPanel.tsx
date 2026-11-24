// Self-custody wallets stay PENDING_OWNERSHIP_VERIFICATION until the owner
// proves control. The harness has no wallet key, so a WALLET_SIGNATURE proof is
// signed in the wallet and pasted back. LIVENESS settles asynchronously.

import { Button } from "@lightsparkdev/origin";
import { useEffect, useRef, useState } from "react";

import { gridPath } from "../api";
import { ButtonRow, CopyableId, Mono, Note, Panel, Pre } from "../sca/ui";
import { TextField, type CallFn } from "./common";

const METHODS = ["WALLET_SIGNATURE", "LIVENESS"] as const;
type Method = (typeof METHODS)[number];

const SCOPES = [
  { id: "customers", label: "Customer" },
  { id: "platform", label: "Platform" },
] as const;
type Scope = (typeof SCOPES)[number]["id"];

const SCHEMES = ["", "bip137", "electrum"] as const;

interface Challenge {
  method?: Method;
  messageToSign?: string;
  verificationLink?: string;
  token?: string;
  expiresAt?: string;
}

export function WalletOwnershipPanel({
  call,
  externalAccountId,
}: {
  call: CallFn;
  externalAccountId: string;
}) {
  const [scope, setScope] = useState<Scope>("customers");
  const [accountId, setAccountId] = useState(externalAccountId);
  const [method, setMethod] = useState<Method>("WALLET_SIGNATURE");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [signature, setSignature] = useState("");
  const [scheme, setScheme] = useState<(typeof SCHEMES)[number]>("");
  const [status, setStatus] = useState<string | null>(null);
  const [challengeError, setChallengeError] = useState<string | null>(null);

  // The prefill is always a customer-created account.
  useEffect(() => {
    if (externalAccountId) {
      setAccountId(externalAccountId);
      setScope("customers");
    }
  }, [externalAccountId]);

  // Results belong to the request that asked for them. A change of target or
  // a newer request of the same kind discards anything still in flight.
  const target = `${scope}|${accountId.trim()}`;
  const challengeGen = useRef(0);
  const statusGen = useRef(0);
  useEffect(() => {
    challengeGen.current++;
    statusGen.current++;
    setChallenge(null);
    setChallengeError(null);
    setSignature("");
    setStatus(null);
  }, [target]);

  const accountPath = (suffix = "") =>
    gridPath(
      `/${scope}/external-accounts/${encodeURIComponent(
        accountId.trim(),
      )}${suffix}`,
    );

  const report = (
    asked: number,
    r: { ok: boolean; status: number; json: unknown },
  ) => {
    if (asked !== statusGen.current) return;
    const s = (r.json as { status?: string } | null)?.status;
    setStatus(
      r.ok ? `status: ${s ?? "ok"}` : `HTTP ${r.status || "error"} — see log`,
    );
  };

  const start = async () => {
    if (!accountId.trim()) return;
    const asked = ++challengeGen.current;
    const r = await call<Challenge>("POST", accountPath("/challenge"), {
      method,
    });
    if (asked !== challengeGen.current) return;
    setChallenge(r.ok ? r.json : null);
    setSignature("");
    setChallengeError(
      r.ok ? null : `challenge failed: HTTP ${r.status || "error"} — see log`,
    );
  };

  const verify = async () => {
    if (!accountId.trim()) return;
    const body: Record<string, string> = { signature: signature.trim() };
    if (scheme) body.signatureScheme = scheme;
    const asked = ++statusGen.current;
    report(asked, await call("POST", accountPath("/verify"), body));
  };

  const checkStatus = async () => {
    if (!accountId.trim()) return;
    const asked = ++statusGen.current;
    report(asked, await call("GET", accountPath()));
  };

  return (
    <Panel
      title="Wallet ownership verification"
      subtitle="Prove a first-party self-custody wallet belongs to its owner. The account must be PENDING_OWNERSHIP_VERIFICATION or UNVERIFIED."
    >
      <ChoiceRow
        options={SCOPES.map((s) => ({ value: s.id, label: s.label }))}
        value={scope}
        onChange={(v) => setScope(v as Scope)}
      />
      <TextField
        label="External account id"
        value={accountId}
        onChange={setAccountId}
      />
      <ChoiceRow
        options={METHODS.map((m) => ({ value: m, label: m }))}
        value={method}
        onChange={(v) => setMethod(v as Method)}
      />
      <ButtonRow>
        <Button disabled={!accountId.trim()} onClick={() => void start()}>
          Start challenge
        </Button>
        <Button
          variant="secondary"
          disabled={!accountId.trim()}
          onClick={() => void checkStatus()}
        >
          Check status
        </Button>
      </ButtonRow>

      {challenge?.messageToSign && (
        <>
          <Note>
            Sign this exact message in the wallet
            {challenge.expiresAt ? ` before ${challenge.expiresAt}` : ""}:
          </Note>
          <Pre>{challenge.messageToSign}</Pre>
          <ButtonRow>
            <Button
              variant="outline"
              size="compact"
              onClick={() =>
                void navigator.clipboard.writeText(
                  challenge.messageToSign ?? "",
                )
              }
            >
              Copy message
            </Button>
          </ButtonRow>
        </>
      )}
      {challenge?.verificationLink && (
        <Note>
          Open the hosted check
          {challenge.expiresAt ? ` before ${challenge.expiresAt}` : ""}:{" "}
          <a href={challenge.verificationLink} target="_blank" rel="noreferrer">
            {challenge.verificationLink}
          </a>
          {challenge.token && (
            <>
              <br />
              SDK token: <CopyableId value={challenge.token} />
            </>
          )}
          <br />
          The outcome arrives asynchronously. Use Check status to poll.
        </Note>
      )}

      {challengeError && (
        <Note>
          <Mono>{challengeError}</Mono>
        </Note>
      )}
      {method === "WALLET_SIGNATURE" && (
        <>
          <TextField
            label="Signature"
            value={signature}
            onChange={setSignature}
            placeholder="EIP-191 hex (EVM), base64 (Bitcoin), base58 (Solana)"
          />
          <Note>Bitcoin signature scheme (ignored for other chains):</Note>
          <ChoiceRow
            options={SCHEMES.map((s) => ({
              value: s,
              label: s || "default",
            }))}
            value={scheme}
            onChange={(v) => setScheme(v as (typeof SCHEMES)[number])}
          />
          <ButtonRow>
            <Button
              disabled={!accountId.trim() || !signature.trim()}
              onClick={() => void verify()}
            >
              Verify signature
            </Button>
          </ButtonRow>
        </>
      )}
      {status && (
        <Note>
          <Mono>{status}</Mono>
        </Note>
      )}
    </Panel>
  );
}

function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <ButtonRow>
      {options.map((o) => (
        <Button
          key={o.value}
          size="compact"
          variant={o.value === value ? "secondary" : "ghost"}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </Button>
      ))}
    </ButtonRow>
  );
}
