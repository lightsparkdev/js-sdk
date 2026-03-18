import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";
import { Button } from "../Button";
import { CentralIcon } from "../Icon";

const meta: Meta = {
  title: "Components/Tooltip",
  parameters: {
    layout: "centered",
  },
  argTypes: {
    delay: { control: "number" },
  },
  decorators: [
    (Story, context) => (
      <Tooltip.Provider delay={context.args?.delay}>
        <Story />
      </Tooltip.Provider>
    ),
  ],
};

export default meta;

export const Default: StoryObj = {
  args: {
    delay: 0,
  },
  render: () => (
    <Tooltip.Root>
      <Tooltip.Trigger render={<Button variant="outline">Hover me</Button>} />
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={8}>
          <Tooltip.Popup>
            This is a tooltip
            <Tooltip.Arrow />
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  ),
};

export const LongText: StoryObj = {
  render: () => (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={<Button variant="outline">Hover for details</Button>}
      />
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={8}>
          <Tooltip.Popup>
            This is a longer tooltip that demonstrates text wrapping behavior
            within the max-width constraint.
            <Tooltip.Arrow />
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  ),
};

export const IconTrigger: StoryObj = {
  render: () => (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <button
            aria-label="Help"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            <CentralIcon name="IconCircleInfo" size={20} />
          </button>
        }
      />
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={8}>
          <Tooltip.Popup>
            Click for more information
            <Tooltip.Arrow />
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  ),
};

export const Placements: StoryObj = {
  render: () => (
    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <Tooltip.Root key={side}>
          <Tooltip.Trigger render={<Button variant="outline">{side}</Button>} />
          <Tooltip.Portal>
            <Tooltip.Positioner side={side} sideOffset={8}>
              <Tooltip.Popup>
                Tooltip on {side}
                <Tooltip.Arrow />
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      ))}
    </div>
  ),
};

export const Controlled: StoryObj = {
  render: function Controlled() {
    const [open, setOpen] = React.useState(false);
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <Button onClick={() => setOpen(!open)}>
          Toggle tooltip: {open ? "Open" : "Closed"}
        </Button>
        <Tooltip.Root open={open} onOpenChange={setOpen}>
          <Tooltip.Trigger
            render={<Button variant="outline">Controlled trigger</Button>}
          />
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={8}>
              <Tooltip.Popup>
                Controlled tooltip
                <Tooltip.Arrow />
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    );
  },
};
