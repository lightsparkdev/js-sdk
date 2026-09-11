"use client";

import * as React from "react";
import { OTPField } from "./";
import { Field } from "@/components/Field";
import { Form } from "@/components/Form";

export function Default() {
  return <OTPField.Root />;
}

export function Controlled() {
  const [value, setValue] = React.useState("");
  const [completedCode, setCompletedCode] = React.useState("");

  return (
    <div>
      <OTPField.Root
        value={value}
        onValueChange={setValue}
        onValueComplete={setCompletedCode}
      />
      <span data-testid="value">{value}</span>
      <span data-testid="completed">{completedCode}</span>
    </div>
  );
}

export function WithField() {
  return (
    <Field.Root name="verificationCode">
      <Field.Label>Verification code</Field.Label>
      <OTPField.Root />
    </Field.Root>
  );
}

export function WithFieldInvalid() {
  return (
    <Field.Root name="verificationCode" invalid>
      <Field.Label>Verification code</Field.Label>
      <OTPField.Root defaultValue="123456" />
      <Field.Error>Enter the code we sent to your device</Field.Error>
    </Field.Root>
  );
}

// Twin catalog story: OTPField.stories.tsx `Normalization` — keep in sync.
export function Normalization() {
  const [value, setValue] = React.useState("");
  const [rejected, setRejected] = React.useState(false);
  // Base UI fires onValueInvalid before onValueChange, so a mixed paste
  // like "AB!12" both rejects and commits from one event. Track which
  // event rejected so its own change doesn't clear the error it raised.
  const lastRejectedEvent = React.useRef<Event | null>(null);

  return (
    <Field.Root name="recoveryCode" invalid={rejected}>
      <Field.Label>Recovery code</Field.Label>
      <OTPField.Root
        validationType="alphanumeric"
        normalizeValue={(next) => next.toUpperCase()}
        value={value}
        onValueChange={(next, details) => {
          setValue(next);
          if (details.event !== lastRejectedEvent.current) {
            setRejected(false);
          }
        }}
        onValueInvalid={(_, details) => {
          lastRejectedEvent.current = details.event;
          setRejected(true);
        }}
      />
      {rejected && <Field.Error>Use letters and numbers only</Field.Error>}
      <span data-testid="value">{value}</span>
    </Field.Root>
  );
}

export function AutoSubmit() {
  const [submittedCode, setSubmittedCode] = React.useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmittedCode(formData.get("verificationCode") as string);
  };

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <Field.Root name="verificationCode">
          <Field.Label>Verification code</Field.Label>
          <OTPField.Root autoSubmit />
        </Field.Root>
      </Form>
      <span data-testid="submitted">{submittedCode}</span>
    </div>
  );
}

export function Disabled() {
  return <OTPField.Root disabled defaultValue="123" />;
}

export function ReadOnly() {
  return <OTPField.Root readOnly defaultValue="123" />;
}

export function Placeholder() {
  return <OTPField.Root placeholder="0" />;
}
