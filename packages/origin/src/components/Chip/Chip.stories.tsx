import type { Meta, StoryObj } from "@storybook/react";
import { Chip, ChipFilter } from "./Chip";

const meta = {
  title: "Components/Chip",
  component: Chip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "radio" },
      options: ["sm", "md"],
    },
    disabled: { control: "boolean" },
    children: { control: "text" },
    onDismiss: { action: "dismissed" },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "label",
    size: "md",
    disabled: false,
  },
};

export const WithDismiss: Story = {
  args: {
    children: "label",
    size: "md",
    disabled: false,
    onDismiss: () => {},
  },
};

export const FilterVariant: StoryObj<typeof ChipFilter> = {
  render: (args) => <ChipFilter {...args} />,
  args: {
    property: "Property",
    operator: "operator",
    value: "value",
    size: "md",
    onDismiss: () => {},
  },
};

export const FilterSmall: StoryObj<typeof ChipFilter> = {
  render: (args) => <ChipFilter {...args} />,
  args: {
    property: "Property",
    operator: "operator",
    value: "value",
    size: "sm",
    onDismiss: () => {},
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <span>MD Default:</span>
        <Chip onDismiss={() => {}}>label</Chip>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <span>SM Default:</span>
        <Chip size="sm" onDismiss={() => {}}>
          label
        </Chip>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <span>MD Filter:</span>
        <ChipFilter
          property="Property"
          operator="operator"
          value="value"
          onDismiss={() => {}}
        />
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <span>SM Filter:</span>
        <ChipFilter
          size="sm"
          property="Property"
          operator="operator"
          value="value"
          onDismiss={() => {}}
        />
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <span>Disabled:</span>
        <Chip disabled onDismiss={() => {}}>
          label
        </Chip>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <span>No dismiss:</span>
        <Chip>label</Chip>
      </div>
    </div>
  ),
};
