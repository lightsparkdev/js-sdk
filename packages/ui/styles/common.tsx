import { CSSInterpolation } from "@emotion/css";
import { css, Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { z } from "@lightsparkdev/ui/styles/z-index";
import { useLayoutEffect, useRef, useState } from "react";
import { Tooltip } from "react-tooltip";
import { bp } from "./breakpoints";
import { colors, darkGradient, themeOr } from "./colors";

type ThemeProp = {
  theme: Theme;
};

export const rootFontSizePx = 12;
export const rootFontSizeRems = rootFontSizePx / 16;
export const standardLineHeightEms = 1.21;

export function pxToRems<T extends boolean>(
  rems: number,
  asNum: T = false as T
): T extends true ? number : string {
  const value = (rems / rootFontSizePx).toFixed(6);
  return (asNum ? Number(value) : `${value}rem`) as T extends true
    ? number
    : string;
}

export function remsToPx<T extends boolean>(
  rems: number,
  asNum: T = false as T
): T extends true ? number : string {
  const value = (rootFontSizePx * rems).toFixed(6);
  return (asNum ? Number(value) : `${value}px`) as T extends true
    ? number
    : string;
}

export const size = {
  px8: pxToRems(8),
  px10: pxToRems(10),
  px12: pxToRems(12),
  px14: pxToRems(14),
  px16: pxToRems(16),
  px18: pxToRems(18),
  px20: pxToRems(20),
  px21: pxToRems(21),
  px24: pxToRems(24),
};

export const extend = (...args: Array<CSSInterpolation>) => css(...args);

export const headingContentMarginPx = 30;
export const standardContentInsetPx = 32;
export const standardContentInsetMdPx = 24;
export const standardContentInsetSmPx = 16;

export const flexCenterAxis = css`
  display: flex;
  align-items: center;
`;
export const flexCenter = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const inlineFlexCenter = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const flexBetween = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const absoluteCenter = css`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
`;

export const textCenter = css`
  text-align: center;
`;

export const formButtonTopMargin = "30px";
export const formButtonSideMargin = "20px";
export const formButtonTopMarginStyle = css`
  margin-top: ${formButtonTopMargin};
`;
export const formButtonRightMargin = css`
  margin-right: ${formButtonSideMargin};
`;
export const formButtonMargin = css`
  margin-top: ${formButtonTopMargin};
  margin-right: ${formButtonSideMargin};
`;

export const smContentInset = css`
  ${bp.sm(`
    margin-left: auto;
    margin-right: auto;
    width: calc(100% - ${standardContentInsetSmPx * 2}px);
  `)}
`;

export const minSmMaxLgContentInset = css`
  ${bp.minSmMaxLg(`
    width: calc(100% - ${standardContentInsetMdPx * 2}px);
  `)}
`;

export const standardContentInset = css`
  margin-left: auto;
  margin-right: auto;
  width: calc(100% - ${standardContentInsetPx * 2}px);
  max-width: 1280px;

  ${smContentInset}
  ${minSmMaxLgContentInset}
`;

export const formInset = css`
  margin-left: auto;
  margin-right: auto;
  max-width: 100%;
  padding: 40px;

  ${bp.minSm(`
    width: 505px;
  `)}

  ${bp.sm(`
    padding: 0;
  `)}

  ${smContentInset}
`;

export const standardCardShadow = css`
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.08),
    0px 8px 24px 0px rgba(0, 0, 0, 0.04);
`;

export const CardSubtitle = styled.p`
  color: ${({ theme }) => theme.mcNeutral};
  font-size: ${size.px14};
  line-height: ${size.px18};
  font-weight: 600;
  margin: 0;
`;

export const pageBorderRadiusPx = 16;
export const pageBorderRadius = `
  border-radius: ${pageBorderRadiusPx}px;
`;

export const getFocusOutline = ({
  theme,
  onBgHex,
}: {
  theme: Theme;
  onBgHex?: string;
}) =>
  `${onBgHex ? theme.hcNeutralFromBg(onBgHex) : theme.hcNeutral} dashed 1px`;
export const outlineOffset = "-2px";
export const standardFocusOutline = ({ theme }: ThemeProp) => css`
  &,
  & a,
  & button {
    &:focus-visible {
      outline: ${getFocusOutline({ theme })};
      outline-offset: ${outlineOffset};
    }
  }
`;

export const delta = ({
  theme,
  delta = 0,
  invertSuccessColor = false,
}: {
  theme: Theme;
  delta?: number;
  invertSuccessColor?: boolean;
}) => css`
  color: ${delta >= 0
    ? invertSuccessColor
      ? theme.danger
      : theme.success
    : invertSuccessColor
    ? theme.success
    : theme.danger};
  border-color: ${delta >= 0
    ? invertSuccessColor
      ? theme.danger
      : theme.success
    : invertSuccessColor
    ? theme.success
    : theme.danger};
`;

export const overflowAutoWithoutScrollbars = css`
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &::-moz-scrollbar {
    display: none;
  }
`;

export const cardBorderRadiusPx = 16;

export const standardBorderColor = ({ theme }: ThemeProp) => css`
  border-color: ${themeOr(theme.c1Neutral, theme.mcNeutral)({ theme })};
`;

export const subtext = ({ theme }: ThemeProp) => css`
  color: ${theme.c6Neutral};
  font-weight: 600;
`;

export const Subtext = styled.div`
  ${subtext}
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
}: {
  theme: Theme;
  hasError: boolean;
}) => css`
  ${hasError ? "border: none !important" : ""};
  background-color: ${theme.bg};
  position: relative;
  z-index: ${z.fieldError + 1};
  ${hasError &&
  "box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.08), 0px 1px 4px rgba(0, 0, 0, 0.1);"}
`;

export const darkGradientBg = css`
  background: ${darkGradient};
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

export const maxFieldWidth = "100%";
export const fieldWidth = "100%";

export const textInputStyle = ({
  theme,
  disabled,
  hasError,
  paddingLeftPx,
  paddingRightPx,
}: {
  theme: Theme;
  disabled: boolean;
  hasError: boolean;
  paddingLeftPx?: number | undefined;
  paddingRightPx?: number | undefined;
}) => css`
  border-radius: ${textInputBorderRadiusPx}px;
  background-color: ${disabled ? theme.vlcNeutral : theme.bg};
  pointer-events: ${disabled ? "none" : "auto"};
  box-sizing: border-box;
  font-weight: ${textInputFontWeight};

  position: relative;
  z-index: ${z.textInput};
  font-family: "Montserrat";
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

export const inputSpacingPx = 24;

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
  transition: font-size ${inputSubtextSeconds}s
      cubic-bezier(0.25, 0.87, 0.56, 1.23),
    opacity ${inputSubtextSeconds * 0.8}s cubic-bezier(0.25, 0.87, 0.56, 1.23),
    margin ${inputSubtextSeconds}s cubic-bezier(0.25, 0.87, 0.56, 1.23);
  color: ${({ hasError, theme }) => (hasError ? theme.danger : theme.text)};
`;

export const labelStyle = ({
  theme,
  hasError,
}: {
  theme: Theme;
  hasError?: boolean;
}) => css`
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

export const StyledTooltip = styled(Tooltip)`
  z-index: ${z.modalOverlay};
`;

export const overlaySurface = ({ theme }: ThemeProp) => css`
  background-color: ${themeOr(colors.white, theme.c1Neutral)({ theme })};
  border: 0.5px solid ${themeOr(theme.c1Neutral, theme.c3Neutral)({ theme })};
  ${themeOr(
    "box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.08), 0px 1px 4px rgba(0, 0, 0, 0.1);",
    ""
  )({ theme })}
`;

export const lineClamp = (lines: number) => css`
  display: -webkit-box;
  -webkit-line-clamp: ${lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const mcBold = (theme: Theme) => css`
  font-weight: 600;
  color: ${theme.mcNeutral};
`;
export const mcBoldStyled = ({ theme }: ThemeProp) => mcBold(theme);

/* See https://github.com/emotion-js/emotion/issues/1178 for detailed discussion. This should work
   even if we adapt SSR in the future. So far in testing it only works in root level styled component
   declarations and not inlined style functions. It is very sensitive to changes so be sure to test
   thoroughly that there are no console warnings in any usage: */
export const ignoreSSRWarning =
  "/* @emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason */";
export const firstChild = (style: string) =>
  `&:first-child:not(style), style:first-child + & ${ignoreSSRWarning} { ${style} }`;
