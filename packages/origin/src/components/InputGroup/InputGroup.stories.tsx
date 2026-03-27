"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { InputGroup } from "./";
import { Field } from "@/components/Field";

const meta: Meta<typeof InputGroup.Root> = {
  title: "Components/InputGroup",
  component: InputGroup.Root,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof InputGroup.Root>;

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle
        cx="7"
        cy="7"
        r="5"
        stroke="currentColor"
        fill="none"
        strokeWidth="1.5"
      />
      <line
        x1="11"
        y1="11"
        x2="14"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect
        x="1"
        y="3"
        width="14"
        height="10"
        rx="1"
        stroke="currentColor"
        fill="none"
        strokeWidth="1.5"
      />
      <path
        d="M1 4l7 5 7-5"
        stroke="currentColor"
        fill="none"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M6.5 9.5l3-3M9 5.5l1.5-1.5a2.12 2.12 0 013 3L12 8.5M7 10.5L5.5 12a2.12 2.12 0 01-3-3L4 7.5"
        stroke="currentColor"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Default: Story = {
  args: {
    disabled: false,
  },
  render: (args) => (
    <div style={{ width: 300 }}>
      <InputGroup.Root {...args}>
        <InputGroup.Addon>
          <SearchIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Search..." />
      </InputGroup.Root>
    </div>
  ),
};

export const TrailingAddon: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <InputGroup.Root>
        <InputGroup.Input placeholder="Enter email" />
        <InputGroup.Addon>
          <MailIcon />
        </InputGroup.Addon>
      </InputGroup.Root>
    </div>
  ),
};

export const LeadingAndTrailing: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <InputGroup.Root>
        <InputGroup.Addon>
          <SearchIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Search..." />
        <InputGroup.Addon>
          <MailIcon />
        </InputGroup.Addon>
      </InputGroup.Root>
    </div>
  ),
};

export const WithGhostButton: Story = {
  name: "Button (Ghost)",
  render: () => (
    <div style={{ width: 300 }}>
      <InputGroup.Root>
        <InputGroup.Addon>
          <SearchIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Search..." />
        <InputGroup.Button>Search</InputGroup.Button>
      </InputGroup.Root>
    </div>
  ),
};

export const WithOutlineButton: Story = {
  name: "Button (Outline)",
  render: () => (
    <div style={{ width: 300 }}>
      <InputGroup.Root>
        <InputGroup.Addon>
          <SearchIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Search..." />
        <InputGroup.Button variant="outline">Search</InputGroup.Button>
      </InputGroup.Root>
    </div>
  ),
};

export const WithGhostSelectTrigger: Story = {
  name: "Select Trigger (Ghost)",
  render: () => (
    <div style={{ width: 300 }}>
      <InputGroup.Root>
        <InputGroup.Input placeholder="0.00" />
        <InputGroup.SelectTrigger>USD</InputGroup.SelectTrigger>
      </InputGroup.Root>
    </div>
  ),
};

export const WithOutlineSelectTrigger: Story = {
  name: "Select Trigger (Outline)",
  render: () => (
    <div style={{ width: 300 }}>
      <InputGroup.Root>
        <InputGroup.Input placeholder="0.00" />
        <InputGroup.SelectTrigger variant="outline">
          USD
        </InputGroup.SelectTrigger>
      </InputGroup.Root>
    </div>
  ),
};

export const Cap: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <InputGroup.Root>
        <InputGroup.Cap>https://</InputGroup.Cap>
        <InputGroup.Input placeholder="example.com" />
      </InputGroup.Root>
    </div>
  ),
};

export const TrailingCap: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <InputGroup.Root>
        <InputGroup.Input placeholder="0.00" />
        <InputGroup.Cap>USD</InputGroup.Cap>
      </InputGroup.Root>
    </div>
  ),
};

export const CapWithButton: Story = {
  name: "Cap with Button",
  render: () => (
    <div style={{ width: 300 }}>
      <InputGroup.Root>
        <InputGroup.Input placeholder="Enter value..." />
        <InputGroup.Cap>
          <InputGroup.Button>Copy</InputGroup.Button>
        </InputGroup.Cap>
      </InputGroup.Root>
    </div>
  ),
};

