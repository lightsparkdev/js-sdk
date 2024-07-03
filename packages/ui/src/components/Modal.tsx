"use client";
import styled from "@emotion/styled";

import type { ComponentProps, MutableRefObject } from "react";
import React, { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useLiveRef } from "../hooks/useLiveRef.js";
import { Breakpoints, bp, useBreakpoints } from "../styles/breakpoints.js";
import {
  overlaySurface,
  standardBorderRadius,
  standardContentInset,
  standardFocusOutline,
} from "../styles/common.js";
import { Spacing } from "../styles/tokens/spacing.js";
import { TokenSize } from "../styles/tokens/typography.js";
import { overflowAutoWithoutScrollbars } from "../styles/utils.js";
import { z } from "../styles/z-index.js";
import { select } from "../utils/emotion.js";
import { toReactNodes, type ToReactNodesArgs } from "../utils/toReactNodes.js";
import { Button, ButtonSelector } from "./Button.js";
import { Drawer } from "./Drawer.js";
import { Icon } from "./Icon/Icon.js";
import { IconWithCircleBackground } from "./IconWithCircleBackground.js";
import { ProgressBar, type ProgressBarProps } from "./ProgressBar.js";
import { UnstyledButton } from "./UnstyledButton.js";
import { Body } from "./typography/Body.js";
import { Headline, headlineSelector } from "./typography/Headline.js";

type ExtraAction = ComponentProps<typeof Button> & {
  /** Determines the placement relative to the submission/cancel buttons. */
  placement: "above" | "below";
};

type SubmitLinkWithRoute<RoutesType extends string> = {
  to: RoutesType;
};

type SubmitLinkWithHref = {
  href: string;
  filename?: string;
};

// Styles for the modal when below the sm breakpoint
type SmKind = "drawer" | "fullscreen" | "default";

function isSubmitLinkWithHref<RoutesType extends string>(
  submitLink: SubmitLinkWithRoute<RoutesType> | SubmitLinkWithHref | undefined,
): submitLink is SubmitLinkWithHref {
  return Boolean(submitLink && "href" in submitLink);
}

type TopContent = ComponentProps<typeof IconWithCircleBackground>;

type ModalProps<RoutesType extends string> = {
  visible: boolean;
  onClose: () => void;
  topContent?: TopContent | undefined;
  title?: ToReactNodesArgs;
  description?: ToReactNodesArgs;
  cancelText?: string | undefined;
  cancelDisabled?: boolean;
  cancelHidden?: boolean;
  ghost?: boolean;
  onSubmit?: (() => void) | undefined;
  onCancel?: () => void;
  submitDisabled?: boolean;
  submitLoading?: boolean;
  submitText?: string;
  submitLink?:
    | {
        to: RoutesType;
      }
    | SubmitLinkWithHref;
  children?: React.ReactNode;
  /* most of the time this is an Element but not in the case of Select - it
   * just extends .focus method: */
  firstFocusRef?: MutableRefObject<{ focus: () => void } | null>;
  /* This should always be true for accessibility purposes unless you are
   * managing focus in a child component */
  autoFocus?: boolean;
  smKind?: SmKind;
  top?: number;
  nonDismissable?: boolean;
  width?: 460 | 600;
  progressBar?: ProgressBarProps;
  /** Determines if buttons are laid out horizontally or vertically */
  buttonLayout?: "horizontal" | "vertical";
  /** Allows placing extra buttons in the same button layout */
  extraActions?: ExtraAction[] | undefined;
  /** Displays a back button at the top of the modal which calls this function */
  handleBack?: () => void;
};

