import type { CSSInterpolation } from "@emotion/css";
import type { Theme } from "@emotion/react";
import { css, useTheme } from "@emotion/react";
import merge from "deepmerge";
import { Breakpoints, useBreakpoints } from "./breakpoints.js";
import {
  colors,
  darkGradient,
  hcNeutralFromBg,
  isColorKey,
  type ColorKey,
} from "./colors.js";
import {
  buttonsThemeBase,
  defaultButtonsTheme,
} from "./themeDefaults/buttons.js";
import {
  cardFormThemeBase,
  defaultCardFormTheme,
} from "./themeDefaults/cardForm.js";
import {
  defaultLoadingTheme,
  loadingThemeBase,
} from "./themeDefaults/loading.js";
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
  UmaAuthSdkLight = "umaAuthSdkLight",
  UmaAuthSdkDark = "umaAuthSdkDark",
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
  c25Neutral: colors.gray75,
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
  linkLight: "#0068C90F",
  mcNeutral: colors.gray40,
  onInfoText: colors.white,
  onPrimaryText: colors.black,
  onSuccessText: colors.white,
  primary: colors.primary,
  secondary: colors.secondary,
  tertiary: colors.black,
  success: colors.success,
  text: colors.black,
  vlcNeutral: colors.gray95,
  warning: colors.warning,
  transparent: colors.transparent,
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
  loading: defaultLoadingTheme,
  cardForm: defaultCardFormTheme,
  badge: {
    bg: "c05Neutral" as ThemeOrColorKey,
  },
  inputBackground: colors.white,
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
  c25Neutral: colors.gray25,
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
  linkLight: "#0068C90F",
  mcNeutral: colors.gray60,
  onInfoText: colors.white,
  onPrimaryText: colors.black,
  onSuccessText: colors.white,
  primary: colors.primary,
  secondary: colors.secondary,
  tertiary: colors.white,
  success: colors.success,
  text: colors.white,
  typography: getTypography(TypographyGroup.Lightspark),
  vlcNeutral: colors.gray20,
  warning: colors.warning,
  transparent: colors.transparent,

  buttons: defaultButtonsTheme,
  loading: defaultLoadingTheme,
  cardForm: defaultCardFormTheme,
  inputBackground: colors.black,
  badge: {
    bg: "c15Neutral",
  },
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

