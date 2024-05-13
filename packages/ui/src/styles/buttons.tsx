/* type outside bracket is needed to pass madge for some reason: */
import type { BackgroundColorKeyArg } from "./themes.js";
import { type TokenSizeKey } from "./tokens/typography.js";

export type PaddingYKey = "short" | "regular";
export type PaddingY = number | { [key in PaddingYKey]: number };

export const buttonBorderRadiuses = [8, 32] as const;
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

export const buttonsThemeBase = {
  defaultSize: "Small" as TokenSizeKey,
  defaultTypography: "Body Strong" as AllowedButtonTypographyTypes,
  defaultBorderRadius: 32 as ButtonBorderRadius,
  defaultBorderWidth: 1,
  defaultBackgroundColor: "bg" as BackgroundColorKeyArg,
  defaultBorderColor: "bg" as BackgroundColorKeyArg,
  defaultHoverBackgroundColor: "bg" as BackgroundColorKeyArg,
  defaultHoverBorderColor: "bg" as BackgroundColorKeyArg,
  defaultPaddingsY: {
    ExtraSmall: 4,
    Small: {
      short: 8,
      regular: 12,
    } as PaddingY,
    Schmedium: 12,
    Medium: 12,
    Mlarge: 12,
    Large: 12,
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
      defaultBorderWidth: 0,
      defaultBackgroundColor: "c9Neutral",
      defaultBorderColor: "c9Neutral",
      defaultHoverBackgroundColor: "c8Neutral",
      defaultHoverBorderColor: "c8Neutral",
    },
    ghost: {
      defaultBackgroundColor: "transparent",
      defaultBorderWidth: 0,
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
    secondary: {
      defaultBackgroundColor: ["bg", "c1Neutral"],
      defaultBorderColor: ["gray90", "gray20"],
      defaultHoverBackgroundColor: ["bg", "c1Neutral"],
      defaultHoverBorderColor: ["gray90", "gray20"],
    },
    blue39: {
      defaultBorderColor: "blue39",
    },
  } as ButtonKindsProps,
};
