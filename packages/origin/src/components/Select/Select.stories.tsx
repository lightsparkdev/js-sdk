import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Select } from "./index";
import { Field } from "../Field";
import { CentralIcon } from "../Icon";

const meta: Meta = {
  title: "Components/Select",
  component: Select.Root,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    variant: { control: "radio", options: ["default", "ghost"] },
  },
};

export default meta;

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "orange", label: "Orange" },
  { value: "grape", label: "Grape" },
  { value: "mango", label: "Mango" },
];

const longOptions = Array.from({ length: 40 }, (_, index) => ({
  value: `option-${index + 1}`,
  label: `Option ${index + 1}`,
}));

export const Default: StoryObj<{
  disabled?: boolean;
  variant?: "default" | "ghost";
}> = {
  args: {
    disabled: false,
    variant: "default",
  },
  render: (args) => (
    <Select.Root disabled={args.disabled}>
      <Select.Trigger variant={args.variant}>
        <Select.Value placeholder="Select a fruit" />
        {args.variant === "ghost" ? <Select.GhostIcon /> : <Select.Icon />}
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              {fruits.map((fruit) => (
                <Select.Item key={fruit.value} value={fruit.value}>
                  <Select.ItemIndicator />
                  <Select.ItemText>{fruit.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  ),
};

export const LongList: StoryObj = {
  render: () => (
    <Select.Root>
      <Select.Trigger>
        <Select.Value placeholder="Select option" />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              {longOptions.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  <Select.ItemIndicator />
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  ),
};

export const WithGroups: StoryObj = {
  render: () => (
    <Select.Root>
      <Select.Trigger>
        <Select.Value placeholder="Select food" />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              <Select.Item value="apple">
                <Select.ItemIndicator />
                <Select.ItemText>Apple</Select.ItemText>
              </Select.Item>
              <Select.Item value="banana">
                <Select.ItemIndicator />
                <Select.ItemText>Banana</Select.ItemText>
              </Select.Item>
            </Select.List>
            <Select.Separator />
            <Select.Group>
              <Select.GroupLabel>Vegetables</Select.GroupLabel>
              <Select.List>
                <Select.Item value="carrot">
                  <Select.ItemIndicator />
                  <Select.ItemText>Carrot</Select.ItemText>
                </Select.Item>
                <Select.Item value="broccoli">
                  <Select.ItemIndicator />
                  <Select.ItemText>Broccoli</Select.ItemText>
                </Select.Item>
              </Select.List>
            </Select.Group>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  ),
};

export const WithIcons: StoryObj = {
  render: () => (
    <Select.Root>
      <Select.Trigger>
        <Select.Value placeholder="Select a country" />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              <Select.Item
                value="us"
                trailingIcon={<CentralIcon name="IconGlobe2" size={16} />}
              >
                <Select.ItemIndicator />
                <Select.ItemText>United States</Select.ItemText>
              </Select.Item>
              <Select.Item
                value="uk"
                trailingIcon={<CentralIcon name="IconGlobe2" size={16} />}
              >
                <Select.ItemIndicator />
                <Select.ItemText>United Kingdom</Select.ItemText>
              </Select.Item>
              <Select.Item
                value="de"
                trailingIcon={<CentralIcon name="IconGlobe2" size={16} />}
              >
                <Select.ItemIndicator />
                <Select.ItemText>Germany</Select.ItemText>
              </Select.Item>
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  ),
};

export const MultiSelect: StoryObj = {
  render: function MultiSelect() {
    const [value, setValue] = React.useState<string[]>(["apple", "banana"]);

    // Render function for multi-select value display
    function renderValue(selected: string[]) {
      if (selected.length === 0) {
        return <span data-placeholder="">Select fruits</span>;
      }
      const labels: Record<string, string> = {
        apple: "Apple",
        banana: "Banana",
        orange: "Orange",
        grape: "Grape",
        mango: "Mango",
      };
      const firstItem = labels[selected[0]];
      if (selected.length === 1) {
        return firstItem;
      }
      return `${firstItem} +${selected.length - 1}`;
    }

    return (
      <Select.Root multiple value={value} onValueChange={setValue}>
        <Select.Trigger>
          <Select.Value>{renderValue}</Select.Value>
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup>
              <Select.List>
                {fruits.map((fruit) => (
                  <Select.Item key={fruit.value} value={fruit.value}>
                    <Select.ItemIndicator />
                    <Select.ItemText>{fruit.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    );
  },
};

export const WithField: StoryObj = {
  render: function WithFieldValidation() {
    const [value, setValue] = React.useState<string | null>(null);
    const [submitted, setSubmitted] = React.useState(false);
    const isInvalid = submitted && !value;

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <Field.Root invalid={isInvalid}>
          <Field.Label>Favorite fruit</Field.Label>
          <Select.Root value={value} onValueChange={setValue}>
            <Select.Trigger>
              <Select.Value placeholder="Select a fruit" />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popup>
                  <Select.List>
                    {fruits.map((fruit) => (
                      <Select.Item key={fruit.value} value={fruit.value}>
                        <Select.ItemIndicator />
                        <Select.ItemText>{fruit.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
          <Field.Error>Please select a fruit</Field.Error>
        </Field.Root>
        <button type="submit">Submit</button>
      </form>
    );
  },
};

const environments = [
  { value: "production", label: "Production" },
  { value: "sandbox", label: "Sandbox" },
  { value: "staging", label: "Staging" },
];

export const Ghost: StoryObj = {
  render: function Ghost() {
    const [value, setValue] = React.useState<string | null>("production");

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--text-secondary)" }}>Environment:</span>
        <Select.Root value={value} onValueChange={setValue}>
          <Select.Trigger variant="ghost">
            <Select.Value placeholder="Select environment">
              {(selected) =>
                environments.find((e) => e.value === selected)?.label ??
                selected
              }
            </Select.Value>
            <Select.GhostIcon />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.List>
                  {environments.map((env) => (
                    <Select.Item key={env.value} value={env.value}>
                      <Select.ItemText>{env.label}</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>
    );
  },
};

export const Controlled: StoryObj = {
  render: function Controlled() {
    const [value, setValue] = React.useState<string | null>(null);

    return (
      <Select.Root value={value} onValueChange={setValue}>
        <Select.Trigger>
          <Select.Value placeholder="Select a fruit" />
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup>
              <Select.List>
                {fruits.map((fruit) => (
                  <Select.Item key={fruit.value} value={fruit.value}>
                    <Select.ItemIndicator />
                    <Select.ItemText>{fruit.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    );
  },
};

const countries = [
  {
    value: "us",
    label: "United States",
    flag: "https://flagcdn.com/w40/us.png",
  },
  {
    value: "gb",
    label: "United Kingdom",
    flag: "https://flagcdn.com/w40/gb.png",
  },
  { value: "de", label: "Germany", flag: "https://flagcdn.com/w40/de.png" },
  { value: "fr", label: "France", flag: "https://flagcdn.com/w40/fr.png" },
  { value: "jp", label: "Japan", flag: "https://flagcdn.com/w40/jp.png" },
];

export const WithFlags: StoryObj = {
  render: function WithFlags() {
    const [value, setValue] = React.useState<string | null>("us");

    return (
      <Select.Root value={value} onValueChange={setValue}>
        <Select.Trigger>
          <Select.Value placeholder="Select a country">
            {(selected) => {
              const country = countries.find((c) => c.value === selected);
              return country ? country.label : selected;
            }}
          </Select.Value>
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup>
              <Select.List>
                {countries.map((country) => (
                  <Select.Item
                    key={country.value}
                    value={country.value}
                    leadingIcon={
                      <Select.ItemFlag src={country.flag} alt={country.label} />
                    }
                  >
                    <Select.ItemText>{country.label}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    );
  },
};
