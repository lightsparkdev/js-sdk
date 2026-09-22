"use client";

import * as React from "react";
import { Alert, type AlertProps } from "./Alert";
import { Button } from "../Button";

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

export function NoIconAlert({
  variant = "default",
  icon = false,
}: {
  variant?: AlertProps["variant"];
  icon?: AlertProps["icon"];
}) {
  return (
    <Alert
      variant={variant}
      title="No Icon"
      description="This alert has no icon."
      icon={icon}
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
      variant="critical"
      title="Custom Icon"
      description="This alert has a custom icon."
      icon={<span data-testid="custom-icon">*</span>}
    />
  );
}

export function AlertWithTrailingAction({ width = 960 }: { width?: number }) {
  return (
    <div style={{ width }}>
      <Alert
        title="A longer alert title that should remain easy to scan"
        description="This description is intentionally long enough to show that the alert shell can fill its parent while the text column stays at a readable measure."
        trailing={
          <Button size="compact" variant="filled">
            Continue
          </Button>
        }
      />
    </div>
  );
}

export function AlertWithNumericTrailing() {
  return <Alert title="Numeric trailing content" trailing={0} />;
}
