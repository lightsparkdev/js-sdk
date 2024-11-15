// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import styled from "@emotion/styled";
import type {
  ChangeEvent,
  ClipboardEvent,
  CompositionEvent,
  FocusEvent,
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
import {
  getFontColor,
  type FontColorKey,
  type ThemeOrColorKey,
} from "../styles/themes.js";
import { applyTypography } from "../styles/typography.js";
import { z } from "../styles/z-index.js";
import { CheckboxContainer } from "./Checkbox.js";
import { Icon, IconContainer } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";
import { ToggleContainer } from "./Toggle.js";
import { Tooltip } from "./Tooltip.js";
import { UnstyledButton } from "./UnstyledButton.js";
import {
  type PartialSimpleTypographyProps,
  type RequiredSimpleTypographyProps,
} from "./typography/types.js";

const selectLeftOffset = 10;

export const iconSides = ["left", "right"] as const;
export type IconSide = (typeof iconSides)[number];
export const iconOffsets = ["small", "large"] as const;
export type IconOffset = (typeof iconOffsets)[number];
export const iconWidths = [8, 12, 16] as const;
export type IconWidth = (typeof iconWidths)[number];

export type TextInputProps = {
  disabled?: boolean | undefined;
  error?: string | undefined;
  icon?:
    | {
        name: IconName;
        width?: IconWidth | undefined;
        side?: IconSide | undefined;
        offset?: IconOffset | undefined;
      }
    | undefined;
  maxLength?: number;
  name?: string;
  onBlur?: (event: FocusEvent<HTMLInputElement, Element>) => void;
  onChange: (newValue: string, event: ChangeEvent<HTMLInputElement>) => void;
  onEnter?: () => void;
  onFocus?: (event: FocusEvent<HTMLInputElement, Element>) => void;
  onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (
    keyValue: string,
    event: KeyboardEvent<HTMLInputElement>,
  ) => void;
  onKeyUp?: (event: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputRef?: RefObject<HTMLInputElement> | undefined;
  inputRefCb?: RefCallback<HTMLInputElement>;
  id?: string;
  type?: "text" | "password" | "hidden" | undefined;
  value: string;
  onClickIcon?: () => void;
  testId?: string;
  autoComplete?:
    | "off"
    | "new-password"
    | "current-password"
    | "username"
    | undefined;
  onBeforeInput?: (e: CompositionEvent) => void;
  pattern?: string;
  inputMode?: "numeric" | "decimal" | undefined;
  hint?: string | undefined;
  hintTooltip?: string | undefined;
  label?: string;
  rightButtonText?: string | undefined;
  onRightButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  typography?: PartialSimpleTypographyProps | undefined;
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
  width?: "full" | "short" | undefined;
  paddingX?: number;
  paddingY?: number;
  // Outline that appears outside/offset when the input is focused
  activeOutline?: boolean;
  activeOutlineColor?: ThemeOrColorKey;
};

function withDefaults(textInputProps: TextInputProps) {
  return {
    ...textInputProps,
    width: textInputProps.width || "full",
    type: textInputProps.type || "text",
    disabled: Boolean(textInputProps.disabled),
    typography: {
      ...defaultTextInputTypography,
      ...textInputProps.typography,
    } as RequiredSimpleTypographyProps,
  } as const;
}

export function TextInput(textInputProps: TextInputProps) {
  const props = withDefaults(textInputProps);
  const [focused, setFocused] = useState(false);

  const inputRef = props.inputRef || React.createRef<HTMLInputElement>();
  /* props.inputRefCb should have priority if provided: */
  const ref = props.inputRefCb || inputRef;
  if (props.inputRefCb && !props.inputRef) {
    console.warn("TextInput: inputRef should be provided with inputRefCb.");
  }

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
  const textInputWidth = props.width === "short" ? "250px" : "100%";

  let paddingLeftPx: number | undefined;
  if (typeof props.paddingX === "number") {
    if (isIconRight) {
      paddingLeftPx = props.paddingX;
    } else {
      paddingLeftPx = props.paddingX + iconWidth + iconTextOffset;
    }
  } else if (props.icon && !isIconRight) {
    paddingLeftPx = iconOffset + iconWidth + iconTextOffset;
  } else if (props.select) {
    paddingLeftPx = selectLeftOffset + props.select.width + 5;
  }

  let paddingRightPx: number | undefined;
  if (typeof props.paddingX === "number") {
    if (isIconRight) {
      paddingRightPx = iconTextOffset + iconWidth + props.paddingX;
    } else {
      paddingRightPx = props.paddingX;
    }
  } else if (isIconRight) {
    paddingRightPx = 28;
  }

  let input = (
    <InputContainer>
      <Input
        disabled={props.disabled}
        maxLength={props.maxLength}
        inputMode={props.inputMode}
        pattern={props.pattern}
        onBlur={(blurEvent) => {
          setFocused(false);
          if (props.onBlur) {
            props.onBlur(blurEvent);
          }
        }}
        onChange={(e) => {
          // needed to prevent default chrome error message when in a form element
          e.target.setCustomValidity("");
          props.onChange(e.target.value, e);
        }}
        onFocus={(focusEvent) => {
          setFocused(true);
          if (props.onFocus) {
            props.onFocus(focusEvent);
          }
        }}
        onKeyDown={(e) => {
          if (props.onKeyDown) {
            props.onKeyDown(e.key, e);
          }
          handleKeyDown(e);
        }}
        onKeyUp={props.onKeyUp}
        id={props.id}
        onPaste={props.onPaste}
        placeholder={props.placeholder}
        ref={ref}
        name={props.name}
        type={props.type}
        value={props.value}
        paddingLeftPx={paddingLeftPx}
        paddingRightPx={paddingRightPx}
        paddingTopPx={props.paddingY}
        paddingBottomPx={props.paddingY}
        activeOutline={props.activeOutline}
        activeOutlineColor={props.activeOutlineColor}
        hasError={hasError}
        data-test-id={props.testId}
        typography={props.typography}
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
      {props.rightButtonText && (
        <RightButtonAligner iconOffset={iconOffset}>
          <RightButton onClick={props.onRightButtonClick}>
            {props.rightButtonText}
          </RightButton>
        </RightButtonAligner>
      )}
    </InputContainer>
  );

  if (props.icon) {
    input = (
      <WithIcon hasError={hasError} withFocus={focused}>
        {isIconRight ? <>{input}</> : null}
        <TextInputIconContainer
          onClick={props.onClickIcon ? props.onClickIcon : () => {}}
          isIconRight={isIconRight}
          iconOffset={
            typeof props.paddingX === "number" ? props.paddingX : iconOffset
          }
          focused={focused}
          hasValue={Boolean(props.value)}
          colorProp={props.typography.color}
        >
          <Icon name={props.icon.name} width={iconWidth} />
        </TextInputIconContainer>
        {isIconRight ? null : <>{input}</>}
      </WithIcon>
    );
  }

  const hintTooltipId = props.hintTooltip
    ? `${props.id || "input"}-hint-tooltip`
    : undefined;

  const { select } = props;

  return (
    <StyledTextInput widthProp={textInputWidth}>
      {props.label ? (
        <TextInputLabel hasError={hasError}>{props.label}</TextInputLabel>
      ) : null}
      {select && (
        <TextInputSelect
          value={select.value}
          widthProp={select.width}
          typography={props.typography}
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
    </StyledTextInput>
  );
}

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
  paddingTopPx?: number | undefined;
  paddingBottomPx?: number | undefined;
  activeOutline?: boolean | undefined;
  activeOutlineColor?: ThemeOrColorKey | undefined;
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
    background-color: ${({ theme }) => theme.bg} !important;
    color: ${({ theme }) => theme.text} !important;
    transition:
      background-color 600000s 0s,
      color 600000s 0s !important;
  }
`;

const RightButtonAligner = styled.div<{ iconOffset: number }>`
  position: absolute;
  top: 0;
  right: ${({ iconOffset }) => iconOffset}px;
  z-index: ${z.textInput + 1};
  bottom: 0;
  display: flex;
  align-items: center;
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

const StyledTextInput = styled.div<{ widthProp: string }>`
  width: ${({ widthProp }) => widthProp};
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

const InputContainer = styled.div`
  position: relative;
`;
