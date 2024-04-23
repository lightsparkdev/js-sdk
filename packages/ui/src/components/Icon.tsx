import styled from "@emotion/styled";
import * as icons from "../icons/index.js";
import { rootFontSizePx } from "../styles/common.js";
import { isString } from "../utils/strings.js";

export type IconName = keyof typeof icons;

type IconProps = {
  className?: string;
  name: IconName;
  width: number;
  mr?: number;
  ml?: number;
  verticalAlign?: "middle" | "top" | "bottom" | "super" | number;
  color?: string | undefined;
  tutorialStep?: number;
};

export function Icon({
  className,
  name,
  width,
  tutorialStep,
  mr = 0,
  ml = 0,
  color = undefined,
  verticalAlign = "middle",
}: IconProps) {
  const IconComponent = icons[name] || null;

  /** Assume width is px relative to the root font size but specify
   * in ems to preserve scale for larger font sizes */
  const w = parseFloat((width / rootFontSizePx).toFixed(2));
  const mrRems = parseFloat((mr / rootFontSizePx).toFixed(2));
  const mlRems = parseFloat((ml / rootFontSizePx).toFixed(2));
  const va =
    typeof verticalAlign === "string"
      ? verticalAlign
      : parseFloat((verticalAlign / rootFontSizePx).toFixed(2));

  return (
    <IconContainer
      className={className}
      w={w}
      mr={mrRems}
      ml={mlRems}
      verticalAlign={va}
      fontColor={color}
      data-tutorial-tip={tutorialStep?.toString()}
    >
      {IconComponent ? <IconComponent /> : null}
    </IconContainer>
  );
}

type IconContainerProps = {
  w: number;
  mr: number;
  ml: number;
  verticalAlign: string | number;
  fontColor?: string | undefined;
};

export const IconContainer = styled.span<IconContainerProps>`
  pointer-events: none;
  display: inline-flex;
  ${({ mr, ml, w }) => `
    width: ${w}em;
    /* ensure no shrink in flex containers: */
    min-width: ${w}em;
    ${mr ? `margin-right: ${mr}em;` : ""}
    ${ml ? `margin-left: ${ml}em;` : ""}
  `}

  vertical-align: ${({ verticalAlign }) =>
    isString(verticalAlign) ? verticalAlign : `${verticalAlign}em`};

  ${({ fontColor }) => `
    & svg {
      color: ${fontColor || "inherit"};
    }
  `}
`;
