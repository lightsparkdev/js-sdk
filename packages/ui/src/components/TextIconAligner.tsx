/** @jsxImportSource @emotion/react */
import { type ThemeOrColorKey } from "../styles/themes.js";
import { type SimpleTypographyProps } from "../styles/typography.js";
import { type ToNonTypographicReactNodesArgs } from "../utils/toNonTypographicReactNodes.js";
import { Icon } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";
import { renderTypography } from "./typography/renderTypography.js";

/* The goal here is to constrain allowed spacings and avoid one-offs
   to ensure spacings are as consistent as possible throughout the UI. */
const marginPx = [4, 6, 8, 10, 12] as const;
type MarginPx = (typeof marginPx)[number];

const width = [12, 14, 16] as const;
export type TextIconAlignerIconWidth = (typeof width)[number];

type TextIconAlignerProps = {
  content?: ToNonTypographicReactNodesArgs | undefined;
  typography?: SimpleTypographyProps | undefined;
  rightIcon?:
    | {
        name: IconName;
        color?: ThemeOrColorKey | undefined;
        width?: TextIconAlignerIconWidth | undefined;
        ml?: MarginPx | undefined;
      }
    | undefined
    | null;
  leftIcon?:
    | {
        name: IconName;
        color?: ThemeOrColorKey | undefined;
        width?: TextIconAlignerIconWidth | undefined;
        mr?: MarginPx | undefined;
      }
    | undefined
    | null;
  onClick?: (() => void) | undefined;
};

export function TextIconAligner({
  content,
  typography,
  rightIcon,
  leftIcon,
  onClick,
}: TextIconAlignerProps) {
  const nodes = renderTypography(typography?.type || "Body", {
    content,
    size: typography?.size || "Small",
    color: typography?.color || "inherit",
  });

  const leftIconNode = leftIcon ? (
    <Icon
      name={leftIcon.name}
      width={leftIcon.width ? leftIcon.width : 12}
      mr={leftIcon.mr || 6}
      color={leftIcon.color}
    />
  ) : null;
  const rightIconNode = rightIcon ? (
    <Icon
      name={rightIcon.name}
      width={rightIcon.width ? rightIcon.width : 12}
      ml={rightIcon.ml || 6}
      color={rightIcon.color}
    />
  ) : null;

  return (
    <span
      css={{
        cursor: onClick ? "pointer" : "inherit",
        display: "inline-flex",
        alignItems: "center",
      }}
      onClick={onClick}
    >
      {leftIconNode}
      {nodes}
      {rightIconNode}
    </span>
  );
}
