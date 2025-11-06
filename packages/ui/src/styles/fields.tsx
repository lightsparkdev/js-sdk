import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { type PartialSimpleTypographyProps } from "../components/typography/types.js";
import type { ToReactNodesArgs } from "../utils/toReactNodes/toReactNodes.js";
import { toReactNodes } from "../utils/toReactNodes/toReactNodes.js";
import { colors } from "./colors.js";
import { standardBorderRadius, subtext } from "./common.js";
import {
  getColor,
  isBridge,
  themeOr,
  type ThemeOrColorKey,
  type ThemeProp,
  type WithTheme,
} from "./themes.js";
import { applyTypography } from "./typography.js";
import { z } from "./z-index.js";

export const maxFieldWidth = "100%";
export const fieldWidth = "100%";
export const inputSpacingPx = 24;
export const formButtonTopMargin = "32px";
export const formButtonTopMarginStyle = css`
  margin-top: ${formButtonTopMargin};
`;

export const standardBorderColor = ({ theme }: ThemeProp) => css`
  border-color: ${themeOr(theme.c1Neutral, theme.mcNeutral)({ theme })};
`;
export const inputBlockStyle = ({
  theme,
  hasValue,
  hasError,
}: WithTheme<{ hasValue: boolean; hasError: boolean }>) => css`
  ${subtext({ theme })}
  ${standardBorderColor({ theme })}
  ${standardBorderRadius(8)}
  background-color: ${theme.bg};
  border-width: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  padding: 52.5px;
  ${hasError
    ? `border-style: solid; border-color: ${theme.danger}; border-width: 2px;`
    : hasValue
    ? `border-style: solid; border-color: ${theme.info};`
    : `border-style: dashed;`}
`;

export const textInputPlaceholderColor = ({ theme }: ThemeProp) =>
  theme.c4Neutral;
export const textInputFontWeight = 600;
export const textInputPaddingPx = 12;
export const textInputPadding = `${textInputPaddingPx}px`;

export const textInputBorderColor = ({ theme }: ThemeProp) =>
  isBridge(theme)
    ? colors.gray4
    : themeOr(theme.c1Neutral, theme.c3Neutral)({ theme });
export const textInputBorderColorFocused = ({ theme }: ThemeProp) =>
  themeOr(theme.hcNeutral, theme.hcNeutral)({ theme });

const textInputActiveStyles = ({
  theme,
  paddingLeftPx,
  paddingRightPx,
  paddingTopPx,
  paddingBottomPx,
  activeOutline,
  activeOutlineColor,
}: WithTheme<{
  paddingLeftPx?: number | undefined;
  paddingRightPx?: number | undefined;
  paddingTopPx?: number | undefined;
  paddingBottomPx?: number | undefined;
  activeOutline?: boolean | undefined;
  activeOutlineColor?: ThemeOrColorKey | undefined;
}>) => {
  if (activeOutline) {
    const outlineColor = activeOutlineColor
      ? getColor(theme, activeOutlineColor)
      : textInputBorderColorFocused({ theme });
    return css`
      outline: 2px solid ${outlineColor};
      outline-offset: 2px;
      caret-color: ${outlineColor};
    `;
  }

  return css`
    border-color: ${textInputBorderColorFocused({ theme })};
    border-width: 2px;
    padding: ${textInputPaddingPx - 1}px;
    ${paddingLeftPx ? `padding-left: ${paddingLeftPx - 1}px;` : ""}
    ${paddingRightPx ? `padding-right: ${paddingRightPx - 1}px;` : ""}
    ${paddingTopPx ? `padding-top: ${paddingTopPx - 1}px;` : ""}
    ${paddingBottomPx ? `padding-bottom: ${paddingBottomPx - 1}px;` : ""}
  `;
};

export const defaultTextInputTypography = {
  type: "Body",
  size: "Small",
  color: "text",
} as const;

export type TextInputBorderRadius =
  | 8
  | 16
  | 999
  | {
      topLeft?: number;
      topRight?: number;
      bottomLeft?: number;
      bottomRight?: number;
    };

