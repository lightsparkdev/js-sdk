"use client";

import * as React from "react";
import { Switch } from "./Switch";

export function DefaultSwitch() {
  return <Switch />;
}

export function CheckedSwitch() {
  return <Switch defaultChecked />;
}

export function SmallSwitch() {
  return <Switch size="sm" />;
}

export function SmallCheckedSwitch() {
  return <Switch size="sm" defaultChecked />;
}

export function DisabledSwitch() {
  return <Switch disabled />;
}

export function DisabledCheckedSwitch() {
  return <Switch disabled defaultChecked />;
}

export function ReadOnlySwitch() {
  return <Switch readOnly defaultChecked />;
}

export function ControlledSwitch() {
  const [checked, setChecked] = React.useState(false);
  return (
    <div>
      <Switch checked={checked} onCheckedChange={setChecked} />
      <span data-testid="status">{checked ? "on" : "off"}</span>
    </div>
  );
}

export function RequiredSwitch() {
  return (
    <form data-testid="form">
      <Switch required name="agree" />
      <button type="submit">Submit</button>
    </form>
  );
}
