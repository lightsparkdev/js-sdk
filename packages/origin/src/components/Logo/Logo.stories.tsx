import type { Meta, StoryObj } from "@storybook/react";
import { Logo } from "./Logo";

const meta: Meta<typeof Logo> = {
  title: "Components/Logo",
  component: Logo,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    brand: {
      control: "radio",
      options: ["lightspark", "grid"],
    },
    variant: {
      control: "radio",
      options: ["logo", "logomark", "wordmark"],
    },
    weight: {
      control: "radio",
      options: ["regular", "light"],
    },
    height: {
      control: "number",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  args: {
    brand: "lightspark",
    variant: "logo",
    weight: "regular",
    height: 24,
    "aria-label": "Lightspark",
  },
  render: (args) => <Logo {...args} />,
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        alignItems: "flex-start",
      }}
    >
      <Logo
        variant="logo"
        weight="regular"
        aria-label="Lightspark logo regular"
      />
      <Logo variant="logo" weight="light" aria-label="Lightspark logo light" />
      <Logo
        variant="logomark"
        weight="regular"
        aria-label="Lightspark logomark regular"
      />
      <Logo
        variant="logomark"
        weight="light"
        aria-label="Lightspark logomark light"
      />
      <Logo variant="wordmark" aria-label="Lightspark wordmark" />
      <Logo brand="grid" variant="logo" aria-label="Grid logo" />
      <Logo brand="grid" variant="logomark" aria-label="Grid logomark" />
    </div>
  ),
};