export const getBorderRadiusCSS = (
  borderRadius?: TextInputBorderRadius,
): string => {
  if (!borderRadius) {
    return "8px  ";
  }

  if (typeof borderRadius === "number") {
    return `${borderRadius}px  `;
  }

  // Handle partial border radius object
  const {
    topLeft = 8,
    topRight = 8,
    bottomLeft = 8,
    bottomRight = 8,
  } = borderRadius;
  return `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
};

export const textInputStyle = ({
  theme,
  active,
  disabled,
  hasError,
  paddingLeftPx,
  paddingRightPx,
  paddingTopPx,
  paddingBottomPx,
  activeOutline,
  activeOutlineColor,
  typography,
  borderRadius,
  borderWidth,
}: WithTheme<{
  // In some cases we want to show an active state when another element is focused.
  active?: boolean | undefined;
  disabled?: boolean | undefined;
  hasError?: boolean | undefined;
  paddingLeftPx?: number | undefined;
  paddingRightPx?: number | undefined;
  paddingTopPx?: number | undefined;
  paddingBottomPx?: number | undefined;
  activeOutline?: boolean | undefined;
  activeOutlineColor?: ThemeOrColorKey | undefined;
  typography?: PartialSimpleTypographyProps | undefined;
  borderRadius?: TextInputBorderRadius | undefined;
  borderWidth?: number | undefined;
}>) => css`
  border-radius: ${getBorderRadiusCSS(borderRadius)};
  background-color: ${disabled ? theme.vlcNeutral : theme.inputBackground};
  cursor: ${disabled ? "not-allowed" : "auto"};
  box-sizing: border-box;
  font-weight: ${textInputFontWeight};

  position: relative;
  z-index: ${z.textInput};
  font-family: ${theme.typography?.fontFamilies.main};
  padding: ${textInputPaddingPx - (hasError ? 1 : 0)}px;
  ${paddingLeftPx
    ? `padding-left: ${paddingLeftPx - (hasError ? 1 : 0)}px;`
    : ""}
  ${paddingRightPx
    ? `padding-right: ${paddingRightPx - (hasError ? 1 : 0)}px;`
    : ""}
  ${paddingTopPx ? `padding-top: ${paddingTopPx - (hasError ? 1 : 0)}px;` : ""}
  ${paddingBottomPx
    ? `padding-bottom: ${paddingBottomPx - (hasError ? 1 : 0)}px;`
    : ""}
  border-style: solid;
  border-width: ${hasError
    ? "2"
    : borderWidth !== undefined
    ? borderWidth
    : "1"}px;
  border-color: ${hasError ? theme.danger : textInputBorderColor({ theme })};
  line-height: 22px;
  outline: none;

  ${applyTypography(
    theme,
    typography?.type || defaultTextInputTypography.type,
    typography?.size || defaultTextInputTypography.size,
    typography?.color || defaultTextInputTypography.color,
  )}

  width: ${fieldWidth};
  max-width: ${maxFieldWidth};
  text-overflow: ellipsis;
  &:focus,
  &:active,
  &:has(:focus) {
    ${textInputActiveStyles({
      theme,
      paddingLeftPx,
      paddingRightPx,
      paddingTopPx,
      paddingBottomPx,
      activeOutline,
      activeOutlineColor,
    })}
  }

  ${active &&
  textInputActiveStyles({
    theme,
    paddingLeftPx,
    paddingRightPx,
    paddingTopPx,
    paddingBottomPx,
    activeOutline,
    activeOutlineColor,
  })}

  &::placeholder {
    color: ${textInputPlaceholderColor({ theme })};
  }

  &:focus::placeholder {
    color: ${textInputPlaceholderColor({ theme })};
  }
`;

export const FieldError = styled.div`
  background-color: rgba(242, 239, 255, 1);
  padding: 16px 16px 8px;
  margin-top: -8px;
  border-radius: 0 0 8px 8px;
  position: relative;
  z-index: ${z.fieldError};
`;
export const aboveFieldError = ({
  theme,
  hasError,
}: WithTheme<{ hasError: boolean }>) => css`
  ${hasError ? "border: none !important" : ""};
  background-color: ${theme.bg};
  position: relative;
  z-index: ${z.fieldError + 1};
  ${hasError &&
  "box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.08), 0px 1px 4px rgba(0, 0, 0, 0.1);"}
`;

const inputSubtextSeconds = 0.25;
export function InputSubtext({
  text,
  content,
  hasError = false,
  hasSuccess = false,
  tooltipId,
  hideNonErrorsIfBlurred = false,
  focused = false,
  subTextPaddingX,
}: {
  text?: string | ToReactNodesArgs | undefined;
  content?: ReactNode | undefined;
  hasError?: boolean;
  hasSuccess?: boolean;
  tooltipId?: string | undefined;
  hideNonErrorsIfBlurred?: boolean | undefined;
  focused?: boolean | undefined;
  subTextPaddingX?: number | undefined;
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [subtext, setSubtext] = useState(text);
  const [visible, setVisible] = useState(Boolean(text));

  useLayoutEffect(() => {
    if (text || content) {
      setSubtext(text);
      setVisible(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      setVisible(false);
      timeoutRef.current = setTimeout(() => {
        setSubtext(undefined);
      }, inputSubtextSeconds * 1000);
    }
  }, [text, content]);

  return (
    <StyledInputSubtext
      visible={visible && (hasError || focused || !hideNonErrorsIfBlurred)}
      hasError={hasError}
      hasSuccess={hasSuccess}
      cursorPointer={Boolean(tooltipId)}
      usingContent={content !== undefined}
      subTextPaddingX={subTextPaddingX}
    >
      {tooltipId ? (
        <span data-tooltip-id={tooltipId}>
          <InputSubtextContent text={subtext} content={content} />
        </span>
      ) : (
        <InputSubtextContent text={subtext} content={content} />
      )}
    </StyledInputSubtext>
  );
}

function InputSubtextContent({
  text,
  content,
}: {
  text: string | ToReactNodesArgs | undefined;
  content?: ReactNode | undefined;
}) {
  if (content) {
    return content;
  }

  if (typeof text === "string") {
    return <>{text}</>;
  }

  return toReactNodes(text);
}

export const StyledInputSubtext = styled.div<{
  hasError: boolean;
  hasSuccess: boolean;
  visible: boolean;
  cursorPointer: boolean;
  usingContent?: boolean;
  subTextPaddingX?: number | undefined;
}>`
  margin-top: ${({ visible }) => (visible ? "8px" : "0px")};
  margin-left: ${({ visible, usingContent }) =>
    visible && !usingContent ? "8px" : "0px"};
  font-size: 12px;
  font-size: ${({ visible }) => (visible ? "12px" : "0px")};
  opacity: ${({ visible }) => (visible ? "1" : "0")};
  overflow: hidden;
  transition:
    font-size ${inputSubtextSeconds}s cubic-bezier(0.25, 0.87, 0.56, 1.23),
    opacity ${inputSubtextSeconds * 0.8}s cubic-bezier(0.25, 0.87, 0.56, 1.23),
    margin ${inputSubtextSeconds}s cubic-bezier(0.25, 0.87, 0.56, 1.23);
  color: ${({ hasError, hasSuccess, theme }) =>
    hasError ? theme.danger : hasSuccess ? theme.success : theme.text};
  cursor: ${({ cursorPointer }) => (cursorPointer ? "pointer" : "auto")};
  ${({ subTextPaddingX }) =>
    subTextPaddingX
      ? `
        padding-left: ${subTextPaddingX}px;
        padding-right: ${subTextPaddingX}px;
      `
      : ""};
`;

export const labelStyle = ({
  theme,
  hasError,
}: WithTheme<{ hasError?: boolean }>) => css`
  color: ${hasError ? theme.danger : theme.text};
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  & + * {
    margin-top: 12px;
  }
  * ~ & {
    margin-top: 40px;
  }
`;
export const Label = styled.label<{ hasError?: boolean }>`
  ${subtext}
  ${labelStyle}
`;
export const LabelDiv = styled.div<{ hasError?: boolean }>`
  ${subtext}
  ${labelStyle}
`;
