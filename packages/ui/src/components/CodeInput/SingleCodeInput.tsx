import type { SerializedStyles } from "@emotion/react";
import { css, useTheme } from "@emotion/react";
import type {
  ChangeEvent,
  ClipboardEvent,
  HTMLInputTypeAttribute,
  KeyboardEvent,
  Ref,
} from "react";
import { textInputStyle } from "../../styles/fields.js";
import type { CodeInputVariant } from "./CodeInput.js";

type CounterProps = {
  id?: string;
  maxLength?: number;
  onChange?: (
    event: ChangeEvent<HTMLInputElement>,
    id: string | undefined,
  ) => void;
  value?: string;
  inputRef?: Ref<HTMLInputElement>;
  onKeyUp?: (
    event: KeyboardEvent<HTMLInputElement>,
    id: string | undefined,
  ) => void;
  onKeyDown?: (
    event: KeyboardEvent<HTMLInputElement>,
    id: string | undefined,
  ) => void;
  onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void;
  max?: number;
  type: HTMLInputTypeAttribute;
  ariaLabel?: string;
  cssProp?: SerializedStyles | undefined;
  disabled?: boolean;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  width: string;
  variant?: CodeInputVariant;
};

const defaultWidth = "42px";
const vPadding = 15;

export function SingleCodeInput({
  id,
  maxLength,
  onChange = () => {},
  value,
  inputRef = null,
  onKeyUp = () => {},
  onKeyDown = () => {},
  onPaste = () => {},
  type,
  max,
  cssProp,
  ariaLabel,
  disabled,
  onBlur,
  width = defaultWidth,
  variant = "default",
}: CounterProps): JSX.Element {
  const theme = useTheme();

  const commonCSS = css`
    text-align: center;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      display: none;
      margin: 0;
    }
    -moz-appearance: textfield; /* Firefox */
  `;

  const unifiedCSS = css`
    ${commonCSS}
    width: ${width};
    padding: 0;
    border: none;
    background: transparent;
    font: inherit;
    color: ${theme.text};
    outline: none;
    caret-color: ${theme.info};

    &::placeholder {
      color: ${theme.secondary};
    }
  `;

  const defaultCSS = css(
    `
      ${
        textInputStyle({
          theme,
          disabled: Boolean(disabled),
          hasError: false,
          borderRadius: 8,
        }).styles
      }
      width: ${width};
      max-width: ${defaultWidth};
      padding: ${vPadding}px 0px;
      &:not(:last-of-type):not(:focus-visible) {
        border-right: none;
      }
      &:not(:first-of-type):not(:last-of-type) {
        border-radius: 0;
      }
      &:first-of-type {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      &:last-of-type {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
      &:focus,
      &:active {
        padding: ${vPadding - 1}px 0px !important;
      }
    `,
    commonCSS,
    cssProp,
  );

  const inputStyles = variant === "unified" ? unifiedCSS : defaultCSS;

  return (
    <input
      id={id}
      maxLength={maxLength}
      onChange={(event) => onChange(event, id)}
      value={value}
      ref={inputRef}
      type={variant === "unified" ? "text" : type}
      aria-label={ariaLabel}
      onKeyUp={(event) => onKeyUp(event, id)}
      onKeyDown={(event) => onKeyDown(event, id)}
      onPaste={(event) => onPaste(event)}
      max={max}
      css={inputStyles}
      onBlur={onBlur}
      inputMode="numeric"
      pattern="[0-9]*"
      placeholder={variant === "unified" ? "-" : undefined}
    />
  );
}
