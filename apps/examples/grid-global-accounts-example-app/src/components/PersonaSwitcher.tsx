import styled from "@emotion/styled";
import { Tabs } from "@lightsparkdev/origin";

import { useAppState, type Persona } from "../state/store";

const PERSONAS: { value: Persona; label: string }[] = [
  { value: "platform", label: "Platform" },
  { value: "customer", label: "Customer" },
];

/**
 * Segmented control that toggles between the Platform and Customer views.
 * Only one persona is on screen at a time; this drives `persona` in the
 * app store. Built on Origin's Tabs so we get the sliding indicator + a
 * roving-tabindex keyboard model for free.
 */
export function PersonaSwitcher() {
  const { persona, setPersona } = useAppState();

  return (
    <Root>
      <Tabs.Root
        value={persona}
        onValueChange={(value) => setPersona(value as Persona)}
      >
        <Tabs.List variant="default">
          {PERSONAS.map(({ value, label }) => (
            <Tabs.Tab key={value} value={value}>
              {label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.Root>
    </Root>
  );
}

const Root = styled.div`
  display: inline-flex;
`;
