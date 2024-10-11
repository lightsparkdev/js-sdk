import type { ThemeOrColorKey } from "../themes.js";
import type { TokenSizeKey, TypographyTypeKey } from "../tokens/typography.js";

export type CardFormPaddingY = 40 | 56;
export type CardFormPaddingX = 40 | 56;
export type CardFormBorderWidth = 0 | 1;
export type CardFormBorderRadius = 8 | 24;
export type CardFormShadow = "soft" | "hard" | "none";
export type CardFormTextAlign = "center" | "left";
export type CardFormBorderColor = "vlcNeutral" | "grayBlue94";
export type CardFormBackgroundColor = "bg" | "white";

const cardFormThemeBaseProps = {
  paddingY: 56 as CardFormPaddingY,
  paddingX: 56 as CardFormPaddingX,
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
      paddingY: 40,
      paddingX: 40,
      shadow: "none",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "vlcNeutral",
    },
    tertiary: { paddingY: 56, paddingX: 40, shadow: "hard" },
  } as Partial<CardFormKindProps>,
};
