"use client";

import * as React from "react";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import styles from "./Stepper.module.scss";

/**
 * Completion only — being the current step is tracked separately by
 * `Stepper.Root`'s `value`, so revisiting a finished step doesn't make it
 * look unfinished.
 */
export type StepStatus = "complete" | "partial" | "upcoming";

export interface StepProgress {
  completed: number;
  total: number;
}

function defaultFormatProgressLabel({ completed, total }: StepProgress) {
  return `${completed} of ${total} complete`;
}

// Out-of-range consumer values are clamped so the accessible name never
// reports more done than there is. Non-finite values and a non-positive
// total carry no usable information and are treated as absent progress.
function normalizeProgress({
  completed,
  total,
}: StepProgress): StepProgress | undefined {
  if (!Number.isFinite(completed) || !Number.isFinite(total) || total <= 0) {
    return undefined;
  }
  return { completed: Math.min(Math.max(completed, 0), total), total };
}

interface RootContextValue {
  value: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
  formatProgressLabel: (progress: StepProgress) => string;
}

const RootContext = React.createContext<RootContextValue | undefined>(
  undefined,
);

function useRootContext(): RootContextValue {
  const context = React.useContext(RootContext);
  if (context === undefined) {
    throw new Error("Stepper parts must be placed within <Stepper.Root>.");
  }
  return context;
}

interface StepContextValue {
  value: string;
  status: StepStatus;
  progress: StepProgress | undefined;
  /** Whether the step sits inside `Stepper.Substeps`. */
  substep: boolean;
  /** Whether the step itself is the current one. */
  current: boolean;
}

const StepContext = React.createContext<StepContextValue | undefined>(
  undefined,
);

function useStepContext(): StepContextValue {
  const context = React.useContext(StepContext);
  if (context === undefined) {
    throw new Error("Stepper step parts must be placed within <Stepper.Step>.");
  }
  return context;
}

export interface RootProps extends React.ComponentPropsWithoutRef<"nav"> {
  /** Value of the current step. The matching trigger gets `aria-current="step"`. */
  value?: string;
  /** Fires with a step's value when its trigger is activated. */
  onValueChange?: (value: string) => void;
  /**
   * Optional analytics name. Activation through `onValueChange` emits
   * `Stepper.change` with `{ value }`.
   */
  analyticsName?: string;
  /**
   * Formats the visually-hidden progress text appended to an unfinished
   * step's accessible name, for localization. Defaults to
   * `"{completed} of {total} complete"`.
   */
  formatProgressLabel?: (progress: StepProgress) => string;
}

export const Root = React.forwardRef<HTMLElement, RootProps>(function Root(
  {
    className,
    children,
    value,
    onValueChange,
    analyticsName,
    formatProgressLabel = defaultFormatProgressLabel,
    "aria-label": ariaLabel = "Progress",
    ...props
  },
  ref,
) {
  const trackedChange = useTrackedCallback(
    analyticsName,
    "Stepper",
    "change",
    onValueChange,
    (stepValue: string) => ({ value: stepValue }),
  );

  const contextValue = React.useMemo<RootContextValue>(
    () => ({
      value,
      onValueChange: onValueChange ? trackedChange : undefined,
      formatProgressLabel,
    }),
    [value, onValueChange, trackedChange, formatProgressLabel],
  );

  return (
    <RootContext.Provider value={contextValue}>
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={clsx(styles.root, className)}
        {...props}
      >
        <ol className={styles.list}>{children}</ol>
      </nav>
    </RootContext.Provider>
  );
});

export interface StepProps extends React.ComponentPropsWithoutRef<"li"> {
  /** Identifies the step within the stepper. */
  value: string;
  /** Completion state. Defaults to "upcoming". */
  status?: StepStatus;
  /**
   * How much of the step is done. Appended to the trigger's accessible name
   * while the step is unfinished.
   */
  progress?: StepProgress;
}

export const Step = React.forwardRef<HTMLLIElement, StepProps>(function Step(
  { className, value, status = "upcoming", progress, ...props },
  ref,
) {
  const root = useRootContext();
  const substep = React.useContext(StepContext) !== undefined;
  const current = root.value !== undefined && root.value === value;

  const contextValue = React.useMemo<StepContextValue>(
    () => ({ value, status, progress, substep, current }),
    [value, status, progress, substep, current],
  );

  return (
    <StepContext.Provider value={contextValue}>
      <li
        ref={ref}
        className={clsx(styles.step, className)}
        data-status={status}
        {...(current && { "data-current": "" })}
        {...props}
      />
    </StepContext.Provider>
  );
});

export interface TriggerProps extends React.HTMLAttributes<HTMLElement> {
  /** Disables activation. Rendered as a disabled button with muted ink. */
  disabled?: boolean;
}

export const Trigger = React.forwardRef<HTMLElement, TriggerProps>(
  function Trigger({ className, children, onClick, disabled, ...props }, ref) {
    const root = useRootContext();
    const step = useStepContext();
    const progress =
      step.progress === undefined
        ? undefined
        : normalizeProgress(step.progress);

    const content = (
      <>
        {children}
        {progress !== undefined && step.status !== "complete" ? (
          // No visible text spells out how far along the step is, so the
          // accessible name carries it.
          <span className={styles.srOnly}>
            {root.formatProgressLabel(progress)}
          </span>
        ) : null}
      </>
    );

    const sharedProps = {
      className: clsx(styles.trigger, className),
      ...(step.current && { "aria-current": "step" as const }),
      ...props,
    };

    // Without an activation handler a button would be a focusable dead stop,
    // so the trigger renders as plain content instead.
    if (root.onValueChange === undefined && onClick === undefined) {
      return (
        <div ref={ref as React.Ref<HTMLDivElement>} {...sharedProps}>
          {content}
        </div>
      );
    }

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        root.onValueChange?.(step.value);
      }
    };

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        disabled={disabled}
        onClick={handleClick}
        {...sharedProps}
      >
        {content}
      </button>
    );
  },
);

/** Check glyph inside the marker; the marker box provides the surrounding space. */
const CHECK_PX = 8;

export interface MarkerProps extends React.ComponentPropsWithoutRef<"span"> {}

export const Marker = React.forwardRef<HTMLSpanElement, MarkerProps>(
  function Marker({ className, ...props }, ref) {
    const step = useStepContext();

    let glyph: React.ReactNode;
    if (step.status === "complete") {
      glyph = (
        <span className={styles.check}>
          <CentralIcon name="IconCheckmark2" size={CHECK_PX} />
        </span>
      );
    } else if (step.substep) {
      glyph = <span className={styles.square} />;
    } else {
      glyph = <span className={styles.ordinal} />;
    }

    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={clsx(styles.marker, className)}
        {...props}
      >
        {glyph}
      </span>
    );
  },
);

export interface LabelProps extends React.ComponentPropsWithoutRef<"span"> {}

export const Label = React.forwardRef<HTMLSpanElement, LabelProps>(
  function Label({ className, ...props }, ref) {
    return (
      <span ref={ref} className={clsx(styles.label, className)} {...props} />
    );
  },
);

export interface SubstepsProps extends React.ComponentPropsWithoutRef<"ol"> {}

export const Substeps = React.forwardRef<HTMLOListElement, SubstepsProps>(
  function Substeps({ className, ...props }, ref) {
    return (
      <ol ref={ref} className={clsx(styles.substeps, className)} {...props} />
    );
  },
);
