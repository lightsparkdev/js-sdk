import type { CSSInterpolation } from "@emotion/css";
import type { Theme } from "@emotion/react";
import { css, useTheme } from "@emotion/react";
import merge from "deepmerge";
import { Breakpoints, useBreakpoints } from "./breakpoints.js";
import { buttonsThemeBase, defaultButtonsTheme } from "./buttons.js";
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

const baseThemeColors = {
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
  vlcNeutral: colors.gray95,
  warning: colors.warning,
};
type ThemeColorKey = keyof typeof baseThemeColors;
export const themeOrColorKeyValues = [
  ...Object.keys(baseThemeColors),
  ...Object.keys(colors),
] as const;

export type SurfaceThemeColorKey = [keyof LightsparkSurfaces, ThemeColorKey];
export type ThemeOrColorKey = ThemeColorKey | ColorKey | SurfaceThemeColorKey; // to select a sub-surface color

const baseTheme = {
  ...baseThemeColors,
  // base type should be Themes but default to Light
  type: Themes.Light as Themes,
  typography: getTypography(TypographyGroup.Lightspark),
  hcNeutralFromBg: (bgHex: string) =>
    hcNeutralFromBg(bgHex, colors.black, colors.white),
  buttons: defaultButtonsTheme,
};

type BaseTheme = typeof baseTheme;

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
  buttons: defaultButtonsTheme,
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
  typography: getTypography(TypographyGroup.UmameDocs, {
    main: "Manrope",
    code: "Monaco",
  }),
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

const umameDocsDarkTheme = extend(darkTheme, {
  type: Themes.UmameDocsDark,
  bg: colors.gray98,
  smBg: colors.gray98,
  secondary: colors.grayBlue43,
  text: colors.grayBlue9,
  link: colors.blue39,
  typography: getTypography(TypographyGroup.UmameDocs, {
    main: "Manrope",
    code: "Monaco",
  }),
});

const lightsparkDocsLightTheme = extend(lightTheme, {
  type: Themes.LightsparkDocsLight,
  typography: getTypography(TypographyGroup.LightsparkDocs),
});

const lightsparkDocsDarkTheme = extend(darkTheme, {
  type: Themes.LightsparkDocsDark,
  typography: getTypography(TypographyGroup.LightsparkDocs),
});

const bridgeBaseSettings = {
  secondary: colors.grayBlue43,
  mcNeutral: colors.grayBlue43,
  typography: getTypography(TypographyGroup.Bridge, {
    main: "Manrope",
    code: "Monaco",
  }),
  buttons: merge<typeof buttonsThemeBase>(buttonsThemeBase, {
    defaultTypography: "Title",
    defaultSize: "Medium",
    defaultBorderRadius: 8,
    defaultBorderWidth: 0,
    kinds: {
      primary: {
        defaultBackgroundColor: "blue39",
        defaultHoverBackgroundColor: "blue37",
      },
      secondary: {
        defaultBackgroundColor: "transparent",
        defaultHoverBackgroundColor: "grayBlue94",
        defaultBorderColor: "grayBlue80",
        defaultBorderWidth: 1,
      },
    },
  }),
};

const bridgeLightTheme = extend(lightTheme, {
  ...bridgeBaseSettings,
  type: Themes.BridgeLight,
  bg: colors.gray98,
  smBg: colors.gray98,
  text: colors.grayBlue9,
  secondary: colors.grayBlue43,
});

const bridgeDarkTheme = extend(darkTheme, {
  ...bridgeBaseSettings,
  type: Themes.BridgeDark,
});

export const themes = {
  [Themes.Light]: lightTheme,
  [Themes.Dark]: darkTheme,
  [Themes.LightsparkDocsLight]: lightsparkDocsLightTheme,
  [Themes.LightsparkDocsDark]: lightsparkDocsDarkTheme,
  [Themes.UmameDocsLight]: umameDocsLightTheme,
  [Themes.UmameDocsDark]: umameDocsDarkTheme,
  [Themes.BridgeLight]: bridgeLightTheme,
  [Themes.BridgeDark]: bridgeDarkTheme,
} as const;

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
  } as LightsparkTheme;
}

/* Next has generated font names so we need to update them at runtime: */
export function setFonts(theme: Theme, fontFamilies: FontFamilies) {
  return {
    ...theme,
    typography: getTypography(theme.typography.group, fontFamilies),
  };
}

export function isThemeColorKey(key: unknown): key is ThemeColorKey {
  return Boolean(key && typeof key === "string" && key in baseThemeColors);
}

export function isThemeOrColorKey(key: unknown): key is ThemeOrColorKey {
  return Boolean(
    typeof key === "string" &&
      (isThemeColorKey(key) ||
        isColorKey(key) ||
        (Array.isArray(key) && key.length === 2 && isThemeColorKey(key[1]))),
  );
}

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

export type FontColorKey = ThemeOrColorKey | "inherit";

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

export type BackgroundColorKey = ThemeOrColorKey | "transparent";
export type BackgroundColorKeyArg =
  | BackgroundColorKey
  | [BackgroundColorKey, BackgroundColorKey];

export function isBackgroundColorKey(key: unknown): key is BackgroundColorKey {
  return key === "transparent" || isThemeOrColorKey(key);
}

export function isBackgroundColorKeyTuple(
  key: unknown,
): key is [BackgroundColorKey, BackgroundColorKey] {
  return (
    Array.isArray(key) &&
    key.length === 2 &&
    isBackgroundColorKey(key[0]) &&
    isBackgroundColorKey(key[1])
  );
}

export function getBackgroundColor(
  theme: LightsparkTheme,
  key?: BackgroundColorKeyArg | undefined,
  defaultColor: BackgroundColorKeyArg = "transparent",
) {
  if (isBackgroundColorKeyTuple(key)) {
    key = isLight(theme) ? key[0] : key[1];
  }
  if (isBackgroundColorKeyTuple(defaultColor)) {
    defaultColor = isLight(theme) ? defaultColor[0] : defaultColor[1];
  }

  if (key === "transparent") {
    return "transparent";
  } else if (!key) {
    if (defaultColor === "transparent") {
      return "transparent";
    }
    return getColor(theme, defaultColor);
  }
  return getColor(theme, key);
}

export const isDark = (theme: Theme) =>
  [
    Themes.Dark,
    Themes.BridgeDark,
    Themes.LightsparkDocsDark,
    Themes.UmameDocsDark,
  ].includes(theme.type);
export const isLight = (theme: Theme) =>
  [
    Themes.Light,
    Themes.BridgeLight,
    Themes.LightsparkDocsLight,
    Themes.UmameDocsLight,
  ].includes(theme.type);
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
