import { useState } from "react";
import { Collapsible } from "./index";

export const TestDefault = () => (
  <Collapsible.Root>
    <Collapsible.Trigger>Toggle content</Collapsible.Trigger>
    <Collapsible.Panel>Panel content</Collapsible.Panel>
  </Collapsible.Root>
);

export const TestDefaultOpen = () => (
  <Collapsible.Root defaultOpen>
    <Collapsible.Trigger>Toggle content</Collapsible.Trigger>
    <Collapsible.Panel>Panel content</Collapsible.Panel>
  </Collapsible.Root>
);

export const TestDisabled = () => (
  <Collapsible.Root disabled>
    <Collapsible.Trigger>Toggle content</Collapsible.Trigger>
    <Collapsible.Panel>Should not open</Collapsible.Panel>
  </Collapsible.Root>
);

export const TestHideIcon = () => (
  <Collapsible.Root>
    <Collapsible.Trigger hideIcon>Toggle content</Collapsible.Trigger>
    <Collapsible.Panel>Panel content</Collapsible.Panel>
  </Collapsible.Root>
);

export const TestCustomIcon = () => (
  <Collapsible.Root>
    <Collapsible.Trigger icon={<span data-testid="custom-icon">+</span>}>
      Toggle content
    </Collapsible.Trigger>
    <Collapsible.Panel>Panel content</Collapsible.Panel>
  </Collapsible.Root>
);

export const TestControlled = ({
  onChange,
}: {
  onChange?: (open: boolean) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        onChange?.(v);
      }}
    >
      <Collapsible.Trigger>Toggle content</Collapsible.Trigger>
      <Collapsible.Panel>Panel content</Collapsible.Panel>
    </Collapsible.Root>
  );
};
