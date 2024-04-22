import { type Theme } from "@emotion/react";
import { bp } from "../breakpoints.js";

export enum TypographyGroup {
  Lightspark = "Lightspark",
  UmameDocs = "UmameDocs",
  Bridge = "Bridge",
}

export type TypographyTokenGroups = ReturnType<typeof getTypography>;

const FONT_FAMILIES = {
  main: "Montserrat",
  code: "Monaco",
};

const LINE_HEIGHTS = {
  [TypographyGroup.Lightspark]: {
    "7xl": "72px",
    "6xl": "60px",
    "5xl": "44px",
    "4xl": "40px",
    "3xl": "36px",
    "2xl": "32px",
    xl: "28px",
    lg: "24px",
    md: "20px",
    sm: "18px",
    xs: "16px",
    "2xs": "14px",
  },
  [TypographyGroup.UmameDocs]: {
    "5xl": "72px",
    "4xl": "60px",
    "3xl": "44px",
    "2xl": "40px",
    xl: "36px",
    lg: "32px",
    md: "28px",
    sm: "24px",
    xs: "20px",
    "2xs": "16px",
  },
  [TypographyGroup.Bridge]: {
    "3xl": "48px",
    "2xl": "32px",
    xl: "24px",
    lg: "22px",
    md: "20px",
    sm: "18px",
    xs: "16px",
    "2xs": "14px",
  },
};

const FONT_WEIGHTS = {
  main: {
    Bold: 700,
    SemiBold: 600,
    Medium: 500,
  },
  code: {
    Bold: 700,
    Regular: 400,
  },
};

const FONT_SIZE = {
  [TypographyGroup.Lightspark]: {
    "2xs": "10px",
    xs: "12px",
    sm: "14px",
    md: "16px",
    lg: "20px",
    xl: "24px",
    "2xl": "28px",
    "3xl": "32px",
    "4xl": "36px",
    "5xl": "48px",
    "6xl": "64px",
  },
  [TypographyGroup.UmameDocs]: {
    "2xs": "11px",
    xs: "12px",
    sm: "14px",
    md: "16px",
    lg: "20px",
    xl: "24px",
    "2xl": "28px",
    "3xl": "32px",
    "4xl": "36px",
    "5xl": "48px",
    "6xl": "64px",
  },
  [TypographyGroup.Bridge]: {
    "2xs": "11px",
    xs: "12px",
    sm: "13px",
    md: "14px",
    lg: "15px",
    xl: "16px",
    "2xl": "18px",
    "3xl": "22px",
    "4xl": "24px",
    "5xl": "32px",
  },
};

const LETTER_SPACING = {
  [TypographyGroup.Lightspark]: {
    "tight-max": "-4%",
    "tight-high": "-3%",
    "tight-medium": "-2%",
    "tight-low": "-0.5%",
    normal: "0",
    "loose-max": "1.44px",
  },
  [TypographyGroup.UmameDocs]: {
    tight: "-.02em",
    normal: "0",
    loose: ".1em",
  },
  [TypographyGroup.Bridge]: {
    "tight-high": "-.04em",
    "tight-low": "-.02em",
    "tight-medium": "-.03em",
    normal: "0em",
  },
};

const TEXT_CASE = {
  none: "none",
  uppercase: "uppercase",
};

const TEXT_DECORATION = {
  none: "none",
};

const PARAGRAPH_INDENT = {
  0: "0px",
};

const PARAGRAPH_SPACING = {
  default: "default",
  0: "0",
  16: "16px",
  40: "40px",
};

export interface FontFamilies {
  main: string;
  code: string;
}

export const TokenSize = {
  Large: "Large",
  Mlarge: "Mlarge",
  Medium: "Medium",
  Schmedium: "Schmedium",
  Small: "Small",
  ExtraSmall: "ExtraSmall",
} as const;
export type TokenSizeKey = (typeof TokenSize)[keyof typeof TokenSize];

const TypographyType = {
  Display: "Display",
  Headline: "Headline",
  Title: "Title",
  Body: "Body",
  BodyStrong: "Body Strong",
  Label: "Label",
  LabelModerate: "Label Moderate",
  LabelStrong: "Label Strong",
  Overline: "Overline",
  Code: "Code",
  CodeStrong: "Code Strong",
} as const;
type TypographyTypeKey = (typeof TypographyType)[keyof typeof TypographyType];

