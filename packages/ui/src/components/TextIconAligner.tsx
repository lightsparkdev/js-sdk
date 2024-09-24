/** @jsxImportSource @emotion/react */
import { type ThemeOrColorKey } from "../styles/themes.js";
import { setDefaultReactNodesTypography } from "../utils/toReactNodes/setReactNodesTypography.js";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../utils/toReactNodes/toReactNodes.js";
import { Icon } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";
import { type PartialSimpleTypographyProps } from "./typography/types.js";

/* The goal here is to constrain allowed spacings and avoid one-offs
   to ensure spacings are as consistent as possible throughout the UI. */
const marginPx = [4, 6, 8, 10, 12] as const;
type MarginPx = (typeof marginPx)[number];

const width = [12, 14, 16] as const;
export type TextIconAlignerIconWidth = (typeof width)[number];

type TextIconAlignerProps = {
  content?: ToReactNodesArgs | undefined;
  typography?: PartialSimpleTypographyProps | undefined;
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
  content: contentProp,
  typography: typographyProp,
  rightIcon,
  leftIcon,
  onClick,
}: TextIconAlignerProps) {
  const defaultTypography = {
    type: typographyProp?.type || "Body",
    size: typographyProp?.size || "Small",
    color: typographyProp?.color || "text",
  } as const;

  const defaultTypographyMap = {
    link: defaultTypography,
    text: defaultTypography,
    nextLink: defaultTypography,
  };

  const nodesWithTypography = setDefaultReactNodesTypography(
    contentProp,
    defaultTypographyMap,
  );

  const content = toReactNodes(nodesWithTypography);

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
      {content}
      {rightIconNode}
    </span>
  );
}
