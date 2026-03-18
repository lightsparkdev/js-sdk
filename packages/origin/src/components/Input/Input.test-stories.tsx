"use client";

import * as React from "react";
import { Input } from "./Input";

export function DefaultInput() {
  return <Input placeholder="Placeholder" />;
}

export function FilledInput() {
  return <Input defaultValue="Content" />;
}

export function DisabledInput() {
  return <Input disabled placeholder="Placeholder" />;
}

export function DisabledFilledInput() {
  return <Input disabled defaultValue="Content" />;
}

export function ReadOnlyInput() {
  return <Input readOnly defaultValue="Read only content" />;
}

export function ControlledInput() {
  const [value, setValue] = React.useState("");
  return (
    <div>
      <Input
        value={value}
        onValueChange={(v) => setValue(v)}
        placeholder="Type here"
      />
      <span data-testid="value">{value}</span>
    </div>
  );
}

export function InputWithType() {
  return <Input type="email" placeholder="Email address" />;
}