type TypographyTokens = {
  fontFamily: string;
  fontWeight: string;
  lineHeight: string;
  fontSize: string;
  letterSpacing: string;
  paragraphSpacing: string;
  paragraphIndent: string;
  textCase: string;
  textDecoration: string;
};

type TypographyTypes = {
  [key in TypographyGroup]: {
    Mobile: {
      [key in TypographyTypeKey]?: {
        [key in TokenSizeKey]?: TypographyTokens;
      };
    };
    Desktop: {
      [key in TypographyTypeKey]?: {
        [key in TokenSizeKey]?: TypographyTokens;
      };
    };
  };
};

function getTypographyTypes(fontFamilies: FontFamilies): TypographyTypes {
  return {
    [TypographyGroup.Lightspark]: {
      Mobile: {
        [TypographyType.Display]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["7xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["6xl"]}`,
            letterSpacing: "-2.56px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["6xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["5xl"]}`,
            letterSpacing: "-1.92px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["5xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["4xl"]}`,
            letterSpacing: "-1.44px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Headline]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["4xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["3xl"]}`,
            letterSpacing: "-.96px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["3xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["2xl"]}`,
            letterSpacing: "-.84px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["2xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].xl}`,
            letterSpacing: "-.72px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Title]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xl}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].lg}`,
            letterSpacing: "-.4px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].md}`,
            letterSpacing: "-.32x",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: "-.28px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Body]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xl}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].lg}`,
            letterSpacing: "-.08px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].md}`,
            letterSpacing: "-.07px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: "-.06px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.BodyStrong]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xl}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].lg}`,
            letterSpacing: "-.08px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].md}`,
            letterSpacing: "-.07px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: "-.06px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Label]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: "-.07px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].xs}`,
            letterSpacing: "-.06px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["2xs"]}`,
            letterSpacing: "-.05px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.LabelModerate]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: "-.07px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].xs}`,
            letterSpacing: "-.06px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["2xs"]}`,
            letterSpacing: "-.05px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.LabelStrong]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: "-.07px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].xs}`,
            letterSpacing: "-.06px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["2xs"]}`,
            letterSpacing: "-.05px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Overline]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].md}`,
            letterSpacing: "1.92px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.uppercase}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: "1.68px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.uppercase}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].xs}`,
            letterSpacing: "1.44px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.uppercase}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Code]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Regular}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xl}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].lg}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Lightspark].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Regular}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Lightspark].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Regular}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Lightspark].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.CodeStrong]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Lightspark].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Lightspark].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Lightspark].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
      },
      Desktop: {
        [TypographyType.Display]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["7xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["6xl"]}`,
            letterSpacing: "-2.56px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["6xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["5xl"]}`,
            letterSpacing: "-1.92px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["5xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["4xl"]}`,
            letterSpacing: "-1.44px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Headline]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["4xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["3xl"]}`,
            letterSpacing: "-.96px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["3xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["2xl"]}`,
            letterSpacing: "-.84px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["2xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].xl}`,
            letterSpacing: "-.72px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Title]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xl}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].lg}`,
            letterSpacing: "-.4px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].md}`,
            letterSpacing: "-.32x",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: "-.28px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Body]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xl}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].lg}`,
            letterSpacing: "-.08px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].md}`,
            letterSpacing: "-.07px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: "-.06px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.BodyStrong]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xl}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].lg}`,
            letterSpacing: "-.08px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].md}`,
            letterSpacing: "-.07px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: "-.06px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Label]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: "-.07px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].xs}`,
            letterSpacing: "-.06px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["2xs"]}`,
            letterSpacing: "-.05px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.LabelModerate]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: "-.07px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].xs}`,
            letterSpacing: "-.06px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["2xs"]}`,
            letterSpacing: "-.05px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.LabelStrong]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: "-.07px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].xs}`,
            letterSpacing: "-.06px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark]["2xs"]}`,
            letterSpacing: "-.05px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Overline]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].md}`,
            letterSpacing: "1.92px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.uppercase}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: "1.68px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.uppercase}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].xs}`,
            letterSpacing: "1.44px",
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.uppercase}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Code]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Regular}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xl}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].lg}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Lightspark].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Regular}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Lightspark].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Regular}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Lightspark].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.CodeStrong]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Lightspark].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Lightspark].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Lightspark].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Lightspark].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Lightspark].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING[0]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
      },
    },
    [TypographyGroup.UmameDocs]: {
      Mobile: {
        [TypographyType.Display]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["5xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["6xl"]}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].tight}`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["4xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["5xl"]}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].tight}`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["3xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["4xl"]}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].tight}`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Headline]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["3xl"]}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].tight}`,
            paragraphSpacing: `${PARAGRAPH_SPACING[16]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].xl}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["2xl"]}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].tight}`,
            paragraphSpacing: `${PARAGRAPH_SPACING[16]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xl}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].tight}`,
            paragraphSpacing: `${PARAGRAPH_SPACING[16]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Title]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].lg}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Body]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.BodyStrong]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Label]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["2xs"]}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.LabelModerate]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["2xs"]}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.LabelStrong]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["2xs"]}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Overline]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].md}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].loose}`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.uppercase}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].loose}`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.uppercase}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].loose}`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.uppercase}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Code]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Regular}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Regular}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Regular}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.CodeStrong]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
      },
      Desktop: {
        [TypographyType.Display]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["5xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["6xl"]}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].tight}`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["4xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["5xl"]}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].tight}`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["3xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["4xl"]}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].tight}`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Headline]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["3xl"]}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].tight}`,
            paragraphSpacing: `${PARAGRAPH_SPACING[16]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].xl}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["2xl"]}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].tight}`,
            paragraphSpacing: `${PARAGRAPH_SPACING[16]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xl}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].tight}`,
            paragraphSpacing: `${PARAGRAPH_SPACING[16]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Title]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].lg}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Body]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.BodyStrong]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Label]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["2xs"]}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.LabelModerate]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["2xs"]}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.LabelStrong]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs]["2xs"]}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Overline]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].md}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].loose}`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.uppercase}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].loose}`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.uppercase}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.main}`,
            fontWeight: `${FONT_WEIGHTS.main.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs]["2xs"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${LETTER_SPACING[TypographyGroup.UmameDocs].loose}`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.uppercase}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Code]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Regular}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Regular}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Regular}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.CodeStrong]: {
          [TokenSize.Large]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: `${fontFamilies.code}`,
            fontWeight: `${FONT_WEIGHTS.code.Bold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.UmameDocs].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.UmameDocs].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.UmameDocs].normal
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
      },
    },
    [TypographyGroup.Bridge]: {
      Mobile: {
        [TypographyType.Headline]: {
          [TokenSize.Large]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge]["2xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge]["3xl"]}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-high"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Title]: {
          [TokenSize.Large]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].lg}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge]["2xl"]}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-low"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Label]: {
          [TokenSize.Large]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].xl}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge].xl}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-medium"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Mlarge]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge].lg}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-low"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-low"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Schmedium]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-low"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-low"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Body]: {
          [TokenSize.Medium]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-low"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Schmedium]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge].sm}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-low"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-low"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.ExtraSmall]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].xs}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge]["2xs"]}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-low"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
      },
      Desktop: {
        [TypographyType.Headline]: {
          [TokenSize.Large]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge]["3xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge]["5xl"]}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-high"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Title]: {
          [TokenSize.Large]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge]["2xl"]}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge]["4xl"]}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-high"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Body]: {
          [TokenSize.Medium]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].xl}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge].xl}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-low"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-low"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.ExtraSmall]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.Medium}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].sm}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge].xs}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-low"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING["16"]}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
        [TypographyType.Label]: {
          [TokenSize.Large]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].xl}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge]["2xl"]}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-medium"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Medium]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].xl}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge].xl}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-low"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
          [TokenSize.Small]: {
            fontFamily: fontFamilies.main,
            fontWeight: `${FONT_WEIGHTS.main.SemiBold}`,
            lineHeight: `${LINE_HEIGHTS[TypographyGroup.Bridge].md}`,
            fontSize: `${FONT_SIZE[TypographyGroup.Bridge].md}`,
            letterSpacing: `${
              LETTER_SPACING[TypographyGroup.Bridge]["tight-low"]
            }`,
            paragraphSpacing: `${PARAGRAPH_SPACING.default}`,
            paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
            textCase: `${TEXT_CASE.none}`,
            textDecoration: `${TEXT_DECORATION.none}`,
          },
        },
      },
    },
  };
}

