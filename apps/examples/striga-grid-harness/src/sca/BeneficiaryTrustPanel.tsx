// SCA-gated beneficiary trust: whitelisting a payee so recurring sends to it skip
// the per-transaction ceremony. Customer identity is implicit in the external
// account id. Start may issue an SMS challenge; confirm submits the code.

import { Button, Field, Input } from "@lightsparkdev/origin";
import { useCallback, useState } from "react";

import { externalAccountPath, type ScaPanelProps } from "./scaApi";
import { ButtonRow, Mono, Note, Panel } from "./ui";

export function BeneficiaryTrustPanel({ call, code }: ScaPanelProps) {
  const [externalAccountId, setExternalAccountId] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [trusted, setTrusted] = useState<string | null>(null);

  const startCall = useCallback(
    async (verb: "trust" | "untrust") => {
      const id = externalAccountId.trim();
      if (!id) return;
      const r = await call<{ scaChallenge?: { id?: string } }>(
        "POST",
        externalAccountPath(id, `/${verb}`),
      );
      setChallengeId(r.json?.scaChallenge?.id ?? null);
      setTrusted(null);
    },
    [call, externalAccountId],
  );

  const confirmCall = useCallback(
    async (verb: "trust" | "untrust") => {
      const id = externalAccountId.trim();
      if (!id) return;
      const body: Record<string, unknown> = { code };
      if (challengeId) body.challengeId = challengeId;
      const r = await call<{ trusted?: boolean }>(
        "POST",
        externalAccountPath(id, `/${verb}/confirm`),
        body,
      );
      setTrusted(r.json ? String(r.json.trusted) : r.ok ? "ok" : "error");
    },
    [call, externalAccountId, code, challengeId],
  );

  return (
    <Panel
      title="Beneficiary trust"
      subtitle="Whitelist / un-whitelist an external account."
    >
      <Field.Root>
        <Field.Label>External account id</Field.Label>
        <Input
          value={externalAccountId}
          onChange={(e) => setExternalAccountId(e.target.value)}
        />
      </Field.Root>
      <ButtonRow>
        <Button onClick={() => void startCall("trust")}>Trust start</Button>
        <Button variant="secondary" onClick={() => void confirmCall("trust")}>
          Trust confirm ({code})
        </Button>
      </ButtonRow>
      <ButtonRow>
        <Button variant="outline" onClick={() => void startCall("untrust")}>
          Untrust start
        </Button>
        <Button variant="outline" onClick={() => void confirmCall("untrust")}>
          Untrust confirm ({code})
        </Button>
      </ButtonRow>
      {challengeId && (
        <Note>
          challengeId: <Mono>{challengeId}</Mono>
        </Note>
      )}
      {trusted && (
        <Note>
          trusted: <Mono>{trusted}</Mono>
        </Note>
      )}
    </Panel>
  );
}