const umaAuthSdkLightTheme = extend(lightTheme, {
  type: Themes.UmaAuthSdkLight,
  bg: colors.gray98,
  smBg: colors.gray98,
  secondary: colors.grayBlue43,
  tertiary: colors.grayBlue9,
  warning: "#F7E3E3",
  danger: "#E31A1A",
  text: colors.grayBlue9,
  link: colors.blue39,
  linkLight: "#0068C90F",
  inputBackground: colors.white,
  typography: getTypography(TypographyGroup.UmaAuthSdk, {
    main: "Inter",
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
  buttons: merge<typeof buttonsThemeBase>(buttonsThemeBase, {
    defaultTypographyType: "Title",
    defaultSize: "Medium",
    defaultBorderRadius: 999,
    defaultPaddingsY: {
      ExtraSmall: 16,
      Small: 16,
      Schmedium: 16,
      Medium: 16,
      Mlarge: 16,
      Large: 16,
    },
    kinds: {
      primary: {
        defaultColor: "bg",
        defaultBorderColor: "blue39",
        defaultBackgroundColor: "blue39",
        defaultHoverBackgroundColor: "blue37",
        defaultHoverBorderColor: "blue37",
        defaultActiveBackgroundColor: "blue22",
        defaultActiveBorderColor: "blue22",
      },
      ghost: {
        defaultColor: "secondary",
        defaultBackgroundColor: "transparent",
        defaultHoverBackgroundColor: "transparent",
        defaultHoverBorderColor: "transparent",
      },
      secondary: {
        defaultBackgroundColor: "grayBlue94",
        defaultBorderColor: "grayBlue94",
        defaultHoverBackgroundColor: "grayBlue88",
        defaultHoverBorderColor: "grayBlue88",
        defaultActiveBackgroundColor: "grayBlue57",
        defaultActiveBorderColor: "grayBlue57",
      },
      tertiary: {
        defaultColor: "bg",
        defaultBackgroundColor: "grayBlue9",
        defaultHoverBackgroundColor: "grayBlue12",
        defaultActiveBackgroundColor: "grayBlue14",
      },
      transparent: {
        defaultBackgroundColor: "transparent",
        defaultBorderColor: "transparent",
        defaultHoverBackgroundColor: "transparenta02",
        defaultHoverBorderColor: "transparent",
        defaultActiveBackgroundColor: "transparenta08",
        defaultActiveBorderColor: "transparent",
      },
      linkLight: {
        defaultColor: "link",
        defaultBackgroundColor: "linkLight",
        defaultBorderColor: "transparent",
        defaultHoverBackgroundColor: "grayBlue93",
        defaultHoverBorderColor: "grayBlue93",
        defaultActiveBackgroundColor: "grayBlue92",
        defaultActiveBorderColor: "grayBlue92",
      },
      warning: {
        defaultColor: "danger",
        defaultBackgroundColor: "red42a10",
        defaultBorderColor: "transparent",
        defaultHoverBackgroundColor: "red42a20",
        defaultHoverBorderColor: "transparent",
        defaultActiveBackgroundColor: "red42a30",
        defaultActiveBorderColor: "transparent",
      },
      danger: {
        defaultColor: "white",
      },
    },
  }),
});

const umaAuthSdkDarkTheme = extend(darkTheme, {
  type: Themes.UmaAuthSdkDark,
  bg: colors.gray5,
  smBg: colors.gray5,
  secondary: colors.grayBlue57,
  tertiary: colors.gray98,
  text: colors.gray98,
  link: colors.blue39,
  inputBackground: colors.gray5,
  typography: getTypography(TypographyGroup.UmaAuthSdk, {
    main: "Inter",
    code: "Monaco",
  }),
  content: extendBase(lightBaseTheme, {
    bg: colors.gray5,
    smBg: colors.gray5,
    text: colors.grayBlue94,
    secondary: colors.grayBlue43,
  }),
  controls: extendBase(lightBaseTheme, {
    text: colors.grayBlue94,
    secondary: colors.grayBlue43,
    bg: colors.grayBlue9,
  }),
  buttons: merge<typeof buttonsThemeBase>(buttonsThemeBase, {
    defaultTypographyType: "Title",
    defaultSize: "Medium",
    defaultBorderRadius: 999,
    defaultPaddingsY: {
      ExtraSmall: 16,
      Small: 16,
      Schmedium: 16,
      Medium: 16,
      Mlarge: 16,
      Large: 16,
    },
    kinds: {
      primary: {
        defaultColor: "bg",
        defaultBackgroundColor: "blue39",
        defaultHoverBackgroundColor: "blue37",
      },
      ghost: {
        defaultColor: "secondary",
        defaultBackgroundColor: "transparent",
        defaultHoverBackgroundColor: "transparent",
        defaultHoverBorderColor: "transparent",
      },
      secondary: {
        defaultBackgroundColor: "grayBlue80",
        defaultHoverBackgroundColor: "grayBlue94",
        defaultBorderColor: "grayBlue80",
      },
      tertiary: {
        defaultColor: "bg",
        defaultHoverBackgroundColor: "grayBlue80",
      },
      transparent: {
        defaultBackgroundColor: "transparent",
        defaultBorderColor: "transparent",
        defaultHoverBackgroundColor: "grayBlue94",
        defaultHoverBorderColor: "transparent",
      },
      linkLight: {
        defaultColor: "link",
        defaultBackgroundColor: "linkLight",
        defaultBorderColor: "transparent",
        defaultHoverBackgroundColor: "linkLight",
        defaultHoverBorderColor: "transparent",
      },
      warning: {
        defaultColor: "danger",
        defaultBackgroundColor: "warning",
        defaultBorderColor: "transparent",
        defaultHoverBackgroundColor: "warning",
        defaultHoverBorderColor: "transparent",
      },
    },
  }),
});

const umameDocsLightTheme = extend(lightTheme, {
  type: Themes.UmameDocsLight,
  bg: colors.gray98,
  smBg: colors.gray98,
  secondary: colors.grayBlue43,
  text: colors.grayBlue9,
  link: colors.blue39,
  inputBackground: colors.white,
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
  success: colors.green35,
  link: colors.blue39,
  typography: getTypography(TypographyGroup.Bridge, {
    main: "Manrope",
    code: "Monaco",
  }),
  buttons: merge<typeof buttonsThemeBase>(buttonsThemeBase, {
    defaultTypographyType: "Title",
    defaultSize: "Medium",
    defaultBorderRadius: 8,
    defaultPaddingsY: {
      ExtraSmall: 14,
      Small: 14,
      Schmedium: 14,
      Medium: 14,
      Mlarge: 14,
      Large: 14,
    },
    kinds: {
      primary: {
        defaultColor: "bg",
        defaultBackgroundColor: "blue39",
        defaultBorderColor: "blue39",
        defaultHoverBackgroundColor: "blue37",
      },
      ghost: {
        defaultColor: "secondary",
        defaultBackgroundColor: "transparent",
        defaultHoverBackgroundColor: "transparent",
        defaultHoverBorderColor: "transparent",
      },
      secondary: {
        defaultBackgroundColor: "transparent",
        defaultHoverBackgroundColor: "grayBlue94",
        defaultBorderColor: "grayBlue80",
      },
    },
  }),
  loading: merge<typeof loadingThemeBase>(loadingThemeBase, {
    defaultIconName: "UmaBridgeLoading",
    kinds: {
      primary: {
        defaultIconName: "UmaBridgeLoading",
      },
      secondary: {
        defaultIconName: "UmaBridgeLoadingTransparent",
      },
    },
  }),
  cardForm: merge<typeof defaultCardFormTheme>(cardFormThemeBase, {
    backgroundColor: "white",
    smBackgroundColor: "bg",
    defaultDescriptionTypographyMap: {
      default: {
        type: "Body",
        size: "Large",
        color: "secondary",
      },
      link: {
        type: "Body",
        size: "Large",
        color: "text",
      },
    },
    kinds: {
      primary: {
        paddingY: 56,
        paddingX: 40,
        shadow: "hard",
      },
      secondary: {
        borderWidth: 1,
        smBorderWidth: 0,
        borderColor: "grayBlue94",
        paddingY: 40,
        paddingX: 40,
        shadow: "none",
      },
    },
  }),
  badge: {
    bg: "grayBlue94",
  } as const,
};

const bridgeLightTheme = extend(lightTheme, {
  ...bridgeBaseSettings,
  type: Themes.BridgeLight,
  bg: colors.gray98,
  smBg: colors.gray98,
  text: colors.grayBlue9,
  secondary: colors.grayBlue43,
  inputBackground: colors.white,
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
  [Themes.UmaAuthSdkLight]: umaAuthSdkLightTheme,
  [Themes.UmaAuthSdkDark]: umaAuthSdkDarkTheme,
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
    Themes.UmaAuthSdkDark,
  ].includes(theme.type);
export const isLight = (theme: Theme) =>
  [
    Themes.Light,
    Themes.BridgeLight,
    Themes.LightsparkDocsLight,
    Themes.UmameDocsLight,
    Themes.UmaAuthSdkLight,
  ].includes(theme.type);

export const themeOr =
  (lightValue: string, darkValue: string) =>
  ({ theme }: { theme: Theme }) => {
    return isLight(theme) ? lightValue : darkValue;
  };

export const themeOrWithKey =
  (lightValue: ThemeOrColorKey, darkValue: ThemeOrColorKey) =>
  ({ theme }: { theme: Theme }) => {
    if (isLight(theme)) {
      return getColor(theme, lightValue);
    }
    return getColor(theme, darkValue);
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