export function getTypography(
  typographyGroup: TypographyGroup,
  customFontFamilies?: FontFamilies,
) {
  const fontFamilies = customFontFamilies ?? FONT_FAMILIES;
  return {
    group: typographyGroup,
    fontFamilies,
    lineHeights: LINE_HEIGHTS[typographyGroup],
    fontWeights: FONT_WEIGHTS,
    fontSize: FONT_SIZE[typographyGroup],
    letterSpacing: LETTER_SPACING[typographyGroup],
    textCase: TEXT_CASE,
    textDecoration: TEXT_DECORATION,
    paragraphIndent: PARAGRAPH_INDENT,
    paragraphSpacing: PARAGRAPH_SPACING,
    types: getTypographyTypes(fontFamilies)[typographyGroup],
  };
}

function mayTokensToStyles(tokens: Record<string, string>) {
  return Object.entries(tokens)
    .map((entry) => {
      // Transform tokens into valid css.
      switch (entry[0]) {
        case "fontFamily":
          return `font-family: ${entry[1]};`;
        case "fontWeight":
          return `font-weight: ${entry[1]};`;
        case "lineHeight":
          return `line-height: ${entry[1]};`;
        case "fontSize":
          return `font-size: ${entry[1]};`;
        case "letterSpacing":
          return `letter-spacing: ${entry[1]};`;
        case "textDecoration":
          return `text-decoration: ${entry[1]};`;
        case "paragraphSpacing":
          /** Better to set context aware margin styles in
           * parent Article container, skip for now: */
          return "";
        case "paragraphIndent":
          return `text-indent: ${entry[1]};`;
        case "textCase":
          return `text-transform: ${entry[1]};`;
        default:
          return `${entry[0]}: ${entry[1]};`;
      }
    })
    .join("");
}

