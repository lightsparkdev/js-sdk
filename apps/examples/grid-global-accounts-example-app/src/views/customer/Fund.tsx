import styled from "@emotion/styled";
import { Badge, Button, Card, Field, Input } from "@lightsparkdev/origin";
import { useState } from "react";

import {
  createExternalAccount,
  createQuote,
  executeQuote,
  signPayload,
  type ExternalAccountParams,
} from "../../flows/money";
import { currencyCode, currencyDecimals } from "../../lib/format-money";
import { useAppState } from "../../state/store";
import { DismissibleAlert } from "../../components/DismissibleAlert";
import type { AccountBalance } from "./WalletHome";

/**
 * Fund — money-in. Registers an external US bank source account on the platform,
 * then quotes a transfer from that external source into the active customer's
 * internal account, signs the embedded-wallet payload, and executes. Sandbox
 * pre-fills the magic signature so Execute runs immediately; production stamps
 * with the live session key.
 */
export function Fund({
  accounts,
  onDone,
}: {
  accounts: AccountBalance[];
  onDone: () => void;
}) {
  const { activeCustomer, platformAuth, reporter } = useAppState();
  const mode = platformAuth?.mode ?? "sandbox";

  const destinationAccountId =
    activeCustomer?.accountId ?? (accounts[0] ? String(accounts[0].id) : "");

  // The destination is the customer's own account. Convert the entered major
  // amount to minor units using THAT account's currency decimals (USDB = 6),
  // not a hardcoded *100, so non-cent currencies fund the right amount.
  const destinationAccount =
    accounts.find((a) => String(a.id) === destinationAccountId) ?? accounts[0];
  const destinationDecimals = currencyDecimals(destinationAccount?.currency);

  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [amount, setAmount] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit() {
    if (!platformAuth) return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      if (!destinationAccountId)
        throw new Error("No destination account for this customer.");
      const amountMinor = Math.round(
        parseFloat(amount || "0") * 10 ** destinationDecimals,
      );
      if (!amountMinor) throw new Error("Enter an amount to fund.");

      // 1) Register the external bank source account.
      const params: ExternalAccountParams = {
        kind: "bank",
        accountNumber,
        routingNumber,
        beneficiaryName: activeCustomer?.name,
      };
      const { externalAccountId } = await createExternalAccount(
        reporter,
        platformAuth,
        params,
      );
      if (!externalAccountId)
        throw new Error("External account create returned no id.");

      // 2) Quote external -> customer's internal account, 3) sign, 4) execute.
      const quote = await createQuote(reporter, platformAuth, {
        sourceAccountId: externalAccountId,
        destinationAccountId,
        // Money-in: the entered amount is the customer's (receiving) amount.
        lockedCurrencySide: "RECEIVING",
        lockedCurrencyAmount: amountMinor,
        mode,
      });
      if (!quote.quoteId) throw new Error("Quote returned no id.");
      let signature = quote.signature;
      if (!signature) {
        const signed = await signPayload(mode, quote.payloadToSign ?? "");
        signature = signed.signature;
      }
      await executeQuote(reporter, platformAuth, quote.quoteId, signature);
      setDone(`Funded ${amount} into ${destinationAccountId}.`);
      reporter.status("Funding complete.", "success");
      onDone();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      reporter.status("Funding failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  const currency = currencyCode(accounts[0]?.currency);

  return (
    <Card.Root variant="structured">
      <Card.Header>
        <Card.TitleGroup>
          <EyebrowRow>
            <Badge variant="green" vibrant>
              Money in
            </Badge>
          </EyebrowRow>
          <Card.Title>Fund wallet</Card.Title>
          <Card.Subtitle>
            Pull funds from an external account into this wallet. We register
            the source, quote the transfer, then sign &amp; execute.
          </Card.Subtitle>
        </Card.TitleGroup>
      </Card.Header>

      <Card.Body>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {error && (
            <DismissibleAlert
              variant="critical"
              title="Couldn't fund"
              description={error}
              onClose={() => setError(null)}
            />
          )}
          {done && (
            <DismissibleAlert
              variant="default"
              title={done}
              onClose={() => setDone(null)}
            />
          )}

          <Row2>
            <Field.Root>
              <Field.Label>Account number</Field.Label>
              <Input
                value={accountNumber}
                placeholder="000123456789"
                autoComplete="off"
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Routing number</Field.Label>
              <Input
                value={routingNumber}
                placeholder="021000021"
                autoComplete="off"
                onChange={(e) => setRoutingNumber(e.target.value)}
              />
            </Field.Root>
          </Row2>

          <Field.Root>
            <Field.Label>Amount{currency ? ` (${currency})` : ""}</Field.Label>
            <Input
              value={amount}
              inputMode="decimal"
              placeholder="50.00"
              onChange={(e) => setAmount(e.target.value)}
            />
            <Field.Description>
              Credited to <Mono>{destinationAccountId || "—"}</Mono>.
            </Field.Description>
          </Field.Root>

          <Button
            type="submit"
            variant="filled"
            loading={busy}
            disabled={!destinationAccountId}
          >
            Fund wallet
          </Button>
        </Form>
      </Card.Body>
    </Card.Root>
  );
}

const EyebrowRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs, 6px);
  margin-bottom: var(--spacing-2xs, 6px);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
`;

const Row2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md, 16px);

  @media (width <= 560px) {
    grid-template-columns: 1fr;
  }
`;

const Mono = styled.code`
  font-family: var(--font-family-mono, ui-monospace, monospace);
  font-size: 0.92em;
`;
