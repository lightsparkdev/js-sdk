import styled from "@emotion/styled";
import { useBreakpoints } from "../../styles/breakpoints.js";
import { Spacing } from "../../styles/tokens/spacing.js";
import { z } from "../../styles/z-index.js";
import { Button } from "../Button.js";
import { Modal } from "../Modal.js";

type Side = "left" | "right";

// TODO(brian): Move to public ui package if we decide to go with this implementation.
export const Popover = ({
  show,
  setShow,
  side = "left",
  onApply,
  onClear,
  children,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
  side: Side;
  onApply: () => void;
  onClear: () => void;
  children: React.ReactNode;
}) => {
  const breakPoint = useBreakpoints();
  const isSm = breakPoint.isSm();

  const handleApply = () => {
    onApply();
  };
  const handleClear = () => {
    onClear();
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onApply();
    }
  };

  const content = (
    <Content onKeyDownCapture={handleKeyPress} isSm={isSm}>
      {children}
      <Footer>
        <Button text="Clear" onClick={handleClear} />
        <FooterRight>
          <Button text="Cancel" onClick={() => setShow(false)} />
          <Button text="Apply" kind="primary" onClick={handleApply} />
        </FooterRight>
      </Footer>
    </Content>
  );
  if (isSm) {
    return (
      <Modal visible={show} onClose={() => setShow(false)} smKind="fullscreen">
        {content}
      </Modal>
    );
  }

  return (
    <Container show={show} side={side}>
      {content}
    </Container>
  );
};

const Container = styled.div<{ show: boolean; side: Side }>`
  position: absolute;
  z-index: ${z.dropdown};
  top: 44px;
  display: ${({ show }) => (show ? "block" : "none")};
  ${({ side }) => (side === "right" ? "right: 0;" : "left: 0;")}
  width: 400px;
  background: white;
  border: 0.5px solid ${({ theme }) => theme.c1Neutral};
  border-radius: 12px;
  box-shadow:
    0px 1px 4px 0px rgba(0, 0, 0, 0.1),
    0px 4px 8px 0px rgba(0, 0, 0, 0.08);
`;

const Content = styled.div<{ isSm?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${Spacing.px.xl};
  padding: ${({ isSm }) => (isSm ? "0px" : Spacing.px.lg)};
`;

const Footer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const FooterRight = styled.div`
  display: flex;
  gap: ${Spacing.px.xs};
`;
