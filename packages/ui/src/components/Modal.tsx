"use client";
import styled from "@emotion/styled";

import type { MutableRefObject } from "react";
import React, { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useLiveRef } from "../hooks/useLiveRef.js";
import { Breakpoints, bp, useBreakpoints } from "../styles/breakpoints.js";
import {
  overlaySurface,
  smContentInset,
  standardContentInsetSmPx,
  standardFocusOutline,
} from "../styles/common.js";
import { overflowAutoWithoutScrollbars, pxToRems } from "../styles/utils.js";
import { z } from "../styles/z-index.js";
import { Button } from "./Button.js";
import { Icon } from "./Icon.js";
import { UnstyledButton } from "./UnstyledButton.js";

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string | undefined;
  cancelText?: string | undefined;
  cancelDisabled?: boolean;
  cancelHidden?: boolean;
  ghost?: boolean;
  onSubmit?: (() => void) | undefined;
  onCancel?: () => void;
  submitDisabled?: boolean;
  submitLoading?: boolean;
  submitText?: string;
  children: React.ReactNode;
  /**
   * most of the time this is an Element but not in the case of Select - it
   * just extends .focus method:
   */
  firstFocusRef?: MutableRefObject<{ focus: () => void } | null>;
  /**
   * This should always be true for accessibility purposes unless you are
   * managing focus in a child component
   */
  autoFocus?: boolean;
  nonDismissable?: boolean;
  width?: number;
};

export function Modal({
  visible,
  title,
  description,
  children,
  onClose,
  onCancel,
  cancelDisabled,
  cancelHidden,
  ghost,
  onSubmit,
  submitDisabled,
  submitLoading,
  submitText,
  cancelText,
  firstFocusRef,
  nonDismissable = false,
  autoFocus = true,
  width,
}: ModalProps) {
  const nodeRef = useRef<null | HTMLDivElement>(null);
  const [defaultFirstFocusRef, defaultFirstFocusRefCb] = useLiveRef();
  const ref = firstFocusRef || defaultFirstFocusRef;
  const [nodeReady, setNodeReady] = React.useState(false);
  const overlayRef = useRef<null | HTMLDivElement>(null);
  const prevFocusedElement = useRef<Element | null>();
  const modalContainerRef = useRef<null | HTMLDivElement>(null);
  const bp = useBreakpoints();
  const isSm = bp.current(Breakpoints.sm);

  useEffect(() => {
    prevFocusedElement.current = document.activeElement;
    if (!nodeRef.current) {
      nodeRef.current = document.createElement("div");
      document.body.appendChild(nodeRef.current);
    }
    setNodeReady(true);
    return () => {
      if (nodeRef.current) {
        document.body.removeChild(nodeRef.current);
        nodeRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        visible &&
        overlayRef.current &&
        event.target &&
        overlayRef.current.contains(event.target as Node) &&
        !nonDismissable
      ) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (visible && event.key === "Escape" && !nonDismissable) {
        onClose();
      }
    };
    if (visible) {
      if (modalContainerRef.current) {
        modalContainerRef.current.addEventListener("keydown", handleKeyDown);
      }
      if (overlayRef.current) {
        overlayRef.current.addEventListener("click", handleOutsideClick);
      }
    } else {
      if (modalContainerRef.current) {
        modalContainerRef.current.removeEventListener("keydown", handleKeyDown);
      }
      if (overlayRef.current) {
        overlayRef.current.removeEventListener("click", handleOutsideClick);
      }
    }

    const containerRef = modalContainerRef.current;
    const overlayRefVar = overlayRef.current;
    return () => {
      if (containerRef) {
        containerRef.removeEventListener("keydown", handleKeyDown);
      }
      if (overlayRefVar) {
        overlayRefVar.removeEventListener("click", handleOutsideClick);
      }
    };
  }, [onClose, visible, nonDismissable]);

  useLayoutEffect(() => {
    if (visible) {
      prevFocusedElement.current = document.activeElement;
      if (typeof ref === "object" && ref?.current && autoFocus) {
        ref.current.focus();
      }
    } else if (prevFocusedElement.current) {
      (prevFocusedElement.current as HTMLElement).focus();
    }
  }, [visible, ref, autoFocus]);

  function onClickCloseButton(event: React.MouseEvent) {
    event.stopPropagation();
    onClose();
  }

  function onSubmitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!submitDisabled && onSubmit) {
      onSubmit();
    }
  }

  function onClickCancel() {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  }

  const modalContent = (
    <Fragment>
      <ModalOverlay ref={overlayRef} />
      <ModalContainer
        aria-modal
        aria-hidden
        tabIndex={-1}
        role="dialog"
        ref={modalContainerRef}
      >
        <ModalContent width={width} ghost={ghost}>
          {!firstFocusRef && (
            <DefaultFocusTarget ref={defaultFirstFocusRefCb} />
          )}
          {!(nonDismissable || ghost) && (
            <CloseButton onClick={onClickCloseButton} type="button">
              <Icon name="Close" width={9} />
            </CloseButton>
          )}
          <ModalContentInner ghost={ghost}>
            {title ? <h4>{title}</h4> : null}
            {description ? <Description>{description}</Description> : null}
            <div>{children}</div>
            {onSubmit ? (
              <ModalButtonRow>
                {!isSm && !cancelHidden && (
                  <Button
                    disabled={cancelDisabled}
                    onClick={onClickCancel}
                    text={cancelText ?? "Cancel"}
                  />
                )}
                <Button
                  disabled={submitDisabled}
                  primary
                  text={submitText ?? "Continue"}
                  loading={submitLoading}
                  type="submit"
                />
                {isSm && !cancelHidden && (
                  <Button onClick={onClose} text="Cancel" />
                )}
              </ModalButtonRow>
            ) : null}
          </ModalContentInner>
        </ModalContent>
      </ModalContainer>
    </Fragment>
  );

  return visible && nodeReady && nodeRef.current
    ? ReactDOM.createPortal(
        onSubmit ? (
          <form onSubmit={onSubmitForm}>{modalContent}</form>
        ) : (
          modalContent
        ),
        nodeRef.current,
      )
    : null;
}

