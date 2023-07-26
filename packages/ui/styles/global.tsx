import { css, Global, useTheme } from "@emotion/react";
import { bp, BreakpointRanges } from "@lightsparkdev/ui/styles/breakpoints";
import { useEffect } from "react";
import "react-tooltip/dist/react-tooltip.css";
import { useThemeBg } from "./colors";
import { rootFontSizeRems, standardLineHeightEms } from "./common";
import { cssVars } from "./constants";

export function GlobalStyles() {
  const theme = useTheme();
  const bg = useThemeBg();

  useEffect(() => {
    /* iOS has no way to actually get the viewport size correctly. There are many ways purporting to solve
         it but the only one that seems to work consistently everywhere requires js https://bit.ly/3LRfsNn
         We need it to properly take up the whole viewport when the content is smaller. */
    const documentHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty(cssVars.docHeight, `${window.innerHeight}px`);
    };
    window.addEventListener("resize", documentHeight);
    documentHeight();
    return () => window.removeEventListener("resize", documentHeight);
  }, []);

  const globalStyles = css`
    :root {
      ${cssVars.docHeight}: 100vh;
      --rt-opacity: 1;
    }

    html {
      font-size: ${rootFontSizeRems}rem;
      background: ${bg};
      color: ${theme.text};

      /* required for iOS https://bit.ly/3Q8syG8 */
      -webkit-text-size-adjust: none;
      text-size-adjust: none;
    }

    body {
      font-family: "Montserrat", sans-serif;
      font-weight: 500;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      height: 100%;
      margin: 0;
      min-height: var(${cssVars.docHeight});
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior: auto;

      &:before {
        content: "";
        position: absolute;
        visibility: hidden;
      }
    }

    body {
      ${bp.sm(`&:before { content: "${BreakpointRanges.sm}"; }`)}
      ${bp.minSmMaxMd(
        `&:before { content: "${BreakpointRanges.minSmMaxMd}"; }`
      )}
      ${bp.minMdMaxLg(
        `&:before { content: "${BreakpointRanges.minMdMaxLg}"; }`
      )}
      ${bp.lg(`&:before { content: "${BreakpointRanges.lg}"; }`)}
    }

    [id="root"] {
      height: 100%;
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
      font-weight: 600;
    }
  `;

  return <Global styles={globalStyles} />;
}
