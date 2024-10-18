/* type outside bracket is needed to pass madge for some reason: */
import type { BackgroundColorKeyArg, ThemeOrColorKey } from "../themes.js";
import { type TokenSizeKey } from "../tokens/typography.js";

export type PaddingYKey = "short" | "regular";
export type PaddingY = number | { [key in PaddingYKey]: number };

export const buttonBorderRadiuses = [8, 32, 999] as const;
export type ButtonBorderRadius = (typeof buttonBorderRadiuses)[number];
export const allowedButtonTypographyTypes = [
  "Body",
  "Body Strong",
  "Title",
  "Label",
  "Label Moderate",
  "Label Strong",
] as const;
export type AllowedButtonTypographyTypes =
  (typeof allowedButtonTypographyTypes)[number];

export type ButtonTypographyArgs = {
  type?: AllowedButtonTypographyTypes;
  color?: ThemeOrColorKey;
};

export const buttonsThemeBase = {
  defaultSize: "Small" as TokenSizeKey,
  defaultTypographyType: "Body Strong" as AllowedButtonTypographyTypes,
  defaultColor: "text" as ThemeOrColorKey,
  defaultBorderRadius: 32 as ButtonBorderRadius,
  defaultBackgroundColor: "bg" as BackgroundColorKeyArg,
  defaultBorderColor: "bg" as BackgroundColorKeyArg,
  defaultHoverBackgroundColor: "bg" as BackgroundColorKeyArg,
  defaultHoverBorderColor: "bg" as BackgroundColorKeyArg,
  defaultActiveBackgroundColor: "bg" as BackgroundColorKeyArg,
  defaultActiveBorderColor: "bg" as BackgroundColorKeyArg,
  defaultOutlineOffset: 1,
  defaultPaddingsY: {
    ExtraSmall: 4 as PaddingY,
    Small: {
      short: 8,
      regular: 12,
    } as PaddingY,
    Schmedium: 12 as PaddingY,
    Medium: 12 as PaddingY,
    Mlarge: 12 as PaddingY,
    Large: 12 as PaddingY,
  },
  kinds: {},
};
export type ButtonsThemeKey = keyof typeof buttonsThemeBase;

type ButtonKindsProps = Record<string, Partial<typeof buttonsThemeBase>>;

/* Themes can selectively override properties per button kind. Undefined
   properties will fallback to the theme default. These base kinds mirror
   how button styles were behaving previously but themes can override these: */
export const defaultButtonsTheme = {
  ...buttonsThemeBase,
  kinds: {
    primary: {
      defaultColor: "bg",
      defaultBackgroundColor: "c9Neutral",
      defaultBorderColor: "c9Neutral",
      defaultHoverBackgroundColor: "c8Neutral",
      defaultHoverBorderColor: "c8Neutral",
      defaultActiveBackgroundColor: "c7Neutral",
      defaultActiveBorderColor: "c7Neutral",
    },
    ghost: {
      defaultBackgroundColor: "transparent",
      defaultHoverBackgroundColor: "transparent",
      defaultHoverBorderColor: "transparent",
      defaultPaddingsY: {
        ExtraSmall: 0,
        Small: 0,
        Schmedium: 0,
        Medium: 0,
        Mlarge: 0,
        Large: 0,
      },
    },
    transparent: {
      defaultBackgroundColor: "transparent",
      defaultBorderColor: "transparent",
      defaultHoverBackgroundColor: "transparenta02",
      defaultHoverBorderColor: "transparent",
      defaultActiveBackgroundColor: "transparenta08",
      defaultActiveBorderColor: "transparent",
    },
    secondary: {
      defaultBackgroundColor: "bg",
      defaultBorderColor: "gray90",
      defaultHoverBackgroundColor: "bg",
      defaultHoverBorderColor: "gray85",
      defaultActiveBackgroundColor: "bg",
      defaultActiveBorderColor: "gray80",
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
    tertiary: {
      defaultColor: "bg",
      defaultBackgroundColor: "grayBlue9",
      defaultHoverBackgroundColor: "grayBlue12",
      defaultActiveBackgroundColor: "grayBlue14",
    },
    blue39: {
      defaultBorderColor: "blue39",
      defaultColor: "gray98",
    },
    blue43: {
      defaultColor: "white",
    },
    green33: {
      defaultColor: "white",
    },
    purple55: {
      defaultColor: "white",
    },
    danger: {
      defaultColor: "white",
    },
  } as ButtonKindsProps,
};
