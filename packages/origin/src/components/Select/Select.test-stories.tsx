"use client";

import * as React from "react";
import { Select } from "./index";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "orange", label: "Orange" },
];

const environments = [
  { value: "production", label: "Production" },
  { value: "sandbox", label: "Sandbox" },
  { value: "staging", label: "Staging" },
];

export function DefaultSelect() {
  return (
    <Select.Root>
      <Select.Trigger>
        <Select.Value placeholder="Select option" />
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
}

export function DisabledSelect() {
  return (
    <Select.Root disabled>
      <Select.Trigger>
        <Select.Value placeholder="Select option" />
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
}

export function WithDefaultValue() {
  return (
    <Select.Root defaultValue="banana">
      <Select.Trigger>
        <Select.Value placeholder="Select option" />
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
}

export function WithGroups() {
  return (
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
  );
}

export function ControlledSelect() {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <div>
      <Select.Root value={value} onValueChange={setValue}>
        <Select.Trigger>
          <Select.Value placeholder="Select option" />
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
      <span data-testid="selected-value">{value ?? "none"}</span>
    </div>
  );
}

export function DisabledItem() {
  return (
    <Select.Root>
      <Select.Trigger>
        <Select.Value placeholder="Select option" />
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
              <Select.Item value="banana" disabled>
                <Select.ItemIndicator />
                <Select.ItemText>Banana (disabled)</Select.ItemText>
              </Select.Item>
              <Select.Item value="orange">
                <Select.ItemIndicator />
                <Select.ItemText>Orange</Select.ItemText>
              </Select.Item>
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

const fruitLabels: Record<string, string> = {
  apple: "Apple",
  banana: "Banana",
  orange: "Orange",
};

function renderMultiValue(selected: string[]) {
  if (selected.length === 0) {
    return <span data-placeholder="">Select fruits</span>;
  }
  const firstItem = fruitLabels[selected[0]];
  if (selected.length === 1) {
    return firstItem;
  }
  return `${firstItem} +${selected.length - 1}`;
}

export function MultiSelectDefault() {
  return (
    <Select.Root multiple defaultValue={["apple", "banana"]}>
      <Select.Trigger>
        <Select.Value>{renderMultiValue}</Select.Value>
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
}

export function MultiSelectControlled() {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <div>
      <Select.Root multiple value={value} onValueChange={setValue}>
        <Select.Trigger>
          <Select.Value>{renderMultiValue}</Select.Value>
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
      <span data-testid="selected-count">{value.length}</span>
    </div>
  );
}

// Ghost variant test fixtures (indicator on right - no leading item)
export function GhostSelect() {
  return (
    <Select.Root defaultValue="production">
      <Select.Trigger variant="ghost">
        <Select.Value placeholder="Select environment" />
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
  );
}

export function GhostSelectPlaceholder() {
  return (
    <Select.Root>
      <Select.Trigger variant="ghost">
        <Select.Value placeholder="Select environment" />
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
  );
}

export function GhostSelectDisabled() {
  return (
    <Select.Root disabled defaultValue="production">
      <Select.Trigger variant="ghost">
        <Select.Value placeholder="Select environment" />
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
  );
}

export function GhostSelectControlled() {
  const [value, setValue] = React.useState<string | null>("production");

  return (
    <div>
      <Select.Root value={value} onValueChange={setValue}>
        <Select.Trigger variant="ghost">
          <Select.Value placeholder="Select environment" />
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
      <span data-testid="selected-env">{value ?? "none"}</span>
    </div>
  );
}

// Hybrid variant test fixtures (only icon button is clickable, not the label)
export function HybridSelect() {
  return (
    <Select.Root defaultValue="production">
      <Select.Trigger variant="hybrid">
        <Select.Value placeholder="Select environment" />
        <Select.HybridIcon />
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
  );
}

export function HybridSelectControlled() {
  const [value, setValue] = React.useState<string | null>("production");

  return (
    <div>
      <Select.Root value={value} onValueChange={setValue}>
        <Select.Trigger variant="hybrid" data-testid="hybrid-trigger">
          <Select.Value
            placeholder="Select environment"
            data-testid="hybrid-value"
          />
          <Select.HybridIcon data-testid="hybrid-icon" />
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
      <span data-testid="selected-env">{value ?? "none"}</span>
    </div>
  );
}
