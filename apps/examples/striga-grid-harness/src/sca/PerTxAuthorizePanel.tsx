// Per-transaction SCA is authorized on the QUOTE (there is no
// /transactions/{id}/authorize). A money-movement quote that requires SCA comes
// back PENDING_AUTHORIZATION with an scaChallenge; authorize it with the sandbox
// code to advance it. Paste the quote id from the Quotes panel's response.

import { Button, Field, Input } from "@lightsparkdev/origin";
import { useCallback, useState } from "react";

import { quotePath, type ScaPanelProps } from "./scaApi";
import { ButtonRow, Mono, Note, Panel } from "./ui";

interface QuoteChallenge {
  status?: string;
  scaChallenge?: { id?: string; factor?: string; expiresAt?: string } | null;
}

export function PerTxAuthorizePanel({ call, code }: ScaPanelProps) {
  const [quoteId, setQuoteId] = useState("");
  const [state, setState] = useState<QuoteChallenge | null>(null);

  const authorize = useCallback(async () => {
    const id = quoteId.trim();
    if (!id) return;
    const r = await call<QuoteChallenge>("POST", quotePath(id, "/authorize"), {
      code,
    });
    setState(r.json ?? null);
  }, [call, quoteId, code]);

  const resend = useCallback(async () => {
    const id = quoteId.trim();
    if (!id) return;
    await call("POST", quotePath(id, "/authorize/resend"));
  }, [call, quoteId]);

  return (
    <Panel
      title="Per-transaction authorize"
      subtitle="Authorize a PENDING_AUTHORIZATION quote. execute/create-quote also accept an scaFactor."
    >
      <Field.Root>
        <Field.Label>Quote id</Field.Label>
        <Input value={quoteId} onChange={(e) => setQuoteId(e.target.value)} />
      </Field.Root>
      <ButtonRow>
        <Button onClick={() => void authorize()}>Authorize ({code})</Button>
        <Button variant="secondary" onClick={() => void resend()}>
          Resend code
        </Button>
      </ButtonRow>
      {state && (
        <Note>
          status: <Mono>{state.status ?? "—"}</Mono>
          {state.scaChallenge
            ? ` · next challenge ${state.scaChallenge.factor ?? "?"} (${state.scaChallenge.id ?? "?"})`
            : " · no further challenge"}
        </Note>
      )}
    </Panel>
  );
}
