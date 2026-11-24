// SCA (Striga EU) — the six SCA surfaces, grouped under one header in the left
// column. All target the active customer.

import styled from "@emotion/styled";
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
  authorizeResult,
  onAuthorizeResult,
}: {
  call: CallFn;
  customerId: string;
  quoteId: string | null;
  scaChallenge: ScaChallengeView | null;
  onScaChallenge: (next: ScaChallengeView | null, forQuoteId: string) => void;
  authorizeResult: string | null;
  onAuthorizeResult: (next: string | null, forQuoteId: string | null) => void;
}) {
  if (!customerId) {
    return (
      <Group>
        <Header>SCA (Striga EU)</Header>
        <Note>Select an active customer to exercise SCA.</Note>
      </Group>
    );
  }

  const props = { call, customerId };
  return (
    <Group>
      <Header>SCA (Striga EU)</Header>
      <FactorsPanel {...props} />
      <PerTxAuthorizePanel
        {...props}
        quoteId={quoteId}
        challenge={scaChallenge}
        onChallenge={onScaChallenge}
        result={authorizeResult}
        onResult={onAuthorizeResult}
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
