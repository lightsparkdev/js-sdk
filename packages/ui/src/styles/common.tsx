import type { Theme } from "@emotion/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { bp } from "./breakpoints.js";
import { darkGradient } from "./colors.js";
import { themeOr, type ThemeProp, type WithTheme } from "./themes.js";

export const rootFontSizePx = 12;
export const rootFontSizeRems = rootFontSizePx / 16;
export const standardLineHeightEms = 1.21;

export const headingContentMarginPx = 30;

function buildStandardContentInset(
  smPx: number,
  minSmMaxLgPx: number,
  lgPx: number,
) {
  const smCSS = css`
    ${bp.sm(`
      margin-left: auto;
      margin-right: auto;
      width: calc(100% - ${smPx * 2}px);
    `)}
  `;
  const minSmMaxLgCSS = css`
    ${bp.minSmMaxLg(`
      margin-left: auto;
      margin-right: auto;
      width: calc(100% - ${minSmMaxLgPx * 2}px);
    `)}
  `;
  const lgCSS = css`
    ${bp.lg(`
      margin-left: auto;
      margin-right: auto;
      width: calc(100% - ${lgPx * 2}px);
      max-width: 1280px;
    `)}
  `;
  return {
    smPx,
    minSmMaxLgPx,
    lgPx,
    smCSS,
    minSmMaxLgCSS,
    lgCSS,
    css: css`
      ${lgCSS}
      ${smCSS}
      ${minSmMaxLgCSS}
    `,
  };
}

export const standardContentInset = buildStandardContentInset(16, 24, 32);

const standardBorderRadiusPx = [0, 4, 8, 12, 16, 18] as const;
type StandardBorderRadius = (typeof standardBorderRadiusPx)[number];
export const cardBorderRadiusPx = 16;

type BorderRadiusArg = StandardBorderRadius | StandardBorderRadius[];
export const standardBorderRadius = (radius: BorderRadiusArg) => {
  const borderRadiusPx = Array.isArray(radius)
    ? radius.map((r) => `${r}px`).join(" ")
    : `${radius}px`;
  return `
    border-radius: ${borderRadiusPx};
  `;
};

export const standardCardShadow = css`
  box-shadow:
    0px 4px 10px 0px rgba(0, 0, 0, 0.08),
    0px 8px 24px 0px rgba(0, 0, 0, 0.04);
`;

export const standardCardShadowHard = css`
  box-shadow:
    0px 24px 24px -12px rgba(0, 0, 0, 0.06),
    0px 12px 12px -6px rgba(0, 0, 0, 0.06),
    0px 6px 6px -3px rgba(0, 0, 0, 0.06),
    0px 3px 3px -1.5px rgba(0, 0, 0, 0.06),
    0px 1px 1px -0.5px rgba(0, 0, 0, 0.06),
    0px 0px 0px 1px rgba(0, 0, 0, 0.06);
`;

export const pageBorderRadiusPx = 16;
export const pageBorderRadius = `
  border-radius: ${pageBorderRadiusPx}px;
`;

export const getFocusOutline = ({
  theme,
  onBgHex,
}: WithTheme<{ onBgHex?: string }>) =>
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
}: WithTheme<{
  delta?: number;
  invertSuccessColor?: boolean;
}>) => css`
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

export const subtext = ({ theme }: ThemeProp) => css`
  color: ${theme.c6Neutral};
  font-weight: 600;
`;
export const Subtext = styled.div`
  ${subtext}
`;

export const darkGradientBg = css`
  background: ${darkGradient};
`;

export const overlaySurfaceBorderColor = ({
  theme,
  important = false,
}: WithTheme<{ important?: boolean }>) => css`
  border-color: ${themeOr(theme.c1Neutral, theme.c3Neutral)({ theme })}
    ${important ? "!important" : ""};
`;
export const overlaySurface = ({
  theme,
  important = false,
  border = true,
}: WithTheme<{ important?: boolean; border?: boolean }>) => css`
  background-color: ${themeOr(theme.bg, theme.c1Neutral)({ theme })}
    ${important ? "!important" : ""};
  ${border ? `border: 0.5px solid ${important ? "!important" : ""};` : ""}
  ${overlaySurfaceBorderColor({ theme, important })};
  ${themeOr(
    `box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.08), 0px 1px 4px rgba(0, 0, 0, 0.1) ${
      important ? "!important" : ""
    };`,
    "",
  )({ theme })}
`;

export const mcBold = (theme: Theme) => css`
  font-weight: 600;
  color: ${theme.mcNeutral};
`;
export const mcBoldStyled = ({ theme }: ThemeProp) => mcBold(theme);
