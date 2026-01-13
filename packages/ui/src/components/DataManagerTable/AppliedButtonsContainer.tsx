import styled from "@emotion/styled";
import { Spacing } from "../../styles/tokens/spacing.js";
import { ButtonSelector } from "../Button.js";

export const AppliedButtonsContainer = styled.div`
  margin-top: ${Spacing.px.sm};
  display: flex;
  gap: ${Spacing.px.xs};
  flex-wrap: wrap;

  ${ButtonSelector()} {
    max-width: 100%;
  }
`;
