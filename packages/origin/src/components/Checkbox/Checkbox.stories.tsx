import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox.Group> = {
  title: "Components/Checkbox",
  component: Checkbox.Group,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["default", "card"],
    },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox.Group>;

export const Default: Story = {
  args: {
    variant: "default",
    disabled: false,
  },
  render: (args) => (
    <Checkbox.Field>
      <Checkbox.Legend>Legend</Checkbox.Legend>
      <Checkbox.Group {...args} defaultValue={["option1"]}>
        <Checkbox.Item
          value="option1"
          label="Label"
          description="Description goes here."
        />
        <Checkbox.Item
          value="option2"
          label="Label"
          description="Description goes here."
        />
        <Checkbox.Item
          value="option3"
          label="Label"
          description="Description goes here."
        />
        <Checkbox.Item
          value="option4"
          label="Label"
          description="Description goes here."
        />
      </Checkbox.Group>
      <Checkbox.Description>Help text goes here.</Checkbox.Description>
    </Checkbox.Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Checkbox.Field>
      <Checkbox.Legend>Legend</Checkbox.Legend>
      <Checkbox.Group>
        <Checkbox.Item
          value="option1"
          label="Label"
          description="Description goes here."
        />
        <Checkbox.Item
          value="option2"
          label="Label"
          description="Description goes here."
        />
        <Checkbox.Item
          value="option3"
          label="Label"
          description="Description goes here."
        />
        <Checkbox.Item
          value="option4"
          label="Label"
          description="Description goes here."
        />
      </Checkbox.Group>
      <Checkbox.Error match>Error text goes here.</Checkbox.Error>
    </Checkbox.Field>
  ),
};

export const DisabledCard: Story = {
  render: () => (
    <Checkbox.Field>
      <Checkbox.Legend>Legend</Checkbox.Legend>
      <Checkbox.Group variant="card" disabled>
        <Checkbox.Item
          value="option1"
          label="Label"
          description="Description goes here."
        />
        <Checkbox.Item
          value="option2"
          label="Label"
          description="Description goes here."
          defaultChecked
        />
      </Checkbox.Group>
    </Checkbox.Field>
  ),
};

export const Indeterminate: Story = {
  render: function IndeterminateStory() {
    const [value, setValue] = useState<string[]>(["child1"]);
    const allValues = ["child1", "child2", "child3"];

    return (
      <Checkbox.Field>
        <Checkbox.Legend>Select all example</Checkbox.Legend>
        <Checkbox.Group
          value={value}
          onValueChange={(v) => setValue(v)}
          allValues={allValues}
        >
          <Checkbox.Item parent label="Select all" />
          <div
            style={{
              paddingLeft: 24,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <Checkbox.Item value="child1" label="Option 1" />
            <Checkbox.Item value="child2" label="Option 2" />
            <Checkbox.Item value="child3" label="Option 3" />
          </div>
        </Checkbox.Group>
      </Checkbox.Field>
    );
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<string[]>(["option2"]);

    return (
      <Checkbox.Field>
        <Checkbox.Legend>Controlled checkbox group</Checkbox.Legend>
        <Checkbox.Group value={value} onValueChange={(v) => setValue(v)}>
          <Checkbox.Item
            value="option1"
            label="Option 1"
            description="First option"
          />
          <Checkbox.Item
            value="option2"
            label="Option 2"
            description="Second option"
          />
          <Checkbox.Item
            value="option3"
            label="Option 3"
            description="Third option"
          />
        </Checkbox.Group>
        <Checkbox.Description>
          Selected: {value.length === 0 ? "none" : value.join(", ")}
        </Checkbox.Description>
      </Checkbox.Field>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 48 }}>
      <div>
        <h3 style={{ marginBottom: 16, fontFamily: "var(--font-family-sans)" }}>
          Default Variant
        </h3>
        <Checkbox.Field>
          <Checkbox.Group>
            <Checkbox.Item
              value="unchecked"
              label="Unchecked"
              description="Default state"
            />
            <Checkbox.Item
              value="checked"
              label="Checked"
              description="Selected state"
              defaultChecked
            />
            <Checkbox.Item
              value="indeterminate"
              label="Indeterminate"
              description="Partial state"
              indeterminate
            />
            <Checkbox.Item
              value="disabled"
              label="Disabled"
              description="Cannot interact"
              disabled
            />
            <Checkbox.Item
              value="disabled-checked"
              label="Disabled Checked"
              description="Cannot interact"
              disabled
              defaultChecked
            />
          </Checkbox.Group>
        </Checkbox.Field>
      </div>
      <div>
        <h3 style={{ marginBottom: 16, fontFamily: "var(--font-family-sans)" }}>
          Card Variant
        </h3>
        <Checkbox.Field>
          <Checkbox.Group variant="card">
            <Checkbox.Item
              value="unchecked"
              label="Unchecked"
              description="Default state"
            />
            <Checkbox.Item
              value="checked"
              label="Checked"
              description="Selected state"
              defaultChecked
            />
            <Checkbox.Item
              value="indeterminate"
              label="Indeterminate"
              description="Partial state"
              indeterminate
            />
            <Checkbox.Item
              value="disabled"
              label="Disabled"
              description="Cannot interact"
              disabled
            />
            <Checkbox.Item
              value="disabled-checked"
              label="Disabled Checked"
              description="Cannot interact"
              disabled
              defaultChecked
            />
          </Checkbox.Group>
        </Checkbox.Field>
      </div>
    </div>
  ),
};
