"use client";
import styled from "@emotion/styled";
import { StyledContentTable } from "../../components/ContentTable.js";
import { select } from "../../utils/emotion.js";
import { colors } from "../colors.js";
import { standardBorderRadius } from "../common.js";
import { Spacing } from "../tokens/spacing.js";
import { getTypographyString, TokenSize } from "../tokens/typography.js";
import { overflowAutoWithoutScrollbars } from "../utils.js";
import { StyledBody } from "./Body.js";
import { StyledCode } from "./Code.js";
import { displaySelector } from "./Display.js";
import { ALL_HEADLINE_SELECTORS, headlineSelector } from "./Headline.js";
import { StyledTitle } from "./Title.js";

export const Article = styled.article`
  ${displaySelector("h1")} {
    margin: 0;
  }

  ${headlineSelector("h1")} {
    margin: 0;
    padding-bottom: ${Spacing.xs};
  }

  ${headlineSelector("h2")} {
    padding-top: ${Spacing["2xl"]};
    padding-bottom: ${Spacing.xs};
    margin: 0;
  }

  ${headlineSelector("h3")} {
    padding-top: ${Spacing["2xl"]};
    padding-bottom: ${Spacing.xs};
    margin: 0;
  }

  ${headlineSelector("h4")} {
    padding-top: ${Spacing["2xl"]};
    padding-bottom: ${Spacing.xs};
    margin: 0;
  }

  ${headlineSelector("h5")} {
    padding-top: ${Spacing["2xl"]};
    padding-bottom: ${Spacing.xs};
    margin: 0;
  }

  ${headlineSelector("h6")} {
    padding-top: ${Spacing["2xl"]};
    padding-bottom: ${Spacing.xs};
    margin: 0;
  }

  ${select(StyledBody)} {
    margin-top: ${Spacing.xs};
    margin-bottom: ${Spacing.xs};
  }

  ${select(StyledContentTable)} {
    margin: ${Spacing["2xl"]} 0;
  }

  img,
  video {
    margin-top: ${Spacing.md};
    margin-bottom: ${Spacing.md};
  }

  strong {
    font-weight: 700;
  }

  *:not(${ALL_HEADLINE_SELECTORS},${select(StyledTitle)},${select(StyledCode)})
    > a {
    ${({ theme }) =>
      getTypographyString(
        theme.typography[theme.app]["Label Strong"][TokenSize.Large],
      )}
    font-size: inherit;
    color: ${({ theme }) => theme.link};
  }

  ul,
  ol {
    padding-left: ${Spacing.lg};
    margin-top: ${Spacing.xs};
    margin-bottom: ${Spacing.xs};
    *:not(a) {
      color: ${({ theme }) => theme.text};
    }
  }

  li {
    ${({ theme }) =>
      getTypographyString(theme.typography[theme.app].Body[TokenSize.Medium])}
    :not(:last-child) {
      margin-bottom: ${Spacing["3xs"]};
    }
  }

  code:not([class|="language"]) {
    ${({ theme }) =>
      getTypographyString(theme.typography[theme.app].Code[TokenSize.Medium])}
    background: ${colors.grayBlue94};
    padding: ${Spacing["4xs"]} ${Spacing["2xs"]};
    margin: ${Spacing["4xs"]};
    border-radius: 4px;
  }

  pre[class|="language"] {
    ${standardBorderRadius(8)}
    width: 100%;
    padding: ${Spacing.md} ${Spacing.lg};
    margin: ${Spacing.md} 0;
  }

  // Must match specificity of prismjs to get proper line height!
  pre[class|="language"],
  code[class|="language"] {
    ${({ theme }) =>
      getTypographyString(theme.typography[theme.app].Code[TokenSize.Small])}

    ${overflowAutoWithoutScrollbars}
  }

  blockquote {
    margin: ${Spacing.xs} 0;
  }
`;
