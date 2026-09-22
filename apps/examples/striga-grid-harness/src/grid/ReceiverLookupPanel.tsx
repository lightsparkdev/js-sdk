import { Button } from "@lightsparkdev/origin";
import { useEffect, useState } from "react";

import { gridPath } from "../api";
import { ButtonRow, Panel } from "../sca/ui";
import { TextField, type CallFn } from "./common";

export function ReceiverLookupPanel({
  call,
  customerId,
  defaultUma,
}: {
  call: CallFn;
  customerId: string;
  defaultUma?: string;
}) {
  const [uma, setUma] = useState(defaultUma ?? "");
  const [externalAccountId, setExternalAccountId] = useState("");

  useEffect(() => {
    setUma(defaultUma ?? "");
  }, [defaultUma]);

  const senderQuery = `?customerId=${encodeURIComponent(customerId)}`;

  const lookupUma = () => {
    const addr = uma.trim();
    if (!addr || !customerId) return;
    void call(
      "GET",
      gridPath(`/receiver/uma/${encodeURIComponent(addr)}${senderQuery}`),
    );
  };

  const lookupExternal = () => {
    const id = externalAccountId.trim();
    if (!id || !customerId) return;
    void call(
      "GET",
      gridPath(
        `/receiver/external-account/${encodeURIComponent(id)}${senderQuery}`,
      ),
    );
  };

  return (
    <Panel
      title="Receiver lookup"
      subtitle="Resolve a UMA address or external-account receiver."
    >
      <TextField
        label="UMA address"
        value={uma}
        onChange={setUma}
        placeholder="$user@domain"
      />
      <ButtonRow>
        <Button variant="secondary" disabled={!customerId} onClick={lookupUma}>
          Lookup UMA
        </Button>
      </ButtonRow>
      <TextField
        label="External account id"
        value={externalAccountId}
        onChange={setExternalAccountId}
      />
      <ButtonRow>
        <Button
          variant="secondary"
          disabled={!customerId}
          onClick={lookupExternal}
        >
          Lookup external account
        </Button>
      </ButtonRow>
    </Panel>
  );
}
