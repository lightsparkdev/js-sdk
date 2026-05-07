import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Tabs } from "./index";
import styles from "./Tabs.stories.module.scss";

const meta: Meta = {
  title: "Components/Tabs",
  component: Tabs.Root,
  argTypes: {
    variant: {
      control: "radio",
      options: ["default", "minimal"],
      description: "Tabs.List variant",
    },
  },
};

export default meta;

export const Default: StoryObj = {
  args: {
    variant: "default",
  },
  render: (args) => (
    <Tabs.Root defaultValue="account">
      <Tabs.List variant={args.variant}>
        <Tabs.Tab value="account">Account</Tabs.Tab>
        <Tabs.Tab value="password">Password</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="account" className={styles.panelCard}>
        Manage your account settings and preferences.
      </Tabs.Panel>
      <Tabs.Panel value="password" className={styles.panelCard}>
        Change your password and security options.
      </Tabs.Panel>
      <Tabs.Panel value="settings" className={styles.panelCard}>
        Configure application settings.
      </Tabs.Panel>
    </Tabs.Root>
  ),
};

export const WithDisabled: StoryObj = {
  render: () => (
    <Tabs.Root defaultValue="active">
      <Tabs.List>
        <Tabs.Tab value="active">Active</Tabs.Tab>
        <Tabs.Tab value="disabled" disabled>
          Disabled
        </Tabs.Tab>
        <Tabs.Tab value="another">Another</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="active" className={styles.panelCard}>
        This tab is active.
      </Tabs.Panel>
      <Tabs.Panel value="disabled" className={styles.panelCard}>
        This panel cannot be accessed.
      </Tabs.Panel>
      <Tabs.Panel value="another" className={styles.panelCard}>
        Another tab content.
      </Tabs.Panel>
    </Tabs.Root>
  ),
};

export const Controlled: StoryObj = {
  render: function Render() {
    const [value, setValue] = useState<string | number | null>("first");

    return (
      <div>
        <div style={{ marginBottom: "1rem" }}>Active tab: {value}</div>
        <Tabs.Root value={value} onValueChange={setValue}>
          <Tabs.List>
            <Tabs.Tab value="first">First</Tabs.Tab>
            <Tabs.Tab value="second">Second</Tabs.Tab>
            <Tabs.Tab value="third">Third</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="first" className={styles.panelCard}>
            First panel content.
          </Tabs.Panel>
          <Tabs.Panel value="second" className={styles.panelCard}>
            Second panel content.
          </Tabs.Panel>
          <Tabs.Panel value="third" className={styles.panelCard}>
            Third panel content.
          </Tabs.Panel>
        </Tabs.Root>
      </div>
    );
  },
};
