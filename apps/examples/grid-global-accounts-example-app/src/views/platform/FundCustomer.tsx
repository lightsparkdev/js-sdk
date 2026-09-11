import styled from "@emotion/styled";
import {
  Alert,
  Button,
  Dialog,
  Field,
  Input,
  Progress,
} from "@lightsparkdev/origin";
import { useState } from "react";

import { DismissibleAlert } from "../../components/DismissibleAlert";
import { fundCustomerFromPlatform, type FundStage } from "../../flows/money";
import { currencyCode } from "../../lib/format-money";
import { useAppState, type ActiveCustomer } from "../../state/store";

/**
 * Staged progress for the fund flow. The backend only signals PROCESSING →
 * COMPLETE, so the earlier steps are approximated: each stage maps to a label
 * and a determinate percentage, advancing the bar as `onStage` fires.
 */
const STAGE_META: Record<FundStage, { label: string; value: number }> = {
  quoting: { label: "Creating quote…", value: 25 },
  executing: { label: "Executing…", value: 55 },
  processing: { label: "Processing…", value: 80 },
  completed: { label: "Complete", value: 100 },
  failed: { label: "Failed", value: 100 },
};

/**
 * Per-customer Fund action: a compact Button that opens an Origin Dialog with an
 * amount input, then funds the customer from the platform's configured funding
 * account via the proven quote → execute → poll flow (`fundCustomerFromPlatform`
 * in `flows/money.ts`, mirroring
 * `sparkcore/.../test_token_fund_in_live.py::_gen_create_and_execute_quote`).
 *
 * The amount is collected in major units and converted to minor units using the
 * destination account's `currency.decimals` (the same block the balance cell
 * renders). On a terminal status the parent refreshes this customer's balance.
 *
 * Disabled (with an explanation) when no platform funding account is configured
 * or the customer has no provisioned internal account.
 */
