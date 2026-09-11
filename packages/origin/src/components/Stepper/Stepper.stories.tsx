import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Stepper } from "./index";

const meta: Meta = {
  title: "Components/Stepper",
  parameters: {
    layout: "centered",
  },
};

export default meta;

function DemoStepper() {
  const [value, setValue] = React.useState("address");
  return (
    <div style={{ width: 240 }}>
      <Stepper.Root
        aria-label="Setup progress"
        value={value}
        onValueChange={setValue}
      >
        <Stepper.Step value="account" status="complete">
          <Stepper.Trigger>
            <Stepper.Marker />
            <Stepper.Label>Account</Stepper.Label>
          </Stepper.Trigger>
        </Stepper.Step>
        <Stepper.Step
          value="details"
          status="partial"
          progress={{ completed: 1, total: 3 }}
        >
          <Stepper.Trigger>
            <Stepper.Marker />
            <Stepper.Label>Details</Stepper.Label>
          </Stepper.Trigger>
          <Stepper.Substeps>
            <Stepper.Step value="profile" status="complete">
              <Stepper.Trigger>
                <Stepper.Marker />
                <Stepper.Label>Profile</Stepper.Label>
              </Stepper.Trigger>
            </Stepper.Step>
            <Stepper.Step value="address" status="partial">
              <Stepper.Trigger>
                <Stepper.Marker />
                <Stepper.Label>Address</Stepper.Label>
              </Stepper.Trigger>
            </Stepper.Step>
            <Stepper.Step value="preferences">
              <Stepper.Trigger>
                <Stepper.Marker />
                <Stepper.Label>Preferences</Stepper.Label>
              </Stepper.Trigger>
            </Stepper.Step>
          </Stepper.Substeps>
        </Stepper.Step>
        <Stepper.Step value="review">
          <Stepper.Trigger>
            <Stepper.Marker />
            <Stepper.Label>Review</Stepper.Label>
          </Stepper.Trigger>
        </Stepper.Step>
      </Stepper.Root>
    </div>
  );
}

export const Default: StoryObj = {
  render: () => <DemoStepper />,
};
