import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Accordion } from "./index";

const meta: Meta = {
  title: "Components/Accordion",
  component: Accordion.Root,
  argTypes: {
    multiple: { control: "boolean" },
  },
};

export default meta;

export const Default: StoryObj = {
  args: {
    multiple: false,
  },
  render: (args) => (
    <Accordion.Root defaultValue={["item-1"]} multiple={args.multiple}>
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>What is Base UI?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          Base UI is an unstyled component library for building accessible web
          applications.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>How does it work?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          It provides behavior and accessibility while you bring your own
          styles.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Header>
          <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          Yes, all components follow WAI-ARIA patterns.
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  ),
};

export const Controlled: StoryObj = {
  render: function Render() {
    const [value, setValue] = useState<string[]>(["item-1"]);

    return (
      <div>
        <div style={{ marginBottom: "1rem" }}>
          Open items: {value.join(", ") || "none"}
        </div>
        <Accordion.Root value={value} onValueChange={setValue}>
          <Accordion.Item value="item-1">
            <Accordion.Header>
              <Accordion.Trigger>Controlled Item 1</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>Content for item 1.</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="item-2">
            <Accordion.Header>
              <Accordion.Trigger>Controlled Item 2</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>Content for item 2.</Accordion.Panel>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    );
  },
};
