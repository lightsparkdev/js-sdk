import * as React from "react";
import { useState } from "react";
import { Combobox } from "./index";

const fruits = [
  "Apple",
  "Banana",
  "Cherry",
  "Date",
  "Elderberry",
  "Fig",
  "Grape",
];

/** InputWrapper conformance - forwards props, ref, className */
export function ConformanceInputWrapper(
  props: React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <Combobox.Root items={fruits}>
      <Combobox.InputWrapper data-testid="test-root" {...props}>
        <Combobox.Input placeholder="Test" />
      </Combobox.InputWrapper>
    </Combobox.Root>
  );
}

/** ItemText conformance - forwards props, ref, className */
export function ConformanceItemText(
  props: React.HTMLAttributes<HTMLDivElement>,
) {
  // Using open={true} to ensure popup is visible for testing
  return (
    <Combobox.Root items={fruits} open>
      <Combobox.InputWrapper>
        <Combobox.Input placeholder="Test" />
      </Combobox.InputWrapper>
      <Combobox.Positioner>
        <Combobox.Popup>
          <Combobox.List>
            {(item: string) => (
              <Combobox.Item key={item} value={item}>
                <Combobox.ItemText data-testid="test-root" {...props}>
                  {item}
                </Combobox.ItemText>
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Root>
  );
}

/** ActionButtons conformance - forwards props, ref, className */
export function ConformanceActionButtons(
  props: React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <Combobox.Root items={fruits}>
      <Combobox.InputWrapper>
        <Combobox.Input placeholder="Test" />
        <Combobox.ActionButtons data-testid="test-root" {...props}>
          <Combobox.Trigger />
        </Combobox.ActionButtons>
      </Combobox.InputWrapper>
    </Combobox.Root>
  );
}

const groupedFruits = {
  common: ["Apple", "Banana"],
  exotic: ["Dragon Fruit", "Mangosteen"],
};

export const TestCombobox = () => (
  <Combobox.Root items={fruits}>
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
);

export const TestComboboxMultiple = () => (
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
);

export const TestComboboxChipPassThrough = () => (
  <Combobox.Root items={fruits} multiple defaultValue={["Apple"]}>
    <Combobox.InputWrapper>
      <Combobox.Chips>
        <Combobox.Value>
          {(selectedValue: string[]) => (
            <>
              {selectedValue.map((item) => (
                <Combobox.Chip key={item} data-testid="combobox-chip">
                  <strong data-testid="chip-label-child">{item}</strong>
                  <span data-testid="remove-wrapper">
                    <Combobox.ChipRemove aria-label={`Remove ${item}`} />
                  </span>
                </Combobox.Chip>
              ))}
              <Combobox.Input placeholder="Select fruits..." />
            </>
          )}
        </Combobox.Value>
      </Combobox.Chips>
    </Combobox.InputWrapper>
  </Combobox.Root>
);

export const TestComboboxDisabled = () => (
  <Combobox.Root items={fruits} disabled>
    <Combobox.InputWrapper>
      <Combobox.Input placeholder="Disabled..." />
      <Combobox.ActionButtons>
        <Combobox.Trigger aria-label="Open popup" />
      </Combobox.ActionButtons>
    </Combobox.InputWrapper>
    <Combobox.Portal>
      <Combobox.Positioner sideOffset={4}>
        <Combobox.Popup>
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
);

export const TestComboboxDefaultValue = () => (
  <Combobox.Root items={fruits} defaultValue="Cherry">
    <Combobox.InputWrapper>
      <Combobox.Input placeholder="Select a fruit..." />
      <Combobox.ActionButtons>
        <Combobox.Trigger aria-label="Open popup" />
      </Combobox.ActionButtons>
    </Combobox.InputWrapper>
    <Combobox.Portal>
      <Combobox.Positioner sideOffset={4}>
        <Combobox.Popup>
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
);

export const TestComboboxControlled = ({
  onChange,
}: {
  onChange?: (value: string | null) => void;
}) => {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Combobox.Root
      items={fruits}
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    >
      <Combobox.InputWrapper>
        <Combobox.Input placeholder="Select a fruit..." />
        <Combobox.ActionButtons>
          <Combobox.Trigger aria-label="Open popup" />
        </Combobox.ActionButtons>
      </Combobox.InputWrapper>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4}>
          <Combobox.Popup>
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
  );
};

export const TestComboboxWithGroups = () => (
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
);

export const TestComboboxWithClear = () => (
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
);
