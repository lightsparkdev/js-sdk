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
  gap?: number | undefined;
};

export function Flex({
  center = false,
  justify: justifyProp,
  align: alignProp,
  column = false,
  children,
  onClick,
  gap,
  as = "div",
  overflow,
  whiteSpace,
  mt,
  mr,
  mb,
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
      mb={mb}
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
  mt: FlexProps["mt"];
  mr: FlexProps["mr"];
  mb: FlexProps["mb"];
  ml: FlexProps["ml"];
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
  ${({ mt }) =>
    typeof mt === "number"
      ? `margin-top: ${mt}px;`
      : mt === "auto"
      ? `margin-top: ${mt};`
      : ""}
  ${({ mr }) =>
    typeof mr === "number"
      ? `margin-right: ${mr}px;`
      : mr === "auto"
      ? `margin-right: ${mr};`
      : ""}
  ${({ mb }) =>
    typeof mb === "number"
      ? `margin-bottom: ${mb}px;`
      : mb === "auto"
      ? `margin-bottom: ${mb};`
      : ""}
  ${({ ml }) =>
    typeof ml === "number"
      ? `margin-left: ${ml}px;`
      : ml === "auto"
      ? `margin-left: ${ml};`
      : ""}
  ${({ gap }) => gap && `gap: ${gap}px;`}
`;
