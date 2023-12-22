import type { Theme } from "@emotion/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Tooltip } from "react-tooltip";
import { bp } from "./breakpoints.js";
import { colors, darkGradient, themeOr, type ThemeProp } from "./colors.js";
import { z } from "./z-index.js";

export const rootFontSizePx = 12;
export const rootFontSizeRems = rootFontSizePx / 16;
export const standardLineHeightEms = 1.21;

export const headingContentMarginPx = 30;
export const standardContentInsetPx = 32;
export const standardContentInsetMdPx = 24;
export const standardContentInsetSmPx = 16;

const standardBorderRadiusPx = [0, 8, 16] as const;
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

export const standardCardShadow = css`
  box-shadow:
    0px 4px 10px 0px rgba(0, 0, 0, 0.08),
    0px 8px 24px 0px rgba(0, 0, 0, 0.04);
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

export const StyledTooltip = styled(Tooltip)`
  z-index: ${z.modalOverlay};
`;

export const overlaySurface = ({ theme }: ThemeProp) => css`
  background-color: ${themeOr(colors.white, theme.c1Neutral)({ theme })};
  border: 0.5px solid ${themeOr(theme.c1Neutral, theme.c3Neutral)({ theme })};
  ${themeOr(
    "box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.08), 0px 1px 4px rgba(0, 0, 0, 0.1);",
    "",
  )({ theme })}
`;

export const mcBold = (theme: Theme) => css`
  font-weight: 600;
  color: ${theme.mcNeutral};
`;
export const mcBoldStyled = ({ theme }: ThemeProp) => mcBold(theme);
