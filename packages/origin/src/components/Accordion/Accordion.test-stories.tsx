import { useState } from "react";
import { Accordion } from "./index";

export const TestAccordion = () => (
  <Accordion.Root>
    <Accordion.Item value="item-1">
      <Accordion.Header>
        <Accordion.Trigger>First Item</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Panel>First panel content</Accordion.Panel>
    </Accordion.Item>
    <Accordion.Item value="item-2">
      <Accordion.Header>
        <Accordion.Trigger>Second Item</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Panel>Second panel content</Accordion.Panel>
    </Accordion.Item>
  </Accordion.Root>
);

export const TestAccordionMultiple = () => (
  <Accordion.Root multiple>
    <Accordion.Item value="item-1">
      <Accordion.Header>
        <Accordion.Trigger>First Item</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Panel>First panel content</Accordion.Panel>
    </Accordion.Item>
    <Accordion.Item value="item-2">
      <Accordion.Header>
        <Accordion.Trigger>Second Item</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Panel>Second panel content</Accordion.Panel>
    </Accordion.Item>
  </Accordion.Root>
);

export const TestAccordionDisabled = () => (
  <Accordion.Root disabled>
    <Accordion.Item value="item-1">
      <Accordion.Header>
        <Accordion.Trigger>Disabled Item</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Panel>Should not open</Accordion.Panel>
    </Accordion.Item>
  </Accordion.Root>
);

export const TestAccordionDefaultValue = () => (
  <Accordion.Root defaultValue={["item-2"]}>
    <Accordion.Item value="item-1">
      <Accordion.Header>
        <Accordion.Trigger>First Item</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Panel>First panel content</Accordion.Panel>
    </Accordion.Item>
    <Accordion.Item value="item-2">
      <Accordion.Header>
        <Accordion.Trigger>Second Item</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Panel>Second panel content</Accordion.Panel>
    </Accordion.Item>
  </Accordion.Root>
);

export const TestAccordionControlled = ({
  onChange,
}: {
  onChange?: (value: string[]) => void;
}) => {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Accordion.Root
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    >
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>First Item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>First panel content</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>Second Item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Second panel content</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
};
