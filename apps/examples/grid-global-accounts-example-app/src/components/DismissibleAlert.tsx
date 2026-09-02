import styled from "@emotion/styled";
import { Alert } from "@lightsparkdev/origin";
import type { ComponentProps } from "react";

type DismissibleAlertProps = ComponentProps<typeof Alert> & {
  /** Called when the user clicks the close (✕) button. */
  onClose: () => void;
};

/**
 * An Origin <Alert> with a close button. Origin's Alert has no dismiss
 * affordance, so we overlay one at the top-right and reserve room for it so a
 * long description doesn't run underneath.
 */
export function DismissibleAlert({
  onClose,
  ...alertProps
}: DismissibleAlertProps) {
  return (
    <Wrap>
      <Alert {...alertProps} />
      <CloseButton type="button" aria-label="Dismiss" onClick={onClose}>
        ✕
      </CloseButton>
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  /* Higher specificity than Origin's .root class, so it wins reliably. */
  & [role="alert"] {
    padding-right: 44px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: var(--corner-radius-sm, 6px);
  color: var(--text-tertiary, #8a8a8a);
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  &:hover {
    color: var(--text-primary, #1a1a1a);
    background: var(--surface-hover, rgba(0, 0, 0, 0.04));
  }
`;
