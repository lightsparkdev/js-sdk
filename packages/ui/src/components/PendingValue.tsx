import { css, keyframes, ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import { themeOrWithKey, themes, type Themes } from "../styles/themes.js";
import {
  getLineHeightForTypographyType,
  type LineHeightKey,
  type TokenSizeKey,
  type TypographyTypeKey,
} from "../styles/tokens/typography.js";
import { setDefaultReactNodesTypography } from "../utils/toReactNodes/setReactNodesTypography.js";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../utils/toReactNodes/toReactNodes.js";
import { type PartialSimpleTypographyProps } from "./typography/types.js";

const bgPosition = keyframes`
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
`;

type PendingValueProps = {
  animate?: boolean;
  content?: ToReactNodesArgs | undefined;
  height?: LineHeightKey | undefined;
  typography?: PartialSimpleTypographyProps;
  width?: number | undefined;
  forceTheme?: Themes | undefined;
};

export function PendingValue({
  animate = true,
  content: contentProp,
  typography: typographyProp,
  width,
  forceTheme,
}: PendingValueProps) {
  const defaultTypography = {
    type: typographyProp?.type || "Body",
    size: typographyProp?.size || "Small",
    color: typographyProp?.color || "text",
    hideOverflow: true,
  } as const;

  const defaultTypographyMap = {
    link: defaultTypography,
    text: defaultTypography,
    nextLink: defaultTypography,
  };

  const nodesWithTypography = setDefaultReactNodesTypography(
    contentProp,
    defaultTypographyMap,
  );

  const content = toReactNodes(nodesWithTypography);

  const nodes = (
    <StyledPendingValue
      typographyType={defaultTypography.type}
      typographySize={defaultTypography.size}
      widthProp={width}
    >
      <StyledPendingValueBg visible={!contentProp} animate={animate} />
      <StyledPendingValueContent>{content}</StyledPendingValueContent>
    </StyledPendingValue>
  );
  return forceTheme ? (
    <ThemeProvider theme={themes[forceTheme]}>{nodes}</ThemeProvider>
  ) : (
    nodes
  );
}

const StyledPendingValue = styled.div<{
  typographyType: TypographyTypeKey;
  typographySize: TokenSizeKey;
  widthProp: number | undefined;
}>`
  position: relative;
  height: ${({ typographyType, typographySize, theme }) =>
    getLineHeightForTypographyType(typographyType, typographySize, theme)};

  ${({ widthProp }) => (widthProp ? `width: ${widthProp}px;` : "width: 100%;")}
  max-width: 100%;
`;

export const StyledPendingValueContent = styled.div`
  position: relative;
  z-index: 1;
`;

const vSpacing = 2;

export const StyledPendingValueBg = styled.div<{
  animate: boolean;
  visible: boolean;
}>`
  z-index: 0;
  height: calc(100% - ${vSpacing * 2}px);
  width: 100%;
  position: absolute;
  top: ${vSpacing}px;
  border-radius: 999px;

  ${({ visible }) => (visible ? "opacity: 1;" : "opacity: 0;")}
  transition: opacity 0.01s ease;

  background: linear-gradient(
    90deg,
    ${themeOrWithKey("c15Neutral", "c25Neutral")} 0%,
    ${themeOrWithKey("c2Neutral", "c3Neutral")} 50%,
    ${themeOrWithKey("c15Neutral", "c25Neutral")} 100%
  );

  background-size: 200% 100%;
  background-position: 0% 0%;

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  ${({ animate }) => {
    return animate
      ? css`
          animation: ${bgPosition} 2s linear infinite;
        `
      : "";
  }}
`;
