import styled from "@emotion/styled";
import { type ElementType, type ReactNode } from "react";

type FlexProps = {
  center?: boolean | undefined;
  justify?:
    | "stretch"
    | "center"
    | "flex-start"
    | "flex-end"
    | "space-between"
    | undefined;
  align?:
    | "stretch"
    | "center"
    | "flex-start"
    | "flex-end"
    | "space-between"
    | undefined;
  children?: ReactNode;
  as?: ElementType | undefined;
  column?: boolean | undefined;
  onClick?: (() => void) | undefined;
  overflow?: "hidden" | "visible" | "scroll" | "auto" | undefined;
  mr?: number | "auto" | undefined;
  ml?: number | "auto" | undefined;
  whiteSpace?:
    | "nowrap"
    | "normal"
    | "pre"
    | "pre-wrap"
    | "pre-line"
    | undefined;
  mt?: number | "auto" | undefined;
  gap?: number | undefined;
};

export function Flex({
  center = false,
  justify: justifyProp,
  align: alignProp,
  column = false,
  children,
  onClick,
  mt,
  gap,
  as = "div",
  overflow,
  whiteSpace,
  mr,
  ml,
}: FlexProps) {
  const justify = justifyProp ? justifyProp : center ? "center" : "stretch";
  const align = alignProp ? alignProp : center ? "center" : "stretch";

  return (
    <StyledFlex
      justify={justify}
      align={align}
      column={column}
      as={as}
      onClick={onClick}
      cursorProp={onClick ? "pointer" : "unset"}
      overflowProp={overflow}
      whiteSpace={whiteSpace}
      mr={mr}
      ml={ml}
      mt={mt}
      gap={gap}
    >
      {children}
    </StyledFlex>
  );
}

type StyledFlexProps = {
  justify: NonNullable<FlexProps["justify"]>;
  align: NonNullable<FlexProps["align"]>;
  column: boolean;
  cursorProp: "pointer" | "initial" | "unset";
  overflowProp: FlexProps["overflow"];
  whiteSpace: FlexProps["whiteSpace"];
  mr: FlexProps["mr"];
  ml: FlexProps["ml"];
  mt: FlexProps["mt"];
  gap: number | undefined;
};

export const StyledFlex = styled.div<StyledFlexProps>`
  display: flex;
  text-overflow: ellipsis;

  ${({ column }) => column && `flex-direction: column;`}
  ${({ justify }) => `justify-content: ${justify};`}
  ${({ align }) => `align-items: ${align};`}
  ${({ cursorProp }) => `cursor: ${cursorProp};`}
  ${({ overflowProp }) =>
    overflowProp ? `overflow: ${overflowProp}; max-width: 100%;` : ""}
  ${({ whiteSpace }) => (whiteSpace ? `white-space: ${whiteSpace};` : "")}
  ${({ mr }) =>
    typeof mr === "number"
      ? `margin-right: ${mr}px;`
      : mr === "auto"
      ? `margin-right: ${mr};`
      : ""}
  ${({ ml }) =>
    typeof ml === "number"
      ? `margin-left: ${ml}px;`
      : ml === "auto"
      ? `margin-left: ${ml};`
      : ""}
  ${({ mt }) =>
    typeof mt === "number"
      ? `margin-top: ${mt}px;`
      : mt === "auto"
      ? `margin-top: ${mt};`
      : ""}
  ${({ gap }) => gap && `gap: ${gap}px;`}
`;
