"use client";

import * as React from "react";
import { Radio } from "./Radio";

export function TestRadioDefault() {
  return (
    <Radio.Field data-testid="radio-field">
      <Radio.Legend data-testid="legend">Select an option</Radio.Legend>
      <Radio.Group defaultValue="option1" data-testid="radio-group">
        <Radio.Item value="option1" label="Option 1" data-testid="option1" />
        <Radio.Item value="option2" label="Option 2" data-testid="option2" />
        <Radio.Item value="option3" label="Option 3" data-testid="option3" />
      </Radio.Group>
      <Radio.Description data-testid="description">Help text</Radio.Description>
    </Radio.Field>
  );
}

export function TestRadioControlled() {
  const [value, setValue] = React.useState<unknown>("option1");

  return (
    <Radio.Field>
      <Radio.Legend>Controlled</Radio.Legend>
      <Radio.Group
        value={value}
        onValueChange={setValue}
        data-testid="radio-group"
      >
        <Radio.Item value="option1" label="Option 1" data-testid="option1" />
        <Radio.Item value="option2" label="Option 2" data-testid="option2" />
        <Radio.Item value="option3" label="Option 3" data-testid="option3" />
      </Radio.Group>
      <span data-testid="status">{String(value)}</span>
    </Radio.Field>
  );
}

export function TestRadioDisabled() {
  return (
    <Radio.Field disabled>
      <Radio.Legend>Disabled Group</Radio.Legend>
      <Radio.Group defaultValue="option1" data-testid="radio-group">
        <Radio.Item value="option1" label="Option 1" data-testid="option1" />
        <Radio.Item value="option2" label="Option 2" data-testid="option2" />
      </Radio.Group>
    </Radio.Field>
  );
}

export function TestRadioDisabledItem() {
  return (
    <Radio.Field>
      <Radio.Legend>Disabled Item</Radio.Legend>
      <Radio.Group defaultValue="option1" data-testid="radio-group">
        <Radio.Item value="option1" label="Option 1" data-testid="option1" />
        <Radio.Item
          value="option2"
          label="Option 2"
          disabled
          data-testid="option2"
        />
        <Radio.Item value="option3" label="Option 3" data-testid="option3" />
      </Radio.Group>
    </Radio.Field>
  );
}

export function TestRadioCard() {
  return (
    <Radio.Field style={{ width: 280 }}>
      <Radio.Legend>Card Variant</Radio.Legend>
      <Radio.Group
        defaultValue="card1"
        variant="card"
        data-testid="radio-group"
      >
        <Radio.Item
          value="card1"
          label="Card 1"
          description="Description"
          data-testid="card1"
        />
        <Radio.Item
          value="card2"
          label="Card 2"
          description="Description"
          data-testid="card2"
        />
      </Radio.Group>
    </Radio.Field>
  );
}

export function TestRadioCritical() {
  return (
    <Radio.Field invalid data-testid="radio-field">
      <Radio.Legend data-testid="legend">Critical State</Radio.Legend>
      <Radio.Group data-testid="radio-group">
        <Radio.Item value="opt1" label="Option 1" data-testid="opt1" />
        <Radio.Item value="opt2" label="Option 2" data-testid="opt2" />
      </Radio.Group>
      <Radio.Error data-testid="error" match>
        This field is required
      </Radio.Error>
    </Radio.Field>
  );
}
