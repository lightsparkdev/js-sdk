import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Item } from "./Item";
import { CentralIcon } from "@/components/Icon";
import { Switch } from "@/components/Switch";

const meta: Meta<typeof Item> = {
  title: "Components/Item",
  component: Item,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    clickable: { control: "boolean" },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Item>;

export const Default: Story = {
  args: {
    title: "Settings",
    description: "Manage your preferences",
  },
};

export const WithLeadingIcon: Story = {
  args: {
    title: "Account",
    description: "View your profile",
    leading: <CentralIcon name="IconHome" size={24} />,
  },
};

export const Navigation: Story = {
  args: {
    title: "Account settings",
    description: "Manage your account",
    leading: <CentralIcon name="IconSettingsGear1" size={24} />,
    trailing: <CentralIcon name="IconChevronRightSmall" size={20} />,
  },
};

function WithSwitchComponent() {
  const [checked, setChecked] = React.useState(false);
  return (
    <Item
      title="Dark mode"
      description="Use system setting"
      clickable={false}
      trailing={<Switch checked={checked} onCheckedChange={setChecked} />}
    />
  );
}

export const WithSwitch: Story = {
  render: () => <WithSwitchComponent />,
};

function SelectableListComponent() {
  const [selected, setSelected] = React.useState<string>("item-1");
  const items = [
    { id: "item-1", title: "Option 1", description: "First option" },
    { id: "item-2", title: "Option 2", description: "Second option" },
    { id: "item-3", title: "Option 3", description: "Third option" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", maxWidth: 400 }}>
      {items.map((item) => (
        <Item
          key={item.id}
          title={item.title}
          description={item.description}
          selected={selected === item.id}
          onClick={() => setSelected(item.id)}
          trailing={
            selected === item.id ? (
              <CentralIcon name="IconCheckmark2Small" size={24} />
            ) : undefined
          }
        />
      ))}
    </div>
  );
}

export const SelectableList: Story = {
  render: () => <SelectableListComponent />,
};
