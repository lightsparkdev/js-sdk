"use client";

import * as React from "react";
import { Alert } from "./Alert";

export function DefaultAlert() {
  return (
    <Alert
      variant="default"
      title="Default Title"
      description="Default description text."
    />
  );
}

export function CriticalAlert() {
  return (
    <Alert
      variant="critical"
      title="Critical Title"
      description="Critical description text."
    />
  );
}

export function TitleOnlyAlert() {
  return <Alert variant="default" title="Title Only" />;
}

export function NoIconAlert() {
  return (
    <Alert
      variant="default"
      title="No Icon"
      description="This alert has no icon."
      icon={false}
    />
  );
}

export function WarningAlert() {
  return (
    <Alert
      variant="warning"
      title="Warning Title"
      description="Warning description text."
    />
  );
}

export function CustomIconAlert() {
  return (
    <Alert
      variant="default"
      title="Custom Icon"
      description="This alert has a custom icon."
      icon={<span data-testid="custom-icon">*</span>}
    />
  );
}
