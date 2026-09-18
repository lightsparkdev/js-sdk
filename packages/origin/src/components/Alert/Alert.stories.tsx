import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";
import { Button } from "../Button";

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

export const WithTrailingAction: Story = {
  args: {
    title: "Review required",
    description:
      "Check the details before you continue with this account update.",
  },
  render: (args) => (
    <div style={{ width: 960, maxWidth: "calc(100vw - 2rem)" }}>
      <Alert
        {...args}
        trailing={
          <Button size="compact" variant="filled">
            Review
          </Button>
        }
      />
    </div>
  ),
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
