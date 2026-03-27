import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Radio } from "./Radio";

const meta = {
  title: "Components/Radio",
  component: Radio.Group,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "radio",
      options: ["default", "card"],
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Radio.Group>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    disabled: false,
  },
  render: (args) => (
    <Radio.Field>
      <Radio.Legend>Legend</Radio.Legend>
      <Radio.Group {...args} defaultValue="option1">
        <Radio.Item
          value="option1"
          label="Label"
          description="Description goes here."
        />
        <Radio.Item
          value="option2"
          label="Label"
          description="Description goes here."
        />
      </Radio.Group>
      <Radio.Description>Help text goes here.</Radio.Description>
    </Radio.Field>
  ),
};

export const CriticalState: Story = {
  render: () => (
    <Radio.Field invalid style={{ width: 280 }}>
      <Radio.Legend>Legend</Radio.Legend>
      <Radio.Group variant="card">
        <Radio.Item
          value="opt1"
          label="Label"
          description="Description goes here."
        />
        <Radio.Item
          value="opt2"
          label="Label"
          description="Description goes here."
        />
      </Radio.Group>
      <Radio.Error>Error text goes here.</Radio.Error>
    </Radio.Field>
  ),
};

export const WithoutDescriptions: Story = {
  render: () => (
    <Radio.Field>
      <Radio.Legend>Select an option</Radio.Legend>
      <Radio.Group defaultValue="option1">
        <Radio.Item value="option1" label="Option 1" />
        <Radio.Item value="option2" label="Option 2" />
        <Radio.Item value="option3" label="Option 3" />
      </Radio.Group>
    </Radio.Field>
  ),
};

export const Controlled: Story = {
  render: function ControlledRadio() {
    const [value, setValue] = useState<unknown>("card2");

    return (
      <Radio.Field style={{ width: 280 }}>
        <Radio.Legend>Payment Method</Radio.Legend>
        <Radio.Group value={value} onValueChange={setValue} variant="card">
          <Radio.Item
            value="card1"
            label="Credit Card"
            description="Pay with Visa, Mastercard, or Amex"
          />
          <Radio.Item
            value="card2"
            label="PayPal"
            description="Pay with your PayPal account"
          />
          <Radio.Item
            value="card3"
            label="Bank Transfer"
            description="Direct transfer from your bank"
          />
        </Radio.Group>
        <Radio.Description>
          Selected: <strong>{String(value)}</strong>
        </Radio.Description>
      </Radio.Field>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 48 }}>
      {/* Default variant */}
      <Radio.Field>
        <Radio.Legend>Default Variant</Radio.Legend>
        <Radio.Group defaultValue="opt1">
          <Radio.Item
            value="opt1"
            label="Label"
            description="Description goes here."
          />
          <Radio.Item
            value="opt2"
            label="Label"
            description="Description goes here."
          />
        </Radio.Group>
        <Radio.Description>Help text goes here.</Radio.Description>
      </Radio.Field>

      {/* Card variant */}
      <Radio.Field style={{ width: 280 }}>
        <Radio.Legend>Card Variant</Radio.Legend>
        <Radio.Group defaultValue="card1" variant="card">
          <Radio.Item
            value="card1"
            label="Label"
            description="Description goes here."
          />
          <Radio.Item
            value="card2"
            label="Label"
            description="Description goes here."
          />
        </Radio.Group>
        <Radio.Description>Help text goes here.</Radio.Description>
      </Radio.Field>

      {/* Critical state */}
      <Radio.Field invalid style={{ width: 280 }}>
        <Radio.Legend>Critical State</Radio.Legend>
        <Radio.Group variant="card">
          <Radio.Item
            value="err1"
            label="Label"
            description="Description goes here."
          />
          <Radio.Item
            value="err2"
            label="Label"
            description="Description goes here."
          />
        </Radio.Group>
        <Radio.Error>Error text goes here.</Radio.Error>
      </Radio.Field>
    </div>
  ),
};
