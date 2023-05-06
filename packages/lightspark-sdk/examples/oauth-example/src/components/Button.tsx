import styled from "@emotion/styled";

export const UnstyledButton = styled.button`
  appearance: none;
  background: transparent;
  border: none;
  padding: 0;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  /* needed in Safari for some reason */
  font-size: 1rem;
  color: inherit;
  font-weight: inherit;
`;

export const Button = styled(UnstyledButton)<{ primary?: boolean }>`
  display: inline-flex;
  opacity: ${({ disabled }) => (disabled ? 0.2 : 1)};
  transition: opacity 0.2s;
  position: relative;

  color: ${({ primary }) => (primary ? "white" : "black")};
  font-size: 14px;
  font-weight: 600;

  text-align: center;
  white-space: nowrap;
  background-color: ${({ primary }) => (primary ? "black" : "white")};
  border: 1px solid black;
  border-radius: 32px;
  padding: 12px 24px;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }
`;
