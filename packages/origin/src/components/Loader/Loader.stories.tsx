import type { Meta, StoryObj } from "@storybook/react";
import { Loader } from "./Loader";

const meta = {
  title: "Components/Loader",
  component: Loader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
    },
    variant: {
      control: "radio",
      options: ["dots", "ring"],
    },
    size: {
      control: "number",
      if: { arg: "variant", eq: "ring" },
    },
  },
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Loading",
  },
};

export const Ring: Story = {
  args: {
    label: "Loading",
    variant: "ring",
  },
};

export const RingSmall: Story = {
  args: {
    label: "Loading",
    variant: "ring",
    size: 12,
  },
};

export const WithSurroundingContent: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span>Loading</span>
      <Loader />
    </div>
  ),
};
