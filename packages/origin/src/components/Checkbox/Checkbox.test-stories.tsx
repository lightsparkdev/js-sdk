import { useState } from "react";
import { Checkbox } from "./Checkbox";

export function TestCheckboxDefault() {
  return (
    <Checkbox.Field data-testid="checkbox-field">
      <Checkbox.Legend>Legend</Checkbox.Legend>
      <Checkbox.Group defaultValue={["option1"]}>
        <Checkbox.Item
          value="option1"
          label="Option 1"
          description="Description"
        />
        <Checkbox.Item
          value="option2"
          label="Option 2"
          description="Description"
        />
      </Checkbox.Group>
      <Checkbox.Description>Help text goes here.</Checkbox.Description>
    </Checkbox.Field>
  );
}

export function TestCheckboxCard() {
  return (
    <Checkbox.Field data-testid="checkbox-field">
      <Checkbox.Legend>Legend</Checkbox.Legend>
      <Checkbox.Group variant="card" defaultValue={["option1"]}>
        <Checkbox.Item
          value="option1"
          label="Option 1"
          description="Description"
        />
        <Checkbox.Item
          value="option2"
          label="Option 2"
          description="Description"
        />
      </Checkbox.Group>
    </Checkbox.Field>
  );
}

export function TestCheckboxDisabled() {
  return (
    <Checkbox.Field data-testid="checkbox-field">
      <Checkbox.Group disabled>
        <Checkbox.Item value="option1" label="Disabled Option" />
      </Checkbox.Group>
    </Checkbox.Field>
  );
}

export function TestCheckboxControlled() {
  const [value, setValue] = useState<string[]>(["option1"]);
  return (
    <Checkbox.Field data-testid="checkbox-field">
      <Checkbox.Group value={value} onValueChange={(v) => setValue(v)}>
        <Checkbox.Item value="option1" label="Option 1" />
        <Checkbox.Item value="option2" label="Option 2" />
      </Checkbox.Group>
      <div data-testid="selected-values">{value.join(",")}</div>
    </Checkbox.Field>
  );
}

export function TestCheckboxIndeterminate() {
  const [value, setValue] = useState<string[]>(["child1"]);
  const allValues = ["child1", "child2", "child3"];

  return (
    <Checkbox.Field data-testid="checkbox-field">
      <Checkbox.Group
        value={value}
        onValueChange={(v) => setValue(v)}
        allValues={allValues}
      >
        <Checkbox.Item
          parent
          label="Select all"
          data-testid="parent-checkbox"
        />
        <Checkbox.Item value="child1" label="Child 1" />
        <Checkbox.Item value="child2" label="Child 2" />
        <Checkbox.Item value="child3" label="Child 3" />
      </Checkbox.Group>
    </Checkbox.Field>
  );
}

export function TestCheckboxCritical() {
  return (
    <Checkbox.Field data-testid="checkbox-field">
      <Checkbox.Legend>Legend</Checkbox.Legend>
      <Checkbox.Group>
        <Checkbox.Item value="option1" label="Option 1" />
      </Checkbox.Group>
      <Checkbox.Error match>Error text goes here.</Checkbox.Error>
    </Checkbox.Field>
  );
}

export function TestCheckboxKeyboard() {
  return (
    <Checkbox.Field data-testid="checkbox-field">
      <Checkbox.Group>
        <Checkbox.Item
          value="option1"
          label="Option 1"
          data-testid="checkbox-1"
        />
        <Checkbox.Item
          value="option2"
          label="Option 2"
          data-testid="checkbox-2"
        />
        <Checkbox.Item
          value="option3"
          label="Option 3"
          data-testid="checkbox-3"
        />
      </Checkbox.Group>
    </Checkbox.Field>
  );
}

export function TestCheckboxReadOnly() {
  return (
    <Checkbox.Field data-testid="checkbox-field">
      <Checkbox.Group>
        <Checkbox.Item
          value="option1"
          label="Read Only Checked"
          readOnly
          defaultChecked
        />
        <Checkbox.Item value="option2" label="Read Only Unchecked" readOnly />
      </Checkbox.Group>
    </Checkbox.Field>
  );
}

export function TestCheckboxRequired() {
  return (
    <Checkbox.Field data-testid="checkbox-field">
      <Checkbox.Group>
        <Checkbox.Item value="option1" label="Required" required />
      </Checkbox.Group>
    </Checkbox.Field>
  );
}

export function TestCheckboxName() {
  return (
    <Checkbox.Field data-testid="checkbox-field">
      <Checkbox.Group>
        <Checkbox.Item
          value="option1"
          label="With Name"
          name="test-checkbox"
          defaultChecked
        />
      </Checkbox.Group>
    </Checkbox.Field>
  );
}
