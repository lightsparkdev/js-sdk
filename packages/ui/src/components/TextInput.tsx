// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import styled from "@emotion/styled";
import type {
  ClipboardEvent,
  CompositionEvent,
  KeyboardEvent,
  RefCallback,
  RefObject,
  SyntheticEvent,
} from "react";
import React, { useState } from "react";
import { standardBorderRadius } from "../styles/common.js";
import {
  InputSubtext,
  defaultTextInputTypography,
  inputSpacingPx,
  textInputPlaceholderColor,
  textInputStyle,
  type TextInputBorderRadius,
} from "../styles/fields.js";
import { getFontColor, type FontColorKey } from "../styles/themes.js";
import {
  applyTypography,
  type RequiredSimpleTypographyProps,
  type SimpleTypographyProps,
} from "../styles/typography.js";
import { z } from "../styles/z-index.js";
import { CheckboxContainer } from "./Checkbox.js";
import { Icon, IconContainer } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";
import { ToggleContainer } from "./Toggle.js";
import { Tooltip } from "./Tooltip.js";
import { UnstyledButton } from "./UnstyledButton.js";

const selectLeftOffset = 10;

export type TextInputProps = {
  disabled?: boolean;
  error?: string | undefined;
  icon?:
    | {
        name: IconName;
        width?: 8 | 12 | 16;
        side?: "left" | "right";
        offset?: "small" | "large";
      }
    | undefined;
  maxLength?: number;
  name?: string;
  onBlur?: () => void;
  onChange: (
    newValue: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onEnter?: () => void;
  onFocus?: () => void;
  onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (
    keyValue: string,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  placeholder?: string;
  inputRef?: RefObject<HTMLInputElement>;
  inputRefCb?: RefCallback<HTMLInputElement>;
  id?: string;
  type?: "text" | "password" | "hidden" | undefined;
  value: string;
  onClickIcon?: () => void;
  testId?: string;
  autoComplete?: "off" | "new-password" | "current-password" | "username";
  onBeforeInput?: (e: CompositionEvent) => void;
  pattern?: string;
  inputMode?: "numeric";
  hint?: string | undefined;
  hintTooltip?: string | undefined;
  label?: string;
  rightButtonText?: string | undefined;
  onRightButtonClick?: () => void;
  typography?: SimpleTypographyProps | undefined;
  select?:
    | {
        options: { value: string; label: string }[];
        value: string;
        onChange: (value: string) => void;
        /* A specified width is required to ensure left input padding is correct */
        width: number;
      }
    | undefined;
  borderRadius?: TextInputBorderRadius | undefined;
};

export function TextInput(props: TextInputProps) {
  const [focused, setFocused] = useState(false);

  const inputRef = props.inputRef || React.createRef<HTMLInputElement>();
  /* props.inputRefCb should have priority if provided: */
  const ref = props.inputRefCb || inputRef;
  if (props.inputRefCb && !props.inputRef) {
    console.warn("TextInput: inputRef should be provided with inputRefCb.");
  }

  const typography = {
    ...defaultTextInputTypography,
    ...props.typography,
  } as RequiredSimpleTypographyProps;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && props.onEnter) {
      props.onEnter();
    }
  };

  const hasError = Boolean(props.error);

  /* Default to right side icon if not specified: */
  const isIconRight = Boolean(props.icon && props.icon.side !== "left");
  const iconWidth = props.icon?.width || 12;
  /* Where the icon center should be regardless of width */
  const iconCenterOffset = props.icon?.offset === "large" ? 26 : 18;
  const iconOffset = iconCenterOffset - iconWidth / 2;
  const iconTextOffset = iconCenterOffset === 18 ? 4 : 14;

  let paddingLeftPx: number | undefined;
  if (props.icon && !isIconRight) {
    paddingLeftPx = iconOffset + iconWidth + iconTextOffset;
  } else if (props.select && typeof props.select.width === "number") {
    paddingLeftPx = selectLeftOffset + props.select.width + 5;
  }

  let input = (
    <Input
      disabled={Boolean(props.disabled)}
      maxLength={props.maxLength}
      inputMode={props.inputMode}
      pattern={props.pattern}
      onBlur={() => {
        setFocused(false);
        if (props.onBlur) {
          props.onBlur();
        }
      }}
      onChange={(e) => {
        // needed to prevent default chrome error message when in a form element
        e.target.setCustomValidity("");
        props.onChange(e.target.value, e);
      }}
      onFocus={() => {
        setFocused(true);
        if (props.onFocus) {
          props.onFocus();
        }
      }}
      onKeyDown={(e) => {
        if (props.onKeyDown) {
          props.onKeyDown(e.key, e);
        }
        handleKeyDown(e);
      }}
      id={props.id}
      onPaste={props.onPaste}
      placeholder={props.placeholder}
      ref={ref}
      name={props.name}
      type={props.type || "text"}
      value={props.value}
      paddingLeftPx={paddingLeftPx}
      paddingRightPx={isIconRight ? 28 : undefined}
      hasError={hasError}
      data-test-id={props.testId}
      typography={typography}
      autoComplete={
        props.autoComplete === "off" ? "new-password" : props.autoComplete
      }
      onBeforeInput={(e: SyntheticEvent) => {
        // more on the typings here - the default doesn't work for referencing
        // event.data https://stackoverflow.com/a/68108756/9808766
        if (props.onBeforeInput) {
          const event = e as CompositionEvent;
          props.onBeforeInput(event);
        }
      }}
      borderRadius={props.borderRadius}
    />
  );

  if (props.icon) {
    input = (
      <WithIcon hasError={hasError} withFocus={focused}>
        {isIconRight ? <>{input}</> : null}
        <TextInputIconContainer
          onClick={props.onClickIcon ? props.onClickIcon : () => {}}
          isIconRight={isIconRight}
          iconOffset={iconOffset}
          focused={focused}
          hasValue={Boolean(props.value)}
          colorProp={typography.color}
        >
          <Icon name={props.icon.name} width={iconWidth} />
        </TextInputIconContainer>
        {isIconRight ? null : <>{input}</>}
        {props.rightButtonText && (
          <TextInputIconContainer
            isIconRight={true}
            iconOffset={iconOffset}
            hasValue={Boolean(props.value)}
            focused={focused}
            colorProp={typography.color}
          >
            <RightButton onClick={props.onRightButtonClick}>
              {props.rightButtonText}
            </RightButton>
          </TextInputIconContainer>
        )}
      </WithIcon>
    );
  }

  const hintTooltipId = props.hintTooltip
    ? `${props.id || "input"}-hint-tooltip`
    : undefined;

  const { select } = props;

  return (
    <InputContainer>
      {props.label ? (
        <TextInputLabel hasError={hasError}>{props.label}</TextInputLabel>
      ) : null}
      {select && (
        <TextInputSelect
          value={select.value}
          widthProp={select.width}
          typography={typography}
          onChange={(event) => {
            select.onChange(event.target.value);
            inputRef.current?.focus();
          }}
        >
          {select.options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </TextInputSelect>
      )}
      {input}
      <InputSubtext
        text={props.error || props.hint}
        hasError={hasError}
        tooltipId={hintTooltipId}
      />
      {props.hintTooltip ? (
        <Tooltip id={hintTooltipId} content={props.hintTooltip} place="right" />
      ) : null}
    </InputContainer>
  );
}

TextInput.defaultProps = {
  disabled: false,
  autoComplete: undefined,
  hint: null,
};

const TextInputSelect = styled.select<{
  widthProp: number;
  typography: RequiredSimpleTypographyProps;
}>`
  ${({ typography, theme }) =>
    applyTypography(theme, typography.type, typography.size, typography.color)}
  position: absolute;
  z-index: ${z.textInput + 1};
  border: none;
  background-color: transparent;
  top: 0;
  left: ${selectLeftOffset}px;
  height: 48px;
  width: ${({ widthProp }) => `${widthProp}px`};
`;

interface WithIconProps {
  hasError: boolean;
  withFocus: boolean;
}

const WithIcon = styled.div<WithIconProps>`
  ${standardBorderRadius(8)}
  position: relative;

  input {
    padding-right: 34px;
  }

  & ${IconContainer.toString()} {
    z-index: ${z.textInput + 1};
  }
`;

interface TextInputIconContainerProps {
  onClick?: () => void;
  isIconRight: boolean;
  focused: boolean;
  hasValue: boolean;
  colorProp: FontColorKey;
  iconOffset: number;
}

const TextInputIconContainer = styled.div<TextInputIconContainerProps>`
  position: absolute;
  z-index: ${z.textInput + 1};
  ${({ isIconRight, iconOffset }) =>
    isIconRight ? `right: ${iconOffset}px` : `left: ${iconOffset}px`};
  top: 0;
  bottom: 0;
  height: 100%;
  display: flex;
  align-items: center;
  cursor: ${({ onClick }) => (onClick ? "pointer" : "auto")};
  color: ${({ focused, hasValue, theme, colorProp }) =>
    focused || hasValue
      ? getFontColor(theme, colorProp)
      : textInputPlaceholderColor({ theme })};
`;

interface InputProps {
  hasError: boolean;
  disabled: boolean;
  paddingLeftPx?: number | undefined;
  paddingRightPx?: number | undefined;
  typography: RequiredSimpleTypographyProps;
  borderRadius?: TextInputBorderRadius | undefined;
}

const Input = styled.input<InputProps>`
  ${textInputStyle};

  // disable autofill styles in chrome https://stackoverflow.com/a/68240841/9808766
  &:-webkit-autofill,
  &:-webkit-autofill:focus,
  &:-internal-autofill-selected,
  &:-internal-autofill-selected:focus {
    background-color: ${({ theme, disabled }) => theme.bg} !important;
    color: ${({ theme }) => theme.text} !important;
    transition:
      background-color 600000s 0s,
      color 600000s 0s !important;
  }
`;

const RightButton = styled(UnstyledButton)`
  border-radius: 4px;
  border: none;
  background-color: ${({ theme }) => theme.vlcNeutral};
  color: ${({ theme }) => theme.mcNeutral};
  font-size: 14px;
  font-weight: 600;
  padding: 8px 10px;
`;

const TextInputLabel = styled.label<{ hasError: boolean }>`
  ${standardBorderRadius(8)}
  font-size: 10px;
  position: absolute;
  z-index: ${z.textInput + 1};
  background-color: ${({ theme }) => theme.bg};
  color: ${({ theme, hasError }) =>
    hasError ? theme.danger : theme.mcNeutral};
  font-weight: 600;
  padding: 4px 6px;
  left: 12px;
  top: -10px;
`;

export const TextInputHalfRow = styled.div`
  margin-top: ${inputSpacingPx}px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  & > * {
    width: 50%;
  }
`;

const InputContainer = styled.div`
  width: 100%;
  position: relative;

  /* eg forms, should be left consistent: */
  & + & {
    margin-top: ${inputSpacingPx}px;
  }

  ${TextInputHalfRow.toString()} & + & {
    margin-top: 0;
  }

  ${CheckboxContainer.toString()} + &,
  ${ToggleContainer.toString()} + &,
  & + ${CheckboxContainer.toString()},
  & + ${ToggleContainer.toString()} {
    margin-top: ${inputSpacingPx}px;
  }
`;
