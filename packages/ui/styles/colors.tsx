import type { CSSInterpolation } from "@emotion/css";
import type { Theme } from "@emotion/react";
import { css, useTheme } from "@emotion/react";
import { Breakpoints, useBreakpoints } from "./breakpoints";
import { getTypography } from "./fonts/typographyTokens";

const neutral = {
  black: "#000000",
  gray5: "#0D0D0D",
  gray10: "#1A1A1A",
  gray15: "#262626",
  gray20: "#333333",
  gray25: "#404040",
  gray30: "#4D4D4D",
  gray40: "#666666",
  gray50: "#808080",
  gray60: "#999999",
  gray70: "#B3B3B3",
  gray80: "#CCCCCC",
  gray85: "#D9D9D9",
  gray90: "#E6E6E6",
  gray95: "#F2F2F2",
  white: "#FFFFFF",
};

const uma = {
  background: "#F9F9F9",
  black: "#16171A",
  blue: "#0068C9",
  blue50: "#C0C9D6",
  blue80: "#DCE2EA",
  blue90: "#EBEEF2",
  blue95: "#F2F5F7",
  grey300: "#DEDFE4",
  secondary: "#686A72",
  stroke: "#C0C9D6",
  strokeProminent: "#9BA7B9",
  fill: "#EBEEF2",
};

export const darkGradient =
  "#1d1d1d linear-gradient(180deg, #090909 63.08%, #1d1d1d 100.52%)";

export enum Themes {
  Light = "light",
  Dark = "dark",
}

const primary = "#FFF14E";

export const colors = {
  ...neutral,
  uma,
  // green
  success: "#17C27C",
  // blue
  blue43: "#145BC6",
  blue22: "#0E2E60",
  blue58: "#28BFFF",
  blue95: "#EBEEF2",
  // yellow
  primary,
  warning: primary,
  // orange
  danger: "#FD2C0F",
  // neutral
  secondary: neutral.black,
  // billing
  tier1: "#179257",
  tier2: "#8B38DE",
  tier3: "#0048F7",
};

interface BaseTheme {
  type: Themes;
  bg: string;
  smBg: string;
  c05Neutral: string;
  c1Neutral: string;
  c15Neutral: string;
  c2Neutral: string;
  c3Neutral: string;
  c4Neutral: string;
  c5Neutral: string;
  c6Neutral: string;
  c7Neutral: string;
  c8Neutral: string;
  c9Neutral: string;
  danger: string;
  hcNeutral: string;
  hcNeutralFromBg: (hex: string) => string;
  info: string;
  lcNeutral: string;
  mcNeutral: string;
  onInfoText: string;
  onPrimaryText: string;
  onSuccessText: string;
  primary: string;
  success: string;
  text: string;
  typography: ReturnType<typeof getTypography>;
  vlcNeutral: string;
  warning: string;
}

type LightsparkSurfaces = {
  header: BaseTheme;
  nav: BaseTheme; // eg nav bar
  content: BaseTheme; // eg main contener
  controls: BaseTheme; // eg secondary nav
};
type LightsparkTheme = BaseTheme & LightsparkSurfaces;

declare module "@emotion/react" {
  export interface Theme extends LightsparkTheme {}
}

function extend(obj: BaseTheme, rest: Partial<LightsparkTheme>) {
  return {
    ...obj,
    ...rest,
  } as LightsparkTheme;
}

function extendBase(obj: BaseTheme, rest: Partial<BaseTheme>) {
  return {
    ...obj,
    ...rest,
  } as BaseTheme;
}

function hcNeutralFromBg(bgHex: string, defaultHex: string, altHex: string) {
  const bgRGB = hexToRGB(bgHex);
  const hcRGB = hexToRGB(defaultHex);
  if (!bgRGB || !hcRGB) return defaultHex;
  const c = contrast(bgRGB, hcRGB);
  if (c < 4.5) {
    return altHex;
  }
  return defaultHex;
}

const lightBaseTheme: BaseTheme = {
  type: Themes.Light,
  bg: colors.white,
  smBg: colors.white,
  c05Neutral: neutral.gray95,
  c1Neutral: neutral.gray90,
  c15Neutral: neutral.gray85,
  c2Neutral: neutral.gray80,
  c3Neutral: neutral.gray70,
  c4Neutral: neutral.gray60,
  c5Neutral: neutral.gray50,
  c6Neutral: neutral.gray40,
  c7Neutral: neutral.gray30,
  c8Neutral: neutral.gray20,
  c9Neutral: neutral.gray10,
  danger: colors.danger,
  hcNeutral: colors.black,
  hcNeutralFromBg: (bgHex) =>
    hcNeutralFromBg(bgHex, colors.black, colors.white),
  info: colors.blue43,
  lcNeutral: neutral.gray80,
  mcNeutral: neutral.gray40,
  onInfoText: colors.white,
  onPrimaryText: colors.black,
  onSuccessText: colors.white,
  primary: colors.primary,
  success: colors.success,
  text: colors.black,
  typography: getTypography(),
  vlcNeutral: neutral.gray95,
  warning: colors.warning,
};