export const CapWithIconButton: Story = {
  name: "Cap with Icon Button",
  render: () => (
    <div style={{ width: 300 }}>
      <InputGroup.Root>
        <InputGroup.Cap>
          <InputGroup.Button aria-label="Search">
            <SearchIcon />
          </InputGroup.Button>
        </InputGroup.Cap>
        <InputGroup.Input placeholder="Search..." />
      </InputGroup.Root>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <InputGroup.Root>
        <InputGroup.Text>$</InputGroup.Text>
        <InputGroup.Input placeholder="0.00" />
        <InputGroup.Text>USD</InputGroup.Text>
      </InputGroup.Root>
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledExample() {
    const [value, setValue] = React.useState("");
    return (
      <div
        style={{ width: 300, display: "flex", flexDirection: "column", gap: 8 }}
      >
        <InputGroup.Root>
          <InputGroup.Addon>
            <SearchIcon />
          </InputGroup.Addon>
          <InputGroup.Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type to search..."
          />
        </InputGroup.Root>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Value: {value || "(empty)"}
        </span>
      </div>
    );
  },
};

export const WithField: Story = {
  render: function WithFieldExample() {
    const [value, setValue] = React.useState("");
    const [touched, setTouched] = React.useState(false);
    const invalid = touched && !value.includes("@");

    return (
      <div style={{ width: 300 }}>
        <Field.Root invalid={invalid}>
          <Field.Label>Email address</Field.Label>
          <InputGroup.Root invalid={invalid}>
            <InputGroup.Addon>
              <MailIcon />
            </InputGroup.Addon>
            <InputGroup.Input
              type="email"
              placeholder="you@example.com"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => setTouched(true)}
            />
          </InputGroup.Root>
          <Field.Description>We will never share your email</Field.Description>
          <Field.Error>Please enter a valid email</Field.Error>
        </Field.Root>
      </div>
    );
  },
};

export const URLInput: Story = {
  name: "URL Input",
  render: () => (
    <div style={{ width: 360 }}>
      <InputGroup.Root>
        <InputGroup.Cap>https://</InputGroup.Cap>
        <InputGroup.Input placeholder="your-domain.com" />
        <InputGroup.Cap>/path</InputGroup.Cap>
      </InputGroup.Root>
    </div>
  ),
};

export const CurrencyInput: Story = {
  name: "Currency Input",
  render: () => (
    <div style={{ width: 300 }}>
      <InputGroup.Root>
        <InputGroup.Text>$</InputGroup.Text>
        <InputGroup.Input placeholder="0.00" type="number" />
        <InputGroup.Cap>USD</InputGroup.Cap>
      </InputGroup.Root>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 16, width: 300 }}
    >
      <div>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 4,
            display: "block",
          }}
        >
          Default with icon
        </span>
        <InputGroup.Root>
          <InputGroup.Addon>
            <SearchIcon />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Search..." />
        </InputGroup.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 4,
            display: "block",
          }}
        >
          Ghost button
        </span>
        <InputGroup.Root>
          <InputGroup.Addon>
            <LinkIcon />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Paste URL..." />
          <InputGroup.Button>Go</InputGroup.Button>
        </InputGroup.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 4,
            display: "block",
          }}
        >
          Outline button
        </span>
        <InputGroup.Root>
          <InputGroup.Addon>
            <LinkIcon />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Paste URL..." />
          <InputGroup.Button variant="outline">Go</InputGroup.Button>
        </InputGroup.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 4,
            display: "block",
          }}
        >
          Ghost select trigger
        </span>
        <InputGroup.Root>
          <InputGroup.Input placeholder="0.00" />
          <InputGroup.SelectTrigger>USD</InputGroup.SelectTrigger>
        </InputGroup.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 4,
            display: "block",
          }}
        >
          Outline select trigger
        </span>
        <InputGroup.Root>
          <InputGroup.Input placeholder="0.00" />
          <InputGroup.SelectTrigger variant="outline">
            USD
          </InputGroup.SelectTrigger>
        </InputGroup.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 4,
            display: "block",
          }}
        >
          Cap
        </span>
        <InputGroup.Root>
          <InputGroup.Cap>https://</InputGroup.Cap>
          <InputGroup.Input placeholder="example.com" />
        </InputGroup.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 4,
            display: "block",
          }}
        >
          Cap with button
        </span>
        <InputGroup.Root>
          <InputGroup.Input placeholder="Enter value..." />
          <InputGroup.Cap>
            <InputGroup.Button>Copy</InputGroup.Button>
          </InputGroup.Cap>
        </InputGroup.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 4,
            display: "block",
          }}
        >
          Text parts
        </span>
        <InputGroup.Root>
          <InputGroup.Text>$</InputGroup.Text>
          <InputGroup.Input placeholder="0.00" />
          <InputGroup.Text>USD</InputGroup.Text>
        </InputGroup.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 4,
            display: "block",
          }}
        >
          Disabled
        </span>
        <InputGroup.Root disabled>
          <InputGroup.Addon>
            <SearchIcon />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Search..." />
        </InputGroup.Root>
      </div>

      <div>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 4,
            display: "block",
          }}
        >
          Invalid
        </span>
        <InputGroup.Root invalid>
          <InputGroup.Addon>
            <MailIcon />
          </InputGroup.Addon>
          <InputGroup.Input defaultValue="bad-email" />
        </InputGroup.Root>
      </div>
    </div>
  ),
};
