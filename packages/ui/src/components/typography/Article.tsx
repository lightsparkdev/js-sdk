"use client";
import styled from "@emotion/styled";
import { type ReactNode } from "react";
import { StyledContentTable } from "../../components/ContentTable.js";
import { colors } from "../../styles/colors.js";
import { standardBorderRadius } from "../../styles/common.js";
import { Spacing } from "../../styles/tokens/spacing.js";
import {
  getTypographyString,
  type TokenSizeKey,
  type TypographyTypeKey,
} from "../../styles/tokens/typography.js";
import { overflowAutoWithoutScrollbars } from "../../styles/utils.js";
import { select } from "../../utils/emotion.js";
import { StyledBody } from "./base/Body.js";
import { StyledCode } from "./base/Code.js";
import { displaySelector } from "./base/Display.js";
import { ALL_HEADLINE_SELECTORS, headlineSelector } from "./base/Headline.js";
import { StyledTitle } from "./base/Title.js";

type ArticleProps = {
  defaultTypography?: {
    type: TypographyTypeKey;
    size: TokenSizeKey;
  };
  children: ReactNode;
};

export function Article({ defaultTypography, children }: ArticleProps) {
  return (
    <StyledArticle
      type={defaultTypography?.type || "Body"}
      size={defaultTypography?.size || "Medium"}
    >
      {children}
    </StyledArticle>
  );
}

type StyledArticleProps = {
  type: TypographyTypeKey;
  size: TokenSizeKey;
};

export const StyledArticle = styled.article<StyledArticleProps>`
  ${({ theme, type, size }) => getTypographyString(theme, type, size)}

  ${displaySelector("h1")} {
    margin: 0;
  }

  ${headlineSelector("h1")} {
    margin: 0;
    padding-bottom: ${Spacing.px.xs};
  }

  ${headlineSelector("h2")} {
    padding-top: ${Spacing.px["2xl"]};
    padding-bottom: ${Spacing.px.xs};
    margin: 0;
  }

  ${headlineSelector("h3")} {
    padding-top: ${Spacing.px["2xl"]};
    padding-bottom: ${Spacing.px.xs};
    margin: 0;
  }

  ${headlineSelector("h4")} {
    padding-top: ${Spacing.px["2xl"]};
    padding-bottom: ${Spacing.px.xs};
    margin: 0;
  }

  ${headlineSelector("h5")} {
    padding-top: ${Spacing.px["2xl"]};
    padding-bottom: ${Spacing.px.xs};
    margin: 0;
  }

  ${headlineSelector("h6")} {
    padding-top: ${Spacing.px["2xl"]};
    padding-bottom: ${Spacing.px.xs};
    margin: 0;
  }

  ${select(StyledBody)} {
    margin-top: ${Spacing.px.xs};
    margin-bottom: ${Spacing.px.xs};
  }

  ${select(StyledContentTable)} {
    margin: ${Spacing.px["2xl"]} 0;
  }

  img,
  video {
    margin-top: ${Spacing.px.md};
    margin-bottom: ${Spacing.px.md};
  }

  strong {
    font-weight: 700;
  }

  *:not(${ALL_HEADLINE_SELECTORS},${select(StyledTitle)},${select(StyledCode)})
    > a {
    ${({ theme }) => getTypographyString(theme, "Label Strong", "Large")}
    font-size: inherit;
    color: ${({ theme }) => theme.link};
  }

  ul,
  ol {
    padding-left: ${Spacing.px.lg};
    margin-top: ${Spacing.px.xs};
    margin-bottom: ${Spacing.px.xs};
    *:not(a) {
      color: ${({ theme }) => theme.text};
    }
  }

  li {
    ${({ theme }) => getTypographyString(theme, "Body", "Medium")}
    :not(:last-child) {
      margin-bottom: ${Spacing.px["3xs"]};
    }
  }

  code:not([class|="language"]) {
    ${({ theme }) => getTypographyString(theme, "Code", "Medium")}
    background: ${colors.grayBlue94};
    padding: ${Spacing.px["4xs"]} ${Spacing.px["2xs"]};
    margin: ${Spacing.px["4xs"]};
    border-radius: 4px;
  }

  pre[class|="language"] {
    ${standardBorderRadius(8)}
    width: 100%;
    padding: ${Spacing.px.md} ${Spacing.px.lg};
    margin: ${Spacing.px.md} 0;
  }

  // Must match specificity of prismjs to get proper line height!
  pre[class|="language"],
  code[class|="language"] {
    ${({ theme }) => getTypographyString(theme, "Code", "Small")}

    ${overflowAutoWithoutScrollbars}
  }

  blockquote {
    margin: ${Spacing.px.xs} 0;
  }
`;
