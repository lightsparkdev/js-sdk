import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useLayoutEffect, useRef, useState } from "react";
import { colors, themeOr, type ThemeProp, type WithTheme } from "./colors.js";
import { standardBorderRadius, subtext } from "./common.js";
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
    ? `border-style: solid; border-color: ${colors.danger}; border-width: 2px;`
    : hasValue
    ? `border-style: solid; border-color: ${theme.info};`
    : `border-style: dashed;`}
`;

export const textInputPlaceholderColor = ({ theme }: ThemeProp) =>
  theme.c4Neutral;
export const textInputColor = ({ theme }: ThemeProp) => theme.text;
export const textInputFontWeight = 600;
export const textInputBorderRadiusPx = 8;
export const textInputPaddingPx = 12;
export const textInputPadding = `${textInputPaddingPx}px`;

export const textInputBorderColor = ({ theme }: ThemeProp) =>
  themeOr(theme.c1Neutral, theme.c3Neutral)({ theme });
export const textInputBorderColorFocused = ({ theme }: ThemeProp) =>
  themeOr(theme.hcNeutral, theme.hcNeutral)({ theme });

export const textInputStyle = ({
  theme,
  disabled,
  hasError,
  paddingLeftPx,
  paddingRightPx,
}: WithTheme<{
  disabled: boolean;
  hasError: boolean;
  paddingLeftPx?: number | undefined;
  paddingRightPx?: number | undefined;
}>) => css`
  border-radius: ${textInputBorderRadiusPx}px;
  background-color: ${disabled ? theme.vlcNeutral : theme.bg};
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
  border-style: solid;
  border-width: ${hasError ? "2" : "1"}px;
  border-color: ${hasError ? theme.danger : textInputBorderColor({ theme })};
  line-height: 22px;
  outline: none;
  /* Use low contrast by default. Some fields, eg login, need high contrast simply
     because of quirks with default autofill styles. Clicking in to an autofilled value
     does not change the color of the text, it just uses the default field color */
  color: ${textInputColor({ theme })};
  font-size: 14px;
  width: ${fieldWidth};
  max-width: ${maxFieldWidth};
  text-overflow: ellipsis;
  &:focus,
  &:active {
    border-color: ${textInputBorderColorFocused({ theme })};
    border-width: 2px;
    color: ${textInputColor({ theme })};
    padding: ${textInputPaddingPx - 1}px;
    ${paddingLeftPx ? `padding-left: ${paddingLeftPx - 1}px;` : ""}
    ${paddingRightPx ? `padding-right: ${paddingRightPx - 1}px;` : ""}
  }

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
  hasError = false,
}: {
  text?: string | undefined;
  hasError?: boolean;
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [subtext, setSubtext] = useState(text);
  const [visible, setVisible] = useState(Boolean(text));

  useLayoutEffect(() => {
    if (text) {
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
  }, [text]);

  return (
    <StyledInputSubtext visible={visible} hasError={hasError}>
      {subtext}
    </StyledInputSubtext>
  );
}

export const StyledInputSubtext = styled.div<{
  hasError: boolean;
  visible: boolean;
}>`
  margin-top: ${({ visible }) => (visible ? "8px" : "0px")};
  margin-left: ${({ visible }) => (visible ? "8px" : "0px")};
  font-size: 12px;
  font-size: ${({ visible }) => (visible ? "12px" : "0px")};
  opacity: ${({ visible }) => (visible ? "1" : "0")};
  overflow: hidden;
  transition:
    font-size ${inputSubtextSeconds}s cubic-bezier(0.25, 0.87, 0.56, 1.23),
    opacity ${inputSubtextSeconds * 0.8}s cubic-bezier(0.25, 0.87, 0.56, 1.23),
    margin ${inputSubtextSeconds}s cubic-bezier(0.25, 0.87, 0.56, 1.23);
  color: ${({ hasError, theme }) => (hasError ? theme.danger : theme.text)};
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
