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
};

export function Flex({
  center = false,
  justify: justifyProp,
  align: alignProp,
  column = false,
  children,
  onClick,
  as = "div",
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
};

const StyledFlex = styled.div<StyledFlexProps>`
  display: flex;

  ${({ column }) => column && `flex-direction: column;`}
  ${({ justify }) => `justify-content: ${justify};`}
  ${({ align }) => `align-items: ${align};`}
  ${({ cursorProp }) => `cursor: ${cursorProp};`}
`;
