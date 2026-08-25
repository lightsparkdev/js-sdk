import { Button } from "@lightsparkdev/origin";
import { useEffect, useState } from "react";

import { gridPath, parseJsonField } from "../api";
import { ButtonRow, Mono, Note, Panel } from "../sca/ui";
import { JsonField, pickId, TextField, type CallFn } from "./common";

function eurTemplate(customerId: string): string {
  return JSON.stringify(
    {
      customerId,
      currency: "EUR",
      defaultUmaDepositAccount: false,
      accountInfo: {
        accountType: "EUR_ACCOUNT",
        iban: "DE89370400440532013000",
        swiftCode: "COBADEFFXXX",
        beneficiary: {
          beneficiaryType: "INDIVIDUAL",
          fullName: "Harness Test User",
          address: {
            line1: "Friedrichstrasse 123",
            city: "Berlin",
            postalCode: "10117",
            country: "DE",
          },
        },
      },
    },
    null,
    2,
  );
}

function cryptoTemplate(customerId: string): string {
  return JSON.stringify(
    {
      customerId,
      currency: "USDC",
      accountInfo: {
        accountType: "SOLANA_WALLET",
        address: "<solana-address>",
      },
    },
    null,
    2,
  );
}

export function ExternalAccountsPanel({
  call,
  customerId,
}: {
  call: CallFn;
  customerId: string;
}) {
  const [body, setBody] = useState(() => eurTemplate(customerId));
  const [externalAccountId, setExternalAccountId] = useState("");

  // Rebuild the template when the active customer changes so the body always
  // carries the right customerId; switching customers resets any hand edits.
  useEffect(() => {
    setBody(eurTemplate(customerId));
  }, [customerId]);

  const create = async () => {
    const r = await call(
      "POST",
      gridPath("/customers/external-accounts"),
      parseJsonField(body),
    );
    const id = pickId(r.json);
    if (id) setExternalAccountId(id);
  };

  const list = () =>
    void call(
      "GET",
      gridPath("/customers/external-accounts?customerId=") +
        encodeURIComponent(customerId),
    );

  const byId = (method: "GET" | "DELETE") => {
    const id = externalAccountId.trim();
    if (!id) return;
    void call(
      method,
      gridPath(`/customers/external-accounts/${encodeURIComponent(id)}`),
    );
  };

  return (
    <Panel
      title="External accounts"
      subtitle="Create SEPA (IBAN) or crypto-wallet destinations, then trust / pay out to them."
    >
      <ButtonRow>
        <Button
          variant="outline"
          onClick={() => setBody(eurTemplate(customerId))}
        >
          EUR IBAN template
        </Button>
        <Button
          variant="outline"
          onClick={() => setBody(cryptoTemplate(customerId))}
        >
          Crypto template
        </Button>
      </ButtonRow>
      <JsonField
        label={`Create body — POST ${gridPath("/customers/external-accounts")}`}
        value={body}
        onChange={setBody}
        rows={14}
      />
      <ButtonRow>
        <Button disabled={!customerId} onClick={() => void create()}>
          Create external account
        </Button>
        <Button variant="secondary" disabled={!customerId} onClick={list}>
          List
        </Button>
      </ButtonRow>
      <TextField
        label="External account id (get / delete)"
        value={externalAccountId}
        onChange={setExternalAccountId}
      />
      <ButtonRow>
        <Button variant="secondary" onClick={() => byId("GET")}>
          Get
        </Button>
        <Button variant="ghost" onClick={() => byId("DELETE")}>
          Delete
        </Button>
      </ButtonRow>
      {externalAccountId && (
        <Note>
          Last external account: <Mono>{externalAccountId}</Mono>
        </Note>
      )}
    </Panel>
  );
}