export function Modal<RoutesType extends string>({
  visible,
  topContent,
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
  submitLink,
  cancelText = "Cancel",
  firstFocusRef,
  smKind = "default",
  top,
  nonDismissable = false,
  autoFocus = true,
  width = 460,
  progressBar,
  buttonLayout = "horizontal",
  extraActions,
  handleBack,
}: ModalProps<RoutesType>) {
  const visibleChangedRef = useRef(false);
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
    if (visible !== visibleChangedRef.current) {
      visibleChangedRef.current = visible;
    }
  }, [visible]);
  const visibleChanged = visible !== visibleChangedRef.current;

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
      if (visibleChanged) {
        prevFocusedElement.current = document.activeElement;
      }
      if (typeof ref === "object" && ref?.current && autoFocus) {
        ref.current.focus();
      }
    } else if (visibleChanged && prevFocusedElement.current) {
      (prevFocusedElement.current as HTMLElement).focus();
    }
  }, [visible, visibleChanged, ref, autoFocus]);

  function onClickCloseButton(event?: React.MouseEvent) {
    event?.stopPropagation();
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

  const linkIsHref = isSubmitLinkWithHref(submitLink);
  const linkIsRoute = !linkIsHref && submitLink;

  const buttonContent = (
    <>
      {extraActions
        ?.filter((action) => action.placement === "above")
        .map(({ placement, text, ...rest }, i) => (
          <Button key={text || `no-text-${i}`} text={text} {...rest} />
        ))}
      {!isSm && !cancelHidden && (
        <Button
          disabled={cancelDisabled}
          onClick={onClickCancel}
          text={cancelText}
        />
      )}
      {(onSubmit || submitLink) && (
        <Button
          kind="primary"
          disabled={submitDisabled}
          text={submitText ?? "Continue"}
          loading={submitLoading}
          to={linkIsRoute ? submitLink.to : undefined}
          href={linkIsHref ? submitLink.href : undefined}
          hrefFilename={linkIsHref ? submitLink.filename : undefined}
          /* If submit button is a link we should not attempt to submit the form and
                    should call onClick instead for onSubmit side-effects: */
          type={submitLink ? "button" : "submit"}
          /* The form element handles submit events when submit button is not a link: */
          onClick={submitLink ? onSubmit : undefined}
        />
      )}
      {isSm && !cancelHidden && <Button onClick={onClose} text={cancelText} />}
      {extraActions
        ?.filter((action) => action.placement === "below")
        .map(({ placement, text, ...rest }, i) => (
          <Button key={text || `no-text-${i}`} text={text} {...rest} />
        ))}
    </>
  );

  let titleContent: React.ReactNode | null = null;
  if (title) {
    if (typeof title === "string") {
      titleContent = (
        <Headline heading="h4" size={TokenSize.Small}>
          {title}
        </Headline>
      );
    } else {
      titleContent = toReactNodes(title);
    }
  }

  let descriptionContent: React.ReactNode | null = null;
  if (description) {
    if (typeof description === "string") {
      descriptionContent = (
        <Description>
          <Body size={"ExtraSmall"} content={description} />
        </Description>
      );
    } else {
      descriptionContent = (
        <Description>{toReactNodes(description)}</Description>
      );
    }
  }

  let topContentNode = null;
  if (topContent) {
    topContentNode = (
      <div css={{ marginBottom: Spacing["xl"] }}>
        <IconWithCircleBackground {...topContent} />
      </div>
    );
  }

  const modalContent = (
    <Fragment>
      {progressBar ? (
        <div css={{ marginBottom: "20px" }}>
          <ProgressBar
            progressPercentage={progressBar.progressPercentage}
            isSm={progressBar.isSm}
          />
        </div>
      ) : null}
      {topContentNode}
      {titleContent}
      {descriptionContent}
      {children}
      {onSubmit || onCancel || submitLink ? (
        buttonLayout === "horizontal" ? (
          <ModalButtonRow>{buttonContent}</ModalButtonRow>
        ) : (
          <ModalButtonColumn>{buttonContent}</ModalButtonColumn>
        )
      ) : null}
    </Fragment>
  );

  let content: React.ReactNode;
  if (smKind === "drawer" && isSm) {
    content = (
      <Drawer
        onClose={() => onClickCloseButton()}
        closeButton
        nonDismissable={nonDismissable}
        handleBack={handleBack}
      >
        {modalContent}
      </Drawer>
    );
  } else {
    content = (
      <Fragment>
        {!(smKind === "fullscreen" && bp.isSm()) ? (
          <ModalOverlay ref={overlayRef} />
        ) : null}
        <ModalContainer
          aria-modal
          aria-hidden
          tabIndex={-1}
          role="dialog"
          ref={modalContainerRef}
          top={top || (smKind === "default" ? standardContentInset.smPx : 0)}
        >
          <ModalContent width={width} ghost={ghost} smKind={smKind}>
            {!firstFocusRef && (
              <DefaultFocusTarget ref={defaultFirstFocusRefCb} />
            )}
            {!ghost && (
              <ModalNavigation>
                {handleBack && (
                  <BackButton onClick={handleBack}>
                    <Icon name="ChevronLeft" width={16} />
                  </BackButton>
                )}
                {!nonDismissable && (
                  <CloseButton onClick={onClickCloseButton} type="button">
                    <Icon name="Close" width={9} />
                  </CloseButton>
                )}
              </ModalNavigation>
            )}
            <ModalContentInner ghost={ghost}>{modalContent}</ModalContentInner>
          </ModalContent>
        </ModalContainer>
      </Fragment>
    );
  }

  return visible && nodeReady && nodeRef.current
    ? ReactDOM.createPortal(
        onSubmit ? <form onSubmit={onSubmitForm}>{content}</form> : content,
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
`;

const ModalContainer = styled.div<{ top: number }>`
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
  ${(props) => `top: ${props.top}px;`}
`;

const contentTopMarginPx = 24;
const Description = styled.div`
  color: ${({ theme }) => theme.mcNeutral};
  margin-top: ${Spacing.sm};
  & + * {
    margin-top: ${contentTopMarginPx}px;
  }
`;

const ModalButtonRow = styled.div`
  margin-top: ${Spacing.lg};
  ${bp.minSm(`display: flex;`)}
  gap: 10px;

  ${ButtonSelector()} {
    width: 50%;
    ${bp.sm(`
      width: 100%;
    `)}
  }
`;

const ModalButtonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Spacing.sm};

  ${ButtonSelector()} {
    width: 100%;
  }

  margin-top: ${Spacing.lg};
`;

const ModalContent = styled.div<{
  width: number;
  smKind: SmKind;
  ghost?: boolean | undefined;
}>`
  pointer-events: auto;
  transition: width 0.25s ease-in;

  ${({ theme, smKind, ghost }) =>
    ghost ? "" : overlaySurface({ theme, border: smKind !== "fullscreen" })}
  ${overflowAutoWithoutScrollbars}
  ${(props) =>
    props.smKind === "fullscreen" && bp.isSm()
      ? `
    width: 100%;
    height: 100%;
  `
      : `
    ${props.ghost ? "" : standardBorderRadius(16)}
    ${standardContentInset.smCSS.styles}
    width: ${props.width}px;
    max-width: 100%;
    max-height: 100%;
    position: absolute;
  `}
  ${(props) => (props.ghost ? "" : "padding: 16px 16px 40px;")}

  ${headlineSelector("h4")} { {
    margin: 0;
    & + *:not(${select(Description)}) {
      margin-top: ${contentTopMarginPx}px;
    }
  }
`;

const ModalNavigation = styled.div`
  display: grid;
  grid-auto-flow: column;
  width: 100%;
`;

const BackButton = styled(UnstyledButton)`
  ${standardFocusOutline}
  width: 24px;
  height: 24px;
  justify-self: flex-start;
`;

const CloseButton = styled(UnstyledButton)`
  ${standardFocusOutline}
  width: 24px;
  height: 24px;
  justify-self: flex-end;
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
