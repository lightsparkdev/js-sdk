import type { Meta, StoryObj } from "@storybook/react";
import { CentralIcon } from "./CentralIcon";

const meta = {
  title: "Components/Icon",
  component: CentralIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: { type: "text" },
    },
    size: {
      control: { type: "number" },
    },
    color: {
      control: { type: "color" },
    },
  },
} satisfies Meta<typeof CentralIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "IconHome",
    size: 24,
  },
};

export const Small: Story = {
  args: {
    name: "IconHome",
    size: 16,
  },
};

export const Large: Story = {
  args: {
    name: "IconHome",
    size: 32,
  },
};

export const CustomColor: Story = {
  args: {
    name: "IconHeart2",
    size: 24,
    color: "var(--color-red-600)",
  },
};

export const Gallery: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <CentralIcon name="IconHome" size={24} />
      <CentralIcon name="IconBell" size={24} />
      <CentralIcon name="IconSettingsGear1" size={24} />
      <CentralIcon name="IconMagnifyingGlass2" size={24} />
      <CentralIcon name="IconHeart2" size={24} />
      <CentralIcon name="IconPencil" size={24} />
      <CentralIcon name="IconTrashCanSimple" size={24} />
      <CentralIcon name="IconLock" size={24} />
      <CentralIcon name="IconGlobe2" size={24} />
      <CentralIcon name="IconUserDuo" size={24} />
    </div>
  ),
};
