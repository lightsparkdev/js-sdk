import { css, Global, useTheme, type Theme } from "@emotion/react";
import { useEffect } from "react";
import "react-tooltip/dist/react-tooltip.css";
import "../static/fonts.css";
import { bp, BreakpointRanges } from "./breakpoints.js";
import { rootFontSizeRems, standardLineHeightEms } from "./common.js";
import { cssVars } from "./constants.js";
import { useThemeBg, type ThemeProp } from "./themes.js";

const getFontImport = (theme: Theme) => {
  let importStr = "";
  const fontStrs = [];

  const interStr = "Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900";
  const manropeStr = "Manrope:wght@200..800";
  const montserratStr = "Montserrat:ital,wght@0,100..900;1,100..900";
  const robotoMonoStr = "Roboto+Mono:ital,wght@0,100..700;1,100..700";
  const suisseIntlStr = "Suisse+Intl:wght@100..900";
  const suisseIntlMonoStr = "Suisse+Intl+Mono:wght@100..900";

  if (theme.typography.fontFamilies.main === "Inter") {
    fontStrs.push(interStr);
  } else if (theme.typography.fontFamilies.main === "Manrope") {
    fontStrs.push(manropeStr);
  } else if (theme.typography.fontFamilies.main === "Montserrat") {
    fontStrs.push(montserratStr);
  } else if (theme.typography.fontFamilies.main === "SuisseIntl") {
    fontStrs.push(suisseIntlStr);
  }

  if (theme.typography.fontFamilies.code === "Roboto Mono") {
    fontStrs.push(robotoMonoStr);
  } else if (theme.typography.fontFamilies.code === "SuisseIntl-Mono") {
    fontStrs.push(suisseIntlMonoStr);
  }

  if (fontStrs.length) {
    importStr = `@import url('https://fonts.googleapis.com/css2?family=${fontStrs.join(
      "&family=",
    )}&display=swap');`;
  }

  return importStr;
};

const getFontsBase = () => {
  try {
    return `${(
      import.meta as unknown as { env: Record<string, string> }
    ).env.BASE_URL.replace(/\/$/, "")}/fonts`;
  } catch {
    return "/fonts";
  }
};

/* HARD RULES (canonical block in origin's _fonts.scss, PR #33261):
   1. Every SuisseIntl face MUST declare the identical `font-weight: 300 700`
      span — an exact-weight or differently-spanned face makes Chromium
      silently fall back to Arial for the whole family (Chromium 145 repro).
   2. Arabic statics live in the separate "Suisse Intl Arabic" family with no
      unicode-range; the sans stacks list it right after the VF family.
   3. The unicode-range lists ship verbatim and partition the VF charset with
      zero overlap. */
const suisseCoreUnicodeRange =
  "U+0000-00FF, U+010C-010D, U+0130-0131, U+2000-206F, U+20A0-20CF, U+2122, " +
  "U+2190-2193, U+2197, U+2199, U+2212, U+2248, U+2264-2265";
const suisseExtUnicodeRange =
  "U+0100-010B, U+010E-012F, U+0132-0137, U+0139-0148, U+014A-017E, " +
  "U+0186, U+018F-0190, " +
  "U+01A0-01A1, U+01AF-01B0, U+01CD-01D4, U+01E6-01E7, U+01EA-01EB, " +
  "U+01F4-01F5, U+0218-021B, U+0232-0233, U+0237, U+0245, U+0254, U+0259, " +
  "U+025B, U+026A, U+028C, U+02BB-02BC, U+02C6-02C7, U+02D8-02DD, " +
  "U+0300-0304, U+0306-030C, U+031B, U+0323, U+0326-0328, U+0401-044F, " +
  "U+0451-045F, U+0490-0493, U+0496-049D, U+04A0-04A3, U+04AA-04AB, " +
  "U+04AE-04B3, U+04B6-04BB, U+04C0-04C2, U+04CF-04D1, U+04D6-04D9, " +
  "U+04E2-04E3, U+04E6-04E9, U+04EE-04EF, U+04F2-04F3, U+060B, U+0E3F, " +
  "U+1E04-1E05, U+1E0C-1E0D, U+1E20-1E21, U+1E24-1E27, U+1E36-1E37, " +
  "U+1E44-1E47, U+1E56-1E57, U+1E62-1E63, U+1E6C-1E6D, U+1E80-1E85, " +
  "U+1E8C-1E8D, U+1E92-1E93, U+1E9E, U+1EA0-1EF9, U+2070, U+2074-2079, " +
  "U+2080-2089, U+2116-2117, U+2150-215F, U+2196, U+2198, U+21A4-21A7, " +
  "U+2215, U+2260, U+25CC, U+2766, U+A7AE, U+FB01-FB02, U+FDFC";

