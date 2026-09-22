// SCA (Striga EU) — the six SCA surfaces, grouped under one header in the left
// column. All target the active customer. The shared OTP code (sandbox default
// 123456) is owned here and threaded into every panel's confirm step.

import styled from "@emotion/styled";
import { Field, Input } from "@lightsparkdev/origin";
import { useState } from "react";

import { BeneficiaryTrustPanel } from "./BeneficiaryTrustPanel";
import { FactorsPanel } from "./FactorsPanel";
import { LoginPanel } from "./LoginPanel";
import { PerTxAuthorizePanel } from "./PerTxAuthorizePanel";
import { ResetPanel } from "./ResetPanel";
import type { CallFn, ScaChallengeView } from "./scaApi";
import { SecurityEventPanel } from "./SecurityEventPanel";
import { Note } from "./ui";

export function ScaSection({
  call,
  customerId,
  quoteId,
  scaChallenge,
  onScaChallenge,
}: {
  call: CallFn;
  customerId: string;
  quoteId: string | null;
  scaChallenge: ScaChallengeView | null;
  onScaChallenge: (next: ScaChallengeView | null) => void;
}) {
  const [code, setCode] = useState("123456");

  if (!customerId) {
    return (
      <Group>
        <Header>SCA (Striga EU)</Header>
        <Note>Select an active customer to exercise SCA.</Note>
      </Group>
    );
  }

  const props = { call, customerId, code };
  return (
    <Group>
      <Header>SCA (Striga EU)</Header>
      <Field.Root>
        <Field.Label>
          Sandbox OTP code (shared by all confirm steps)
        </Field.Label>
        <Input value={code} onChange={(e) => setCode(e.target.value)} />
      </Field.Root>
      <FactorsPanel {...props} />
      <PerTxAuthorizePanel
        {...props}
        quoteId={quoteId}
        challenge={scaChallenge}
        onChallenge={onScaChallenge}
      />
      <LoginPanel {...props} />
      <SecurityEventPanel {...props} />
      <ResetPanel {...props} />
      <BeneficiaryTrustPanel {...props} />
    </Group>
  );
}

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
`;

const Header = styled.h2`
  margin: var(--spacing-xs, 8px) 0 0;
  font-size: var(--font-size-md, 14px);
  font-weight: var(--font-weight-semibold, 600);
  letter-spacing: var(--font-tracking-tight, -0.3px);
  color: var(--text-primary);
`;
