import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M10 12L6 8L10 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M6 12L10 8L6 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M8 2v12M2 8h12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["filled", "secondary", "outline", "ghost", "critical", "link"],
    },
    size: {
      control: "radio",
      options: ["default", "compact", "dense"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    variant: "filled",
    size: "default",
    loading: false,
    disabled: false,
    fullWidth: false,
    children: "Button",
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Button size="dense">Dense</Button>
      <Button size="compact">Compact</Button>
      <Button size="default">Default</Button>
    </div>
  ),
};

export const WithLeadingIcon: Story = {
  args: {
    leadingIcon: <ChevronLeft />,
    children: "Back",
  },
};

export const WithTrailingIcon: Story = {
  args: {
    trailingIcon: <ChevronRight />,
    children: "Next",
  },
};

export const WithBothIcons: Story = {
  args: {
    leadingIcon: <ChevronLeft />,
    trailingIcon: <ChevronRight />,
    children: "Navigate",
  },
};

export const IconOnly: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Button
        iconOnly
        size="dense"
        aria-label="Add"
        leadingIcon={<PlusIcon />}
      />
      <Button
        iconOnly
        size="compact"
        aria-label="Add"
        leadingIcon={<PlusIcon />}
      />
      <Button
        iconOnly
        size="default"
        aria-label="Add"
        leadingIcon={<PlusIcon />}
      />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Button variant="filled">Filled</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="critical">Critical</Button>
        <Button variant="link">Link</Button>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Button variant="filled" disabled>
          Filled
        </Button>
        <Button variant="secondary" disabled>
          Secondary
        </Button>
        <Button variant="outline" disabled>
          Outline
        </Button>
        <Button variant="ghost" disabled>
          Ghost
        </Button>
        <Button variant="critical" disabled>
          Critical
        </Button>
        <Button variant="link" disabled>
          Link
        </Button>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Button variant="filled" loading>
          Filled
        </Button>
        <Button variant="secondary" loading>
          Secondary
        </Button>
        <Button variant="outline" loading>
          Outline
        </Button>
        <Button variant="ghost" loading>
          Ghost
        </Button>
        <Button variant="critical" loading>
          Critical
        </Button>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Button size="dense" variant="filled">
          Dense Filled
        </Button>
        <Button size="dense" variant="secondary">
          Dense Secondary
        </Button>
        <Button size="dense" variant="outline">
          Dense Outline
        </Button>
        <Button size="dense" variant="ghost">
          Dense Ghost
        </Button>
        <Button size="dense" variant="critical">
          Dense Critical
        </Button>
        <Button size="dense" variant="link">
          Dense Link
        </Button>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Button size="compact" variant="filled">
          Compact Filled
        </Button>
        <Button size="compact" variant="secondary">
          Compact Secondary
        </Button>
        <Button size="compact" variant="outline">
          Compact Outline
        </Button>
        <Button size="compact" variant="ghost">
          Compact Ghost
        </Button>
        <Button size="compact" variant="critical">
          Compact Critical
        </Button>
        <Button size="compact" variant="link">
          Compact Link
        </Button>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Button size="default" variant="filled">
          Default Filled
        </Button>
        <Button size="default" variant="secondary">
          Default Secondary
        </Button>
        <Button size="default" variant="outline">
          Default Outline
        </Button>
        <Button size="default" variant="ghost">
          Default Ghost
        </Button>
        <Button size="default" variant="critical">
          Default Critical
        </Button>
        <Button size="default" variant="link">
          Default Link
        </Button>
      </div>
    </div>
  ),
};
