"use client";

import * as React from "react";
import { Field } from "./";
import { Input } from "@/components/Input";

const RenderedRoot = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"section">
>(function RenderedRoot(props, ref) {
  return <section ref={ref} data-custom-root="" {...props} />;
});

export function DefaultField() {
  return (
    <Field.Root>
      <Field.Label>Email</Field.Label>
      <Input placeholder="Enter your email" />
      <Field.Description>We'll never share your email.</Field.Description>
    </Field.Root>
  );
}

export function FieldWithLabelSuffix() {
  return (
    <Field.Root>
      <Field.Label data-testid="field-label-with-suffix">
        Display name
        <span data-testid="field-label-suffix">(optional)</span>
      </Field.Label>
      <Input placeholder="Enter display name" />
    </Field.Root>
  );
}

export function FieldWithError() {
  return (
    <Field.Root invalid>
      <Field.Label>Email</Field.Label>
      <Input placeholder="Enter your email" />
      <Field.Error>Please enter a valid email address.</Field.Error>
    </Field.Root>
  );
}

export function DisabledField() {
  return (
    <Field.Root disabled>
      <Field.Label>Email</Field.Label>
      <Input placeholder="Enter your email" />
      <Field.Description>This field is disabled.</Field.Description>
    </Field.Root>
  );
}

export function FieldWithoutLabel() {
  return (
    <Field.Root>
      <Input placeholder="No label field" />
      <Field.Description>A field without a label.</Field.Description>
    </Field.Root>
  );
}

export function FieldWithoutDescription() {
  return (
    <Field.Root>
      <Field.Label>Password</Field.Label>
      <Input type="password" placeholder="Enter password" />
    </Field.Root>
  );
}

export function ControlledField() {
  const [value, setValue] = React.useState("");
  return (
    <div>
      <Field.Root>
        <Field.Label>Name</Field.Label>
        <Input value={value} onValueChange={setValue} placeholder="Type here" />
        <Field.Description>Enter your full name.</Field.Description>
      </Field.Root>
      <span data-testid="field-value">{value}</span>
    </div>
  );
}

export function FieldWithValidation() {
  const [invalid, setInvalid] = React.useState(false);
  const [value, setValue] = React.useState("");

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    setInvalid(newValue.length > 0 && !newValue.includes("@"));
  };

  return (
    <div>
      <Field.Root invalid={invalid}>
        <Field.Label>Email</Field.Label>
        <Input
          value={value}
          onValueChange={handleValueChange}
          placeholder="Enter email"
        />
        {!invalid && (
          <Field.Description>Enter a valid email.</Field.Description>
        )}
        {invalid && <Field.Error>Email must contain @</Field.Error>}
      </Field.Root>
      <span data-testid="validation-state">
        {invalid ? "invalid" : "valid"}
      </span>
    </div>
  );
}

export function FieldWithName() {
  return (
    <Field.Root name="user-email">
      <Field.Label>Email</Field.Label>
      <Input placeholder="Enter your email" />
    </Field.Root>
  );
}

export function FieldWithRenderedRoot() {
  return (
    <Field.Root
      invalid
      className="consumer-field-root"
      render={
        <RenderedRoot
          className="rendered-field-root"
          data-testid="rendered-field-root"
        />
      }
    >
      <Field.Label>Email</Field.Label>
      <Input placeholder="Rendered root email" />
      <Field.Error>Enter a valid email address.</Field.Error>
    </Field.Root>
  );
}

export function FieldWithStatefulRootClassName() {
  return (
    <Field.Root
      invalid
      className={(state) =>
        state.valid === false
          ? "consumer-field-root-invalid"
          : "consumer-field-root-valid"
      }
      render={
        <RenderedRoot
          className="rendered-stateful-field-root"
          data-testid="stateful-class-field-root"
        />
      }
    >
      <Field.Label>Email</Field.Label>
      <Input placeholder="Stateful root email" />
      <Field.Error>Enter a valid email address.</Field.Error>
    </Field.Root>
  );
}
