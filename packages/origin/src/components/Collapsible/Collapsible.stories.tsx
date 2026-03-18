import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Collapsible } from "./index";
import { CentralIcon } from "../Icon";

const meta: Meta<typeof Collapsible.Root> = {
  title: "Components/Collapsible",
  component: Collapsible.Root,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    defaultOpen: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultOpen: false,
    disabled: false,
  },
  render: (args) => (
    <Collapsible.Root defaultOpen={args.defaultOpen} disabled={args.disabled}>
      <Collapsible.Trigger>Advanced settings</Collapsible.Trigger>
      <Collapsible.Panel>
        These settings are for experienced users. Adjust with caution.
      </Collapsible.Panel>
    </Collapsible.Root>
  ),
};

export const CustomIcon: Story = {
  render: () => (
    <Collapsible.Root>
      <Collapsible.Trigger icon={<CentralIcon name="IconPlus" size={16} />}>
        Expand section
      </Collapsible.Trigger>
      <Collapsible.Panel>
        A custom icon replaces the default chevron.
      </Collapsible.Panel>
    </Collapsible.Root>
  ),
};

export const Controlled: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <div style={{ marginBottom: "1rem" }}>
          State: {open ? "open" : "closed"}
        </div>
        <Collapsible.Root open={open} onOpenChange={setOpen}>
          <Collapsible.Trigger>Controlled collapsible</Collapsible.Trigger>
          <Collapsible.Panel>
            The open state is controlled externally.
          </Collapsible.Panel>
        </Collapsible.Root>
      </div>
    );
  },
};

export const Nested: Story = {
  render: () => (
    <Collapsible.Root defaultOpen>
      <Collapsible.Trigger>Parent section</Collapsible.Trigger>
      <Collapsible.Panel>
        <p style={{ marginBottom: "12px" }}>Parent content.</p>
        <Collapsible.Root>
          <Collapsible.Trigger>Child section</Collapsible.Trigger>
          <Collapsible.Panel>Nested collapsible content.</Collapsible.Panel>
        </Collapsible.Root>
      </Collapsible.Panel>
    </Collapsible.Root>
  ),
};
