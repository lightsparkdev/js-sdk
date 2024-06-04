import styled from "@emotion/styled";
import { LabelModerate } from "../components/typography/index.js";
import { standardBorderRadius } from "../styles/common.js";
import { getColor, isLight } from "../styles/themes.js";

type BadgeColor = "text" | "danger";

export type BadgeProps = {
  text?: string | undefined;
  color?: BadgeColor | undefined;
  ml?: 0 | 4 | 6;
  mr?: 0 | 4 | 6;
};

export function Badge({ text, color, ml = 0, mr = 0 }: BadgeProps) {
  return text ? (
    <StyledBadge color={color} ml={ml}>
      <LabelModerate size="Small" color={color}>
        {text}
      </LabelModerate>
    </StyledBadge>
  ) : null;
}

export const badgeVPadding = 2;
const StyledBadge = styled.span<{ color: BadgeColor | undefined; ml: number }>`
  ${standardBorderRadius(4)}
  ${({ ml }) => (ml === 0 ? "" : `margin-left: ${ml}px;`)}
  padding: ${badgeVPadding}px 6px;
  background-color: ${({ theme, color }) => {
    if (color === "danger") {
      return getColor(theme, "red42a10");
    } else {
      return isLight(theme) ? theme.c05Neutral : theme.c15Neutral;
    }
  }};
`;
