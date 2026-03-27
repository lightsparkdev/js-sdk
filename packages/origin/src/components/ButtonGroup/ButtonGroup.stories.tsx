"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { ButtonGroup } from "./";
import { Button } from "@/components/Button";

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

const meta: Meta<typeof ButtonGroup> = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },
    variant: {
      control: "radio",
      options: ["filled", "outline", "secondary"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  args: {
    orientation: "horizontal",
    variant: "filled",
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant={args.variant}>Button</Button>
      <Button variant={args.variant}>Button</Button>
      <Button variant={args.variant} iconOnly aria-label="More">
        <ChevronIcon />
      </Button>
    </ButtonGroup>
  ),
};

export const TwoButtons: Story = {
  render: () => (
    <ButtonGroup variant="outline">
      <Button variant="outline">Yes</Button>
      <Button variant="outline">No</Button>
    </ButtonGroup>
  ),
};

export const WithAriaLabel: Story = {
  render: () => (
    <ButtonGroup variant="outline" aria-label="Text formatting">
      <Button variant="outline">B</Button>
      <Button variant="outline">I</Button>
      <Button variant="outline">U</Button>
    </ButtonGroup>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Filled horizontal
        </span>
        <ButtonGroup>
          <Button variant="filled">Button</Button>
          <Button variant="filled">Button</Button>
          <Button variant="filled" iconOnly aria-label="More">
            <ChevronIcon />
          </Button>
        </ButtonGroup>

        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Outline horizontal
        </span>
        <ButtonGroup variant="outline">
          <Button variant="outline">Button</Button>
          <Button variant="outline">Button</Button>
          <Button variant="outline" iconOnly aria-label="More">
            <ChevronIcon />
          </Button>
        </ButtonGroup>

        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Secondary horizontal
        </span>
        <ButtonGroup variant="secondary">
          <Button variant="secondary">Button</Button>
          <Button variant="secondary">Button</Button>
          <Button variant="secondary" iconOnly aria-label="More">
            <ChevronIcon />
          </Button>
        </ButtonGroup>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Filled vertical
        </span>
        <ButtonGroup orientation="vertical">
          <Button variant="filled">Button</Button>
          <Button variant="filled">Button</Button>
          <Button variant="filled">Button</Button>
        </ButtonGroup>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Outline vertical
        </span>
        <ButtonGroup orientation="vertical" variant="outline">
          <Button variant="outline">Button</Button>
          <Button variant="outline">Button</Button>
          <Button variant="outline">Button</Button>
        </ButtonGroup>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Secondary vertical
        </span>
        <ButtonGroup orientation="vertical" variant="secondary">
          <Button variant="secondary">Button</Button>
          <Button variant="secondary">Button</Button>
          <Button variant="secondary">Button</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};
