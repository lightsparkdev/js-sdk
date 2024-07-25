"use client";

import styled from "@emotion/styled";
import { useRef, useState } from "react";
import { colors } from "../styles/colors.js";
import { standardFocusOutline } from "../styles/common.js";
import { Spacing } from "../styles/tokens/spacing.js";
import { z } from "../styles/z-index.js";
import { Button } from "./Button.js";
import { Icon } from "./Icon/Icon.js";
import { UnstyledButton } from "./UnstyledButton.js";

interface Props {
  children?: React.ReactNode;
  onClose?: () => void;
  grabber?: boolean;
  closeButton?: boolean;
  nonDismissable?: boolean;
  handleBack?: (() => void) | undefined;
}

export const Drawer = (props: Props) => {
  const [isOpen, setIsOpen] = useState(true);
  const [lastY, setLastY] = useState<number | null>(null);
  const [totalDeltaY, setTotalDeltaY] = useState<number>(0);
  const [fractionVisible, setFractionVisible] = useState<number>(1);
  const [grabbing, setGrabbing] = useState(false);
  const drawerContainerRef = useRef<null | HTMLDivElement>(null);

  const handleClose = () => {
    if (props.nonDismissable) {
      return;
    }

    setIsOpen(false);

    setTimeout(() => {
      props.onClose && props.onClose();
      setTotalDeltaY(0);
      setLastY(null);
    }, 300);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (props.nonDismissable) {
      return;
    }

    if (lastY === null) {
      setLastY(event.touches[0].clientY);
    } else {
      const deltaY = event.touches[0].clientY - lastY;

      const topOfDrawer =
        (drawerContainerRef.current?.getBoundingClientRect().top || 0) +
        window.scrollY;
      const drawerContainerHeight =
        drawerContainerRef.current?.getBoundingClientRect().height || 1;
      const newFractionVisible = Math.min(
        1,
        (window.innerHeight - topOfDrawer) / drawerContainerHeight,
      );
      setFractionVisible(newFractionVisible);
      setLastY(event.touches[0].clientY);
      setTotalDeltaY((prev) => Math.max(prev + deltaY, 0));
    }
  };

  const handleTouchStart = () => {
    if (props.nonDismissable) {
      return;
    }

    setGrabbing(true);
  };

  const handleTouchEnd = () => {
    if (props.nonDismissable) {
      return;
    }

    setGrabbing(false);
    if (fractionVisible < 0.8) {
      handleClose();
    }
    setTotalDeltaY(0);
    setLastY(null);
  };

  return (
    <>
      <Background
        isOpen={isOpen}
        fractionVisible={fractionVisible}
        onClick={handleClose}
      />
      <DrawerContainer
        isOpen={isOpen}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        totalDeltaY={totalDeltaY}
        grabbing={grabbing}
        ref={drawerContainerRef}
      >
        {props.grabber && !props.nonDismissable && (
          <Grabber onClick={handleClose}>
            <GrabberBar />
          </Grabber>
        )}
        {props.handleBack && (
          <BackButtonContainer>
            <Button
              onClick={props.handleBack}
              icon="ChevronLeft"
              kind="ghost"
              size="Small"
            />
          </BackButtonContainer>
        )}
        {props.closeButton && !props.nonDismissable && (
          <CloseButtonContainer>
            <CloseButton onClick={handleClose} type="button">
              <Icon name="Close" width={12} />
            </CloseButton>
          </CloseButtonContainer>
        )}
        {props.children}
      </DrawerContainer>
    </>
  );
};

const Background = styled.div<{ isOpen: boolean; fractionVisible: number }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${z.modalOverlay};

  // Animate opacity
  transition: opacity 0.3s ease-in-out;
  opacity: ${(props) => (props.isOpen ? props.fractionVisible : "0")};

  animation: open 0.3s ease-in-out;

  @keyframes open {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const DrawerContainer = styled.div<{
  isOpen: boolean;
  totalDeltaY: number;
  grabbing: boolean;
}>`
  position: fixed;
  max-height: 100dvh;
  width: 100%;
  background-color: ${({ theme }) => theme.bg};
  right: 0;
  bottom: 0;
  transform: translateY(${(props) => `${props.totalDeltaY}px`});
  z-index: ${z.modalContainer};
  border-radius: ${Spacing.px.lg} ${Spacing.px.lg} 0 0;
  display: flex;
  flex-direction: column;
  padding: ${Spacing.px["6xl"]} ${Spacing.px.xl} ${Spacing.px["2xl"]}
    ${Spacing.px.xl};
  overflow-y: scroll;

  // Only smooth transition when not grabbing, otherwise dragging will feel very laggy
  ${(props) =>
    props.grabbing && props.isOpen
      ? ""
      : "transition: transform 0.3s ease-in-out;"};

  // Animate the drawer opening and closing, and make sure the the drawer stays closed.
  animation: 0.3s ease-in-out
    ${(props) => (props.isOpen ? "openDrawer" : "closeDrawer forwards")};

  @keyframes openDrawer {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0%);
    }
  }

  @keyframes closeDrawer {
    from {
      transform: translateY(${(props) => `${props.totalDeltaY}px`});
    }
    to {
      transform: translateY(100%);
    }
  }
`;

const Grabber = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: ${Spacing.px.lg};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 9px;
  cursor: pointer;
`;

const CloseButtonContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  border-radius: 50%;
  background-color: ${colors.grayBlue94};
  padding: ${Spacing.px.xs};
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;

  * > * {
    line-height: 14px;
  }
`;

const CloseButton = styled(UnstyledButton)`
  ${standardFocusOutline}
  width: 24px;
  height: 24px;
  justify-self: flex-end;
`;

const BackButtonContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  border-radius: 50%;
  padding: ${Spacing.px.xs};
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
`;

const GrabberBar = styled.div`
  width: 36px;
  height: 5px;
  border-radius: 2.5px;
  background: #c0c9d6;
`;
