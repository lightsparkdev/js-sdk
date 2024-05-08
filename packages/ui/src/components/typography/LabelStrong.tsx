"use client";

import styled from "@emotion/styled";
import { getFontColor, type FontColorKey } from "../../styles/themes.js";
import {
  getTypographyString,
  type TokenSizeKey,
} from "../../styles/tokens/typography.js";

export type LabelStrongProps = {
  children: React.ReactNode;
  size?: TokenSizeKey;
  color?: FontColorKey | undefined;
};

export const LabelStrong = ({
  children,
  color,
  size = "Medium",
}: LabelStrongProps) => {
  return (
    <StyledLabelStrong size={size} colorProp={color}>
      {children}
    </StyledLabelStrong>
  );
};

type StyledLabelStrongProps = {
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
  children: React.ReactNode;
  size: TokenSizeKey;
};

export const StyledLabelStrong = styled.label<StyledLabelStrongProps>`
  color: ${({ theme, colorProp }) => getFontColor(theme, colorProp, "inherit")};
  ${({ theme, size }) => getTypographyString(theme, "Label Strong", size)}
  cursor: inherit;

  * {
    color: ${({ theme, colorProp }) =>
      getFontColor(theme, colorProp, "inherit")};
    ${({ theme, size }) => getTypographyString(theme, "Label Strong", size)}
  }
`;
