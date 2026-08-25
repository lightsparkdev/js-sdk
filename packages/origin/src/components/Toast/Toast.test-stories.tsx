"use client";

import * as React from "react";
import { Button } from "@/components/Button";
import { CentralIcon, type CentralIconName } from "@/components/Icon";
import {
  Toast,
  type ToastLayout,
  type ToastPlacement,
  type ToastVariant,
} from "./";

interface ToastData {
  layout?: ToastLayout;
  variant?: ToastVariant;
}

interface ToastTriggerProps {
  title: React.ReactNode;
  description?: string;
  layout?: ToastLayout;
  variant?: ToastVariant;
  actionLabel?: string;
  actionTestId?: string;
  onAction?: () => void;
}

function ToastTrigger({
  title,
  description,
  layout = "default",
  variant = "default",
  actionLabel,
  actionTestId,
  onAction,
}: ToastTriggerProps) {
  const toastManager = Toast.useToastManager<ToastData>();

  const handleAdd = () => {
    toastManager.add({
      title,
      description,
      actionProps: actionLabel
        ? {
            children: actionLabel,
            "data-testid": actionTestId,
            onClick: onAction,
          }
        : undefined,
      data: { layout, variant },
    });
  };

  return (
    <Button onClick={handleAdd} data-testid="trigger">
      Show Toast
    </Button>
  );
}

function ToastRenderer() {
  const toastManager = Toast.useToastManager<ToastData>();

  return (
    <>
      {toastManager.toasts.map((toast) => {
        const layout = toast.data?.layout ?? "default";
        const variant = toast.data?.variant ?? "default";

        return (
          <Toast.Root
            key={toast.id}
            toast={toast}
            layout={layout}
            variant={variant}
          >
            {variant !== "default" && (
              <Toast.Icon data-testid="semantic-icon" variant={variant} />
            )}
            <Toast.Content>
              <Toast.Title>{toast.title}</Toast.Title>
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </Toast.Content>
            <Toast.Action />
            <Toast.Close aria-label="Close toast" />
          </Toast.Root>
        );
      })}
    </>
  );
}

function ToastFixture({
  children,
  limit,
  placement = "bottom",
  timeout,
}: {
  children: React.ReactNode;
  limit?: number;
  placement?: ToastPlacement;
  timeout?: number;
}) {
  return (
    <Toast.Provider limit={limit} timeout={timeout}>
      {children}
      <Toast.Portal>
        <Toast.Viewport placement={placement}>
          <ToastRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

export function ViewportRefCleanup() {
  const [showViewport, setShowViewport] = React.useState(true);
  const [cleanupCount, setCleanupCount] = React.useState(0);
  const viewportRef = React.useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      return;
    }

    return () => setCleanupCount((count) => count + 1);
  }, []);

  return (
    <Toast.Provider timeout={0}>
      <Button
        onClick={() => setShowViewport(false)}
        data-testid="unmount-viewport"
      >
        Unmount viewport
      </Button>
      <output data-testid="viewport-ref-cleanup-count">{cleanupCount}</output>
      {showViewport && (
        <Toast.Portal>
          <Toast.Viewport ref={viewportRef} />
        </Toast.Portal>
      )}
    </Toast.Provider>
  );
}

export function BasicToast() {
  return (
    <ToastFixture>
      <ToastTrigger title="Toast title" />
    </ToastFixture>
  );
}

export function PlacementToast({ placement }: { placement: ToastPlacement }) {
  return (
    <ToastFixture placement={placement} timeout={0}>
      <ToastTrigger title={`${placement} toast`} />
    </ToastFixture>
  );
}

const RouterLikeLink = React.forwardRef<
  HTMLAnchorElement,
  Omit<React.ComponentPropsWithoutRef<"a">, "href"> & { to: string }
>(function RouterLikeLink({ to, ...props }, ref) {
  return <a ref={ref} href={to} data-router-link="" {...props} />;
});

export function ToastWithTextLinks() {
  return (
    <ToastFixture timeout={0}>
      <ToastTrigger
        title={
          <>
            Read the{" "}
            <Toast.Link data-testid="native-toast-link" href="/docs">
              docs
            </Toast.Link>{" "}
            or open{" "}
            <Toast.Link
              className="consumer-toast-link"
              data-testid="rendered-toast-link"
              render={
                <RouterLikeLink className="router-toast-link" to="/settings" />
              }
            >
              settings
            </Toast.Link>
            {" or "}
            <Toast.Link
              data-testid="rendered-toast-button"
              render={<button type="button" />}
            >
              reload
            </Toast.Link>
          </>
        }
      />
    </ToastFixture>
  );
}

export function ToastWithDescription() {
  return (
    <ToastFixture>
      <ToastTrigger title="Toast title" description="Toast description." />
    </ToastFixture>
  );
}

export function ToastWithHostileGlobalMargins() {
  return (
    <>
      <style>{"h2, p { margin: 47px; }"}</style>
      <ToastFixture>
        <ToastTrigger title="Toast title" description="Toast description." />
      </ToastFixture>
    </>
  );
}

export function ToastWithAction() {
  const [actionCount, setActionCount] = React.useState(0);

  return (
    <ToastFixture>
      <ToastTrigger
        title="Toast title"
        description="Toast description."
        actionLabel="Undo"
        actionTestId="action"
        onAction={() => setActionCount((count) => count + 1)}
      />
      <output data-testid="action-count">{actionCount}</output>
    </ToastFixture>
  );
}

