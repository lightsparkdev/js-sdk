"use client";

import * as React from "react";
import { Toast } from "./";
import { Button } from "@/components/Button";

// Inner component that uses the hook
function ToastTrigger({
  title,
  description,
  variant,
  actionLabel,
}: {
  title: string;
  description?: string;
  variant?: "default" | "info" | "success" | "warning" | "invalid";
  actionLabel?: string;
}) {
  const toastManager = Toast.useToastManager();

  const handleAdd = () => {
    toastManager.add({
      title,
      description,
      data: { variant: variant || "default", actionLabel },
    });
  };

  return (
    <Button onClick={handleAdd} data-testid="trigger">
      Show Toast
    </Button>
  );
}

// Inner component that renders toasts
function ToastRenderer() {
  const toastManager = Toast.useToastManager();

  return (
    <>
      {toastManager.toasts.map((toast) => {
        const variant =
          (toast.data?.variant as
            | "default"
            | "info"
            | "success"
            | "warning"
            | "invalid") || "default";
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

// Basic toast with title only
export function BasicToast() {
  return (
    <Toast.Provider>
      <ToastTrigger title="Toast title" />
      <Toast.Portal>
        <Toast.Viewport>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

// Toast with title and description
export function ToastWithDescription() {
  return (
    <Toast.Provider>
      <ToastTrigger title="Toast title" description="Toast description." />
      <Toast.Portal>
        <Toast.Viewport>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

// Toast with action button
export function ToastWithAction() {
  return (
    <Toast.Provider>
      <ToastTrigger
        title="Toast title"
        description="Toast description."
        actionLabel="Undo"
      />
      <Toast.Portal>
        <Toast.Viewport>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

// Info variant
export function InfoToast() {
  return (
    <Toast.Provider>
      <ToastTrigger title="Info toast" variant="info" />
      <Toast.Portal>
        <Toast.Viewport>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

// Success variant
export function SuccessToast() {
  return (
    <Toast.Provider>
      <ToastTrigger title="Success toast" variant="success" />
      <Toast.Portal>
        <Toast.Viewport>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

// Warning variant
export function WarningToast() {
  return (
    <Toast.Provider>
      <ToastTrigger title="Warning toast" variant="warning" />
      <Toast.Portal>
        <Toast.Viewport>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

// Invalid variant
export function InvalidToast() {
  return (
    <Toast.Provider>
      <ToastTrigger title="Invalid toast" variant="invalid" />
      <Toast.Portal>
        <Toast.Viewport>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

// Multiple toasts trigger
function MultiToastTrigger() {
  const toastManager = Toast.useToastManager();
  const [count, setCount] = React.useState(0);

  const handleAdd = () => {
    const newCount = count + 1;
    setCount(newCount);
    toastManager.add({ title: `Toast ${newCount}` });
  };

  return (
    <Button onClick={handleAdd} data-testid="multi-trigger">
      Add Toast ({count})
    </Button>
  );
}

// Multiple toasts
export function MultipleToasts() {
  return (
    <Toast.Provider limit={3}>
      <MultiToastTrigger />
      <Toast.Portal>
        <Toast.Viewport>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

// No auto-dismiss (timeout=0)
export function NoAutoDismiss() {
  return (
    <Toast.Provider timeout={0}>
      <ToastTrigger title="Persistent toast" />
      <Toast.Portal>
        <Toast.Viewport>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
