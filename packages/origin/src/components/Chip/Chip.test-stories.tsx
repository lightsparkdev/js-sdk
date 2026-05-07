"use client";

import * as React from "react";
import { Chip, ChipFilter } from "./Chip";

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