const darkBaseTheme: BaseTheme = {
  type: Themes.Dark,
  bg: colors.black,
  smBg: colors.black,
  c05Neutral: neutral.gray5,
  c1Neutral: neutral.gray10,
  c15Neutral: neutral.gray15,
  c2Neutral: neutral.gray20,
  c3Neutral: neutral.gray30,
  c4Neutral: neutral.gray40,
  c5Neutral: neutral.gray50,
  c6Neutral: neutral.gray60,
  c7Neutral: neutral.gray70,
  c8Neutral: neutral.gray80,
  c9Neutral: neutral.gray90,
  danger: colors.danger,
  hcNeutral: colors.white,
  hcNeutralFromBg: (bgHex) =>
    hcNeutralFromBg(bgHex, colors.white, colors.black),
  info: colors.white,
  lcNeutral: neutral.gray40,
  mcNeutral: neutral.gray60,
  onInfoText: colors.white,
  onPrimaryText: colors.black,
  onSuccessText: colors.white,
  primary: colors.primary,
  success: colors.success,
  text: colors.white,
  typography: getTypography(),
  vlcNeutral: neutral.gray20,
  warning: colors.warning,
};

const lightTheme = extend(lightBaseTheme, {
  header: extendBase(lightBaseTheme, {
    text: colors.gray60,
  }),
  nav: extendBase(lightBaseTheme, {
    text: colors.gray60,
  }),
  content: extendBase(lightBaseTheme, {
    bg: colors.white,
    smBg: colors.white,
  }),
  controls: extendBase(lightBaseTheme, {
    bg: neutral.gray40,
    smBg: neutral.gray40,
    text: neutral.white,
  }),
});

const darkTheme = extend(darkBaseTheme, {
  header: extendBase(darkBaseTheme, {}),
  nav: extendBase(darkBaseTheme, {}),
  content: extendBase(darkBaseTheme, {}),
  controls: extendBase(darkBaseTheme, {
    bg: neutral.gray40,
    smBg: neutral.gray40,
    text: neutral.white,
  }),
});

const umaLightTheme = extend(lightTheme, {
  bg: uma.background,
  smBg: uma.background,
  content: extendBase(lightBaseTheme, {
    bg: uma.background,
    smBg: uma.background,
    text: uma.black,
  }),
  controls: extendBase(lightBaseTheme, {
    text: uma.background,
  }),
});

/**
 * Allows setting typography in cases where a custom font is needed.
 * Setting custom fonts should only be necessary for next fonts.
 */
export const themeWithTypography = (
  theme: Theme,
  typography: ReturnType<typeof getTypography>,
) => {
  return extendBase(theme, { typography });
};

export const themes: {
  light: LightsparkTheme;
  dark: LightsparkTheme;
  uma: {
    light: LightsparkTheme;
  };
} = {
  light: lightTheme,
  dark: darkTheme,
  uma: {
    light: umaLightTheme,
  },
};

export const isDark = (theme: Theme) => theme.type === Themes.Dark;
export const isLight = (theme: Theme) => theme.type === Themes.Light;
export const themeOr =
  (lightValue: string, darkValue: string) =>
  ({ theme }: { theme: Theme }) => {
    return isLight(theme) ? lightValue : darkValue;
  };

export function ifLight(style: CSSInterpolation) {
  return function ({ theme }: { theme: LightsparkTheme }) {
    if (theme.type === Themes.Light) {
      return css`
        ${style}
      `;
    }
    return "";
  };
}

export function ifDark(style: CSSInterpolation) {
  return function ({ theme }: { theme: LightsparkTheme }) {
    if (theme.type === Themes.Dark) {
      return css`
        ${style}
      `;
    }
    return "";
  };
}

/* https://bit.ly/3WUawKh */
export function luminance(r: number, g: number, b: number) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

type RGB = [number, number, number];

export function contrast(rgb1: RGB, rgb2: RGB) {
  const lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function componentToHex(c: number) {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function hexToRGB(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? ([
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ] as RGB)
    : ([0, 0, 0] as RGB);
}

export function hexToRGBAStr(hex: string, alpha: number) {
  const rgb = hexToRGB(hex);
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

export function useThemeBg() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const isSm = bp.current(Breakpoints.sm);
  if (isDark(theme)) {
    return darkGradient;
  }
  return isSm ? theme.smBg : theme.bg;
}

export type ThemeProp = {
  theme: Theme;
};
