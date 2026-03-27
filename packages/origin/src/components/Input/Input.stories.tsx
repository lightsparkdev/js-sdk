import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Input } from "./Input";
import { Field } from "@/components/Field";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Placeholder",
    disabled: false,
    readOnly: false,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "Content",
  },
};

export const Invalid: Story = {
  render: () => <Input defaultValue="Invalid content" data-invalid />,
};

export const Controlled: Story = {
  render: function ControlledInput() {
    const [value, setValue] = useState("");
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "256px",
        }}
      >
        <Input
          value={value}
          onValueChange={(v) => setValue(v)}
          placeholder="Type here..."
        />
        <span style={{ fontSize: "12px", color: "#7c7c7c" }}>
          Value: {value || "(empty)"}
        </span>
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "256px",
      }}
    >
      <div>
        <span
          style={{
            fontSize: "12px",
            color: "#7c7c7c",
            marginBottom: "4px",
            display: "block",
          }}
        >
          Default
        </span>
        <Input placeholder="Placeholder" />
      </div>
      <div>
        <span
          style={{
            fontSize: "12px",
            color: "#7c7c7c",
            marginBottom: "4px",
            display: "block",
          }}
        >
          Filled
        </span>
        <Input defaultValue="Content" />
      </div>
      <div>
        <span
          style={{
            fontSize: "12px",
            color: "#7c7c7c",
            marginBottom: "4px",
            display: "block",
          }}
        >
          Disabled
        </span>
        <Input placeholder="Placeholder" disabled />
      </div>
      <div>
        <span
          style={{
            fontSize: "12px",
            color: "#7c7c7c",
            marginBottom: "4px",
            display: "block",
          }}
        >
          Read Only
        </span>
        <Input defaultValue="Read only content" readOnly />
      </div>
      <div>
        <span
          style={{
            fontSize: "12px",
            color: "#7c7c7c",
            marginBottom: "4px",
            display: "block",
          }}
        >
          Invalid
        </span>
        <Input defaultValue="Invalid content" data-invalid />
      </div>
    </div>
  ),
};

export const WithField: Story = {
  render: function WithField() {
    const [value, setValue] = useState("");
    const [touched, setTouched] = useState(false);
    const invalid = touched && value.length === 0;

    return (
      <div style={{ width: "256px" }}>
        <Field.Root invalid={invalid}>
          <Field.Label>Email</Field.Label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={value}
            onValueChange={setValue}
            onBlur={() => setTouched(true)}
          />
          <Field.Description>We'll never share your email</Field.Description>
          <Field.Error>Email is required</Field.Error>
        </Field.Root>
      </div>
    );
  },
};
