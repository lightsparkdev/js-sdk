import styled from "@emotion/styled";
import { type ReactNode } from "react";

export type CardFormHeaderProps = {
  children?: ReactNode;
  bundle?: boolean;
  grow?: boolean;
};

export function CardFormHeader({
  children,
  bundle = false,
}: CardFormHeaderProps) {
  if (!bundle) {
    return children;
  }

  return <Wrapper>{children}</Wrapper>;
}

const Wrapper = styled.div<{ grow?: boolean }>`
  display: flex;
  flex-direction: column;
  ${({ grow }) => grow && `flex-grow: 1;`}
  height: 100%;
  justify-content: center;
`;
