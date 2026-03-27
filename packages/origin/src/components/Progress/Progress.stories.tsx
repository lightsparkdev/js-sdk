import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Progress } from "./index";

const meta: Meta = {
  title: "Components/Progress",
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
      <Progress.Root {...args}>
        <Progress.Label>Export data</Progress.Label>
        <Progress.Value />
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>
    </div>
  ),
};

export const Indeterminate: StoryObj = {
  render: () => (
    <div style={{ width: 240 }}>
      <Progress.Root value={null}>
        <Progress.Label>Loading...</Progress.Label>
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>
    </div>
  ),
};

export const TrackOnly: StoryObj = {
  render: () => (
    <div style={{ width: 240 }}>
      <Progress.Root value={75}>
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>
    </div>
  ),
};

export const Animated: StoryObj = {
  render: function AnimatedProgress() {
    const [value, setValue] = React.useState(0);

    React.useEffect(() => {
      const interval = setInterval(() => {
        setValue((current) => {
          if (current >= 100) return 0;
          return Math.min(100, current + Math.random() * 15);
        });
      }, 500);
      return () => clearInterval(interval);
    }, []);

    return (
      <div style={{ width: 240 }}>
        <Progress.Root value={value}>
          <Progress.Label>Downloading</Progress.Label>
          <Progress.Value />
          <Progress.Track>
            <Progress.Indicator />
          </Progress.Track>
        </Progress.Root>
      </div>
    );
  },
};
