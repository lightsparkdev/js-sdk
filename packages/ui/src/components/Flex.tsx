import styled from "@emotion/styled";
import { type ElementType, type ReactNode } from "react";

type FlexProps = {
  center?: boolean | undefined;
  justify?: "center" | "flex-start" | "flex-end" | "space-between" | undefined;
  align?: "center" | "flex-start" | "flex-end" | "space-between" | undefined;
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
};

export function Flex({
  center = false,
  justify: justifyProp,
  align: alignProp,
  column = false,
  children,
  onClick,
  as = "div",
  overflow,
  whiteSpace,
  mr,
  ml,
}: FlexProps) {
  const justify = justifyProp ? justifyProp : center ? "center" : "flex-start";
  const align = alignProp ? alignProp : center ? "center" : "flex-start";

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
};

const StyledFlex = styled.div<StyledFlexProps>`
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
    mr ? `margin-right: ${typeof mr === "number" ? `${mr}px` : mr};` : ""}
  ${({ ml }) =>
    ml ? `margin-left: ${typeof ml === "number" ? `${ml}px` : ml};` : ""}
`;
