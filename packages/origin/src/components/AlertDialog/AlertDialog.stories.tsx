import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AlertDialog } from "./index";
import { Button } from "../Button";

const meta: Meta = {
  title: "Components/AlertDialog",
  component: AlertDialog.Root,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    defaultOpen: { control: "boolean" },
  },
};

export default meta;

export const Default: StoryObj = {
  args: {
    defaultOpen: false,
  },
  render: (args) => (
    <AlertDialog.Root defaultOpen={args.defaultOpen}>
      <AlertDialog.Trigger render={<Button variant="outline" />}>
        Delete Item
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Popup>
          <AlertDialog.Title>Delete Item?</AlertDialog.Title>
          <AlertDialog.Description>
            This action cannot be undone. The item will be permanently removed.
          </AlertDialog.Description>
          <AlertDialog.Actions>
            <AlertDialog.Close render={<Button variant="outline" />}>
              Cancel
            </AlertDialog.Close>
            <AlertDialog.Close render={<Button variant="filled" />}>
              Delete
            </AlertDialog.Close>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  ),
};

export const Critical: StoryObj = {
  render: () => (
    <AlertDialog.Root>
      <AlertDialog.Trigger render={<Button variant="critical" />}>
        Delete Account
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Popup>
          <AlertDialog.Title>Delete Account?</AlertDialog.Title>
          <AlertDialog.Description>
            This will permanently delete your account and all associated data.
            You cannot undo this action.
          </AlertDialog.Description>
          <AlertDialog.Actions>
            <AlertDialog.Close render={<Button variant="outline" />}>
              Cancel
            </AlertDialog.Close>
            <AlertDialog.Close render={<Button variant="critical" />}>
              Delete Account
            </AlertDialog.Close>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  ),
};

export const Controlled: StoryObj = {
  render: function ControlledExample() {
    const [open, setOpen] = React.useState(false);

    return (
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
          <AlertDialog.Trigger render={<Button variant="outline" />}>
            Open Controlled Dialog
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Popup>
              <AlertDialog.Title>Controlled Dialog</AlertDialog.Title>
              <AlertDialog.Description>
                This dialog is controlled via React state. Open: {String(open)}
              </AlertDialog.Description>
              <AlertDialog.Actions>
                <AlertDialog.Close render={<Button variant="outline" />}>
                  Close
                </AlertDialog.Close>
              </AlertDialog.Actions>
            </AlertDialog.Popup>
          </AlertDialog.Portal>
        </AlertDialog.Root>
        <span style={{ fontSize: "14px", color: "#666" }}>
          State: {open ? "Open" : "Closed"}
        </span>
      </div>
    );
  },
};
