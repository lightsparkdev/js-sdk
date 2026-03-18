import type { Meta, StoryObj } from "@storybook/react";
import { SegmentedNav } from "./";

const meta = {
  title: "Components/SegmentedNav",
  component: SegmentedNav,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SegmentedNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SegmentedNav aria-label="Payout sections">
      <SegmentedNav.Link render={<a href="/payouts" />}>
        Overview
      </SegmentedNav.Link>
      <SegmentedNav.Link active render={<a href="/payouts/activity" />}>
        Activity
      </SegmentedNav.Link>
      <SegmentedNav.Link render={<a href="/payouts/recipients" />}>
        Recipients
      </SegmentedNav.Link>
      <SegmentedNav.Link render={<a href="/payouts/customers" />}>
        Customers
      </SegmentedNav.Link>
    </SegmentedNav>
  ),
};

export const Grouped: Story = {
  render: () => (
    <SegmentedNav aria-label="Payout sections">
      <SegmentedNav.Group>
        <SegmentedNav.Link render={<a href="/payouts" />}>
          Overview
        </SegmentedNav.Link>
        <SegmentedNav.Link active render={<a href="/payouts/activity" />}>
          Platform payouts
        </SegmentedNav.Link>
        <SegmentedNav.Link render={<a href="/payouts/recipients" />}>
          Recipients
        </SegmentedNav.Link>
      </SegmentedNav.Group>
      <SegmentedNav.Group>
        <SegmentedNav.Link render={<a href="/payouts/customers" />}>
          Customer payouts
        </SegmentedNav.Link>
      </SegmentedNav.Group>
    </SegmentedNav>
  ),
};

export const PlainAnchors: Story = {
  render: () => (
    <SegmentedNav aria-label="Balance sections">
      <SegmentedNav.Link active render={<a href="/balances" />}>
        Balances
      </SegmentedNav.Link>
      <SegmentedNav.Link render={<a href="/balances/activity" />}>
        Activity
      </SegmentedNav.Link>
      <SegmentedNav.Link render={<a href="/balances/reports" />}>
        Reports
      </SegmentedNav.Link>
    </SegmentedNav>
  ),
};

export const LongerLabels: Story = {
  render: () => (
    <SegmentedNav aria-label="Customer payout sections">
      <SegmentedNav.Link render={<a href="/customers/overview" />}>
        Customer overview
      </SegmentedNav.Link>
      <SegmentedNav.Link
        active
        render={<a href="/customers/platform-payouts" />}
      >
        Platform payouts
      </SegmentedNav.Link>
      <SegmentedNav.Link render={<a href="/customers/reconciliation" />}>
        Reconciliation
      </SegmentedNav.Link>
    </SegmentedNav>
  ),
};
