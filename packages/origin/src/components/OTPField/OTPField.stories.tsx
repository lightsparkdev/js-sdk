"use client";

// Every story wraps OTPField.Root in Field.Root + Field.Label on purpose:
// Base UI names the first slot via the group label (aria-label on slot 0 is
// ignored), so a bare OTPField.Root is inherently inaccessible.
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OTPField } from "./";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { Form } from "@/components/Form";

const meta: Meta = {
  title: "Components/OTPField",
  component: OTPField.Root,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Field.Root name="verificationCode">
      <Field.Label>Verification code</Field.Label>
      <OTPField.Root />
    </Field.Root>
  ),
};

export const CustomLength: Story = {
  render: () => (
    <Field.Root name="verificationCode">
      <Field.Label>Verification code</Field.Label>
      <OTPField.Root length={4} />
    </Field.Root>
  ),
};

export const Grouped: Story = {
  render: () => (
    <Field.Root name="verificationCode">
      <Field.Label>Verification code</Field.Label>
      <OTPField.Root>
        <OTPField.Input />
        <OTPField.Input aria-label="Character 2 of 6" />
        <OTPField.Input aria-label="Character 3 of 6" />
        <OTPField.Separator />
        <OTPField.Input aria-label="Character 4 of 6" />
        <OTPField.Input aria-label="Character 5 of 6" />
        <OTPField.Input aria-label="Character 6 of 6" />
      </OTPField.Root>
    </Field.Root>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Field.Root name="verificationCode" disabled>
      <Field.Label>Verification code</Field.Label>
      <OTPField.Root disabled defaultValue="123" />
    </Field.Root>
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <Field.Root name="verificationCode">
      <Field.Label>Verification code</Field.Label>
      <OTPField.Root readOnly defaultValue="123456" />
    </Field.Root>
  ),
};

export const Placeholder: Story = {
  render: () => (
    <Field.Root name="verificationCode">
      <Field.Label>Verification code</Field.Label>
      <OTPField.Root placeholder="0" />
    </Field.Root>
  ),
};

export const Alphanumeric: Story = {
  render: () => (
    <Field.Root name="recoveryCode">
      <Field.Label>Recovery code</Field.Label>
      <OTPField.Root validationType="alphanumeric" />
    </Field.Root>
  ),
};

// Twin CT fixture: OTPField.test-stories.tsx `Normalization` — keep in sync.
export const Normalization: Story = {
  render: function NormalizationStory() {
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
        <Field.Description>
          Letters and digits only; letters are converted to uppercase
        </Field.Description>
        {rejected && <Field.Error>Use letters and numbers only</Field.Error>}
      </Field.Root>
    );
  },
};

export const Controlled: Story = {
  render: function ControlledOTPField() {
    const [value, setValue] = React.useState("");
    const [complete, setComplete] = React.useState(false);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-xs)",
        }}
      >
        <Field.Root name="verificationCode">
          <Field.Label>Verification code</Field.Label>
          <OTPField.Root
            value={value}
            onValueChange={(next) => {
              setValue(next);
              setComplete(false);
            }}
            onValueComplete={() => setComplete(true)}
          />
        </Field.Root>
        <span className="body-sm" style={{ color: "var(--text-secondary)" }}>
          Value: {value || "(empty)"} {complete ? "— complete" : ""}
        </span>
      </div>
    );
  },
};

export const AutoSubmit: Story = {
  render: function AutoSubmitStory() {
    const [submittedCode, setSubmittedCode] = React.useState("");

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      setSubmittedCode(formData.get("verificationCode") as string);
    };

    if (submittedCode) {
      return <p>Verified code {submittedCode}</p>;
    }

    return (
      <Form onSubmit={handleSubmit}>
        <Field.Root name="verificationCode">
          <Field.Label>Verification code</Field.Label>
          <OTPField.Root autoSubmit />
          <Field.Description>
            Submits automatically when all six digits are entered
          </Field.Description>
        </Field.Root>
      </Form>
    );
  },
};

export const Validation: Story = {
  render: function ValidationStory() {
    const [value, setValue] = React.useState("");
    const [submitted, setSubmitted] = React.useState(false);
    const isInvalid = submitted && value.length < 6;

    return (
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <Field.Root name="verificationCode" invalid={isInvalid}>
          <Field.Label>Verification code</Field.Label>
          <OTPField.Root
            value={value}
            onValueChange={(next) => {
              setValue(next);
              setSubmitted(false);
            }}
          />
          <Field.Description>
            Enter the 6-digit code we sent to your device
          </Field.Description>
          <Field.Error>Enter the code we sent to your device</Field.Error>
        </Field.Root>
        <Button type="submit">Submit</Button>
      </Form>
    );
  },
};
