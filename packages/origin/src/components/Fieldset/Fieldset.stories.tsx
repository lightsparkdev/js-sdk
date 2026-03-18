import type { Meta, StoryObj } from "@storybook/react";
import { Fieldset } from "./parts";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";

const meta = {
  title: "Components/Fieldset",
  component: Fieldset.Root,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Fieldset.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Fieldset.Root>
      <Fieldset.Legend>Personal Information</Fieldset.Legend>
      <Field.Root name="firstName">
        <Field.Label>First Name</Field.Label>
        <Input placeholder="Enter first name" />
        <Field.Description>Your legal first name.</Field.Description>
      </Field.Root>
      <Field.Root name="lastName">
        <Field.Label>Last Name</Field.Label>
        <Input placeholder="Enter last name" />
        <Field.Description>Your legal last name.</Field.Description>
      </Field.Root>
    </Fieldset.Root>
  ),
};

export const ContactInfo: Story = {
  render: () => (
    <Fieldset.Root>
      <Fieldset.Legend>Contact Information</Fieldset.Legend>
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Input type="email" placeholder="you@example.com" />
      </Field.Root>
      <Field.Root name="phone">
        <Field.Label>Phone</Field.Label>
        <Input type="tel" placeholder="+1 (555) 000-0000" />
      </Field.Root>
    </Fieldset.Root>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Fieldset.Root disabled>
      <Fieldset.Legend>Disabled Section</Fieldset.Legend>
      <Field.Root name="field1">
        <Field.Label>Field 1</Field.Label>
        <Input placeholder="Cannot edit" />
      </Field.Root>
      <Field.Root name="field2">
        <Field.Label>Field 2</Field.Label>
        <Input placeholder="Also cannot edit" />
      </Field.Root>
    </Fieldset.Root>
  ),
};
