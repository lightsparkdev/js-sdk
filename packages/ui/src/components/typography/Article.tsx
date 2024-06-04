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
import { StyledBody } from "./Body.js";
import { StyledCode } from "./Code.js";
import { displaySelector } from "./Display.js";
import { ALL_HEADLINE_SELECTORS, headlineSelector } from "./Headline.js";
import { StyledTitle } from "./Title.js";

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
    ${({ theme }) => getTypographyString(theme, "Label Strong", "Large")}
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
    ${({ theme }) => getTypographyString(theme, "Body", "Medium")}
    :not(:last-child) {
      margin-bottom: ${Spacing["3xs"]};
    }
  }

  code:not([class|="language"]) {
    ${({ theme }) => getTypographyString(theme, "Code", "Medium")}
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
    ${({ theme }) => getTypographyString(theme, "Code", "Small")}

    ${overflowAutoWithoutScrollbars}
  }

  blockquote {
    margin: ${Spacing.xs} 0;
  }
`;
