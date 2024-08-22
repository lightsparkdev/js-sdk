import { css, keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { type ReactNode } from "react";
import {
  getLineHeightForTypographyType,
  type LineHeightKey,
  type TokenSizeKey,
  type TypographyTypeKey,
} from "../styles/tokens/typography.js";
import { type SimpleTypographyProps } from "../styles/typography.js";
import {
  setDefaultReactNodesTypography,
  toReactNodes,
  type ToReactNodesArgs,
} from "../utils/toReactNodes.js";

const bgPosition = keyframes`
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
`;

type PendingValueProps<T extends TypographyTypeKey> = {
  animate?: boolean;
  content?: ToReactNodesArgs<T> | undefined;
  height?: LineHeightKey | undefined;
  typography?: SimpleTypographyProps;
  width?: number | undefined;
};

export function PendingValue<T extends TypographyTypeKey>({
  animate = true,
  content: contentProp,
  typography: typographyProp,
  width,
}: PendingValueProps<T>) {
  const defaultTypography = {
    type: typographyProp?.type || "Body",
    props: {
      size: typographyProp?.size || "Small",
      color: typographyProp?.color || "text",
    },
  } as const;

  const defaultTypographyMap = {
    link: defaultTypography,
    externalLink: defaultTypography,
    text: defaultTypography,
    nextLink: defaultTypography,
  };

  let content: ToReactNodesArgs<T> | ReactNode = setDefaultReactNodesTypography(
    contentProp,
    defaultTypographyMap,
  );

  content = toReactNodes(content);

  return contentProp ? (
    content
  ) : (
    <StyledPendingValue
      widthProp={width}
      typographyType={defaultTypography.type}
      typographySize={defaultTypography.props.size}
      animate={animate}
    />
  );
}

export const StyledPendingValue = styled.div<{
  widthProp: number | undefined;
  typographyType: TypographyTypeKey;
  typographySize: TokenSizeKey;
  animate: boolean;
}>`
  border-radius: 999px;
  max-width: 100%;
  ${({ widthProp }) => (widthProp ? `width: ${widthProp}px;` : "")}
  height: ${({ typographyType, typographySize, theme }) =>
    getLineHeightForTypographyType(typographyType, typographySize, theme)};
  background: ${({ theme }) => theme.c15Neutral};

  ${({ theme }) => `
    background: linear-gradient(
      90deg,
      ${theme.c15Neutral} 0%,
      ${theme.c2Neutral} 50%,
      ${theme.c15Neutral} 100%
    );`}

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
