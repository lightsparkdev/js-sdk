"use client";

import * as React from "react";
import { InputGroup } from "./";
import { Field } from "../Field";

// Minimal icon for testing (avoids CentralIcon dependency in tests)
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" fill="none" />
      <line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" fill="none" />
      <text x="8" y="12" textAnchor="middle" fill="currentColor" fontSize="10">
        i
      </text>
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      data-testid="spinner"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        fill="none"
        strokeDasharray="20 10"
      />
    </svg>
  );
}

// Shared helper for InputGroup stories
interface InputGroupStoryProps {
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
}

// Default: leading icon addon + input
export function Default({
  disabled,
  invalid,
  placeholder = "Search...",
}: InputGroupStoryProps = {}) {
  return (
    <InputGroup.Root disabled={disabled} invalid={invalid}>
      <InputGroup.Addon>
        <SearchIcon />
      </InputGroup.Addon>
      <InputGroup.Input placeholder={placeholder} />
    </InputGroup.Root>
  );
}

// Trailing addon
export function TrailingAddon() {
  return (
    <InputGroup.Root>
      <InputGroup.Input placeholder="Enter value" />
      <InputGroup.Addon>
        <InfoIcon />
      </InputGroup.Addon>
    </InputGroup.Root>
  );
}

// Both leading and trailing addons
export function LeadingAndTrailing() {
  return (
    <InputGroup.Root>
      <InputGroup.Addon>
        <SearchIcon />
      </InputGroup.Addon>
      <InputGroup.Input placeholder="Search..." />
      <InputGroup.Addon>
        <InfoIcon />
      </InputGroup.Addon>
    </InputGroup.Root>
  );
}

// Cap (attached edge block)
export function CapAddon() {
  return (
    <InputGroup.Root>
      <InputGroup.Cap>https://</InputGroup.Cap>
      <InputGroup.Input placeholder="example.com" />
    </InputGroup.Root>
  );
}

// Trailing cap
export function TrailingCap() {
  return (
    <InputGroup.Root>
      <InputGroup.Input placeholder="0.00" />
      <InputGroup.Cap>USD</InputGroup.Cap>
    </InputGroup.Root>
  );
}

// Cap with button inside
export function CapWithButton() {
  return (
    <InputGroup.Root>
      <InputGroup.Input placeholder="Enter value..." />
      <InputGroup.Cap>
        <InputGroup.Button>Copy</InputGroup.Button>
      </InputGroup.Cap>
    </InputGroup.Root>
  );
}

// Cap with icon button inside
export function CapWithIconButton() {
  return (
    <InputGroup.Root>
      <InputGroup.Cap>
        <InputGroup.Button aria-label="Search">
          <SearchIcon />
        </InputGroup.Button>
      </InputGroup.Cap>
      <InputGroup.Input placeholder="Search..." />
    </InputGroup.Root>
  );
}

// With Text part
export function WithText() {
  return (
    <InputGroup.Root>
      <InputGroup.Text>$</InputGroup.Text>
      <InputGroup.Input placeholder="0.00" />
      <InputGroup.Text>USD</InputGroup.Text>
    </InputGroup.Root>
  );
}

// With ghost button (default)
export function WithButton() {
  return (
    <InputGroup.Root>
      <InputGroup.Addon>
        <SearchIcon />
      </InputGroup.Addon>
      <InputGroup.Input placeholder="Search..." />
      <InputGroup.Button aria-label="Search">Search</InputGroup.Button>
    </InputGroup.Root>
  );
}

// With outline button
export function WithOutlineButton() {
  return (
    <InputGroup.Root>
      <InputGroup.Addon>
        <SearchIcon />
      </InputGroup.Addon>
      <InputGroup.Input placeholder="Search..." />
      <InputGroup.Button variant="outline" aria-label="Search">
        Search
      </InputGroup.Button>
    </InputGroup.Root>
  );
}

// With spinner addon
export function WithSpinner() {
  return (
    <InputGroup.Root>
      <InputGroup.Input placeholder="Loading..." />
      <InputGroup.Addon>
        <SpinnerIcon />
      </InputGroup.Addon>
    </InputGroup.Root>
  );
}

// With ghost select trigger (default)
export function WithSelectTrigger() {
  return (
    <InputGroup.Root>
      <InputGroup.Input placeholder="Search..." />
      <InputGroup.SelectTrigger>Label</InputGroup.SelectTrigger>
    </InputGroup.Root>
  );
}

