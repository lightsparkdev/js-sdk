"use client";

import styled from "@emotion/styled";
import { type ReactNode } from "react";
import { applyTypography } from "../../styles/typography.js";
import { toNonTypographicReactNodes } from "../../utils/toNonTypographicReactNodes.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "./types.js";
import { typographyStyles } from "./typographyStyles.js";

type AllowedBodyTags = "span" | "p" | "pre" | "div";

type BodyProps = CommonTypographyProps & {
  tag?: AllowedBodyTags | undefined;
};

export const Body = ({
  block = false,
  children,
  color,
  content,
  display,
  hideOverflow = false,
  id,
  size = "Medium",
  tag = "span",
}: BodyProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }

  return (
    <StyledBody
      as={tag}
      block={block}
      colorProp={color}
      displayProp={display}
      hideOverflow={hideOverflow}
      id={id}
      size={size}
    >
      {reactNodes}
    </StyledBody>
  );
};

type StyledBodyProps = CommonStyledTypographyProps;

export const StyledBody = styled.span<StyledBodyProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Body", size, colorProp)}
  ${typographyStyles}
`;
