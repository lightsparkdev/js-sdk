"use client";

import * as React from "react";
import { Stepper } from "./index";

export function BasicStepper({
  value = "details",
  onValueChange = () => undefined,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <Stepper.Root
      aria-label="Setup progress"
      value={value}
      onValueChange={onValueChange}
    >
      <Stepper.Step value="account" status="complete">
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Account</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
      <Stepper.Step value="details" status="partial">
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Details</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
      <Stepper.Step value="review">
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Review</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
    </Stepper.Root>
  );
}

export function ControlledStepper({
  onValueChange,
}: {
  onValueChange?: (value: string) => void;
}) {
  const [value, setValue] = React.useState("account");
  return (
    <BasicStepper
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onValueChange?.(next);
      }}
    />
  );
}

export function NestedStepper({ value = "address" }: { value?: string }) {
  return (
    <Stepper.Root
      aria-label="Setup progress"
      value={value}
      onValueChange={() => undefined}
    >
      <Stepper.Step
        value="details"
        status="partial"
        progress={{ completed: 1, total: 3 }}
      >
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Details</Stepper.Label>
        </Stepper.Trigger>
        <Stepper.Substeps>
          <Stepper.Step value="profile" status="complete">
            <Stepper.Trigger>
              <Stepper.Marker />
              <Stepper.Label>Profile</Stepper.Label>
            </Stepper.Trigger>
          </Stepper.Step>
          <Stepper.Step value="address" status="partial">
            <Stepper.Trigger>
              <Stepper.Marker />
              <Stepper.Label>Address</Stepper.Label>
            </Stepper.Trigger>
          </Stepper.Step>
          <Stepper.Step value="preferences">
            <Stepper.Trigger>
              <Stepper.Marker />
              <Stepper.Label>Preferences</Stepper.Label>
            </Stepper.Trigger>
          </Stepper.Step>
        </Stepper.Substeps>
      </Stepper.Step>
      <Stepper.Step
        value="verification"
        status="complete"
        progress={{ completed: 3, total: 3 }}
      >
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Verification</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
      <Stepper.Step value="review">
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Review</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
    </Stepper.Root>
  );
}

export function NonInteractiveStepper() {
  return (
    <Stepper.Root aria-label="Setup progress" value="details">
      <Stepper.Step value="account" status="complete">
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Account</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
      <Stepper.Step value="details" status="partial">
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Details</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
      <Stepper.Step value="review">
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Review</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
    </Stepper.Root>
  );
}

export function LockedStepper() {
  return (
    <Stepper.Root
      aria-label="Setup progress"
      value="details"
      onValueChange={() => undefined}
    >
      <Stepper.Step value="account" status="complete">
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Account</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
      <Stepper.Step value="details" status="partial">
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Details</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
      <Stepper.Step value="review">
        <Stepper.Trigger disabled>
          <Stepper.Marker />
          <Stepper.Label>Review</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
    </Stepper.Root>
  );
}

export function OutOfRangeProgressStepper() {
  return (
    <Stepper.Root
      aria-label="Setup progress"
      value="details"
      onValueChange={() => undefined}
    >
      <Stepper.Step
        value="details"
        status="partial"
        progress={{ completed: 7, total: 5 }}
      >
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Details</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
      <Stepper.Step
        value="review"
        status="partial"
        progress={{ completed: 2, total: 0 }}
      >
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Review</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
      <Stepper.Step
        value="confirm"
        status="partial"
        progress={{ completed: Number.NaN, total: Number.POSITIVE_INFINITY }}
      >
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Confirm</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
    </Stepper.Root>
  );
}

export function CustomProgressLabelStepper() {
  return (
    <Stepper.Root
      aria-label="Setup progress"
      value="details"
      onValueChange={() => undefined}
      formatProgressLabel={({ completed, total }) =>
        `${completed}/${total} done`
      }
    >
      <Stepper.Step
        value="details"
        status="partial"
        progress={{ completed: 1, total: 3 }}
      >
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Details</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
      <Stepper.Step value="review">
        <Stepper.Trigger>
          <Stepper.Marker />
          <Stepper.Label>Review</Stepper.Label>
        </Stepper.Trigger>
      </Stepper.Step>
    </Stepper.Root>
  );
}
