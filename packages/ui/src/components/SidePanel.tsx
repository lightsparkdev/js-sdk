import styled from "@emotion/styled";
import { Icon } from "./Icon/Icon.js";
import { UnstyledButton } from "./UnstyledButton.js";

type SidePanelProps = {
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
};

export function SidePanel({ children, visible, onClose }: SidePanelProps) {
  return (
    <StyledSidePanel visible={visible}>
      <UnstyledButton onClick={onClose}>
        <Icon name="Close" width={14} color="white" />
      </UnstyledButton>
      {children}
    </StyledSidePanel>
  );
}

type StyledSidePanelProps = {
  visible: boolean;
};

const StyledSidePanel = styled.div<StyledSidePanelProps>`
  background-color: rgba(0, 0, 0, 1);
  width: 356px;
  position: fixed;
  overflow: auto;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  ${({ visible }) => visible && "transform: translateX(0%);"}

  button {
    position: absolute;
    right: 20px;
    top: 20px;
  }
`;