// With outline select trigger
export function WithOutlineSelectTrigger() {
  return (
    <InputGroup.Root>
      <InputGroup.Input placeholder="Search..." />
      <InputGroup.SelectTrigger variant="outline">
        Label
      </InputGroup.SelectTrigger>
    </InputGroup.Root>
  );
}

// Disabled state
export function Disabled() {
  return <Default disabled />;
}

// Disabled with button (verifies button inherits disabled from root)
export function DisabledWithButton() {
  return (
    <InputGroup.Root disabled>
      <InputGroup.Addon>
        <SearchIcon />
      </InputGroup.Addon>
      <InputGroup.Input placeholder="Search..." />
      <InputGroup.Button aria-label="Search">
        <SearchIcon />
      </InputGroup.Button>
    </InputGroup.Root>
  );
}

// Invalid state
export function Invalid() {
  return <Default invalid />;
}

// Input only (no addons)
export function InputOnly() {
  return (
    <InputGroup.Root>
      <InputGroup.Input placeholder="Plain input group" />
    </InputGroup.Root>
  );
}

// Field integration
export function WithField() {
  return (
    <Field.Root>
      <Field.Label>Email</Field.Label>
      <InputGroup.Root>
        <InputGroup.Addon>@</InputGroup.Addon>
        <InputGroup.Input placeholder="you@example.com" />
      </InputGroup.Root>
      <Field.Description>Enter your email address</Field.Description>
    </Field.Root>
  );
}

// Field integration with invalid state
export function WithFieldInvalid() {
  return (
    <Field.Root invalid>
      <Field.Label>Email</Field.Label>
      <InputGroup.Root invalid>
        <InputGroup.Addon>@</InputGroup.Addon>
        <InputGroup.Input placeholder="you@example.com" />
      </InputGroup.Root>
      <Field.Error>Please enter a valid email</Field.Error>
    </Field.Root>
  );
}

// Controlled input
export function Controlled() {
  const [value, setValue] = React.useState("");
  return (
    <div>
      <InputGroup.Root>
        <InputGroup.Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type here"
        />
      </InputGroup.Root>
      <span data-testid="value">{value}</span>
    </div>
  );
}

// Conformance: Root forwards props
export function ConformanceRoot(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <InputGroup.Root data-testid="test-root" {...props}>
      <InputGroup.Input placeholder="Test" />
    </InputGroup.Root>
  );
}

// Conformance: Addon forwards props
export function ConformanceAddon(props: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <InputGroup.Root>
      <InputGroup.Addon data-testid="test-root" {...props}>
        <SearchIcon />
      </InputGroup.Addon>
      <InputGroup.Input placeholder="Test" />
    </InputGroup.Root>
  );
}

// Conformance: Input forwards props
export function ConformanceInput(
  props: React.ComponentPropsWithoutRef<"input">,
) {
  return (
    <InputGroup.Root>
      <InputGroup.Input data-testid="test-root" placeholder="Test" {...props} />
    </InputGroup.Root>
  );
}

// Conformance: Button forwards props
export function ConformanceButton(
  props: React.HTMLAttributes<HTMLButtonElement>,
) {
  return (
    <InputGroup.Root>
      <InputGroup.Input placeholder="Test" />
      <InputGroup.Button data-testid="test-root" aria-label="Action" {...props}>
        Go
      </InputGroup.Button>
    </InputGroup.Root>
  );
}

// Conformance: SelectTrigger forwards props
export function ConformanceSelectTrigger(
  props: React.ComponentPropsWithoutRef<"button">,
) {
  return (
    <InputGroup.Root>
      <InputGroup.Input placeholder="Test" />
      <InputGroup.SelectTrigger data-testid="test-root" {...props}>
        Label
      </InputGroup.SelectTrigger>
    </InputGroup.Root>
  );
}

// Conformance: Text forwards props
export function ConformanceText(props: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <InputGroup.Root>
      <InputGroup.Text data-testid="test-root" {...props}>
        $
      </InputGroup.Text>
      <InputGroup.Input placeholder="Test" />
    </InputGroup.Root>
  );
}

// Conformance: Cap forwards props
export function ConformanceCap(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <InputGroup.Root>
      <InputGroup.Cap data-testid="test-root" {...props}>
        https://
      </InputGroup.Cap>
      <InputGroup.Input placeholder="Test" />
    </InputGroup.Root>
  );
}