export function FundCustomer({
  customer,
  destinationAccountId,
  currency,
  onFunded,
}: {
  customer: ActiveCustomer;
  /** The customer's internal account LSID, from its balance fetch. */
  destinationAccountId: string | null;
  /** The destination account's currency block (for decimals + code). */
  currency: unknown;
  /** Called after a terminal transaction so the table can refresh the balance. */
  onFunded: () => void;
}) {
  const { platformAuth, platformFundingAccountId, reporter } = useAppState();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<FundStage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const connected = platformAuth !== null;
  const hasFundingAccount = platformFundingAccountId.trim().length > 0;
  const hasDestination = Boolean(destinationAccountId);
  const code = currencyCode(currency);
  const decimals = currencyDecimals(currency);

  // Why the action can't run, surfaced both as a disabled-state tooltip and an
  // in-dialog notice.
  const blockedReason = !connected
    ? "Connect the platform first."
    : !hasFundingAccount
    ? "Set a platform funding account in the config panel above to fund customers."
    : !hasDestination
    ? "This customer has no provisioned internal account yet."
    : null;

  function reset() {
    setAmount("");
    setError(null);
    setResult(null);
    setSubmitting(false);
    setStage(null);
  }

  async function submit() {
    if (!platformAuth || !destinationAccountId) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    setStage(null);
    try {
      const major = parseFloat(amount || "0");
      if (!Number.isFinite(major) || major <= 0)
        throw new Error("Enter an amount to fund.");
      const amountMinor = Math.round(major * 10 ** decimals);
      if (amountMinor <= 0) throw new Error("Enter an amount to fund.");

      reporter.status(`Funding ${customer.name || customer.id}…`, "info");
      const out = await fundCustomerFromPlatform(
        reporter,
        platformAuth,
        {
          fundingAccountId: platformFundingAccountId,
          destinationAccountId,
          amountMinor,
        },
        { onStage: setStage },
      );

      if (out.status === "COMPLETED") {
        setResult(`Funded — transaction ${out.transactionId} COMPLETED.`);
        reporter.status("Funding complete.", "success");
        onFunded();
      } else if (out.status === "FAILED") {
        setError(`Transaction ${out.transactionId} FAILED.`);
        reporter.status("Funding failed.", "error");
      } else {
        // Non-terminal: the poll timed out. Surface the last-seen status; the
        // balance may still settle, so refresh anyway.
        setResult(
          `Submitted — transaction ${out.transactionId} is ${
            out.status || "pending"
          }.`,
        );
        reporter.status("Funding submitted (still settling).", "info");
        onFunded();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      reporter.status("Funding failed.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const formId = `fund-customer-form-${customer.id}`;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <Dialog.Trigger
        render={
          <Button
            variant="outline"
            size="compact"
            disabled={!connected || !hasFundingAccount || !hasDestination}
            title={blockedReason ?? "Fund this customer from the platform"}
          />
        }
      >
        Fund
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.CloseButton />
          <Dialog.Header>
            <Dialog.Title>Fund {customer.name || "customer"}</Dialog.Title>
            <Dialog.Description>
              Send value from the platform funding account to this customer.
              Creates a quote, executes it with the platform's API token (no
              wallet signature), then polls the transaction to completion.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Content>
            <Form
              id={formId}
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              {blockedReason && (
                <Alert
                  variant="critical"
                  title="Can't fund"
                  description={blockedReason}
                />
              )}
              {error && (
                <DismissibleAlert
                  variant="critical"
                  title="Couldn't fund"
                  description={error}
                  onClose={() => setError(null)}
                />
              )}
              {result && (
                <DismissibleAlert
                  variant="default"
                  title={result}
                  onClose={() => setResult(null)}
                />
              )}

              {(submitting || stage) && stage && (
                <ProgressWrap>
                  <Progress.Root value={STAGE_META[stage].value}>
                    <Progress.Label>{STAGE_META[stage].label}</Progress.Label>
                    <Progress.Value />
                    <Progress.Track>
                      <Progress.Indicator />
                    </Progress.Track>
                  </Progress.Root>
                </ProgressWrap>
              )}

              <Detail>
                <DetailRow>
                  <DetailLabel>From</DetailLabel>
                  <Mono title={platformFundingAccountId}>
                    {platformFundingAccountId || "—"}
                  </Mono>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>To</DetailLabel>
                  <Mono title={destinationAccountId ?? ""}>
                    {destinationAccountId ?? "—"}
                  </Mono>
                </DetailRow>
              </Detail>

              <Field.Root>
                <Field.Label>Amount{code ? ` (${code})` : ""}</Field.Label>
                <Input
                  value={amount}
                  inputMode="decimal"
                  placeholder="25.00"
                  autoComplete="off"
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={Boolean(blockedReason)}
                />
                <Field.Description>
                  Converted to minor units using the account's currency decimals
                  ({decimals}).
                </Field.Description>
              </Field.Root>
            </Form>
          </Dialog.Content>
          <Dialog.Footer>
            <Dialog.Close render={<Button variant="outline" />}>
              Close
            </Dialog.Close>
            <Button
              type="submit"
              form={formId}
              variant="filled"
              loading={submitting}
              disabled={Boolean(blockedReason)}
            >
              Fund customer
            </Button>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Minor-unit decimals from a Currency block; default 2 (mirrors format-money). */
function currencyDecimals(currency: unknown): number {
  if (currency && typeof currency === "object") {
    const c = currency as Record<string, unknown>;
    if (typeof c.decimals === "number" && c.decimals >= 0) return c.decimals;
  }
  return 2;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 24px);
`;

const ProgressWrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const Detail = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 12px);
  border: var(--stroke-xs, 1px) solid var(--border-primary, #e6e6e9);
  border-radius: var(--corner-radius-lg, 12px);
  background: var(--surface-base, #f5f5f7);
  padding: var(--spacing-md, 16px);
`;

const DetailRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-md, 16px);
`;

const DetailLabel = styled.span`
  font-size: var(--font-size-xs, 12px);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-tertiary, #8a8a8a);
`;

const Mono = styled.span`
  font-family: var(--font-family-mono, ui-monospace, monospace);
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary, #555);
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
