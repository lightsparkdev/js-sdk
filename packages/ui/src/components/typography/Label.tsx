"use client";

import styled from "@emotion/styled";
import { getFontColor, type FontColorKey } from "../../styles/themes.js";
import {
  getTypographyString,
  type TokenSizeKey,
} from "../../styles/tokens/typography.js";

type LabelProps = {
  children: React.ReactNode;
  size?: TokenSizeKey;
  color?: FontColorKey | undefined;
};

export const Label = ({ children, color, size = "Medium" }: LabelProps) => {
  return (
    <StyledLabel size={size} colorProp={color}>
      {children}
    </StyledLabel>
  );
};

type StyledLabelProps = {
  children: React.ReactNode;
  size: TokenSizeKey;
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
};

export const StyledLabel = styled.label<StyledLabelProps>`
  color: ${({ theme, colorProp }) => getFontColor(theme, colorProp, "inherit")};
  ${({ theme, size }) => getTypographyString(theme, "Label", size)}
  cursor: inherit;
`;
