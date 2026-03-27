"use client";

import * as React from "react";
import { Textarea } from "./Textarea";

export function DefaultTextarea() {
  return <Textarea placeholder="Placeholder" />;
}

export function FilledTextarea() {
  return <Textarea defaultValue="Content" />;
}

export function DisabledTextarea() {
  return <Textarea disabled placeholder="Placeholder" />;
}

export function DisabledFilledTextarea() {
  return <Textarea disabled defaultValue="Content" />;
}

export function ReadOnlyTextarea() {
  return <Textarea readOnly defaultValue="Read only content" />;
}

export function ControlledTextarea() {
  const [value, setValue] = React.useState("");
  return (
    <div>
      <Textarea
        value={value}
        onValueChange={(v) => setValue(v)}
        placeholder="Type here"
      />
      <span data-testid="value">{value}</span>
    </div>
  );
}

export function TextareaWithRows() {
  return <Textarea rows={6} placeholder="Tall textarea" />;
}

export function InvalidTextarea() {
  return <Textarea defaultValue="Invalid content" data-invalid="" />;
}
