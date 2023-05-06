import styled from "@emotion/styled/macro";
import { useLayoutEffect, useState } from "react";

const rootFontSizePx = 12;

function isString(str: unknown): str is string {
  return typeof str === "string";
}

type Component = () => JSX.Element;

type IconMap = {
  [key: string]: Component;
};

const iconMap: IconMap = {};

async function loadIcon(iconName: string) {
  let IconComp;
  try {
    ({ default: IconComp } = await import(
      // this can't be a variable only, needs to have some string constraints:
      `./${iconName}.tsx`
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
  color?: string;
};

const defaultProps = {
  verticalAlign: "middle" as const,
  mr: 0,
  ml: 0,
  color: undefined,
};

export function Icon({
  className,
  name,
  width,
  mr = defaultProps.mr,
  ml = defaultProps.ml,
  verticalAlign = defaultProps.verticalAlign,
  color = defaultProps.color,
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
    >
      {IconComponent ? <IconComponent /> : null}
    </IconContainer>
  );
}

Icon.defaultProps = defaultProps;

type IconContainerProps = {
  w: number;
  mr: number;
  ml: number;
  verticalAlign: string | number;
  fontColor?: string;
};

export const IconContainer = styled.span<IconContainerProps>`
  pointer-events: none;
  display: inline-flex;
  ${({ mr, ml, w }) => `
    width: ${w}em;
    ${mr ? `margin-right: ${mr}em;` : ""}
    ${ml ? `margin-left: ${ml}em;` : ""}
  `}

  vertical-align: ${({ verticalAlign }) =>
    isString(verticalAlign) ? verticalAlign : `${verticalAlign}em`};

  ${({ fontColor, theme }) => `
    & svg {
      color: ${fontColor || "inherit"};
    }
  `}
`;
