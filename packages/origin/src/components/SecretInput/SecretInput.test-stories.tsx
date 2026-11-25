"use client";

import * as React from "react";
import { Field } from "../Field";
import { Fieldset } from "../Fieldset";
import { SecretInput } from "./SecretInput";

export function DefaultSecretInput() {
  return <SecretInput placeholder="Enter password" />;
}

export function FilledSecretInput() {
  return <SecretInput defaultValue="hunter2!" />;
}

export function DisabledSecretInput() {
  return <SecretInput disabled defaultValue="saved secret" />;
}

export function FieldDisabledSecretInput() {
  return (
    <Field.Root name="secret" disabled>
      <Field.Label>Secret</Field.Label>
      <SecretInput defaultValue="saved secret" />
    </Field.Root>
  );
}

export function DynamicallyFieldDisabledSecretInput() {
  const [disabled, setDisabled] = React.useState(false);

  return (
    <>
      <button type="button" onClick={() => setDisabled((value) => !value)}>
        {disabled ? "Enable field" : "Disable field"}
      </button>
      <Field.Root name="secret" disabled={disabled}>
        <Field.Label>Secret</Field.Label>
        <SecretInput defaultValue="saved secret" />
      </Field.Root>
    </>
  );
}

export function FieldsetDisabledSecretInput() {
  return (
    <Fieldset.Root disabled>
      <Fieldset.Legend>Credentials</Fieldset.Legend>
      <Field.Root name="secret">
        <Field.Label>Secret</Field.Label>
        <SecretInput defaultValue="saved secret" />
      </Field.Root>
    </Fieldset.Root>
  );
}

export function DynamicallyFieldsetDisabledSecretInput() {
  const [disabled, setDisabled] = React.useState(false);

  return (
    <>
      <button type="button" onClick={() => setDisabled((value) => !value)}>
        {disabled ? "Enable fieldset" : "Disable fieldset"}
      </button>
      <Fieldset.Root disabled={disabled}>
        <Fieldset.Legend>Credentials</Fieldset.Legend>
        <Field.Root name="secret">
          <Field.Label>Secret</Field.Label>
          <SecretInput defaultValue="saved secret" />
        </Field.Root>
      </Fieldset.Root>
    </>
  );
}

export function ControlledSecretInput() {
  const [value, setValue] = React.useState("");

  return (
    <div>
      <SecretInput
        value={value}
        onValueChange={setValue}
        placeholder="Type here"
      />
      <span data-testid="value">{value}</span>
    </div>
  );
}

export function SecretInputWithField() {
  return (
    <Field.Root name="password">
      <Field.Label>Password</Field.Label>
      <SecretInput
        placeholder="Enter password"
        autoComplete="current-password"
      />
      <Field.Description>At least 12 characters</Field.Description>
    </Field.Root>
  );
}

export function SecretInputWithFieldInvalid() {
  return (
    <Field.Root name="password" invalid>
      <Field.Label>Password</Field.Label>
      <SecretInput invalid placeholder="Enter password" />
      <Field.Error>Enter a password</Field.Error>
    </Field.Root>
  );
}

export function SecretInputInForm() {
  const [submitCount, setSubmitCount] = React.useState(0);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitCount((count) => count + 1);
      }}
    >
      <SecretInput placeholder="Enter password" />
      <span data-testid="submit-count">{submitCount}</span>
    </form>
  );
}
