import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Combobox } from "./index";
import { Field } from "@/components/Field";

const meta: Meta<typeof Combobox.Root> = {
  title: "Components/Combobox",
  component: Combobox.Root,
  argTypes: {
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Combobox.Root>;

const fruits = [
  "Apple",
  "Banana",
  "Cherry",
  "Date",
  "Elderberry",
  "Fig",
  "Grape",
  "Honeydew",
  "Kiwi",
  "Lemon",
];

export const Default: Story = {
  args: {
    disabled: false,
  },
  render: (args) => (
    <Combobox.Root items={fruits} {...args}>
      <Combobox.InputWrapper>
        <Combobox.Input placeholder="Select a fruit..." />
        <Combobox.ActionButtons>
          <Combobox.Trigger aria-label="Open popup" />
        </Combobox.ActionButtons>
      </Combobox.InputWrapper>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4}>
          <Combobox.Popup>
            <Combobox.Empty />
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  <Combobox.ItemIndicator />
                  <Combobox.ItemText>{item}</Combobox.ItemText>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  ),
};

export const WithClear: Story = {
  render: () => (
    <Combobox.Root items={fruits} defaultValue="Apple">
      <Combobox.InputWrapper>
        <Combobox.Input placeholder="Select a fruit..." />
        <Combobox.ActionButtons>
          <Combobox.Clear aria-label="Clear selection" />
          <Combobox.Trigger aria-label="Open popup" />
        </Combobox.ActionButtons>
      </Combobox.InputWrapper>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4}>
          <Combobox.Popup>
            <Combobox.Empty />
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  <Combobox.ItemIndicator />
                  <Combobox.ItemText>{item}</Combobox.ItemText>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Combobox.Root items={fruits} multiple>
      <Combobox.InputWrapper>
        <Combobox.Input placeholder="Select fruits..." />
        <Combobox.ActionButtons>
          <Combobox.Trigger aria-label="Open popup" />
        </Combobox.ActionButtons>
      </Combobox.InputWrapper>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4}>
          <Combobox.Popup>
            <Combobox.Empty />
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  <Combobox.ItemIndicator />
                  <Combobox.ItemText>{item}</Combobox.ItemText>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  ),
};

const groupedFruits = {
  common: ["Apple", "Banana", "Orange"],
  exotic: ["Dragon Fruit", "Mangosteen", "Rambutan"],
};

export const WithGroups: Story = {
  render: () => (
    <Combobox.Root items={[...groupedFruits.common, ...groupedFruits.exotic]}>
      <Combobox.InputWrapper>
        <Combobox.Input placeholder="Select a fruit..." />
        <Combobox.ActionButtons>
          <Combobox.Trigger aria-label="Open popup" />
        </Combobox.ActionButtons>
      </Combobox.InputWrapper>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4}>
          <Combobox.Popup>
            <Combobox.Empty />
            <Combobox.List>
              <Combobox.Group items={groupedFruits.common}>
                <Combobox.GroupLabel>Common</Combobox.GroupLabel>
                {(item: string) => (
                  <Combobox.Item key={item} value={item}>
                    <Combobox.ItemIndicator />
                    <Combobox.ItemText>{item}</Combobox.ItemText>
                  </Combobox.Item>
                )}
              </Combobox.Group>
              <Combobox.Group items={groupedFruits.exotic}>
                <Combobox.GroupLabel>Exotic</Combobox.GroupLabel>
                {(item: string) => (
                  <Combobox.Item key={item} value={item}>
                    <Combobox.ItemIndicator />
                    <Combobox.ItemText>{item}</Combobox.ItemText>
                  </Combobox.Item>
                )}
              </Combobox.Group>
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  ),
};

export const Controlled: Story = {
  render: function Render() {
    const [value, setValue] = useState<string | null>(null);

    return (
      <div>
        <div style={{ marginBottom: "1rem" }}>Selected: {value ?? "none"}</div>
        <Combobox.Root items={fruits} value={value} onValueChange={setValue}>
          <Combobox.InputWrapper>
            <Combobox.Input placeholder="Select a fruit..." />
            <Combobox.ActionButtons>
              <Combobox.Trigger aria-label="Open popup" />
            </Combobox.ActionButtons>
          </Combobox.InputWrapper>
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={4}>
              <Combobox.Popup>
                <Combobox.Empty />
                <Combobox.List>
                  {(item: string) => (
                    <Combobox.Item key={item} value={item}>
                      <Combobox.ItemIndicator />
                      <Combobox.ItemText>{item}</Combobox.ItemText>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </div>
    );
  },
};

export const WithField: Story = {
  render: function WithField() {
    const [value, setValue] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);
    const invalid = touched && !value;

    return (
      <Field.Root invalid={invalid}>
        <Field.Label>Favorite fruit</Field.Label>
        <Combobox.Root items={fruits} value={value} onValueChange={setValue}>
          <Combobox.InputWrapper>
            <Combobox.Input
              placeholder="Select a fruit..."
              onBlur={() => setTouched(true)}
            />
            <Combobox.ActionButtons>
              <Combobox.Trigger aria-label="Open popup" />
            </Combobox.ActionButtons>
          </Combobox.InputWrapper>
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={4}>
              <Combobox.Popup>
                <Combobox.Empty />
                <Combobox.List>
                  {(item: string) => (
                    <Combobox.Item key={item} value={item}>
                      <Combobox.ItemIndicator />
                      <Combobox.ItemText>{item}</Combobox.ItemText>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
        <Field.Description>Choose your favorite</Field.Description>
        <Field.Error>Please select a fruit</Field.Error>
      </Field.Root>
    );
  },
};
