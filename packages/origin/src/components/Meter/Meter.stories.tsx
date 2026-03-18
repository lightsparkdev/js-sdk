import type { Meta, StoryObj } from "@storybook/react";
import { Meter } from "./index";

const meta: Meta = {
  title: "Components/Meter",
  parameters: {
    layout: "centered",
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    min: { control: { type: "number" } },
    max: { control: { type: "number" } },
  },
};

export default meta;

export const Default: StoryObj = {
  args: {
    value: 50,
    min: 0,
    max: 100,
  },
  render: (args) => (
    <div style={{ width: 240 }}>
      <Meter.Root {...args}>
        <Meter.Label>Storage used</Meter.Label>
        <Meter.Value />
        <Meter.Track>
          <Meter.Indicator />
        </Meter.Track>
      </Meter.Root>
    </div>
  ),
};

export const TrackOnly: StoryObj = {
  render: () => (
    <div style={{ width: 240 }}>
      <Meter.Root value={65}>
        <Meter.Track>
          <Meter.Indicator />
        </Meter.Track>
      </Meter.Root>
    </div>
  ),
};
