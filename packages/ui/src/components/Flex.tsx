import styled from "@emotion/styled";
import { type ElementType, type ReactNode } from "react";

type FlexProps = {
  center?: boolean | undefined;
  justify?:
    | "stretch"
    | "center"
    | "flex-start"
    | "start"
    | "flex-end"
    | "end"
    | "space-between"
    | undefined;
  align?:
    | "stretch"
    | "center"
    | "flex-start"
    | "start"
    | "flex-end"
    | "end"
    | "space-between"
    | undefined;
  children?: ReactNode;
  as?: ElementType | undefined;
  asButtonType?: "button" | "submit" | undefined;
  column?: boolean | undefined;
  onClick?: (() => void) | undefined;
  disabled?: boolean | undefined;
  overflow?: "hidden" | "visible" | "scroll" | "auto" | undefined;
  whiteSpace?:
    | "nowrap"
    | "normal"
    | "pre"
    | "pre-wrap"
    | "pre-line"
    | undefined;
  mt?: number | "auto" | undefined;
  mr?: number | "auto" | undefined;
  mb?: number | "auto" | undefined;
  ml?: number | "auto" | undefined;
  pt?: number | undefined;
  pr?: number | undefined;
  pb?: number | undefined;
  pl?: number | undefined;
  gap?: number | undefined;
};

export function Flex({
  center = false,
  justify: justifyProp,
  align: alignProp,
  column = false,
  children,
  onClick,
  disabled = false,
  gap,
  as = "div",
  asButtonType,
  overflow,
  whiteSpace,
  mt,
  mr,
  mb,
  ml,
  pt,
  pr,
  pb,
  pl,
}: FlexProps) {
  const justify = justifyProp ? justifyProp : center ? "center" : "stretch";
  const align = alignProp ? alignProp : center ? "center" : "stretch";

  const asButtonProps = asButtonType ? { type: asButtonType, disabled } : {};

  return (
    <StyledFlex
      justify={justify}
      align={align}
      column={column}
      as={as}
      onClick={disabled ? undefined : onClick}
      cursorProp={onClick ? (disabled ? "not-allowed" : "pointer") : "unset"}
      overflowProp={overflow}
      whiteSpace={whiteSpace}
      mr={mr}
      ml={ml}
      mt={mt}
      mb={mb}
      pt={pt}
      pr={pr}
      pb={pb}
      pl={pl}
      gap={gap}
      {...asButtonProps}
    >
      {children}
    </StyledFlex>
  );
}

function marginPropToString(
  margin: number | "auto" | undefined,
  type: "top" | "right" | "bottom" | "left",
) {
  if (typeof margin === "number") {
    return `margin-${type}: ${margin}px;`;
  } else if (margin === "auto") {
    return `margin-${type}: auto;`;
  }
  return "";
}

type StyledFlexProps = {
  justify: NonNullable<FlexProps["justify"]>;
  align: NonNullable<FlexProps["align"]>;
  column: boolean;
  cursorProp: "pointer" | "not-allowed" | "initial" | "unset";
  overflowProp: FlexProps["overflow"];
  whiteSpace: FlexProps["whiteSpace"];
  mt: FlexProps["mt"];
  mr: FlexProps["mr"];
  mb: FlexProps["mb"];
  ml: FlexProps["ml"];
  pt: FlexProps["pt"];
  pr: FlexProps["pr"];
  pb: FlexProps["pb"];
  pl: FlexProps["pl"];
  gap: number | undefined;
  as?: ElementType | undefined;
};

export const StyledFlex = styled.div<StyledFlexProps>`
  display: flex;
  text-overflow: ellipsis;

  ${({ as }) =>
    /* reset button styles */
    as === "button" &&
    `
    border: 0;
    appearance: none;
    background: transparent;
    padding: 0;
    /* needed in Safari for some reason */
    font-size: 1rem;
    color: inherit;
    font-weight: inherit;
  `}

  ${({ column }) => column && `flex-direction: column;`}
  ${({ justify }) => `justify-content: ${justify};`}
  ${({ align }) => `align-items: ${align};`}
  ${({ cursorProp }) => `cursor: ${cursorProp};`}
  ${({ overflowProp }) =>
    overflowProp ? `overflow: ${overflowProp}; max-width: 100%;` : ""}
  ${({ whiteSpace }) => (whiteSpace ? `white-space: ${whiteSpace};` : "")}
  ${({ gap }) => gap && `gap: ${gap}px;`}

  ${({ mt }) => marginPropToString(mt, "top")}
  ${({ mr }) => marginPropToString(mr, "right")}
  ${({ mb }) => marginPropToString(mb, "bottom")}
  ${({ ml }) => marginPropToString(ml, "left")}

  ${({ pt }) => pt && `padding-top: ${pt}px;`}
  ${({ pr }) => pr && `padding-right: ${pr}px;`}
  ${({ pb }) => pb && `padding-bottom: ${pb}px;`}
  ${({ pl }) => pl && `padding-left: ${pl}px;`}
`;
