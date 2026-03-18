import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "radio",
      options: [
        "gray",
        "purple",
        "blue",
        "sky",
        "pink",
        "green",
        "yellow",
        "red",
      ],
    },
    vibrant: { control: "boolean" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
    variant: "gray",
    vibrant: false,
  },
  argTypes: {
    variant: {
      control: "radio",
      options: [
        "gray",
        "purple",
        "blue",
        "sky",
        "pink",
        "green",
        "yellow",
        "red",
      ],
    },
  },
  render: (args) => <Badge {...args} />,
};

export const Vibrant: Story = {
  args: {
    children: "Label",
    variant: "blue",
    vibrant: true,
  },
};

export const AllVariants: Story = {
  args: {
    children: "Label",
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <span style={{ width: 80 }}>Subtle:</span>
        <Badge variant="gray">Label</Badge>
        <Badge variant="purple">Label</Badge>
        <Badge variant="blue">Label</Badge>
        <Badge variant="sky">Label</Badge>
        <Badge variant="pink">Label</Badge>
        <Badge variant="green">Label</Badge>
        <Badge variant="yellow">Label</Badge>
        <Badge variant="red">Label</Badge>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <span style={{ width: 80 }}>Vibrant:</span>
        <Badge variant="gray" vibrant>
          Label
        </Badge>
        <Badge variant="purple" vibrant>
          Label
        </Badge>
        <Badge variant="blue" vibrant>
          Label
        </Badge>
        <Badge variant="sky" vibrant>
          Label
        </Badge>
        <Badge variant="pink" vibrant>
          Label
        </Badge>
        <Badge variant="green" vibrant>
          Label
        </Badge>
        <Badge variant="yellow" vibrant>
          Label
        </Badge>
        <Badge variant="red" vibrant>
          Label
        </Badge>
      </div>
    </div>
  ),
};
