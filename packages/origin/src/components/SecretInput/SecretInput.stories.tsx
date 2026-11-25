import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Field } from "@/components/Field";
import { SecretInput } from "./SecretInput";

const meta: Meta<typeof SecretInput> = {
  title: "Components/SecretInput",
  component: SecretInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof SecretInput>;

export const Default: Story = {
  args: {
    placeholder: "Enter password",
    disabled: false,
    invalid: false,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "hunter2!",
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "hunter2!",
    disabled: true,
  },
};

export const Invalid: Story = {
  args: {
    defaultValue: "hunter2!",
    invalid: true,
  },
};

export const Controlled: Story = {
  render: function ControlledSecretInput() {
    const [value, setValue] = useState("");

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-xs)",
          width: "var(--spacing-19xl)",
        }}
      >
        <SecretInput
          value={value}
          onValueChange={setValue}
          placeholder="Type here..."
        />
        <span className="body-sm" style={{ color: "var(--text-secondary)" }}>
          Length: {value.length}
        </span>
      </div>
    );
  },
};

export const WithField: Story = {
  render: function SecretInputWithField() {
    const [value, setValue] = useState("");
    const [touched, setTouched] = useState(false);
    const invalid = touched && value.length === 0;

    return (
      <div style={{ width: "var(--spacing-19xl)" }}>
        <Field.Root invalid={invalid}>
          <Field.Label>Password</Field.Label>
          <SecretInput
            placeholder="Enter password"
            autoComplete="current-password"
            invalid={invalid}
            value={value}
            onValueChange={setValue}
            onBlur={() => setTouched(true)}
          />
          <Field.Description>At least 12 characters</Field.Description>
          <Field.Error>Enter a password</Field.Error>
        </Field.Root>
      </div>
    );
  },
};
