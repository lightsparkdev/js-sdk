/** @jsxImportSource @emotion/react */
import { Icon } from "./Icon.js";

/* The goal here is to constrain allowed spacings and avoid one-offs
   to ensure spacings are as consistent as possible throughout the UI. */
const marginPx = [6, 12] as const;
type MarginPx = (typeof marginPx)[number];

export type TextIconAlignerProps = {
  text: string;
  rightIcon?:
    | {
        name: string;
        color?: string;
        lg?: boolean | undefined;
        ml?: MarginPx | undefined;
      }
    | undefined
    | null;
  leftIcon?:
    | {
        name: string;
        color?: string;
        lg?: boolean | undefined;
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
      width={leftIcon.lg ? 16 : 12}
      mr={leftIcon.mr || 6}
      color={leftIcon.color}
    />
  ) : null;
  const rightIconNode = rightIcon ? (
    <Icon
      name={rightIcon.name}
      width={rightIcon.lg ? 16 : 12}
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
