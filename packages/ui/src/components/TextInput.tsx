// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import styled from "@emotion/styled";
import type {
  ChangeEvent,
  ClipboardEvent,
  CompositionEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  ReactNode,
  RefCallback,
  RefObject,
  SyntheticEvent,
} from "react";
import React, { useState } from "react";
import { standardBorderRadius } from "../styles/common.js";
import {
  InputSubtext,
  defaultTextInputTypography,
  getBorderRadiusCSS,
  inputSpacingPx,
  textInputPlaceholderColor,
  textInputStyle,
  type TextInputBorderRadius,
} from "../styles/fields.js";
import {
  getBackgroundColor,
  getFontColor,
  type FontColorKey,
  type ThemeOrColorKey,
} from "../styles/themes.js";
import { applyTypography } from "../styles/typography.js";
import { z } from "../styles/z-index.js";
import type { ToReactNodesArgs } from "../utils/toReactNodes/toReactNodes.js";
import { toReactNodes } from "../utils/toReactNodes/toReactNodes.js";
import { CheckboxContainer } from "./Checkbox.js";
import { Icon, IconContainer } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";
import { Loading } from "./Loading.js";
import { ToggleContainer } from "./Toggle.js";
import { Tooltip } from "./Tooltip.js";
import { UnstyledButton } from "./UnstyledButton.js";
import { type TypographyPropsWithoutChildren } from "./typography/renderTypography.js";
import {
  type PartialSimpleTypographyProps,
  type RequiredSimpleTypographyProps,
} from "./typography/types.js";

const selectLeftOffset = 10;

const getPartialBorderRadiusCSS = (
  partialBorderRadius?: PartialBorderRadius,
): string => {
  if (!partialBorderRadius) {
    return "";
  }

  const {
    topLeft = 0,
    topRight = 0,
    bottomLeft = 0,
    bottomRight = 0,
  } = partialBorderRadius;
  return `border-radius: ${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px;`;
};

export const iconSides = ["left", "right"] as const;
export type IconSide = (typeof iconSides)[number];
export const iconOffsets = ["small", "medium", "large"] as const;
export type IconOffset = (typeof iconOffsets)[number];
export const iconWidths = [8, 12, 16, 20] as const;
export type IconWidth = (typeof iconWidths)[number];
export const iconStrokeWidths = [1, 1.5, 2] as const;
export type IconStrokeWidth = (typeof iconStrokeWidths)[number];

export type TextLabelOptions = {
  backgroundColor?: ThemeOrColorKey;
  borderRadius?: TextInputBorderRadius;
  paddingX?: number;
  paddingY?: number;
  typography?: TypographyPropsWithoutChildren;
  position?: "absolute" | "relative";
  marginBottom?: number;
};

export type PartialBorderRadius = {
  topLeft?: number;
  topRight?: number;
  bottomLeft?: number;
  bottomRight?: number;
};

