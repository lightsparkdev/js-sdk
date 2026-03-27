import type { Meta, StoryObj } from "@storybook/react";
import { VisuallyHidden } from "./VisuallyHidden";

const meta = {
  title: "Components/VisuallyHidden",
  component: VisuallyHidden,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "This text is visually hidden but accessible to screen readers",
  },
  render: (args) => (
    <div>
      <p>Inspect the DOM to see the hidden content below:</p>
      <VisuallyHidden {...args} />
    </div>
  ),
};

export const AsDiv: Story = {
  args: {
    as: "div",
    children: "Hidden div element",
  },
  render: (args) => (
    <div>
      <p>Rendered as a hidden {"<div>"}:</p>
      <VisuallyHidden {...args} />
    </div>
  ),
};

export const AsLabel: Story = {
  args: {
    as: "label",
    children: "Accessible label for this input",
  },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <VisuallyHidden {...args} />
      <input type="text" placeholder="Input with a visually hidden label" />
    </div>
  ),
};
