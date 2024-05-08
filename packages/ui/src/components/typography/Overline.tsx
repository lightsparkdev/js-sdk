"use client";

import styled from "@emotion/styled";
import { getFontColor, type FontColorKey } from "../../styles/themes.js";
import {
  getTypographyString,
  type TokenSizeKey,
} from "../../styles/tokens/typography.js";

export type OverlineProps = {
  children: React.ReactNode;
  size?: TokenSizeKey;
  color?: FontColorKey | undefined;
};

export const Overline = ({
  children,
  color,
  size = "Medium",
}: OverlineProps) => {
  return (
    <StyledOverline size={size} colorProp={color}>
      {children}
    </StyledOverline>
  );
};

type StyledOverlineProps = {
  children: React.ReactNode;
  size: TokenSizeKey;
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
};

export const StyledOverline = styled.span<StyledOverlineProps>`
  color: ${({ theme, colorProp }) => getFontColor(theme, colorProp, "inherit")};
  ${({ theme, size }) => getTypographyString(theme, "Overline", size)}
  cursor: inherit;
`;
