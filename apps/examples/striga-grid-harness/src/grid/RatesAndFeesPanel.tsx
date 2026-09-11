import { Button } from "@lightsparkdev/origin";
import { useEffect, useState } from "react";

import { gridPath, parseJsonField } from "../api";
import { ButtonRow, Note, Panel } from "../sca/ui";
import { JsonField, TextField, type CallFn } from "./common";

function feeTemplate(usdcAccountId: string): string {
  return JSON.stringify(
    {
      internalAccountId: usdcAccountId || "<usdc-account-id>",
      currency: "USDC",
      cryptoNetwork: "SOLANA",
      amount: 1000000,
      destinationAddress: "<solana-address>",
    },
    null,
    2,
  );
}

export function RatesAndFeesPanel({
  call,
  accounts,
}: {
  call: CallFn;
  accounts?: Record<string, string>;
}) {
  const usdc = accounts?.USDC ?? "";
  const [sourceCurrency, setSourceCurrency] = useState("EUR");
  const [destinationCurrency, setDestinationCurrency] = useState("BITCOIN");
  const [feeBody, setFeeBody] = useState(() => feeTemplate(usdc));

  useEffect(() => {
    setFeeBody(feeTemplate(usdc));
  }, [usdc]);

  const rates = (suffix: string) =>
    void call(
      "GET",
      gridPath(
        `${suffix}?sourceCurrency=${encodeURIComponent(sourceCurrency)}` +
          `&destinationCurrency=${encodeURIComponent(destinationCurrency)}`,
      ),
    );

  const estimateFee = () =>
    void call(
      "POST",
      gridPath("/crypto/estimate-withdrawal-fee"),
      parseJsonField(feeBody),
    );

  return (
    <Panel
      title="Exchange rates & fees"
      subtitle="Rates (v1/v2) for a currency pair, plus the on-chain withdrawal fee estimate."
    >
      <TextField
        label="sourceCurrency"
        value={sourceCurrency}
        onChange={setSourceCurrency}
      />
      <TextField
        label="destinationCurrency"
        value={destinationCurrency}
        onChange={setDestinationCurrency}
      />
      <ButtonRow>
        <Button variant="secondary" onClick={() => rates("/exchange-rates")}>
          Get rates
        </Button>
        <Button variant="secondary" onClick={() => rates("/exchange-rates-v2")}>
          Get rates v2
        </Button>
      </ButtonRow>
      <JsonField
        label={`Fee estimate body — POST ${gridPath(
          "/crypto/estimate-withdrawal-fee",
        )}`}
        value={feeBody}
        onChange={setFeeBody}
        rows={7}
      />
      <ButtonRow>
        <Button onClick={estimateFee}>Estimate withdrawal fee</Button>
      </ButtonRow>
      <Note>
        Use full currency names (BITCOIN, USDC, EUR — not BTC). Amounts are in
        the currency&apos;s smallest unit.
      </Note>
    </Panel>
  );
}
