import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Toast, ToastVariant } from "./";
import { Button } from "@/components/Button";

const meta: Meta = {
  title: "Components/Toast",
  parameters: {
    layout: "centered",
  },
};

export default meta;

// Helper component to trigger toasts
function ToastTrigger({
  title,
  description,
  variant = "default",
  actionLabel,
}: {
  title: string;
  description?: string;
  variant?: ToastVariant;
  actionLabel?: string;
}) {
  const toastManager = Toast.useToastManager();

  const handleAdd = () => {
    toastManager.add({
      title,
      description,
      data: { variant, actionLabel },
    });
  };

  return (
    <Button onClick={handleAdd} variant="outline">
      Show {variant} toast
    </Button>
  );
}

// Helper component to render toasts
function ToastRenderer() {
  const toastManager = Toast.useToastManager();

  return (
    <>
      {toastManager.toasts.map((toast) => {
        const variant = (toast.data?.variant as ToastVariant) || "default";
        return (
          <Toast.Root key={toast.id} toast={toast} variant={variant}>
            {variant !== "default" && <Toast.Icon variant={variant} />}
            <Toast.Content>
              <Toast.Title>{toast.title}</Toast.Title>
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </Toast.Content>
            {toast.data?.actionLabel && (
              <Toast.Action>{toast.data.actionLabel}</Toast.Action>
            )}
            <Toast.Close aria-label="Close toast" />
          </Toast.Root>
        );
      })}
    </>
  );
}

// Default story
export const Default: StoryObj = {
  render: () => (
    <Toast.Provider>
      <ToastTrigger title="Toast title" description="Toast description." />
      <Toast.Portal>
        <Toast.Viewport>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  ),
};

// All variants
export const Variants: StoryObj = {
  render: () => (
    <Toast.Provider>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <ToastTrigger title="Default toast" variant="default" />
        <ToastTrigger title="Info toast" variant="info" />
        <ToastTrigger title="Success toast" variant="success" />
        <ToastTrigger title="Warning toast" variant="warning" />
        <ToastTrigger title="Invalid toast" variant="invalid" />
      </div>
      <Toast.Portal>
        <Toast.Viewport>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  ),
};

// With action
export const WithAction: StoryObj = {
  render: () => (
    <Toast.Provider>
      <ToastTrigger
        title="Item deleted"
        description="The item has been moved to trash."
        actionLabel="Undo"
      />
      <Toast.Portal>
        <Toast.Viewport>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  ),
};

// Persistent (no auto-dismiss)
export const Persistent: StoryObj = {
  render: () => (
    <Toast.Provider timeout={0}>
      <ToastTrigger
        title="Persistent toast"
        description="This toast won't auto-dismiss."
      />
      <Toast.Portal>
        <Toast.Viewport>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  ),
};
