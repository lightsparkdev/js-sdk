import styled from "@emotion/styled";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
} from "@lightsparkdev/origin";
import { useCallback, useEffect, useState } from "react";

import {
  createCustomerExternalAccount,
  createQuote,
  executeQuote,
  listCustomerExternalAccounts,
  signPayload,
  type CreateQuoteResult,
  type CustomerExternalAccount,
} from "../../flows/money";
import { currencyCode, currencyDecimals } from "../../lib/format-money";
import { useAppState } from "../../state/store";
import { DismissibleAlert } from "../../components/DismissibleAlert";
import type { AccountBalance } from "./WalletHome";

interface PendingQuote {
  quote: CreateQuoteResult;
  amount: string;
  destinationLabel: string;
}

/**
 * Pay — money-out (offramp). The destination is a *customer-owned* USD external
 * account, so the embedded wallet → external account quote passes ownership
 * checks. On entry we list the customer's USD external accounts and let them
 * pick one; "Add USD bank account" registers a new one and selects it. Then:
 * amount → quote (SENDING-locked) → review → sign the embedded-wallet payload →
 * execute. Signature is the magic value in sandbox, a live session stamp in
 * production.
 */
export function Pay({
  accounts,
  onDone,
}: {
  accounts: AccountBalance[];
  onDone: () => void;
}) {
  const { activeCustomer, platformAuth, reporter } = useAppState();
  const mode = platformAuth?.mode ?? "sandbox";
  const customerId = activeCustomer?.id ?? "";

  const sourceAccountId =
    activeCustomer?.accountId ?? (accounts[0] ? String(accounts[0].id) : "");

  // The source is the customer's own wallet account. Convert the entered major
  // amount to minor units using THAT account's currency decimals (USDB = 6),
  // not a hardcoded *100, so non-cent currencies send the right amount.
  const sourceAccount =
    accounts.find((a) => String(a.id) === sourceAccountId) ?? accounts[0];
  const sourceDecimals = currencyDecimals(sourceAccount?.currency);

  // Existing customer USD external accounts + the selected destination id.
  const [externalAccounts, setExternalAccounts] = useState<
    CustomerExternalAccount[]
  >([]);
  const [selectedId, setSelectedId] = useState("");
  const [listing, setListing] = useState(false);

  // "Add USD bank account" form (secondary path), collapsed by default.
  const [adding, setAdding] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");

  const [amount, setAmount] = useState("");

  const [pending, setPending] = useState<PendingQuote | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  // Load the customer's USD external accounts and preselect the first one.
  const refreshExternal = useCallback(async () => {
    if (!platformAuth || !customerId) return;
    setListing(true);
    try {
      const rows = await listCustomerExternalAccounts(
        reporter,
        platformAuth,
        customerId,
        "USD",
      );
      setExternalAccounts(rows);
      setSelectedId((prev) =>
        rows.some((r) => r.id === prev) ? prev : rows[0]?.id ?? "",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setListing(false);
    }
  }, [platformAuth, customerId, reporter]);

  useEffect(() => {
    void refreshExternal();
  }, [refreshExternal]);

  async function addBank() {
    if (!platformAuth) return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const id = await createCustomerExternalAccount(reporter, platformAuth, {
        customerId,
        accountNumber,
        routingNumber,
        beneficiaryName: activeCustomer?.name,
      });
      await refreshExternal();
      setSelectedId(id);
      setAdding(false);
      setAccountNumber("");
      setRoutingNumber("");
      reporter.status("Bank account added.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      reporter.status("Couldn't add bank account.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function getQuote() {
    if (!platformAuth) return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      if (!sourceAccountId)
        throw new Error("No source account for this customer.");
      if (!selectedId)
        throw new Error("Select a destination bank account first.");
      const amountMinor = Math.round(
        parseFloat(amount || "0") * 10 ** sourceDecimals,
      );
      if (!amountMinor) throw new Error("Enter an amount to send.");

      const quote = await createQuote(reporter, platformAuth, {
        sourceAccountId,
        // Customer-owned external account — passes the ownership check.
        destinationAccountId: selectedId,
        // Money-out: the entered amount is what leaves the wallet (sending).
        lockedCurrencySide: "SENDING",
        lockedCurrencyAmount: amountMinor,
        mode,
      });
      if (!quote.quoteId) throw new Error("Quote returned no id.");
      const destinationLabel =
        externalAccounts.find((a) => a.id === selectedId)?.label ?? selectedId;
      setPending({ quote, amount, destinationLabel });
      reporter.status("Quote ready — review and confirm.", "info");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      reporter.status("Quote failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!platformAuth || !pending?.quote.quoteId) return;
    setBusy(true);
    setError(null);
    try {
      let signature = pending.quote.signature;
      if (!signature) {
        const signed = await signPayload(
          mode,
          pending.quote.payloadToSign ?? "",
        );
        signature = signed.signature;
      }
      await executeQuote(
        reporter,
        platformAuth,
        pending.quote.quoteId,
        signature,
      );
      setDone(`Sent ${pending.amount} to ${pending.destinationLabel}.`);
      setPending(null);
      setAmount("");
      reporter.status("Payment executed.", "success");
      onDone();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      reporter.status("Payment failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  const currency = currencyCode(accounts[0]?.currency);
  const value = selectedId || null;

  return (
    <Card.Root variant="structured">
      <Card.Header>
        <Card.TitleGroup>
          <EyebrowRow>
            <Badge variant="purple" vibrant>
              Money out
            </Badge>
          </EyebrowRow>
          <Card.Title>Send a payment</Card.Title>
          <Card.Subtitle>
            Quote a transfer from this wallet to a USD bank account, then
            confirm to sign &amp; execute.
          </Card.Subtitle>
        </Card.TitleGroup>
      </Card.Header>

      <Card.Body>
        {pending ? (
          <Review>
            {error && (
              <DismissibleAlert
                variant="critical"
                title="Couldn't send"
                description={error}
                onClose={() => setError(null)}
              />
            )}
            <QuoteCard>
              <QuoteRow>
                <QuoteLabel>Amount</QuoteLabel>
                <QuoteValue>
                  {pending.amount} {currency}
                </QuoteValue>
              </QuoteRow>
              <QuoteRow>
                <QuoteLabel>To</QuoteLabel>
                <QuoteValue>{pending.destinationLabel}</QuoteValue>
              </QuoteRow>
              <QuoteRow>
                <QuoteLabel>From</QuoteLabel>
                <QuoteMono title={sourceAccountId}>{sourceAccountId}</QuoteMono>
              </QuoteRow>
              <QuoteRow>
                <QuoteLabel>Quote</QuoteLabel>
                <QuoteMono title={pending.quote.quoteId}>
                  {pending.quote.quoteId}
                </QuoteMono>
              </QuoteRow>
              <QuoteRow>
                <QuoteLabel>Signature</QuoteLabel>
                <QuoteValue>
                  {mode === "sandbox" ? "Magic (sandbox)" : "Session-stamped"}
                </QuoteValue>
              </QuoteRow>
            </QuoteCard>
            <Actions>
              <Button
                variant="filled"
                loading={busy}
                onClick={() => void confirm()}
              >
                Confirm &amp; send
              </Button>
              <Button
                variant="ghost"
                onClick={() => setPending(null)}
                disabled={busy}
              >
                Cancel
              </Button>
            </Actions>
          </Review>
        ) : (
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              void getQuote();
            }}
          >
            {error && (
              <DismissibleAlert
                variant="critical"
                title="Couldn't quote"
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

            <Field.Root>
              <Field.Label>Destination (USD bank account)</Field.Label>
              {externalAccounts.length > 0 ? (
                <Select.Root
                  value={value}
                  onValueChange={(next) =>
                    setSelectedId(typeof next === "string" ? next : "")
                  }
                >
                  <Select.Trigger>
                    <Select.Value
                      placeholder={
                        listing
                          ? "Loading bank accounts…"
                          : "Choose a bank account"
                      }
                    >
                      {(selected) =>
                        externalAccounts.find((a) => a.id === selected)
                          ?.label ?? selected
                      }
                    </Select.Value>
                    <Select.Icon />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Positioner>
                      <Select.Popup>
                        <Select.List>
                          {externalAccounts.map((acct) => (
                            <Select.Item key={acct.id} value={acct.id}>
                              <Select.ItemIndicator />
                              <Select.ItemText>{acct.label}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Popup>
                    </Select.Positioner>
                  </Select.Portal>
                </Select.Root>
              ) : (
                <Field.Description>
                  {listing
                    ? "Loading bank accounts…"
                    : "No saved bank accounts yet — add one below."}
                </Field.Description>
              )}
            </Field.Root>

            {adding ? (
              <AddCard>
                <Field.Root>
                  <Field.Label>Add USD bank account</Field.Label>
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
                </Field.Root>
                <Actions>
                  <Button
                    type="button"
                    variant="outline"
                    loading={busy}
                    onClick={() => void addBank()}
                    disabled={!accountNumber || !routingNumber}
                  >
                    Save bank account
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setAdding(false)}
                    disabled={busy}
                  >
                    Cancel
                  </Button>
                </Actions>
              </AddCard>
            ) : (
              <AddLink
                type="button"
                onClick={() => {
                  setError(null);
                  setAdding(true);
                }}
              >
                + Add USD bank account
              </AddLink>
            )}

            <Field.Root>
              <Field.Label>
                Amount{currency ? ` (${currency})` : ""}
              </Field.Label>
              <Input
                value={amount}
                inputMode="decimal"
                placeholder="25.00"
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field.Root>

            <Button
              type="submit"
              variant="filled"
              loading={busy}
              disabled={!sourceAccountId || !selectedId}
            >
              Get quote
            </Button>
          </Form>
        )}
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

const AddCard = styled.div`
  border: var(--stroke-xs, 1px) solid var(--border-primary, #e6e6e9);
  border-radius: var(--corner-radius-lg, 12px);
  padding: var(--spacing-md, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
`;

const AddLink = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: var(--font-size-sm, 13px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-link, #6c4cf6);

  &:hover {
    text-decoration: underline;
  }
`;

const Review = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
`;

const QuoteCard = styled.div`
  border: var(--stroke-xs, 1px) solid var(--border-primary, #e6e6e9);
  border-radius: var(--corner-radius-lg, 12px);
  background: var(--surface-base, #f5f5f7);
  padding: var(--spacing-md, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 12px);
`;

const QuoteRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-md, 16px);
`;

const QuoteLabel = styled.span`
  font-size: var(--font-size-xs, 12px);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-tertiary, #8a8a8a);
`;

const QuoteValue = styled.span`
  font-size: var(--font-size-sm, 13px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-primary, #1a1a1a);
  font-variant-numeric: tabular-nums;
`;

const QuoteMono = styled.span`
  font-family: var(--font-family-mono, ui-monospace, monospace);
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary, #555);
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Actions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
`;
