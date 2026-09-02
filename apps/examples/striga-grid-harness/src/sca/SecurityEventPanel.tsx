// Fire-and-forget security events that drive Striga's progressive lockout. Repeated
// FAILED_LOGIN_ATTEMPT escalates the lockout; RESET_PASSWORD_COMPLETED clears it.

import { Button, Field } from "@lightsparkdev/origin";
import { useCallback, useState } from "react";

import { scaPath, type ScaPanelProps } from "./scaApi";
import { ButtonRow, EnumSelect, Mono, Note, Panel } from "./ui";

const EVENT_TYPES = ["FAILED_LOGIN_ATTEMPT", "RESET_PASSWORD_COMPLETED"] as const;

export function SecurityEventPanel({ call, customerId }: ScaPanelProps) {
  const [eventType, setEventType] = useState<string>("FAILED_LOGIN_ATTEMPT");
  const [result, setResult] = useState<string | null>(null);

  const record = useCallback(async () => {
    const r = await call<{
      suspended?: boolean;
      failedAttempts?: number;
      lockedUntil?: string | null;
    }>("POST", scaPath("/record-event", customerId), { eventType });
    if (r.json) {
      const { suspended, failedAttempts, lockedUntil } = r.json;
      setResult(
        `suspended=${suspended} · failedAttempts=${failedAttempts} · lockedUntil=${lockedUntil ?? "—"}`,
      );
    } else {
      setResult(r.ok ? "ok" : "error");
    }
  }, [call, customerId, eventType]);

  return (
    <Panel title="Security events" subtitle="Drive Striga's failed-login lockout counter.">
      <Field.Root>
        <Field.Label>Event type</Field.Label>
        <EnumSelect
          value={eventType}
          onValueChange={setEventType}
          options={EVENT_TYPES}
        />
      </Field.Root>
      <ButtonRow>
        <Button onClick={() => void record()}>Record event</Button>
      </ButtonRow>
      {result && (
        <Note>
          <Mono>{result}</Mono>
        </Note>
      )}
    </Panel>
  );
}
