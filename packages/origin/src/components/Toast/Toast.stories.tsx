import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Button } from "@/components/Button";
import { Toast, type ToastLayout, type ToastVariant } from "./";

interface ToastData {
  dismissible?: boolean;
  layout: ToastLayout;
  variant: ToastVariant;
}

interface ToastOptions {
  actionLabel?: string;
  description?: string;
  dismissible?: boolean;
  layout?: ToastLayout;
  timeout?: number;
  title: string;
  variant?: ToastVariant;
}

const meta: Meta = {
  title: "Components/Toast",
  parameters: {
    layout: "centered",
  },
};

export default meta;

function ToastTrigger({
  actionLabel,
  buttonLabel,
  description,
  dismissible = true,
  layout = "default",
  timeout,
  title,
  variant = "default",
}: ToastOptions & { buttonLabel: string }) {
  const toastManager = Toast.useToastManager<ToastData>();

  const handleAdd = () => {
    const id = toastManager.add({
      actionProps: actionLabel
        ? {
            children: actionLabel,
            onClick: () => toastManager.close(id),
          }
        : undefined,
      data: { dismissible, layout, variant },
      description,
      timeout,
      title,
    });
  };

  return (
    <Button onClick={handleAdd} variant="outline">
      {buttonLabel}
    </Button>
  );
}

function ToastRenderer() {
  const toastManager = Toast.useToastManager<ToastData>();

  return toastManager.toasts.map((toast) => {
    const { dismissible, layout, variant } = toast.data ?? {
      dismissible: true,
      layout: "default",
      variant: "default",
    };

    return (
      <Toast.Root
        key={toast.id}
        layout={layout}
        toast={toast}
        variant={variant}
      >
        {variant !== "default" && <Toast.Icon variant={variant} />}
        <Toast.Content>
          <Toast.Title>{toast.title}</Toast.Title>
          {toast.description && (
            <Toast.Description>{toast.description}</Toast.Description>
          )}
        </Toast.Content>
        <Toast.Action />
        {dismissible && <Toast.Close aria-label="Close toast" />}
      </Toast.Root>
    );
  });
}

function ToastDemo({
  children,
  limit,
  theme,
  timeout,
}: {
  children: React.ReactNode;
  limit?: number;
  theme?: "light" | "dark";
  timeout?: number;
}) {
  return (
    <div
      data-theme={theme}
      style={{
        background: theme === "dark" ? "var(--surface-primary)" : undefined,
        padding: theme ? "var(--spacing-2xl)" : undefined,
      }}
    >
      <Toast.Provider limit={limit} timeout={timeout}>
        {children}
        <Toast.Viewport>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Provider>
    </div>
  );
}

export const Default: StoryObj = {
  render: () => (
    <ToastDemo timeout={0}>
      <ToastTrigger
        actionLabel="Action"
        buttonLabel="Show Default"
        description="Optional supporting description."
        title="Default toast"
      />
    </ToastDemo>
  ),
};

export const Compact: StoryObj = {
  render: () => (
    <ToastDemo>
      <ToastTrigger
        buttonLabel="Show Compact"
        layout="compact"
        title="Short status update"
        variant="info"
      />
    </ToastDemo>
  ),
};

export const Pill: StoryObj = {
  render: () => (
    <ToastDemo>
      <ToastTrigger
        buttonLabel="Show Pill"
        layout="pill"
        title="Saved"
        variant="success"
      />
    </ToastDemo>
  ),
};

export const SemanticIntents: StoryObj = {
  render: () => (
    <ToastDemo>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-xs)" }}
      >
        <ToastTrigger buttonLabel="Neutral" title="Neutral toast" />
        <ToastTrigger
          buttonLabel="Info"
          title="Informational toast"
          variant="info"
        />
        <ToastTrigger
          buttonLabel="Success"
          title="Successful toast"
          variant="success"
        />
        <ToastTrigger
          buttonLabel="Warning"
          title="Warning toast"
          variant="warning"
        />
        <ToastTrigger
          buttonLabel="Invalid"
          title="Invalid toast"
          variant="invalid"
        />
      </div>
    </ToastDemo>
  ),
};

export const Dark: StoryObj = {
  render: () => (
    <ToastDemo theme="dark" timeout={0}>
      <ToastTrigger
        buttonLabel="Show dark toast"
        description="Panel, border, icon, and text use dark theme tokens."
        title="Dark theme"
        variant="info"
      />
    </ToastDemo>
  ),
};

export const LongText: StoryObj = {
  render: () => (
    <ToastDemo timeout={0}>
      <ToastTrigger
        buttonLabel="Show long content"
        description="Supporting content wraps within the responsive 320 pixel maximum while preserving the action and close controls."
        title="A longer title demonstrates how Default feedback handles narrow screens"
        variant="warning"
      />
    </ToastDemo>
  ),
};

function StackingDemo() {
  const toastManager = Toast.useToastManager<ToastData>();
  const [count, setCount] = React.useState(0);

  const handleAdd = () => {
    const examples: Array<{
      description?: string;
      layout: ToastLayout;
      title: string;
      variant: ToastVariant;
    }> = [
      {
        description:
          "The oldest notification uses multiple lines to demonstrate measured heights.",
        layout: "default",
        title: "Detailed notification",
        variant: "info",
      },
      {
        layout: "compact",
        title: "Compact update",
        variant: "warning",
      },
      {
        layout: "pill",
        title: "Saved",
        variant: "success",
      },
    ];

    const example = examples[count % examples.length];
    toastManager.add({
      data: {
        dismissible: true,
        layout: example.layout,
        variant: example.variant,
      },
      description: example.description,
      title: example.title,
    });
    setCount((currentCount) => currentCount + 1);
  };

  return (
    <Button onClick={handleAdd} variant="outline">
      Add toast
    </Button>
  );
}

export const Stacking: StoryObj = {
  render: () => (
    <ToastDemo timeout={0}>
      <StackingDemo />
    </ToastDemo>
  ),
};

export const TimingAndDismissal: StoryObj = {
  render: () => (
    <ToastDemo>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-xs)" }}
      >
        <ToastTrigger
          buttonLabel="2.5 second"
          layout="pill"
          timeout={2500}
          title="Saved"
          variant="success"
        />
        <ToastTrigger
          buttonLabel="5 second"
          layout="compact"
          timeout={5000}
          title="Status updated"
          variant="info"
        />
        <ToastTrigger
          actionLabel="Dismiss"
          buttonLabel="Persistent"
          description="This toast remains until its action or close control is used."
          timeout={0}
          title="Persistent feedback"
          variant="warning"
        />
      </div>
    </ToastDemo>
  ),
};
