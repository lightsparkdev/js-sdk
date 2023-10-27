"use client";

import styled from "@emotion/styled";

type Size = "sm" | "lg";

interface Props {
  keyboardKey: string;
  size?: Size;
  color?: string;
  backgroundColor?: string;
}

export const CommandKey = ({
  keyboardKey,
  size,
  color,
  backgroundColor,
}: Props) => {
  return (
    <StyledCommandKey
      color={color}
      size={size}
      backgroundColor={backgroundColor}
    >
      {keyboardKey}
    </StyledCommandKey>
  );
};

interface StyledCommandKeyProps {
  size?: Size | undefined;
  color?: string | undefined;
  backgroundColor?: string | undefined;
}

const StyledCommandKey = styled.div<StyledCommandKeyProps>`
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: ${(props) => props.color || "black"};
  ${(props) =>
    props.backgroundColor ? `background-color: ${props.backgroundColor};` : ""}
  border-radius: 3.6px;
  min-width: ${(props) => (props.size === "sm" ? 20 : 24)}px;
  height: ${(props) => (props.size === "sm" ? 20 : 24)}px;
  font-size: ${(props) => (props.size === "sm" ? 12 : 14)}px;
  padding: 3px 6px;
`;
