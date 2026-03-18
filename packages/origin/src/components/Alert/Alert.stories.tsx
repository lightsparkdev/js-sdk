import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["default", "critical", "warning"],
    },
    icon: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    title: "Title",
    description: "Description here.",
  },
};

export const TitleOnly: Story = {
  args: {
    variant: "default",
    title: "Title only alert",
  },
};

export const AllVariants: Story = {
  args: {
    title: "Title",
  },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "420px",
      }}
    >
      <Alert variant="default" title="Title" description="Description here." />
      <Alert variant="warning" title="Title" description="Description here." />
      <Alert variant="critical" title="Title" description="Description here." />
    </div>
  ),
};
