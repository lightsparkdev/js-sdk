"use client";

import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import clsx from "clsx";
import styles from "./Textarea.module.scss";

export interface TextareaProps extends Omit<BaseInput.Props, "size"> {
  /** Number of visible text rows. */
  rows?: number;
  /** Number of visible text columns. */
  cols?: number;
  /** Soft or hard wrapping. */
  wrap?: string;
}

const MIN_HEIGHT = 66;
const KEYBOARD_STEP = 20;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(props, ref) {
    const { className, disabled, ...other } = props;
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const startY = React.useRef(0);
    const startHeight = React.useRef(0);
    const [heightValue, setHeightValue] = React.useState(MIN_HEIGHT);

    const mergedRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // Safety net: clean up body styles if component unmounts during a drag
    React.useEffect(() => {
      return () => {
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };
    }, []);

    const cleanUpBodyStyles = React.useCallback(() => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }, []);

    const onPointerDown = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);

        startY.current = e.clientY;
        startHeight.current = textarea.offsetHeight;

        document.body.style.userSelect = "none";
        document.body.style.cursor = "ns-resize";
      },
      [],
    );

    const onPointerMove = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;

        const textarea = textareaRef.current;
        if (!textarea) return;

        const delta = e.clientY - startY.current;
        const newHeight = Math.max(MIN_HEIGHT, startHeight.current + delta);
        textarea.style.height = `${newHeight}px`;
      },
      [],
    );

    const onPointerUp = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        cleanUpBodyStyles();
        const height = textareaRef.current?.offsetHeight ?? MIN_HEIGHT;
        setHeightValue(height);
      },
      [cleanUpBodyStyles],
    );

    // Handles capture loss (touch cancel, browser intervention)
    const onLostPointerCapture = React.useCallback(() => {
      cleanUpBodyStyles();
      const height = textareaRef.current?.offsetHeight ?? MIN_HEIGHT;
      setHeightValue(height);
    }, [cleanUpBodyStyles]);

    const onKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        let delta: number;
        if (e.key === "ArrowDown") delta = KEYBOARD_STEP;
        else if (e.key === "ArrowUp") delta = -KEYBOARD_STEP;
        else return;

        e.preventDefault();
        const current = textarea.offsetHeight;
        const newHeight = Math.max(MIN_HEIGHT, current + delta);
        textarea.style.height = `${newHeight}px`;
        setHeightValue(newHeight);
      },
      [],
    );

    return (
      <div className={styles.root} data-disabled={disabled ? "" : undefined}>
        <BaseInput
          // Cast needed: BaseInput types expect HTMLInputElement, but render={<textarea />}
          // swaps the rendered element at runtime.
          ref={mergedRef as unknown as React.Ref<HTMLInputElement>}
          render={<textarea />}
          className={clsx(styles.textarea, className)}
          disabled={disabled}
          {...(other as Omit<BaseInput.Props, "className">)}
        />
        {!disabled && (
          <div
            className={styles.handle}
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize textarea"
            aria-valuenow={heightValue}
            aria-valuemin={MIN_HEIGHT}
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onLostPointerCapture={onLostPointerCapture}
            onKeyDown={onKeyDown}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <line
                x1="8"
                y1="11"
                x2="11"
                y2="8"
                stroke="currentColor"
                strokeWidth="1"
              />
              <line
                x1="4"
                y1="11"
                x2="11"
                y2="4"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
          </div>
        )}
      </div>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Textarea.displayName = "Textarea";
}

export default Textarea;
