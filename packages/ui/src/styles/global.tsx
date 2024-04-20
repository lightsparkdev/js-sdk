import { css, Global, useTheme } from "@emotion/react";
import { useEffect } from "react";
import "react-tooltip/dist/react-tooltip.css";
import "../static/fonts.css";
import { bp, BreakpointRanges } from "./breakpoints.js";
import { rootFontSizeRems, standardLineHeightEms } from "./common.js";
import { cssVars } from "./constants.js";
import { useThemeBg, type ThemeProp } from "./themes.js";

export const globalComponentStyles = ({ theme }: ThemeProp) => css`
  @import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

  html {
    font-size: ${rootFontSizeRems}rem;
    color: ${theme.text};

    /* required for iOS https://bit.ly/3Q8syG8 */
    -webkit-text-size-adjust: none;
    text-size-adjust: none;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.typography.fontFamilies.main}, sans-serif;
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

  .pretty-scrollbar {
    scrollbar-width: auto;
    scrollbar-color: #333333 #000000;
  }

  .pretty-scrollbar::-webkit-scrollbar {
    width: 16px;
  }

  .pretty-scrollbar::-webkit-scrollbar-track {
    background: #000000;
  }

  .pretty-scrollbar::-webkit-scrollbar-thumb {
    background-color: #333333;
    border-radius: 10px;
    border: 3px solid #000000;
  }

  *:focus-visible {
    outline: ${theme.hcNeutral} dashed 1px;
  }

  strong {
    font-weight: 700;
  }
`;

export function GlobalStyles() {
  const theme = useTheme();
  const bg = useThemeBg();

  useEffect(() => {
    /* 
     * iOS has no way to actually get the viewport size correctly.
     * There are many ways purporting to solve
         it but the only one that seems to work consistently everywhere requires js https://bit.ly/3LRfsNn
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
