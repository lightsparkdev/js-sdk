import styled from "@emotion/styled";
import { pxToRems } from "../styles/utils.js";

export type StatusIndicatorColors =
  | "success"
  | "warning"
  | "danger"
  | "primary";
export type StatusIndicatorProps = {
  color?: StatusIndicatorColors;
  text: string;
  size?: 12 | 14;
  fontWeight?: 500 | 700;
};

export function StatusIndicator({
  color = "success",
  text,
  size = 12,
  fontWeight = 700,
}: StatusIndicatorProps) {
  return (
    <StyledStatusIndicator color={color} size={size} fontWeight={fontWeight}>
      {text}
    </StyledStatusIndicator>
  );
}

type StyledStatusIndicatorProps = Required<Omit<StatusIndicatorProps, "text">>;

const StyledStatusIndicator = styled.div<StyledStatusIndicatorProps>`
  color: ${({ theme, color }) => theme[color]};
  font-size: ${({ size }) => pxToRems(size)};
  font-weight: ${({ fontWeight }) => fontWeight};
`;
