import { css, keyframes, ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import { Fragment } from "react";
import { themeOrWithKey, themes, type Themes } from "../styles/themes.js";
import {
  getLineHeightForTypographyType,
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
  typography?: PartialSimpleTypographyProps;
  width?: number | undefined;
  forceTheme?: Themes | undefined;
  /* If fullSizePending the background will expand to the size of it's nearest parent with
     position: relative. Otherwise the background will be the line height of the content to
     avoid layout shift once the content is defined */
  fullSizePending?: boolean;
};

export function PendingValue({
  animate = true,
  content: contentProp,
  typography: typographyProp,
  width,
  forceTheme,
  fullSizePending = false,
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
    currencyAmount: defaultTypography,
    clipboardTextField: defaultTypography,
  };

  const nodesWithTypography = setDefaultReactNodesTypography(
    contentProp,
    defaultTypographyMap,
  );

  const content = toReactNodes(nodesWithTypography);

  /* Depending on fullSizePending, content node may be inside the background
     or outside to ensure intrinsic height is always equal to the line height
     of the content once it's defined */
  const contentNode = (
    <StyledPendingValueContent
      typographyType={defaultTypography.type}
      typographySize={defaultTypography.size}
    >
      {content}
    </StyledPendingValueContent>
  );
  const nodes = (
    <Fragment>
      <StyledPendingValueBgOuter
        typographyType={defaultTypography.type}
        typographySize={defaultTypography.size}
        widthProp={width}
        hasContent={!!contentProp}
        fullSizePending={fullSizePending}
      >
        <StyledPendingValueBg
          visible={!contentProp}
          fullSizePending={fullSizePending}
          animate={animate}
        />
        {fullSizePending ? null : contentNode}
      </StyledPendingValueBgOuter>
      {fullSizePending ? contentNode : null}
    </Fragment>
  );
  return forceTheme ? (
    <ThemeProvider theme={themes[forceTheme]}>{nodes}</ThemeProvider>
  ) : (
    nodes
  );
}

const StyledPendingValueBgOuter = styled.div<{
  typographyType: TypographyTypeKey;
  typographySize: TokenSizeKey;
  widthProp: number | undefined;
  fullSizePending: boolean;
  hasContent: boolean;
}>`
  position: relative;
  height: ${({ typographyType, typographySize, theme }) =>
    getLineHeightForTypographyType(typographyType, typographySize, theme)};

  ${({ widthProp, hasContent }) =>
    widthProp && !hasContent ? `width: ${widthProp}px;` : "width: 100%;"}
  overflow: hidden;
  max-width: 100%;

  ${({ fullSizePending }) => {
    if (fullSizePending) {
      return `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100%;
        width: 100%;
      `;
    }
    return "";
  }}
`;

export const StyledPendingValueContent = styled.div<{
  typographyType: TypographyTypeKey;
  typographySize: TokenSizeKey;
}>`
  position: relative;
  z-index: 1;
  overflow: hidden;

  height: ${({ typographyType, typographySize, theme }) =>
    getLineHeightForTypographyType(typographyType, typographySize, theme)};
`;

const vSpacing = 2;

export const StyledPendingValueBg = styled.div<{
  animate: boolean;
  visible: boolean;
  fullSizePending: boolean;
}>`
  z-index: 0;
  width: 100%;
  position: absolute;

  ${({ fullSizePending }) => {
    if (fullSizePending) {
      return `
        height: 100%;
        top: 0;
      `;
    }
    /* When not fullSizePending this looks nicer when it's just
       slightly less tall than the line height of the content: */
    return `
      height: calc(100% - ${vSpacing * 2}px);
      top: ${vSpacing}px;
      border-radius: 999px;
    `;
  }}

  ${({ visible }) => (visible ? "opacity: 1;" : "opacity: 0;")}

  background: linear-gradient(
    90deg,
    ${themeOrWithKey("c05Neutral", "c25Neutral")} 0%,
    ${themeOrWithKey("c1Neutral", "c3Neutral")} 50%,
    ${themeOrWithKey("c05Neutral", "c25Neutral")} 100%
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