const DefaultFocusTarget = styled(UnstyledButton)`
  position: absolute;
  top: -30px;
  width: 0;
  height: 0;
`;

const ModalOverlay = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: ${z.modalOverlay};
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
`;

const ModalContainer = styled.div`
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${z.modalContainer};
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  outline: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.text};
  padding-top: ${standardContentInsetSmPx}px;
`;

const contentTopMarginPx = 24;
const Description = styled.div`
  color: ${({ theme }) => theme.mcNeutral};
  margin-top: 4px;
  & + * {
    margin-top: ${contentTopMarginPx}px;
  }
`;

const ModalButtonRow = styled.div`
  margin-top: 32px;
  ${bp.minSm(`display: flex;`)}

  button {
    width: 50%;
    ${bp.sm(`
      width: 100%;
    `)}
  }

  button:last-of-type {
    ${bp.sm(`
      margin-top: 16px;
    `)}
    ${bp.minSm(`
      margin-left: 10px;
    `)}
  }
`;

const ModalContent = styled.div<{
  width?: number | undefined;
  ghost?: boolean | undefined;
}>`
  ${overflowAutoWithoutScrollbars}
  ${smContentInset}
  ${(props) => (props.ghost ? "" : overlaySurface)}
  pointer-events: auto;
  width: ${(props) => props.width || 430}px;
  max-width: 100%;
  max-height: 100%;
  border-radius: 16px;
  position: absolute;
  ${(props) => (props.ghost ? "" : "padding: 16px 16px 40px;")}

  h4 {
    margin: 0;
    font-weight: 800;
    font-size: ${pxToRems(21)};
    & + *:not(${Description}) {
      margin-top: ${contentTopMarginPx}px;
    }
  }
`;

const CloseButton = styled(UnstyledButton)`
  ${standardFocusOutline}
  width: 24px;
  height: 24px;
`;

const ModalContentInner = styled.div<{ ghost?: boolean | undefined }>`
  ${(props) => (props.ghost ? "" : "padding: 32px 24px 0;")}
  ${(props) =>
    props.ghost
      ? ""
      : `${bp.sm(`
    padding-left: 10px;
    padding-right: 10px;
  `)}`}
`;
