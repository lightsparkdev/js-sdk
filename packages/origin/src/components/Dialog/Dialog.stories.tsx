import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "./index";
import { Button } from "../Button";

const meta: Meta = {
  title: "Components/Dialog",
  component: Dialog.Root,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    modal: { control: "boolean" },
  },
};

export default meta;

export const Default: StoryObj = {
  args: {
    modal: true,
  },
  render: (args) => (
    <Dialog.Root modal={args.modal}>
      <Dialog.Trigger render={<Button variant="outline" />}>
        Open Dialog
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.CloseButton />
          <Dialog.Header>
            <Dialog.Title>Dialog Title</Dialog.Title>
            <Dialog.Description>
              This is a description of the dialog content.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Content>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "var(--text-secondary)",
              }}
            >
              Dialog content goes here. This area can contain forms, text, or
              any other content.
            </p>
          </Dialog.Content>
          <Dialog.Footer>
            <Dialog.Close render={<Button variant="outline" />}>
              Cancel
            </Dialog.Close>
            <Button variant="filled">Confirm</Button>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  ),
};

export const WithoutCloseButton: StoryObj = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="outline" />}>
        Open Dialog
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Header>
            <Dialog.Title>No Close Button</Dialog.Title>
            <Dialog.Description>
              This dialog does not have an X close button.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Content>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "var(--text-secondary)",
              }}
            >
              The user must use the footer buttons or press Escape to close.
            </p>
          </Dialog.Content>
          <Dialog.Footer>
            <Dialog.Close render={<Button variant="outline" />}>
              Cancel
            </Dialog.Close>
            <Dialog.Close render={<Button variant="filled" />}>
              Done
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  ),
};

export const HeaderOnly: StoryObj = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="outline" />}>
        Quick Confirm
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.CloseButton />
          <Dialog.Header>
            <Dialog.Title>Are you sure?</Dialog.Title>
            <Dialog.Description>
              This action will apply the changes.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.Close render={<Button variant="outline" />}>
              Cancel
            </Dialog.Close>
            <Button variant="filled">Apply</Button>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  ),
};

export const Controlled: StoryObj = {
  render: function ControlledExample() {
    const [open, setOpen] = React.useState(false);

    return (
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger render={<Button variant="outline" />}>
            Open Controlled Dialog
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
              <Dialog.CloseButton />
              <Dialog.Header>
                <Dialog.Title>Controlled Dialog</Dialog.Title>
                <Dialog.Description>
                  This dialog is controlled via React state. Open:{" "}
                  {String(open)}
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Content>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "var(--text-secondary)",
                  }}
                >
                  Use the buttons below or press Escape to close.
                </p>
              </Dialog.Content>
              <Dialog.Footer>
                <Dialog.Close render={<Button variant="outline" />}>
                  Close
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
        <span style={{ fontSize: "14px", color: "#666" }}>
          State: {open ? "Open" : "Closed"}
        </span>
      </div>
    );
  },
};

export const Nested: StoryObj = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="outline" />}>
        Open Parent
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.CloseButton />
          <Dialog.Header>
            <Dialog.Title>Parent Dialog</Dialog.Title>
            <Dialog.Description>
              This dialog contains a nested child dialog.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Content>
            <Dialog.Root>
              <Dialog.Trigger render={<Button variant="outline" />}>
                Open Child
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Backdrop />
                <Dialog.Popup>
                  <Dialog.CloseButton />
                  <Dialog.Header>
                    <Dialog.Title>Child Dialog</Dialog.Title>
                    <Dialog.Description>
                      This is a nested dialog.
                    </Dialog.Description>
                  </Dialog.Header>
                  <Dialog.Footer>
                    <Dialog.Close render={<Button variant="outline" />}>
                      Close
                    </Dialog.Close>
                  </Dialog.Footer>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          </Dialog.Content>
          <Dialog.Footer>
            <Dialog.Close render={<Button variant="outline" />}>
              Close
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  ),
};
