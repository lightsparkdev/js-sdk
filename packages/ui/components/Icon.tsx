import styled from "@emotion/styled";
import { useLayoutEffect, useState } from "react";
import { rootFontSizePx } from "../styles/common";
import { isString } from "../utils/strings";

type Component = () => JSX.Element;

type IconMap = {
  [key: string]: Component;
};

const iconMap: IconMap = {};

async function loadIcon(iconName: string) {
  let IconComp;
  try {
    ({ default: IconComp } = await import(
      /* webpackMode: "eager" */
      // this can't be a variable only, needs to have some string constraints:
      `../icons/${iconName}.tsx`
    ));
  } catch (e) {
    throw new Error(`Icon ${iconName} not found`);
  }
  iconMap[iconName] = IconComp as Component;
}

type IconProps = {
  className?: string;
  name: string;
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
  verticalAlign = "middle",
  color = undefined,
}: IconProps) {
  const [, setLoading] = useState(false);

  const IconComponent = iconMap[name] || null;

  useLayoutEffect(() => {
    (async () => {
      if (!iconMap[name]) {
        setLoading(true);
        await loadIcon(name);
        setLoading(false);
      }
    })();
  }, [name]);

  // Assume width is px relative to the root font size but specify in ems to preserve scale for larger font sizes
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
