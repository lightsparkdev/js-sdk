"use client";

import styled from "@emotion/styled";
import { type ReactNode } from "react";
import { getFontColor, type FontColorKey } from "../../styles/themes.js";
import {
  getTypographyString,
  type TokenSizeKey,
} from "../../styles/tokens/typography.js";

export type TitleProps = {
  children: React.ReactNode;
  size?: TokenSizeKey;
  color?: FontColorKey | undefined;
  block?: boolean;
};

export const Title = ({
  children,
  color,
  size = "Medium",
  block = false,
}: TitleProps) => {
  return (
    <StyledTitle size={size} colorProp={color} block={block}>
      {children}
    </StyledTitle>
  );
};

type StyledTitleStrongProps = {
  children: ReactNode;
  size: TokenSizeKey;
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
  block: boolean;
};

export const StyledTitle = styled.span<StyledTitleStrongProps>`
  ${({ block }) => (block ? "display: block;" : "")}
  color: ${({ theme, colorProp }) => getFontColor(theme, colorProp, "inherit")};
  ${({ theme, size }) => getTypographyString(theme, "Title", size)};
`;
