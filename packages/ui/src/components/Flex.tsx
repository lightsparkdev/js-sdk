import styled from "@emotion/styled";
import { type ElementType, type ReactNode } from "react";

type FlexProps = {
  center?: boolean | undefined;
  children?: ReactNode;
  as?: ElementType | undefined;
};

export function Flex({ center = false, children, as = "div" }: FlexProps) {
  return (
    <StyledFlex center={center} as={as}>
      {children}
    </StyledFlex>
  );
}

type StyledFlexProps = {
  center: boolean;
};

const StyledFlex = styled.div`
  display: flex;
  ${({ center }: StyledFlexProps) =>
    center &&
    `
    justify-content: center;
    align-items: center;
  `}
`;
