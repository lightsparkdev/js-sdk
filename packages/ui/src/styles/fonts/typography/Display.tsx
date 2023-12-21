"use client";

import styled from "@emotion/styled";
import { select } from "../../../utils/emotion.js";
import { colors } from "../../colors.js";
import { getTypographyString, TokenSize } from "../typographyTokens.js";

export const ELEMENTS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
type Element = (typeof ELEMENTS)[number];

interface Props {
  children: React.ReactNode;
  size?: TokenSize;
  element?: Element;
  color?: string | undefined;
}

export const Display = ({
  children,
  color,
  size = TokenSize.Medium,
  element = "h1",
}: Props) => {
  return (
    <StyledDisplay as={element} size={size} color={color}>
      {children}
    </StyledDisplay>
  );
};

const StyledDisplay = styled.span<Props>`
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size
      ? getTypographyString(theme.typography[theme.app].Display[size])
      : "";
  }}
`;

export function displaySelector(element: Element) {
  return `${element}${select(StyledDisplay)}`;
}
