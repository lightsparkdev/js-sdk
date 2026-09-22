import { Button } from "@lightsparkdev/origin";
import { useState } from "react";

import { gridPath } from "../api";
import { ButtonRow, Note, Panel } from "../sca/ui";
import { TextField, type CallFn } from "./common";

export function TransactionsPanel({
  call,
  customerId,
}: {
  call: CallFn;
  customerId: string;
}) {
  const [transactionId, setTransactionId] = useState("");

  const list = () =>
    void call(
      "GET",
      gridPath("/transactions?customerId=") + encodeURIComponent(customerId),
    );

  const txAction = (method: "GET" | "POST", suffix: string) => {
    const id = transactionId.trim();
    if (!id) return;
    void call(
      method,
      gridPath(`/transactions/${encodeURIComponent(id)}${suffix}`),
    );
  };

  return (
    <Panel
      title="Transactions"
      subtitle="List history for the active customer; get / decide a single transaction by id."
    >
      <ButtonRow>
        <Button variant="secondary" disabled={!customerId} onClick={list}>
          List transactions
        </Button>
      </ButtonRow>
      <TextField
        label="Transaction id"
        value={transactionId}
        onChange={setTransactionId}
      />
      <ButtonRow>
        <Button variant="secondary" onClick={() => txAction("GET", "")}>
          Get
        </Button>
        <Button variant="outline" onClick={() => txAction("POST", "/approve")}>
          Approve
        </Button>
        <Button variant="outline" onClick={() => txAction("POST", "/reject")}>
          Reject
        </Button>
        <Button variant="outline" onClick={() => txAction("POST", "/confirm")}>
          Confirm
        </Button>
        <Button variant="ghost" onClick={() => txAction("POST", "/cancel")}>
          Cancel
        </Button>
      </ButtonRow>
      <Note>
        Confirm acknowledges receipt/delivery; cancel voids a pending one.
        Approve / reject are routed but still stubbed server-side, so they
        return 501 NOT_IMPLEMENTED rather than deciding anything.
      </Note>
    </Panel>
  );
}
