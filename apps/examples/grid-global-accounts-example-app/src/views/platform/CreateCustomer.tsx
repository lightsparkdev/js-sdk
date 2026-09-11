import styled from "@emotion/styled";
import { Button, Dialog, Field, Input } from "@lightsparkdev/origin";
import { useState } from "react";

import { DismissibleAlert } from "../../components/DismissibleAlert";
import { createCustomer } from "../../flows/customer";
import { useAppState, type ActiveCustomer } from "../../state/store";

/**
 * Create-customer action: a Button that opens an Origin Dialog with the
 * customer form. On submit it calls the decoupled `createCustomer` operation
 * (`flows/customer.ts`) with the held `reporter` + `platformAuth`, then adds
 * the result to the session-local customers list and selects it as active.
 *
 * Disabled until the platform is connected — `createCustomer` needs an
 * `ApiAuth`, which only exists once the Config panel has stored `platformAuth`.
 *
 * On success it optimistically prepends the new customer (`addCustomer`) so it
 * shows immediately, then fires `onCreated` so the parent table re-runs its
 * single grouped `GET /customers/internal-accounts` fetch (the authoritative
 * row + balance).
 */
export function CreateCustomer({ onCreated }: { onCreated?: () => void }) {
  const { platformAuth, reporter, addCustomer, setActiveCustomer } =
    useAppState();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [platformCustomerId, setPlatformCustomerId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connected = platformAuth !== null;

  function reset() {
    setFullName("");
    setEmail("");
    setPlatformCustomerId("");
    setError(null);
    setSubmitting(false);
  }

  async function submit() {
    if (!platformAuth) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createCustomer(reporter, platformAuth, {
        fullName,
        email,
        platformCustomerId,
      });
      const customer: ActiveCustomer = {
        id: result.customerId,
        name: fullName.trim() || "Test User",
        email: email.trim(),
        accountId: result.accountId,
        status: "Active",
        walletState: result.accountId ? "Provisioned" : "Pending",
      };
      addCustomer(customer);
      setActiveCustomer(customer);
      reporter.status(`Customer ${customer.name} created.`, "success");
      onCreated?.();
      setOpen(false);
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      reporter.status("Create customer failed.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <Dialog.Trigger
        render={<Button variant="filled" disabled={!connected} />}
      >
        Create customer
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.CloseButton />
          <Dialog.Header>
            <Dialog.Title>Create customer</Dialog.Title>
            <Dialog.Description>
              Provisions a business customer and a USDB internal account on the
              connected platform.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Content>
            <Form
              id="create-customer-form"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              {error && (
                <DismissibleAlert
                  variant="critical"
                  title="Couldn't create customer"
                  description={error}
                  onClose={() => setError(null)}
                />
              )}

              <Field.Root>
                <Field.Label>Legal name</Field.Label>
                <Input
                  value={fullName}
                  placeholder="Acme Inc."
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Field.Description>
                  Defaults to “Test User” if left blank.
                </Field.Description>
              </Field.Root>

              <Field.Root>
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  value={email}
                  placeholder="founder@acme.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>Platform customer ID</Field.Label>
                <Input
                  value={platformCustomerId}
                  placeholder="Auto-generated if blank"
                  onChange={(e) => setPlatformCustomerId(e.target.value)}
                />
                <Field.Description>
                  Your own reference for this customer.
                </Field.Description>
              </Field.Root>
            </Form>
          </Dialog.Content>
          <Dialog.Footer>
            <Dialog.Close render={<Button variant="outline" />}>
              Cancel
            </Dialog.Close>
            <Button
              type="submit"
              form="create-customer-form"
              variant="filled"
              loading={submitting}
            >
              Create customer
            </Button>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 24px);
`;
