"use client";

import styled from "@emotion/styled";
import { getFontColor, type FontColorKey } from "../../styles/themes.js";
import {
  getTypographyString,
  type TokenSizeKey,
} from "../../styles/tokens/typography.js";

export type LabelModerateProps = {
  children: React.ReactNode;
  size?: TokenSizeKey;
  color?: FontColorKey | undefined;
};

export const LabelModerate = ({
  children,
  color,
  size = "Medium",
}: LabelModerateProps) => {
  return (
    <StyledLabelModerate size={size} colorProp={color}>
      {children}
    </StyledLabelModerate>
  );
};

type StyledLabelModerateProps = {
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
  children: React.ReactNode;
  size: TokenSizeKey;
};

export const StyledLabelModerate = styled.label<StyledLabelModerateProps>`
  color: ${({ theme, colorProp }) => getFontColor(theme, colorProp, "inherit")};
  ${({ theme, size }) => getTypographyString(theme, "Label Moderate", size)}
  cursor: inherit;

  * {
    color: ${({ theme, colorProp }) =>
      getFontColor(theme, colorProp, "inherit")};
    ${({ theme, size }) => getTypographyString(theme, "Label Moderate", size)}
  }
`;
