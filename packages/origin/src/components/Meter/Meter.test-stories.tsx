"use client";

import * as React from "react";
import { Meter } from "./index";

export function DefaultMeter() {
  return (
    <Meter.Root value={50}>
      <Meter.Label>Storage used</Meter.Label>
      <Meter.Value />
      <Meter.Track>
        <Meter.Indicator />
      </Meter.Track>
    </Meter.Root>
  );
}

export function ZeroMeter() {
  return (
    <Meter.Root value={0}>
      <Meter.Label>Empty</Meter.Label>
      <Meter.Value />
      <Meter.Track>
        <Meter.Indicator />
      </Meter.Track>
    </Meter.Root>
  );
}

export function FullMeter() {
  return (
    <Meter.Root value={100}>
      <Meter.Label>Storage full</Meter.Label>
      <Meter.Value />
      <Meter.Track>
        <Meter.Indicator />
      </Meter.Track>
    </Meter.Root>
  );
}

export function LowMeter() {
  return (
    <Meter.Root value={25}>
      <Meter.Label>Battery</Meter.Label>
      <Meter.Value />
      <Meter.Track>
        <Meter.Indicator />
      </Meter.Track>
    </Meter.Root>
  );
}

export function HighMeter() {
  return (
    <Meter.Root value={90}>
      <Meter.Label>Disk space</Meter.Label>
      <Meter.Value />
      <Meter.Track>
        <Meter.Indicator />
      </Meter.Track>
    </Meter.Root>
  );
}

export function TrackOnlyMeter() {
  return (
    <Meter.Root value={75}>
      <Meter.Track>
        <Meter.Indicator />
      </Meter.Track>
    </Meter.Root>
  );
}

export function CustomRangeMeter() {
  return (
    <Meter.Root value={50} min={0} max={200}>
      <Meter.Label>Custom range</Meter.Label>
      <Meter.Value />
      <Meter.Track>
        <Meter.Indicator />
      </Meter.Track>
    </Meter.Root>
  );
}
