import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Textarea } from "./Textarea";
import { Field } from "@/components/Field";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    placeholder: { control: "text" },
    rows: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Placeholder",
    disabled: false,
    readOnly: false,
    rows: 3,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "Content",
  },
};

export const Invalid: Story = {
  render: () => <Textarea defaultValue="Invalid content" data-invalid="" />,
};

export const Controlled: Story = {
  render: function ControlledTextarea() {
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
        <Textarea
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
        <Textarea placeholder="Placeholder" />
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
        <Textarea defaultValue="Content" />
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
        <Textarea placeholder="Placeholder" disabled />
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
        <Textarea defaultValue="Read only content" readOnly />
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
        <Textarea defaultValue="Invalid content" data-invalid="" />
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
          <Field.Label>Description</Field.Label>
          <Textarea
            placeholder="Enter a description..."
            value={value}
            onValueChange={setValue}
            onBlur={() => setTouched(true)}
            rows={4}
          />
          <Field.Description>Provide a detailed description</Field.Description>
          <Field.Error>Description is required</Field.Error>
        </Field.Root>
      </div>
    );
  },
};
