// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import styled from "@emotion/styled";
import { standardFocusOutline } from "@lightsparkdev/ui/styles/common";

export const UnstyledButton = styled.button`
  ${standardFocusOutline}
  font-family: ${({ theme }) => theme.fontFamily};
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
