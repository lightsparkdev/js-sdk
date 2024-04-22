import type { CSSInterpolation } from "@emotion/css";
import type { Theme } from "@emotion/react";
import { css, useTheme } from "@emotion/react";
import { Breakpoints, useBreakpoints } from "./breakpoints.js";
import { colors, darkGradient, hcNeutralFromBg } from "./colors.js";
import { App, getTypography } from "./tokens/typography.js";

export enum Themes {
  Light = "light",
  Dark = "dark",
}

interface BaseTheme {
  type: Themes;
  app: App;
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
  link: string;
  mcNeutral: string;
  onInfoText: string;
  onPrimaryText: string;
  onSuccessText: string;
  primary: string;
  secondary: string;
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
export type LightsparkTheme = BaseTheme & LightsparkSurfaces;

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

const lightBaseTheme: BaseTheme = {
  type: Themes.Light,
  app: App.Lightspark,
  bg: colors.white,
  smBg: colors.white,
  c05Neutral: colors.gray95,
  c1Neutral: colors.gray90,
  c15Neutral: colors.gray85,
  c2Neutral: colors.gray80,
  c3Neutral: colors.gray70,
  c4Neutral: colors.gray60,
  c5Neutral: colors.gray50,
  c6Neutral: colors.gray40,
  c7Neutral: colors.gray30,
  c8Neutral: colors.gray20,
  c9Neutral: colors.gray10,
  danger: colors.danger,
  hcNeutral: colors.black,
  hcNeutralFromBg: (bgHex) =>
    hcNeutralFromBg(bgHex, colors.black, colors.white),
  info: colors.blue43,
  lcNeutral: colors.gray80,
  link: colors.blue43,
  mcNeutral: colors.gray40,
  onInfoText: colors.white,
  onPrimaryText: colors.black,
  onSuccessText: colors.white,
  primary: colors.primary,
  secondary: colors.secondary,
  success: colors.success,
  text: colors.black,
  typography: getTypography(),
  vlcNeutral: colors.gray95,
  warning: colors.warning,
};

const darkBaseTheme: BaseTheme = {
  type: Themes.Dark,
  app: App.Lightspark,
  bg: colors.black,
  smBg: colors.black,
  c05Neutral: colors.gray5,
  c1Neutral: colors.gray10,
  c15Neutral: colors.gray15,
  c2Neutral: colors.gray20,
  c3Neutral: colors.gray30,
  c4Neutral: colors.gray40,
  c5Neutral: colors.gray50,
  c6Neutral: colors.gray60,
  c7Neutral: colors.gray70,
  c8Neutral: colors.gray80,
  c9Neutral: colors.gray90,
  danger: colors.danger,
  hcNeutral: colors.white,
  hcNeutralFromBg: (bgHex) =>
    hcNeutralFromBg(bgHex, colors.white, colors.black),
  info: colors.white,
  lcNeutral: colors.gray40,
  link: colors.blue43,
  mcNeutral: colors.gray60,
  onInfoText: colors.white,
  onPrimaryText: colors.black,
  onSuccessText: colors.white,
  primary: colors.primary,
  secondary: colors.secondary,
  success: colors.success,
  text: colors.white,
  typography: getTypography(),
  vlcNeutral: colors.gray20,
  warning: colors.warning,
};

const lightTheme = extend(lightBaseTheme, {
  header: extendBase(lightBaseTheme, {
    text: colors.gray60,
  }),
  nav: extendBase(lightBaseTheme, {
    text: colors.gray10,
    secondary: colors.gray40,
  }),
  content: extendBase(lightBaseTheme, {
    bg: colors.white,
    smBg: colors.white,
  }),
  controls: extendBase(lightBaseTheme, {
    bg: colors.gray95,
    smBg: colors.gray95,
    text: colors.gray60,
    secondary: colors.secondary,
  }),
});

const darkTheme = extend(darkBaseTheme, {
  header: extendBase(darkBaseTheme, {}),
  nav: extendBase(darkBaseTheme, {}),
  content: extendBase(darkBaseTheme, {}),
  controls: extendBase(darkBaseTheme, {
    bg: colors.gray40,
    smBg: colors.gray40,
    text: colors.white,
    secondary: colors.secondary,
  }),
});

const umaLightTheme = extend(lightTheme, {
  app: App.UmaDocs,
  bg: colors.gray98,
  smBg: colors.gray98,
  secondary: colors.grayBlue43,
  text: colors.grayBlue9,
  link: colors.blue39,
  content: extendBase(lightBaseTheme, {
    bg: colors.gray98,
    smBg: colors.gray98,
    text: colors.grayBlue9,
    secondary: colors.grayBlue43,
  }),
  controls: extendBase(lightBaseTheme, {
    text: colors.grayBlue9,
    secondary: colors.grayBlue43,
    bg: colors.grayBlue94,
  }),
});

/** Allows setting typography in cases where a custom font is needed.
 * Setting custom fonts should only be necessary for next fonts. */
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
export type WithTheme<T extends Record<string, unknown>> = T & ThemeProp;
