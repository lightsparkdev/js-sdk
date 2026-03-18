import { useState } from "react";
import { Tabs } from "./index";

export const TestTabs = () => (
  <Tabs.Root defaultValue="tab1">
    <Tabs.List>
      <Tabs.Tab value="tab1">First Tab</Tabs.Tab>
      <Tabs.Tab value="tab2">Second Tab</Tabs.Tab>
      <Tabs.Tab value="tab3">Third Tab</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="tab1">First panel content</Tabs.Panel>
    <Tabs.Panel value="tab2">Second panel content</Tabs.Panel>
    <Tabs.Panel value="tab3">Third panel content</Tabs.Panel>
  </Tabs.Root>
);

export const TestTabsMinimal = () => (
  <Tabs.Root defaultValue="tab1">
    <Tabs.List variant="minimal">
      <Tabs.Tab value="tab1">First Tab</Tabs.Tab>
      <Tabs.Tab value="tab2">Second Tab</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="tab1">First panel content</Tabs.Panel>
    <Tabs.Panel value="tab2">Second panel content</Tabs.Panel>
  </Tabs.Root>
);

export const TestTabsDefaultValue = () => (
  <Tabs.Root defaultValue="tab2">
    <Tabs.List>
      <Tabs.Tab value="tab1">First Tab</Tabs.Tab>
      <Tabs.Tab value="tab2">Second Tab</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="tab1">First panel content</Tabs.Panel>
    <Tabs.Panel value="tab2">Second panel content</Tabs.Panel>
  </Tabs.Root>
);

export const TestTabsDisabled = () => (
  <Tabs.Root defaultValue="tab1">
    <Tabs.List>
      <Tabs.Tab value="tab1">First Tab</Tabs.Tab>
      <Tabs.Tab value="tab2" disabled>
        Disabled Tab
      </Tabs.Tab>
      <Tabs.Tab value="tab3">Third Tab</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="tab1">First panel content</Tabs.Panel>
    <Tabs.Panel value="tab2">Disabled panel content</Tabs.Panel>
    <Tabs.Panel value="tab3">Third panel content</Tabs.Panel>
  </Tabs.Root>
);

export const TestTabsControlled = ({
  onChange,
}: {
  onChange?: (value: string | number | null) => void;
}) => {
  const [value, setValue] = useState<string | number | null>("tab1");
  return (
    <Tabs.Root
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    >
      <Tabs.List>
        <Tabs.Tab value="tab1">First Tab</Tabs.Tab>
        <Tabs.Tab value="tab2">Second Tab</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="tab1">First panel content</Tabs.Panel>
      <Tabs.Panel value="tab2">Second panel content</Tabs.Panel>
    </Tabs.Root>
  );
};

export const TestTabsKeepMounted = () => (
  <Tabs.Root defaultValue="tab1">
    <Tabs.List>
      <Tabs.Tab value="tab1">First Tab</Tabs.Tab>
      <Tabs.Tab value="tab2">Second Tab</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="tab1" keepMounted>
      First panel content
    </Tabs.Panel>
    <Tabs.Panel value="tab2" keepMounted>
      Second panel content
    </Tabs.Panel>
  </Tabs.Root>
);
