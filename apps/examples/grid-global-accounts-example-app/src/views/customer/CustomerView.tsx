import styled from "@emotion/styled";
import { Alert, Badge, Button } from "@lightsparkdev/origin";

import { StatusBanner } from "../../components/StatusBanner";
import { useAppState } from "../../state/store";
import { Login } from "./Login";
import { WalletHome } from "./WalletHome";

/**
 * Customer view — the consumer-wallet side of a Grid integration, scoped to the
 * `activeCustomer` the platform is acting as. Authenticates with `platformAuth`
 * and runs the decoupled flow operations; every action is a real ceremony,
 * nothing auto-signed.
 *
 * Routing inside the view is session-gated: no `session` → the login screen;
 * a `session` → the wallet home (balance, fund, pay, activity) with Settings.
 * If no customer is active (e.g. someone flipped the persona switch directly),
 * we prompt them back to the Platform view to pick one.
 */
export function CustomerView() {
  const { activeCustomer, session, setPersona } = useAppState();

  if (!activeCustomer) {
    return (
      <Empty>
        <Alert
          variant="default"
          title="No customer selected"
          description="Switch to the Platform view, then “Act as” a customer to open their wallet."
        />
        <Button variant="filled" onClick={() => setPersona("platform")}>
          Go to Platform
        </Button>
      </Empty>
    );
  }

  return (
    <Stack>
      <ActingAs>
        <Badge variant="blue" vibrant>
          Acting as
        </Badge>
        <ActingName>{activeCustomer.name || activeCustomer.email}</ActingName>
        {activeCustomer.email && activeCustomer.name && (
          <ActingEmail>{activeCustomer.email}</ActingEmail>
        )}
      </ActingAs>

      <StatusBanner />

      {session ? <WalletHome /> : <Login />}
    </Stack>
  );
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 24px);
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-md, 16px);
`;

const ActingAs = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs, 8px);
  flex-wrap: wrap;
`;

const ActingName = styled.span`
  font-size: var(--font-size-sm, 13px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary, #1a1a1a);
`;

const ActingEmail = styled.span`
  font-size: var(--font-size-sm, 13px);
  color: var(--text-tertiary, #8a8a8a);
`;