export type TextInputProps = {
  disabled?: boolean | undefined;
  error?: string | ToReactNodesArgs | undefined;
  contentError?: ReactNode | undefined;
  success?: string | ToReactNodesArgs | undefined;
  contentSuccess?: ReactNode | undefined;
  icon?:
    | {
        name: IconName;
        width?: IconWidth | undefined;
        side?: IconSide | undefined;
        offset?: IconOffset | undefined;
        strokeWidth?: IconStrokeWidth | undefined;
        color?: ThemeOrColorKey | undefined;
      }
    | undefined;
  maxLength?: number;
  name?: string;
  onBlur?: (event: FocusEvent<HTMLInputElement, Element>) => void;
  onChange: (newValue: string, event: ChangeEvent<HTMLInputElement>) => void;
  onEnter?: () => void;
  onFocus?:
    | ((event: FocusEvent<HTMLInputElement, Element>) => void)
    | undefined;
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
  hint?: string | ToReactNodesArgs | undefined;
  hideNonErrorsIfBlurred?: boolean | undefined;
  hintTooltip?: string | undefined;
  label?: string;
  labelOptions?: TextLabelOptions;
  rightButtonText?: string | undefined;
  rightText?: string | undefined;
  onRightButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  typography?: PartialSimpleTypographyProps | undefined;
  select?:
    | {
        options: { value: string; label: string }[];
        value: string;
        onChange: (value: string) => void;
        /* A specified width is required to ensure left input padding is correct */
        width: number;
        /* A specified height is required to ensure the select is the same height as the input */
        height: number;
      }
    | undefined;
  borderRadius?: TextInputBorderRadius | undefined;
  partialBorderRadius?: PartialBorderRadius | undefined;
  borderWidth?: number | undefined;
  width?: "full" | "short" | undefined;
  paddingX?: number;
  paddingY?: number;
  subTextPaddingX?: number | undefined;
  marginTop?: number | undefined;
  // Outline that appears outside/offset when the input is focused
  activeOutline?: boolean;
  activeOutlineColor?: ThemeOrColorKey;
  enterKeyHint?: InputHTMLAttributes<HTMLInputElement>["enterKeyHint"];
  autoFocus?: boolean;
  loading?: boolean;
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

  const hasError = Boolean(props.error || props.contentError);
  const hasSuccess = Boolean(props.success || props.contentSuccess);

  /* Default to right side icon if not specified: */
  const iconSide = props.icon ? props.icon.side || "right" : undefined;
  const hasIconLeft = Boolean(props.icon && iconSide === "left");
  const hasIconRight =
    Boolean(props.icon && iconSide === "right") || props.loading;
  const iconWidth = props.icon?.width || 12;
  /* Where the icon center should be regardless of icon width: */
  const iconCenterOffset =
    props.icon?.offset === "large" || props.icon?.offset === "medium" ? 26 : 18;
  const iconTextOffset =
    props.icon?.offset === "large"
      ? 14
      : props.icon?.offset === "medium"
      ? 8
      : 4;

  const leftIconOffset = iconCenterOffset - iconWidth / 2;
  let paddingLeftPx: number | undefined;
  if (typeof props.paddingX === "number") {
    if (hasIconLeft) {
      paddingLeftPx = props.paddingX + iconWidth + iconTextOffset;
    } else {
      paddingLeftPx = props.paddingX;
    }
  } else if (hasIconLeft) {
    paddingLeftPx = leftIconOffset + iconWidth + iconTextOffset;
  } else if (props.select) {
    paddingLeftPx = selectLeftOffset + props.select.width + 5;
  }

  const rightIconWidth = props.loading ? 20 : iconWidth;
  const rightIconOffset = iconCenterOffset - rightIconWidth / 2;
  let paddingRightPx: number | undefined;
  if (typeof props.paddingX === "number") {
    if (hasIconRight) {
      paddingRightPx = iconTextOffset + rightIconWidth + props.paddingX;
    } else {
      paddingRightPx = props.paddingX;
    }
  } else if (hasIconRight) {
    paddingRightPx = rightIconOffset + rightIconWidth + iconTextOffset;
  }

  const textInputWidth = props.width === "short" ? "250px" : "100%";

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
        hasSuccess={hasSuccess}
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
        partialBorderRadius={props.partialBorderRadius}
        borderWidth={props.borderWidth}
        enterKeyHint={props.enterKeyHint}
        autoFocus={props.autoFocus}
      />
      {props.rightButtonText && (
        <RightButtonAligner paddingX={rightIconOffset}>
          <RightButton onClick={props.onRightButtonClick}>
            {props.rightButtonText}
          </RightButton>
        </RightButtonAligner>
      )}
      {props.rightText && (
        <RightButtonAligner paddingX={rightIconOffset}>
          <RightTextBody focused={focused}>{props.rightText}</RightTextBody>
        </RightButtonAligner>
      )}
    </InputContainer>
  );

  if (hasIconLeft || hasIconRight) {
    input = (
      <WithIcon hasError={hasError} withFocus={focused}>
        {props.icon && iconSide === "left" && (
          <TextInputIconContainer
            onClick={props.onClickIcon ? props.onClickIcon : () => {}}
            isIconRight={false}
            focused={focused}
            hasValue={Boolean(props.value)}
            colorProp={props.typography.color}
            iconOffset={
              typeof props.paddingX === "number"
                ? props.paddingX
                : leftIconOffset
            }
          >
            <Icon
              name={props.icon.name}
              width={iconWidth}
              iconProps={{ strokeWidth: props.icon.strokeWidth }}
            />
          </TextInputIconContainer>
        )}
        {input}
        {hasIconRight && (
          <TextInputIconContainer
            onClick={props.onClickIcon ? props.onClickIcon : () => {}}
            isIconRight={true}
            focused={focused}
            hasValue={Boolean(props.value)}
            colorProp={props.typography.color}
            iconOffset={
              typeof props.paddingX === "number"
                ? props.paddingX
                : rightIconOffset
            }
          >
            {props.loading ? (
              <Loading center={false} size={rightIconWidth} />
            ) : props.icon && iconSide === "right" ? (
              <Icon
                name={props.icon.name}
                width={rightIconWidth}
                iconProps={{ strokeWidth: props.icon.strokeWidth }}
              />
            ) : null}
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
    <StyledTextInput widthProp={textInputWidth} marginTop={props.marginTop}>
      {props.label ? (
        <TextInputLabel hasError={hasError} labelOptions={props.labelOptions}>
          {props.labelOptions?.typography
            ? toReactNodes({
                text: props.label,
                typography: props.labelOptions.typography,
              })
            : props.label}
        </TextInputLabel>
      ) : null}
      {select && (
        <TextInputSelect
          value={select.value}
          widthProp={select.width}
          heightProp={select.height}
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
        text={props.error || props.success || props.hint}
        content={props.contentError || props.contentSuccess}
        hasError={hasError}
        hasSuccess={hasSuccess}
        tooltipId={hintTooltipId}
        hideNonErrorsIfBlurred={props.hideNonErrorsIfBlurred}
        focused={focused}
        subTextPaddingX={props.subTextPaddingX}
      />
      {props.hintTooltip ? (
        <Tooltip id={hintTooltipId} content={props.hintTooltip} place="right" />
      ) : null}
    </StyledTextInput>
  );
}

const TextInputSelect = styled.select<{
  widthProp: number;
  heightProp: number;
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
  height: ${({ heightProp }) => `${heightProp}px`};
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
  hasSuccess: boolean;
  disabled: boolean;
  paddingLeftPx?: number | undefined;
  paddingRightPx?: number | undefined;
  paddingTopPx?: number | undefined;
  paddingBottomPx?: number | undefined;
  activeOutline?: boolean | undefined;
  activeOutlineColor?: ThemeOrColorKey | undefined;
  typography: RequiredSimpleTypographyProps;
  borderRadius?: TextInputBorderRadius | undefined;
  partialBorderRadius?: PartialBorderRadius | undefined;
  borderWidth?: number | undefined;
}

const Input = styled.input<InputProps>`
  ${textInputStyle};
  ${({ partialBorderRadius }) => getPartialBorderRadiusCSS(partialBorderRadius)}
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

const RightButtonAligner = styled.div<{ paddingX: number }>`
  position: absolute;
  top: 0;
  right: ${({ paddingX }) => paddingX}px;
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

const RightTextBody = styled.label<{ focused: boolean }>`
  font-size: 14px;
  font-weight: ${({ focused }) => (focused ? 600 : 400)};
`;

const TextInputLabel = styled.label<{
  hasError: boolean;
  labelOptions?: TextLabelOptions | undefined;
}>`
  border-radius: ${({ labelOptions }) =>
    labelOptions?.borderRadius
      ? getBorderRadiusCSS(labelOptions.borderRadius)
      : "8px"};
  font-size: 10px;
  position: ${({ labelOptions }) => labelOptions?.position || "absolute"};
  z-index: ${z.textInput + 1};
  background-color: ${({ theme, labelOptions }) =>
    labelOptions?.backgroundColor
      ? getBackgroundColor(theme, labelOptions.backgroundColor)
      : theme.bg};
  color: ${({ theme, hasError }) =>
    hasError ? theme.danger : theme.mcNeutral};
  font-weight: 600;
  padding-left: ${({ labelOptions }) =>
    labelOptions?.paddingX === undefined
      ? "6px"
      : `${labelOptions.paddingX}px`};
  padding-right: ${({ labelOptions }) =>
    labelOptions?.paddingX === undefined
      ? "6px"
      : `${labelOptions.paddingX}px`};
  padding-top: ${({ labelOptions }) =>
    labelOptions?.paddingY === undefined
      ? "4px"
      : `${labelOptions.paddingY}px`};
  padding-bottom: ${({ labelOptions }) =>
    labelOptions?.paddingY === undefined
      ? "4px"
      : `${labelOptions.paddingY}px`};
  left: ${({ labelOptions }) =>
    labelOptions?.position === "relative" ? "0" : "12px"};
  top: ${({ labelOptions }) =>
    labelOptions?.position === "relative" ? "0" : "-10px"};
  margin-bottom: ${({ labelOptions }) =>
    labelOptions?.marginBottom ? `${labelOptions.marginBottom}px` : "0"};
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

const StyledTextInput = styled.div<{
  widthProp: string;
  marginTop: number | undefined;
}>`
  display: flex;
  flex-direction: column;
  width: ${({ widthProp }) => widthProp};
  position: relative;
  /* Apply marginTop to every TextInput when specified */
  margin-top: ${({ marginTop }) =>
    marginTop !== undefined ? `${marginTop}px` : ""};

  /* eg forms, should be left consistent: */
  & + & {
    margin-top: ${({ marginTop }) =>
      marginTop !== undefined ? `${marginTop}px` : `${inputSpacingPx}px`};
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
