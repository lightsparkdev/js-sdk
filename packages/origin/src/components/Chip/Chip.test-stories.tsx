"use client";

import * as React from "react";
import { Chip, ChipFilter } from "./Chip";
import { Menu } from "../Menu";

export function DefaultChip() {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) {
    return <div data-testid="dismissed">Chip dismissed</div>;
  }

  return <Chip onDismiss={() => setDismissed(true)}>Test Label</Chip>;
}

export function DisabledChip() {
  const [dismissed, setDismissed] = React.useState(false);

  return (
    <>
      <Chip disabled onDismiss={() => setDismissed(true)}>
        Disabled Chip
      </Chip>
      {dismissed && <div data-testid="dismissed">Should not appear</div>}
    </>
  );
}

export function FilterChip() {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) {
    return <div data-testid="dismissed">Filter dismissed</div>;
  }

  return (
    <ChipFilter
      property="Status"
      operator="is"
      value="Active"
      onDismiss={() => setDismissed(true)}
    />
  );
}

export function FilterChipWithNodeValue() {
  return (
    <ChipFilter
      property="Status"
      operator="is"
      value={<em data-testid="node-value">Active</em>}
      valueLabel="Active"
      onDismiss={() => {}}
    />
  );
}

export function FilterChipWithNumericValue() {
  return (
    <ChipFilter property="Count" operator="=" value={5} onDismiss={() => {}} />
  );
}

export function FilterChipWithTriggerValue() {
  const [dismissed, setDismissed] = React.useState(false);
  const [clicks, setClicks] = React.useState(0);

  if (dismissed) {
    return <div data-testid="dismissed">Filter dismissed</div>;
  }

  return (
    <>
      <ChipFilter
        property="Status"
        operator="is"
        value={
          <ChipFilter.Trigger onClick={() => setClicks((c) => c + 1)}>
            Active
          </ChipFilter.Trigger>
        }
        valueLabel="Active"
        onDismiss={() => setDismissed(true)}
      />
      <div data-testid="click-count">{clicks}</div>
    </>
  );
}

export function DisabledFilterChipWithTrigger() {
  const [clicks, setClicks] = React.useState(0);

  return (
    <>
      <ChipFilter
        property="Status"
        operator="is"
        disabled
        value={
          <ChipFilter.Trigger onClick={() => setClicks((c) => c + 1)}>
            Active
          </ChipFilter.Trigger>
        }
        valueLabel="Active"
        onDismiss={() => {}}
      />
      <div data-testid="click-count">{clicks}</div>
    </>
  );
}

// The documented composition — the trigger's inherited disabled state must
// survive the render-prop merge with a Base UI menu trigger.
export function DisabledFilterChipWithMenuTrigger() {
  return (
    <ChipFilter
      property="Status"
      operator="is"
      disabled
      value={
        <Menu.Root>
          <Menu.Trigger render={<ChipFilter.Trigger />}>Active</Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup>
                <Menu.Item data-testid="menu-item">Inactive</Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      }
      valueLabel="Active"
      onDismiss={() => {}}
    />
  );
}

export function FilterChipWithTriggerValueNoLabel() {
  return (
    <ChipFilter
      property="Status"
      operator="is"
      value={<ChipFilter.Trigger>Active</ChipFilter.Trigger>}
      onDismiss={() => {}}
    />
  );
}

// Published contract: elements that set the raw attribute themselves must
// keep receiving the segment-takeover styling.
export function FilterChipWithRawAttributeTrigger() {
  return (
    <ChipFilter
      property="Status"
      operator="is"
      value={
        <button type="button" data-chip-trigger>
          Active
        </button>
      }
      valueLabel="Active"
      onDismiss={() => {}}
    />
  );
}

export function FilterChipWithPlainButtonValue() {
  return (
    <ChipFilter
      property="Status"
      operator="is"
      value={
        <button type="button" data-testid="plain-button">
          Active
        </button>
      }
      valueLabel="Active"
      onDismiss={() => {}}
    />
  );
}

export function ChipNoDismiss() {
  return <Chip>No dismiss button</Chip>;
}

export function ChipWithArbitraryChild() {
  return (
    <Chip>
      <strong data-testid="chip-custom-child">Custom child</strong>
    </Chip>
  );
}
