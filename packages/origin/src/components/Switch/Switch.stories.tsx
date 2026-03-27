import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Switch } from "./Switch";
import { Field } from "@/components/Field";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md"],
    },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    size: "md",
    defaultChecked: false,
    disabled: false,
    readOnly: false,
  },
};

export const SmallChecked: Story = {
  args: {
    size: "sm",
    defaultChecked: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
    size: "md",
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultChecked: true,
    size: "md",
  },
};

export const Controlled: Story = {
  render: function ControlledSwitch() {
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Switch checked={checked} onCheckedChange={setChecked} />
        <span style={{ fontSize: "14px" }}>{checked ? "On" : "Off"}</span>
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <span style={{ width: "100px", fontSize: "14px" }}>SM Off</span>
        <Switch size="sm" />
      </div>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <span style={{ width: "100px", fontSize: "14px" }}>SM On</span>
        <Switch size="sm" defaultChecked />
      </div>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <span style={{ width: "100px", fontSize: "14px" }}>MD Off</span>
        <Switch size="md" />
      </div>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <span style={{ width: "100px", fontSize: "14px" }}>MD On</span>
        <Switch size="md" defaultChecked />
      </div>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <span style={{ width: "100px", fontSize: "14px" }}>Disabled Off</span>
        <Switch size="md" disabled />
      </div>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <span style={{ width: "100px", fontSize: "14px" }}>Disabled On</span>
        <Switch size="md" disabled defaultChecked />
      </div>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <span style={{ width: "100px", fontSize: "14px" }}>Read Only</span>
        <Switch size="md" readOnly defaultChecked />
      </div>
    </div>
  ),
};

export const WithField: Story = {
  render: function WithField() {
    const [checked, setChecked] = useState(false);

    return (
      <Field.Root>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Switch checked={checked} onCheckedChange={setChecked} />
          <Field.Label style={{ margin: 0 }}>Enable notifications</Field.Label>
        </div>
        <Field.Description>
          Receive updates about your account
        </Field.Description>
      </Field.Root>
    );
  },
};
