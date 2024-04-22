/** @jsxImportSource @emotion/react */
import { Icon } from "./Icon.js";

/* The goal here is to constrain allowed spacings and avoid one-offs
   to ensure spacings are as consistent as possible throughout the UI. */
const marginPx = [4, 6, 8, 10, 12] as const;
type MarginPx = (typeof marginPx)[number];

const width = [12, 14, 16] as const;
type Width = (typeof width)[number];

export type TextIconAlignerProps = {
  text: string;
  rightIcon?:
    | {
        name: string;
        color?: string;
        width?: Width | undefined;
        ml?: MarginPx | undefined;
      }
    | undefined
    | null;
  leftIcon?:
    | {
        name: string;
        color?: string;
        width?: Width | undefined;
        mr?: MarginPx | undefined;
      }
    | undefined
    | null;
  onClick?: (() => void) | undefined;
};

export function TextIconAligner({
  text,
  rightIcon,
  leftIcon,
  onClick,
}: TextIconAlignerProps) {
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
      {text}
      {rightIconNode}
    </span>
  );
}
