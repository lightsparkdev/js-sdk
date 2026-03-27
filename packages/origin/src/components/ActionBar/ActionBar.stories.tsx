import type { Meta, StoryObj } from "@storybook/react";
import { ActionBar, ActionBarLabel, ActionBarActions } from "./ActionBar";
import { Button } from "@/components/Button";
import { CentralIcon } from "@/components/Icon";

const meta = {
  title: "Components/ActionBar",
  component: ActionBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <ActionBarLabel>4 transactions selected</ActionBarLabel>
        <ActionBarActions>
          <Button variant="outline" size="default">
            Clear
          </Button>
          <Button
            variant="filled"
            size="default"
            leadingIcon={<CentralIcon name="IconArrowOutOfBox" size={16} />}
          >
            Export
          </Button>
        </ActionBarActions>
      </>
    ),
  },
};

export const SingleAction: Story = {
  args: {
    children: (
      <>
        <ActionBarLabel>2 items selected</ActionBarLabel>
        <ActionBarActions>
          <Button variant="filled" size="default">
            Delete
          </Button>
        </ActionBarActions>
      </>
    ),
  },
};

export const MultipleActions: Story = {
  args: {
    children: (
      <>
        <ActionBarLabel>12 files selected</ActionBarLabel>
        <ActionBarActions>
          <Button variant="ghost" size="default">
            Cancel
          </Button>
          <Button variant="outline" size="default">
            Move
          </Button>
          <Button variant="filled" size="default">
            Download
          </Button>
        </ActionBarActions>
      </>
    ),
  },
};

export const CriticalAction: Story = {
  args: {
    children: (
      <>
        <ActionBarLabel>3 users selected</ActionBarLabel>
        <ActionBarActions>
          <Button variant="outline" size="default">
            Cancel
          </Button>
          <Button variant="critical" size="default">
            Delete users
          </Button>
        </ActionBarActions>
      </>
    ),
  },
};
