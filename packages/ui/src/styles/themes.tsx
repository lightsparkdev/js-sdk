import type { CSSInterpolation } from "@emotion/css";
import type { Theme } from "@emotion/react";
import { css, useTheme } from "@emotion/react";
import { omit } from "lodash-es";
import { Breakpoints, useBreakpoints } from "./breakpoints.js";
import {
  colors,
  darkGradient,
  hcNeutralFromBg,
  isColorKey,
  type ColorKey,
} from "./colors.js";
import {
  TypographyGroup,
  getTypography,
  type FontFamilies,
} from "./tokens/typography.js";

export enum Themes {
  Light = "light",
  Dark = "dark",
  LightsparkDocsLight = "lightsparkDocsLight",
  LightsparkDocsDark = "lightsparkDocsDark",
  UmameDocsLight = "umameDocsLight",
  UmameDocsDark = "umameDocsDark",
  BridgeLight = "bridgeLight",
  BridgeDark = "bridgeDark",
}

const baseTheme = {
  // base type should be Themes but default to Light
  type: Themes.Light as Themes,
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
  hcNeutralFromBg: (bgHex: string) =>
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
  typography: getTypography(TypographyGroup.Lightspark),
  vlcNeutral: colors.gray95,
  warning: colors.warning,
};

type BaseTheme = typeof baseTheme;

const baseThemeColors = omit(baseTheme, [
  "type",
  "typography",
  "hcNeutralFromBg",
]);
type ThemeColorKey = keyof typeof baseThemeColors;

export function isThemeColorKey(key: unknown): key is ThemeColorKey {
  return Boolean(key && typeof key === "string" && key in baseThemeColors);
}

export type SurfaceThemeColorKey = [keyof LightsparkSurfaces, ThemeColorKey];

export type ThemeOrColorKey = ThemeColorKey | ColorKey | SurfaceThemeColorKey; // to select a sub-surface color
export type FontColorKey = ThemeOrColorKey | "inherit";

export function getColor(
  theme: LightsparkTheme,
  key?: ThemeOrColorKey | undefined,
) {
  if (key && isThemeColorKey(key)) {
    return theme[key];
  } else if (key && Array.isArray(key)) {
    const [surface, colorKey] = key;
    const surfaceTheme = theme[surface];
    const color = surfaceTheme[colorKey];
    return color;
  } else if (key && isColorKey(key)) {
    return colors[key];
  }
  return theme.text;
}

export function getFontColor(
  theme: LightsparkTheme,
  key?: FontColorKey | undefined,
  defaultColor: ThemeColorKey | "inherit" = "inherit",
) {
  if (key === "inherit" || (!key && defaultColor === "inherit")) {
    return "inherit";
  }
  return getColor(theme, key);
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

const lightBaseTheme: BaseTheme = baseTheme;

const darkBaseTheme: BaseTheme = {
  type: Themes.Dark,
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
  typography: getTypography(TypographyGroup.Lightspark),
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

const umameDocsLightTheme = extend(lightTheme, {
  type: Themes.UmameDocsLight,
  bg: colors.gray98,
  smBg: colors.gray98,
  secondary: colors.grayBlue43,
  text: colors.grayBlue9,
  link: colors.blue39,
  typography: getTypography(TypographyGroup.UmameDocs),
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

const lightsparkDocsLightTheme = extend(lightTheme, {
  type: Themes.BridgeLight,
  typography: getTypography(TypographyGroup.Bridge),
});

const lightsparkDocsDarkTheme = extend(darkTheme, {
  type: Themes.BridgeDark,
  typography: getTypography(TypographyGroup.Bridge),
});

const bridgeLightTheme = extend(lightTheme, {
  type: Themes.BridgeLight,
  typography: getTypography(TypographyGroup.Bridge),
  bg: colors.gray98,
  text: colors.grayBlue9,
  secondary: colors.grayBlue43,
});

const bridgeDarkTheme = extend(darkTheme, {
  type: Themes.BridgeDark,
  typography: getTypography(TypographyGroup.Bridge),
});

export const themes = {
  [Themes.Light]: lightTheme,
  [Themes.Dark]: darkTheme,
  [Themes.LightsparkDocsLight]: lightsparkDocsLightTheme,
  [Themes.LightsparkDocsDark]: lightsparkDocsDarkTheme,
  [Themes.UmameDocsLight]: umameDocsLightTheme,
  [Themes.UmameDocsDark]: umameDocsLightTheme,
  [Themes.BridgeLight]: bridgeLightTheme,
  [Themes.BridgeDark]: bridgeDarkTheme,
} as const;

/* Next has generated font names so we need to update them at runtime: */
export function setFonts(theme: Theme, fontFamilies: FontFamilies) {
  return {
    ...theme,
    typography: getTypography(theme.typography.group, fontFamilies),
  };
}

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
