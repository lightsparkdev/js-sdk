import styled from "@emotion/styled";
import { colors } from "../styles/colors.js";
import { standardBorderRadius } from "../styles/common.js";
import { LabelModerate } from "../styles/fonts/typography/LabelModerate.js";
import { TokenSize } from "../styles/fonts/typographyTokens.js";
import { isLight } from "../styles/themes.js";

type BadgeColor = "neutral" | "error";

export type BadgeProps = {
  text?: string | undefined;
  color?: BadgeColor | undefined;
  ml?: 0 | 4 | 6;
  mr?: 0 | 4 | 6;
};

export function Badge({ text, color, ml = 0, mr = 0 }: BadgeProps) {
  const labelColor = color === "error" ? "#D80027" : colors.black;
  return text ? (
    <StyledBadge color={color} ml={ml}>
      <LabelModerate size={TokenSize.Small} color={labelColor}>
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
    if (color === "error") {
      return "#D800271A";
    } else {
      return isLight(theme) ? theme.c05Neutral : theme.c15Neutral;
    }
  }};
`;
