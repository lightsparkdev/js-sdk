"use client";

import styled from "@emotion/styled";
import { App, getTypographyString, TokenSize } from "../typographyTokens";

interface Props {
  children: React.ReactNode;
  app?: App;
  size?: TokenSize;
  color?: string | undefined;
}

export const LabelStrong = ({
  children,
  color,
  app = App.Lightspark,
  size = TokenSize.Medium,
}: Props) => {
  return (
    <StyledLabelStrong app={app} size={size} color={color}>
      {children}
    </StyledLabelStrong>
  );
};

export const StyledLabelStrong = styled.label<Props>`
  ${(props) => (props.color === undefined ? "" : `color: ${props.color};`)}
  ${({ theme, app, size }) => {
    return app && size
      ? getTypographyString(theme.typography[app]["Label Strong"][size])
      : "";
  }}
`;