const defaultTokens = {
  fontFamily: FONT_FAMILIES.main,
  fontWeight: `${FONT_WEIGHTS.main.Medium}`,
  lineHeight: LINE_HEIGHTS[TypographyGroup.Lightspark].sm,
  fontSize: FONT_SIZE[TypographyGroup.Lightspark].sm,
  letterSpacing: LETTER_SPACING[TypographyGroup.Lightspark].normal,
  paragraphSpacing: PARAGRAPH_SPACING.default,
  paragraphIndent: `${PARAGRAPH_INDENT[0]}`,
  textCase: TEXT_CASE.none,
  textDecoration: TEXT_DECORATION.none,
};

export const getTypographyString = (
  theme: Theme,
  typographyType: TypographyTypeKey,
  size: TokenSizeKey,
) => {
  const mobileTokenGroups = theme.typography.types["Mobile"];
  const desktopTokenGroups = theme.typography.types["Desktop"];
  const mobileTokenSizes = mobileTokenGroups[typographyType];
  const desktopTokenSizes = desktopTokenGroups[typographyType];
  let mobileTokens = mobileTokenSizes?.[size];
  let desktopTokens = desktopTokenSizes?.[size];

  if (!mobileTokens || !desktopTokens) {
    /* It's okay for a TypographyGroup to not have tokens defined for every possible
       typography type but if a component tries to use the style we should log an error
       since we don't have styles defined for this scenario. Developer should reach out
       to design for new tokens or use a typography type that exists in the theme. */
    console.error(
      "Attempted to use a typography type that does not exist in the current theme. Falling back to default tokens.",
    );
    mobileTokens = defaultTokens;
    desktopTokens = defaultTokens;
  }

  return `
    ${mayTokensToStyles(desktopTokens)}
    ${bp.sm(mayTokensToStyles(mobileTokens))}
  `;
};
