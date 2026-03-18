"use client";

import * as React from "react";
import { ButtonGroup } from "./";
import { Button } from "../Button";

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Horizontal with filled buttons (default)
export function HorizontalFilled() {
  return (
    <ButtonGroup>
      <Button variant="filled">Edit</Button>
      <Button variant="filled">Copy</Button>
      <Button variant="filled" iconOnly aria-label="More">
        <ChevronIcon />
      </Button>
    </ButtonGroup>
  );
}

// Horizontal with outline buttons
export function HorizontalOutline() {
  return (
    <ButtonGroup variant="outline">
      <Button variant="outline">Edit</Button>
      <Button variant="outline">Copy</Button>
      <Button variant="outline" iconOnly aria-label="More">
        <ChevronIcon />
      </Button>
    </ButtonGroup>
  );
}

// Vertical with filled buttons
export function VerticalFilled() {
  return (
    <ButtonGroup orientation="vertical">
      <Button variant="filled">Option A</Button>
      <Button variant="filled">Option B</Button>
      <Button variant="filled">Option C</Button>
    </ButtonGroup>
  );
}

// Vertical with outline buttons
export function VerticalOutline() {
  return (
    <ButtonGroup orientation="vertical" variant="outline">
      <Button variant="outline">Option A</Button>
      <Button variant="outline">Option B</Button>
      <Button variant="outline">Option C</Button>
    </ButtonGroup>
  );
}

// Horizontal with secondary buttons
export function HorizontalSecondary() {
  return (
    <ButtonGroup variant="secondary">
      <Button variant="secondary">Edit</Button>
      <Button variant="secondary">Copy</Button>
      <Button variant="secondary" iconOnly aria-label="More">
        <ChevronIcon />
      </Button>
    </ButtonGroup>
  );
}

// Vertical with secondary buttons
export function VerticalSecondary() {
  return (
    <ButtonGroup orientation="vertical" variant="secondary">
      <Button variant="secondary">Option A</Button>
      <Button variant="secondary">Option B</Button>
      <Button variant="secondary">Option C</Button>
    </ButtonGroup>
  );
}

// Two buttons only (verifies first/last without middle)
export function TwoButtons() {
  return (
    <ButtonGroup variant="outline">
      <Button variant="outline">Yes</Button>
      <Button variant="outline">No</Button>
    </ButtonGroup>
  );
}

// Single button (edge case)
export function SingleButton() {
  return (
    <ButtonGroup variant="outline">
      <Button variant="outline">Only</Button>
    </ButtonGroup>
  );
}

// With aria-label
export function WithLabel() {
  return (
    <ButtonGroup variant="outline" aria-label="Actions">
      <Button variant="outline">Edit</Button>
      <Button variant="outline">Delete</Button>
    </ButtonGroup>
  );
}

// Conformance: forwards props
export function ConformanceRoot(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ButtonGroup variant="outline" data-testid="test-root" {...props}>
      <Button variant="outline">A</Button>
      <Button variant="outline">B</Button>
    </ButtonGroup>
  );
}
