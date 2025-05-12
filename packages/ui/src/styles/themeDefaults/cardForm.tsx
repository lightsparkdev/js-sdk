import type { ThemeOrColorKey } from "../themes.js";
import type { TokenSizeKey, TypographyTypeKey } from "../tokens/typography.js";

export type CardFormContentMarginTop = 0 | 32;
export type CardFormPaddingY = 40 | 56;
export type CardFormPaddingX = 0 | 32 | 40 | 56;
export type CardFormPaddingTop = 0 | 24 | 32 | 40 | 56;
export type CardFormPaddingBottom = 0 | 24 | 32 | 40 | 56 | 64;
export type CardFormBorderWidth = 0 | 1;
export type CardFormBorderRadius = 8 | 24 | 32;
export type CardFormShadow = "soft" | "hard" | "none";
export type CardFormTextAlign = "center" | "left";
export type CardFormBorderColor = "vlcNeutral" | "grayBlue94";
export type CardFormBackgroundColor = "bg" | "white";

const cardFormThemeBaseProps = {
  contentMarginTop: 32 as CardFormContentMarginTop,
  paddingX: 56 as CardFormPaddingX,
  paddingTop: 56 as CardFormPaddingTop,
  paddingBottom: 56 as CardFormPaddingBottom,
  shadow: "soft" as CardFormShadow,
  borderRadius: 24 as CardFormBorderRadius,
  borderWidth: 0 as CardFormBorderWidth,
  borderColor: "vlcNeutral" as CardFormBorderColor,
  textAlign: "left" as CardFormTextAlign,
  backgroundColor: "bg" as CardFormBackgroundColor,
  smBackgroundColor: "bg" as CardFormBackgroundColor,
  smBorderWidth: 0 as CardFormBorderWidth,
  defaultDescriptionTypographyMap: {
    default: {
      type: "Body Strong" as TypographyTypeKey,
      size: "Small" as TokenSizeKey,
      color: "mcNeutral" as ThemeOrColorKey,
    },
    link: {
      type: "Body Strong" as TypographyTypeKey,
      size: "Small" as TokenSizeKey,
      color: "text" as ThemeOrColorKey,
    },
  },
} as const;

export const cardFormThemeBase = {
  ...cardFormThemeBaseProps,
  kinds: {
    primary: {},
    secondary: {},
    tertiary: {},
  },
};

export type CardFormThemeKey = keyof typeof cardFormThemeBaseProps;

export type CardFormKind = keyof (typeof cardFormThemeBase)["kinds"];
type CardFormKindProps = Record<
  CardFormKind,
  Partial<typeof cardFormThemeBaseProps>
>;

export const defaultCardFormTheme = {
  ...cardFormThemeBaseProps,
  kinds: {
    primary: {},
    secondary: {
      paddingTop: 40,
      paddingBottom: 40,
      paddingX: 40,
      shadow: "none",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "vlcNeutral",
    },
    tertiary: {
      paddingTop: 56,
      paddingBottom: 56,
      paddingX: 40,
      shadow: "hard",
    },
  } as Partial<CardFormKindProps>,
};
