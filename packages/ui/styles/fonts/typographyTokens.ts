const FONT_FAMILIES = {
  main: "Montserrat",
  code: "Roboto mono",
};

const LINE_HEIGHTS = {
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
};

const LETTER_SPACING = {
  tight: "-.02em",
  normal: "0",
  loose: ".1em",
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
  16: "16px",
  40: "40px",
};

export interface FontFamilies {
  main: string;
  code: string;
}

interface Token {
  "font-family": string;
  "font-weight": string;
  "line-height": string;
  "font-size": string;
  "letter-spacing": string;
  "paragraph-spacing": string;
  "paragraph-indent": string;
  "text-case": string;
  "text-decoration": string;
}

export enum TokenSize {
  Large,
  Medium,
  Small,
}

export enum App {
  Lightspark,
  UmaDocs,
}

export const getTypography = (customFontFamilies?: FontFamilies) => {
  const fontFamilies = customFontFamilies ?? FONT_FAMILIES;
  return {
    fontFamilies,
    lineHeights: LINE_HEIGHTS,
    fontWeights: FONT_WEIGHTS,
    fontSize: FONT_SIZE,
    letterSpacing: LETTER_SPACING,
    textCase: TEXT_CASE,
    textDecoration: TEXT_DECORATION,
    paragraphIndent: PARAGRAPH_INDENT,
    paragraphSpacing: PARAGRAPH_SPACING,
    [App.UmaDocs]: {
      Display: {
        [TokenSize.Large]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS["5xl"]}`,
          "font-size": `${FONT_SIZE["6xl"]}`,
          "letter-spacing": `${LETTER_SPACING.tight}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Medium]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS["4xl"]}`,
          "font-size": `${FONT_SIZE["5xl"]}`,
          "letter-spacing": `${LETTER_SPACING.tight}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Small]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS["3xl"]}`,
          "font-size": `${FONT_SIZE["4xl"]}`,
          "letter-spacing": `${LETTER_SPACING.tight}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
      },
      Headline: {
        [TokenSize.Large]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS["2xl"]}`,
          "font-size": `${FONT_SIZE["3xl"]}`,
          "letter-spacing": `${LETTER_SPACING.tight}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING[16]}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Medium]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS.xl}`,
          "font-size": `${FONT_SIZE["2xl"]}`,
          "letter-spacing": `${LETTER_SPACING.tight}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING[16]}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Small]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS.lg}`,
          "font-size": `${FONT_SIZE.xl}`,
          "letter-spacing": `${LETTER_SPACING.tight}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING[16]}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
      },
      Title: {
        [TokenSize.Large]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS.md}`,
          "font-size": `${FONT_SIZE.lg}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Medium]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS.sm}`,
          "font-size": `${FONT_SIZE.md}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Small]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS.xs}`,
          "font-size": `${FONT_SIZE.sm}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
      },
      Body: {
        [TokenSize.Large]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS.sm}`,
          "font-size": `${FONT_SIZE.md}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Medium]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Medium}`,
          "line-height": `${LINE_HEIGHTS.sm}`,
          "font-size": `${FONT_SIZE.sm}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Small]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Medium}`,
          "line-height": `${LINE_HEIGHTS.sm}`,
          "font-size": `${FONT_SIZE.xs}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
      },
      Label: {
        [TokenSize.Large]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS.xs}`,
          "font-size": `${FONT_SIZE.sm}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Medium]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS["2xs"]}`,
          "font-size": `${FONT_SIZE.xs}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Small]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS["2xs"]}`,
          "font-size": `${FONT_SIZE["2xs"]}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
      },
      "Label Strong": {
        [TokenSize.Large]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS.xs}`,
          "font-size": `${FONT_SIZE.sm}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Medium]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS["2xs"]}`,
          "font-size": `${FONT_SIZE.xs}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Small]: {
          "font-family": `${fontFamilies.main}`,
          "font-weight": `${FONT_WEIGHTS.main.Bold}`,
          "line-height": `${LINE_HEIGHTS["2xs"]}`,
          "font-size": `${FONT_SIZE["2xs"]}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
      },
      Overline: {
        [TokenSize.Large]: {
          "font-family": `${fontFamilies.code}`,
          "font-weight": `${FONT_WEIGHTS.code.Bold}`,
          "line-height": `${LINE_HEIGHTS.sm}`,
          "font-size": `${FONT_SIZE.md}`,
          "letter-spacing": `${LETTER_SPACING.loose}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.uppercase}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Medium]: {
          "font-family": `${fontFamilies.code}`,
          "font-weight": `${FONT_WEIGHTS.code.Bold}`,
          "line-height": `${LINE_HEIGHTS.xs}`,
          "font-size": `${FONT_SIZE.sm}`,
          "letter-spacing": `${LETTER_SPACING.loose}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.uppercase}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Small]: {
          "font-family": `${fontFamilies.code}`,
          "font-weight": `${FONT_WEIGHTS.code.Bold}`,
          "line-height": `${LINE_HEIGHTS["2xs"]}`,
          "font-size": `${FONT_SIZE.xs}`,
          "letter-spacing": `${LETTER_SPACING.loose}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.uppercase}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
      },
      Code: {
        [TokenSize.Large]: {
          "font-family": `${fontFamilies.code}`,
          "font-weight": `${FONT_WEIGHTS.code.Regular}`,
          "line-height": `${LINE_HEIGHTS.sm}`,
          "font-size": `${FONT_SIZE.md}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Medium]: {
          "font-family": `${fontFamilies.code}`,
          "font-weight": `${FONT_WEIGHTS.code.Regular}`,
          "line-height": `${LINE_HEIGHTS.sm}`,
          "font-size": `${FONT_SIZE.sm}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Small]: {
          "font-family": `${fontFamilies.code}`,
          "font-weight": `${FONT_WEIGHTS.code.Regular}`,
          "line-height": `${LINE_HEIGHTS.sm}`,
          "font-size": `${FONT_SIZE.xs}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
      },
      "Code Strong": {
        [TokenSize.Large]: {
          "font-family": `${fontFamilies.code}`,
          "font-weight": `${FONT_WEIGHTS.code.Bold}`,
          "line-height": `${LINE_HEIGHTS.sm}`,
          "font-size": `${FONT_SIZE.md}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Medium]: {
          "font-family": `${fontFamilies.code}`,
          "font-weight": `${FONT_WEIGHTS.code.Bold}`,
          "line-height": `${LINE_HEIGHTS.sm}`,
          "font-size": `${FONT_SIZE.sm}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
        [TokenSize.Small]: {
          "font-family": `${fontFamilies.code}`,
          "font-weight": `${FONT_WEIGHTS.code.Bold}`,
          "line-height": `${LINE_HEIGHTS.sm}`,
          "font-size": `${FONT_SIZE.xs}`,
          "letter-spacing": `${LETTER_SPACING.normal}`,
          "paragraph-spacing": `${PARAGRAPH_SPACING.default}`,
          "paragraph-indent": `${PARAGRAPH_INDENT[0]}`,
          "text-case": `${TEXT_CASE.none}`,
          "text-decoration": `${TEXT_DECORATION.none}`,
        },
      },
    },
  };
};

export const getTypographyString = (token: Token) => {
  return Object.entries(token)
    .map((entry) => {
      // Transform any non-css token properties into valid css.
      switch (entry[0]) {
        case "paragraph-spacing":
          return entry[1] === "default" ? "" : `margin-bottom: ${entry[1]};`;
        case "paragraph-indent":
          return `text-indent: ${entry[1]};`;
        case "text-case":
          return `text-transform: ${entry[1]};`;
        default:
          return `${entry[0]}: ${entry[1]};`;
      }
    })
    .join("");
};
