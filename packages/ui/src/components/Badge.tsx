import styled from "@emotion/styled";
import { isLight } from "../styles/colors.js";
import { standardBorderRadius } from "../styles/common.js";

type BadgeProps = {
  text?: string | undefined;
  ml?: number;
};

export function Badge({ text, ml = 0 }: BadgeProps) {
  return text ? <StyledBadge ml={ml}>{text}</StyledBadge> : null;
}

export const badgeVPadding = 2;
const StyledBadge = styled.span<{ ml: number }>`
  ${standardBorderRadius(4)}
  ${({ ml }) => (ml === 0 ? "" : `margin-left: ${ml}px;`)}
  padding: ${badgeVPadding}px 6px;
  background-color: ${({ theme }) =>
    isLight(theme) ? theme.c05Neutral : theme.c15Neutral};
`;
