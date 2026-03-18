"use client";

import * as React from "react";
import { Progress } from "./index";

export function DefaultProgress() {
  return (
    <Progress.Root value={50}>
      <Progress.Label>Export data</Progress.Label>
      <Progress.Value />
      <Progress.Track>
        <Progress.Indicator />
      </Progress.Track>
    </Progress.Root>
  );
}

export function ZeroProgress() {
  return (
    <Progress.Root value={0}>
      <Progress.Label>Starting</Progress.Label>
      <Progress.Value />
      <Progress.Track>
        <Progress.Indicator />
      </Progress.Track>
    </Progress.Root>
  );
}

export function CompleteProgress() {
  return (
    <Progress.Root value={100}>
      <Progress.Label>Complete</Progress.Label>
      <Progress.Value />
      <Progress.Track>
        <Progress.Indicator />
      </Progress.Track>
    </Progress.Root>
  );
}

export function IndeterminateProgress() {
  return (
    <Progress.Root value={null}>
      <Progress.Label>Loading</Progress.Label>
      <Progress.Track>
        <Progress.Indicator />
      </Progress.Track>
    </Progress.Root>
  );
}

export function TrackOnlyProgress() {
  return (
    <Progress.Root value={75}>
      <Progress.Track>
        <Progress.Indicator />
      </Progress.Track>
    </Progress.Root>
  );
}

export function ControlledProgress() {
  const [value, setValue] = React.useState(25);
  return (
    <div>
      <Progress.Root value={value}>
        <Progress.Label>Uploading</Progress.Label>
        <Progress.Value />
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>
      <button onClick={() => setValue((v) => Math.min(100, v + 25))}>
        Increase
      </button>
      <span data-testid="current-value">{value}</span>
    </div>
  );
}