function SemanticToast({
  icon,
  title,
  variant,
}: {
  icon: CentralIconName;
  title: string;
  variant: Exclude<ToastVariant, "default">;
}) {
  return (
    <>
      <ToastFixture>
        <ToastTrigger title={title} variant={variant} />
      </ToastFixture>
      <span hidden data-testid="expected-semantic-icon">
        <CentralIcon name={icon} />
      </span>
    </>
  );
}

export function InfoToast() {
  return (
    <SemanticToast
      icon="IconCircleInfoFilled"
      title="Info toast"
      variant="info"
    />
  );
}

export function SuccessToast() {
  return (
    <SemanticToast
      icon="IconCircleCheckFilled"
      title="Success toast"
      variant="success"
    />
  );
}

export function WarningToast() {
  return (
    <SemanticToast
      icon="IconExclamationTriangleFilled"
      title="Warning toast"
      variant="warning"
    />
  );
}

export function InvalidToast() {
  return (
    <SemanticToast
      icon="IconExclamationTriangleFilled"
      title="Invalid toast"
      variant="invalid"
    />
  );
}

function MultiToastTrigger() {
  const toastManager = Toast.useToastManager<ToastData>();
  const [count, setCount] = React.useState(0);

  const handleAdd = () => {
    const newCount = count + 1;
    setCount(newCount);
    toastManager.add({
      title: `Toast ${newCount}`,
      data: { layout: "default", variant: "default" },
    });
  };

  return (
    <Button onClick={handleAdd} data-testid="multi-trigger">
      Add Toast ({count})
    </Button>
  );
}

export function MultipleToasts({
  limit = 3,
  placement = "bottom",
}: {
  limit?: number;
  placement?: ToastPlacement;
}) {
  return (
    <ToastFixture limit={limit} placement={placement} timeout={0}>
      <MultiToastTrigger />
    </ToastFixture>
  );
}

function StackTrigger() {
  const toastManager = Toast.useToastManager<ToastData>();
  const [count, setCount] = React.useState(0);

  const toasts = [
    {
      actionProps: { children: "Undo 1" },
      data: { layout: "default", variant: "info" },
      description:
        "The oldest notification has enough supporting text to use multiple lines.",
      title: "Toast 1",
    },
    {
      data: { layout: "compact", variant: "warning" },
      title: "Toast 2",
    },
    {
      data: { layout: "pill", variant: "success" },
      title: "Toast 3",
    },
  ] satisfies Array<{
    actionProps?: { children: string };
    data: ToastData;
    description?: string;
    title: string;
  }>;

  const handleAdd = () => {
    const toast = toasts[count % toasts.length];
    toastManager.add(toast);
    setCount((currentCount) => currentCount + 1);
  };

  return (
    <Button onClick={handleAdd} data-testid="stack-trigger">
      Add Toast ({count})
    </Button>
  );
}

export function StackedToasts({
  adjustableLimit = false,
  limit = 3,
}: {
  adjustableLimit?: boolean;
  limit?: number;
}) {
  const [runtimeLimit, setRuntimeLimit] = React.useState(limit);

  return (
    <ToastFixture limit={runtimeLimit} timeout={0}>
      <StackTrigger />
      {adjustableLimit && (
        <Button onClick={() => setRuntimeLimit(3)} data-testid="increase-limit">
          Show three toasts
        </Button>
      )}
    </ToastFixture>
  );
}

function TimedStackTrigger() {
  const toastManager = Toast.useToastManager<ToastData>();
  const [count, setCount] = React.useState(0);

  const handleAdd = () => {
    if (count === 0) {
      toastManager.add({
        title: "Tall Default toast",
        description:
          "This persistent notification is deliberately tall enough to expose mixed-layout promotion.",
        data: { layout: "default", variant: "info" },
        timeout: 0,
      });
    } else {
      toastManager.add({
        title: "Timed Pill toast",
        data: { layout: "pill", variant: "success" },
        timeout: 500,
      });
    }
    setCount((currentCount) => currentCount + 1);
  };

  return (
    <Button
      onClick={handleAdd}
      data-testid="timed-stack-trigger"
      disabled={count >= 2}
    >
      Add timed toast ({count})
    </Button>
  );
}

export function TimedStackedToasts() {
  return (
    <ToastFixture timeout={0}>
      <TimedStackTrigger />
    </ToastFixture>
  );
}

export function NoAutoDismiss() {
  return (
    <ToastFixture timeout={0}>
      <ToastTrigger title="Persistent toast" />
    </ToastFixture>
  );
}

export function LayoutToast({ layout }: { layout: ToastLayout }) {
  return (
    <ToastFixture timeout={0}>
      <ToastTrigger
        title="Layout toast"
        description="Description should only appear in Default."
        layout={layout}
        variant="success"
        actionLabel="Undo"
      />
    </ToastFixture>
  );
}

function StateAttributeOverrideRenderer() {
  const toastManager = Toast.useToastManager<ToastData>();

  return (
    <>
      {toastManager.toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          toast={toast}
          layout="compact"
          variant="success"
          data-layout="pill"
          data-variant="invalid"
        >
          <Toast.Icon data-testid="semantic-icon" variant="success" />
          <Toast.Content>
            <Toast.Title>{toast.title}</Toast.Title>
          </Toast.Content>
        </Toast.Root>
      ))}
    </>
  );
}

export function StateAttributeOverrideToast() {
  return (
    <Toast.Provider timeout={0}>
      <ToastTrigger title="State attribute toast" />
      <Toast.Portal>
        <Toast.Viewport>
          <StateAttributeOverrideRenderer />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
