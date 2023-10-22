"use client";
import styled from "@emotion/styled";
import { colors } from "../../colors";
import { getTypographyString, TokenSize, type App } from "../typographyTokens";
import { StyledBody } from "./Body";
import { displaySelector } from "./Display";
import { headlineSelector } from "./Headline";

interface Props {
  app: App;
}

export const Article = styled.article<Props>`
  ${displaySelector("h1")} {
    margin: 0;
  }

  ${headlineSelector("h1")} {
    margin: 0;
    padding-bottom: 8px;
  }

  ${headlineSelector("h2")} {
    padding-top: 32px;
    padding-bottom: 8px;
    margin: 0;
  }

  ${headlineSelector("h3")} {
    padding-top: 32px;
    padding-bottom: 8px;
    margin: 0;
  }

  ${headlineSelector("h4")} {
    padding-top: 32px;
    padding-bottom: 8px;
    margin: 0;
  }

  ${headlineSelector("h5")} {
    padding-top: 32px;
    padding-bottom: 8px;
    margin: 0;
  }

  ${headlineSelector("h6")} {
    padding-top: 32px;
    padding-bottom: 8px;
    margin: 0;
  }

  ${StyledBody} {
    margin-top: 12px;
    margin-bottom: 12px;
  }

  img {
    margin-top: 16px;
    margin-bottom: 16px;
  }

  a {
    ${({ theme, app }) =>
      getTypographyString(
        theme.typography[app]["Label Strong"][TokenSize.Large],
      )}
    color: ${colors.uma.blue};
  }

  ul,
  ol {
    :not(li ul, li ol) {
      padding-left: 16px;
    }
    margin-top: 8px;
  }

  li {
    ${({ theme, app }) =>
      getTypographyString(theme.typography[app].Body[TokenSize.Medium])}
    :not(:last-child) {
      margin-bottom: 4px;
    }
  }

  code:not([class|="language"]) {
    ${({ theme, app }) =>
      getTypographyString(theme.typography[app].Code[TokenSize.Medium])}
    background: ${colors.uma.blue90};
    padding: 2px 6px;
    margin: 2px;
    border-radius: 4px;
  }

  pre[class|="language"] {
    border-radius: 8px;
    width: 100%;
    padding: 16px 24px;
    margin: 0;
  }

  // Must match specificity of prismjs to get proper line height!
  pre[class|="language"],
  code[class|="language"] {
    ${({ theme, app }) =>
      getTypographyString(theme.typography[app].Code[TokenSize.Small])}
  }
`;
