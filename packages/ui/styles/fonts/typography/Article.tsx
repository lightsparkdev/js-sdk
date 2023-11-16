"use client";
import styled from "@emotion/styled";
import { colors } from "../../colors";
import { overflowAutoWithoutScrollbars } from "../../utils";
import { getTypographyString, TokenSize } from "../typographyTokens";
import { StyledBody } from "./Body";
import { displaySelector } from "./Display";
import { ALL_HEADLINE_SELECTORS, headlineSelector } from "./Headline";

export const Article = styled.article`
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
    padding-top: 16px;
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

  strong {
    font-weight: 700;
  }

  *:not(${ALL_HEADLINE_SELECTORS}) > a {
    ${({ theme }) =>
      getTypographyString(
        theme.typography[theme.app]["Label Strong"][TokenSize.Large],
      )}
    color: ${({ theme }) => theme.link};
  }

  ul,
  ol {
    padding-left: 24px;
    margin-top: 8px;
    margin-bottom: 8px;
    *:not(a) {
      color: ${({ theme }) => theme.text};
    }
  }

  li {
    ${({ theme }) =>
      getTypographyString(theme.typography[theme.app].Body[TokenSize.Medium])}
    :not(:last-child) {
      margin-bottom: 4px;
    }
  }

  code:not([class|="language"]) {
    ${({ theme }) =>
      getTypographyString(theme.typography[theme.app].Code[TokenSize.Medium])}
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
    ${({ theme }) =>
      getTypographyString(theme.typography[theme.app].Code[TokenSize.Small])}

    ${overflowAutoWithoutScrollbars}
  }
`;