const arabicFallbackWeights = [
  ["SuisseIntl-Light.woff2", 300],
  ["SuisseIntl-Regular.woff2", 400],
  ["SuisseIntl-Book.woff2", 450],
  ["SuisseIntl-Medium.woff2", 500],
  ["SuisseIntl-Semibold.woff2", 600],
  ["SuisseIntl-Bold.woff2", 700],
] as const;

const getFontFaces = (theme: Theme) => {
  let fontFacesStr = "";
  if (theme.typography.fontFamilies.main === "SuisseIntl") {
    const fontsBase = getFontsBase();
    fontFacesStr += `
      @font-face {
        font-family: "SuisseIntl";
        src: url("${fontsBase}/SuisseIntlVF-wght300-700-core.woff2") format("woff2-variations");
        font-weight: 300 700;
        font-style: normal;
        font-display: swap;
        unicode-range: ${suisseCoreUnicodeRange};
      }
      @font-face {
        font-family: "SuisseIntl";
        src: url("${fontsBase}/SuisseIntlVF-wght300-700-ext.woff2") format("woff2-variations");
        font-weight: 300 700;
        font-style: normal;
        font-display: swap;
        unicode-range: ${suisseExtUnicodeRange};
      }
      ${arabicFallbackWeights
        .map(
          ([file, weight]) => `
      @font-face {
        font-family: "Suisse Intl Arabic";
        src: url("${fontsBase}/${file}") format("woff2");
        font-weight: ${weight};
        font-style: normal;
        font-display: swap;
      }
    `,
        )
        .join("")}
    `;
  }
  if (theme.typography.fontFamilies.code === "SuisseIntl-Mono") {
    const fontsBase = getFontsBase();
    fontFacesStr += `
      @font-face {
        font-family: "SuisseIntl-Mono";
        src: url("${fontsBase}/SuisseIntlMono-Regular.woff2") format("woff2");
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
    `;
  }

  return fontFacesStr;
};

export const globalComponentStyles = ({ theme }: ThemeProp) => css`
  ${getFontImport(theme)};
  ${getFontFaces(theme)};

  html {
    font-size: ${rootFontSizeRems}rem;
    color: ${theme.text};

    /* required for iOS https://bit.ly/3Q8syG8 */
    -webkit-text-size-adjust: none;
    text-size-adjust: none;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.typography.cssFontFamilies.main}, sans-serif;
    font-weight: 500;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    &:before {
      position: absolute;
      visibility: hidden;
    }

    ${bp.sm(`&:before { content: "${BreakpointRanges.sm}"; }`)}
    ${bp.minSmMaxMd(`&:before { content: "${BreakpointRanges.minSmMaxMd}"; }`)}
      ${bp.minMdMaxLg(
      `&:before { content: "${BreakpointRanges.minMdMaxLg}"; }`,
    )}
    ${bp.lg(`&:before { content: "${BreakpointRanges.lg}"; }`)}
  }

  * {
    box-sizing: border-box;
    line-height: ${standardLineHeightEms}em;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
      monospace;
  }

  a {
    color: #0d6efd;
    text-decoration: none;
  }

  *:focus-visible {
    outline: ${theme.hcNeutral} dashed 1px;
  }

  strong {
    font-weight: 700;
  }

  // Recaptcha badge invisibility
  .grecaptcha-badge {
    visibility: hidden;
  }
`;

export function GlobalStyles() {
  const theme = useTheme();
  const bg = useThemeBg();

  useEffect(() => {
    /*
     * iOS has no way to actually get the viewport size correctly.
     * There are many ways purporting to solve it but the only one that seems
     * to work consistently everywhere requires JS: https://bit.ly/3LRfsNn
     * We need it to properly take up the whole viewport when the content is
     * smaller.
     */
    const documentHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty(cssVars.docHeight, `${window.innerHeight}px`);
    };
    window.addEventListener("resize", documentHeight);
    documentHeight();
    return () => window.removeEventListener("resize", documentHeight);
  }, []);

  const globalStyles = css`
    ${globalComponentStyles({ theme })}

    :root {
      ${cssVars.docHeight}: 100vh;
      --rt-opacity: 1 !important;
      --rt-transition-show-delay: 0.15s !important;
      --rt-transition-closing-delay: 0.2s !important;
    }

    html {
      background: ${bg};
    }

    body {
      height: 100%;
      margin: 0;
      min-height: var(${cssVars.docHeight});
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior: auto;
    }

    [id="root"] {
      height: 100%;
    }
  `;

  return <Global styles={globalStyles} />;
}
