import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./Separator";

const meta = {
  title: "Components/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["default", "hairline"],
    },
    orientation: {
      control: { type: "radio" },
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    orientation: "horizontal",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "200px" }}>
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  args: {},
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "300px",
      }}
    >
      <div>
        <p style={{ marginBottom: "8px", fontSize: "12px", color: "#7C7C7C" }}>
          Default (1px)
        </p>
        <Separator />
      </div>
      <div>
        <p style={{ marginBottom: "8px", fontSize: "12px", color: "#7C7C7C" }}>
          Hairline (0.5px)
        </p>
        <Separator variant="hairline" />
      </div>
      <div
        style={{
          display: "flex",
          height: "48px",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <span>Vertical Default</span>
        <Separator orientation="vertical" />
        <span>Text</span>
      </div>
      <div
        style={{
          display: "flex",
          height: "48px",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <span>Vertical Hairline</span>
        <Separator orientation="vertical" variant="hairline" />
        <span>Text</span>
      </div>
    </div>
  ),
};

export const InNavigation: Story = {
  args: {},
  render: () => (
    <nav
      style={{
        display: "flex",
        gap: "16px",
        alignItems: "center",
        height: "32px",
      }}
    >
      <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
        Home
      </a>
      <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
        Pricing
      </a>
      <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
        Blog
      </a>
      <Separator orientation="vertical" />
      <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
        Log in
      </a>
      <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
        Sign up
      </a>
    </nav>
  ),
};
