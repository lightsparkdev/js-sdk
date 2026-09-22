// The newer KYC surface, distinct from the hosted KYC link: verifications are
// submitted and polled through Grid rather than completed off-site.

import { Button } from "@lightsparkdev/origin";
import { useState } from "react";

import { gridPath } from "../api";
import { ButtonRow, Mono, Note, Panel } from "../sca/ui";
import { pickId, TextField, type CallFn } from "./common";

export function VerificationsPanel({
  call,
  customerId,
}: {
  call: CallFn;
  customerId: string;
}) {
  const [verificationId, setVerificationId] = useState("");

  const submit = async () => {
    if (!customerId) return;
    const r = await call("POST", gridPath("/verifications"), { customerId });
    const id = pickId(r.json);
    if (id) setVerificationId(id);
  };

  const list = () =>
    void call(
      "GET",
      gridPath("/verifications?customerId=") + encodeURIComponent(customerId),
    );

  const get = () => {
    const id = verificationId.trim();
    if (!id) return;
    void call("GET", gridPath(`/verifications/${encodeURIComponent(id)}`));
  };

  return (
    <Panel
      title="Verifications"
      subtitle="Submit / list / get verifications for the active customer."
    >
      <ButtonRow>
        <Button disabled={!customerId} onClick={() => void submit()}>
          Submit verification
        </Button>
        <Button variant="secondary" disabled={!customerId} onClick={list}>
          List
        </Button>
      </ButtonRow>
      <TextField
        label="Verification id"
        value={verificationId}
        onChange={setVerificationId}
      />
      <ButtonRow>
        <Button variant="secondary" onClick={get}>
          Get
        </Button>
      </ButtonRow>
      {verificationId && (
        <Note>
          Last verification: <Mono>{verificationId}</Mono>
        </Note>
      )}
    </Panel>
  );
}
