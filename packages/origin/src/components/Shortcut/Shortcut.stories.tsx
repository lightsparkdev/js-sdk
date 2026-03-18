import type { Meta, StoryObj } from "@storybook/react";
import { Shortcut } from "./Shortcut";

const meta = {
  title: "Components/Shortcut",
  component: Shortcut,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    keys: {
      control: { type: "object" },
    },
  },
} satisfies Meta<typeof Shortcut>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    keys: ["⌘", "K"],
  },
};

export const SingleKey: Story = {
  args: {
    keys: ["⌘"],
  },
};

export const ThreeKeys: Story = {
  args: {
    keys: ["⌘", "⇧", "P"],
  },
};

export const CommonShortcuts: Story = {
  args: {
    keys: ["⌘", "C"],
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Shortcut keys={["⌘", "C"]} />
        <span>Copy</span>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Shortcut keys={["⌘", "V"]} />
        <span>Paste</span>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Shortcut keys={["⌘", "Z"]} />
        <span>Undo</span>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Shortcut keys={["⌘", "⇧", "Z"]} />
        <span>Redo</span>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Shortcut keys={["⌘", "K"]} />
        <span>Command Palette</span>
      </div>
    </div>
  ),
};
