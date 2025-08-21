import type { CSSInterpolation } from "@emotion/css";
import { css, useTheme } from "@emotion/react";
import type { CSSObject } from "@emotion/styled";
import styled from "@emotion/styled";
import type {
  ComponentProps,
  FocusEvent,
  KeyboardEvent,
  ReactNode,
  RefObject,
} from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { useLiveRef } from "../hooks/useLiveRef.js";
import {
  Link,
  type ExternalLink,
  type LinkProps,
  type RouteHash,
  type RouteParams,
} from "../router.js";
import { bp } from "../styles/breakpoints.js";
import {
  overlaySurface,
  standardBorderRadius,
  standardFocusOutline,
} from "../styles/common.js";
import { smHeaderLogoMarginLeft } from "../styles/constants.js";
import { themeOr, type ThemeProp, type WithTheme } from "../styles/themes.js";
import { z } from "../styles/z-index.js";
import { type NewRoutesType } from "../types/index.js";
import { Button } from "./Button.js";
import { Icon } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";
import { MultiToggle } from "./MultiToggle.js";
import { Toggle } from "./Toggle.js";
import { UnstyledButton } from "./UnstyledButton.js";

type DropdownItemGetProps = WithTheme<{
  dropdownItem: DropdownItemType;
}>;

type DropdownItemType = {
  label: string;
  getIcon?:
    | (({ theme, dropdownItem }: DropdownItemGetProps) =>
        | {
            name: IconName;
            color?: string;
            width?: number;
          }
        | undefined)
    | undefined;
  onClick?: ((dropdownItem: DropdownItemType) => void) | undefined;
  getCSS?: ({ dropdownItem, theme }: DropdownItemGetProps) => CSSInterpolation;
  to?: NewRoutesType | undefined;
  externalLink?: ExternalLink | undefined;
  params?: RouteParams | undefined;
  selected?: boolean;
  toggle?:
    | ComponentProps<typeof MultiToggle>
    | ComponentProps<typeof Toggle>
    | undefined;
  hash?: RouteHash;
};

type DropdownGetProps = WithTheme<{ isOpen: boolean }>;

type DropdownBorderRadius = 6 | 8 | 12;

type CommonSimpleDropdownButton = {
  id?: string;
  getCSS?: ({ isOpen, theme }: DropdownGetProps) => CSSInterpolation;
};

export type SimpleDropdownButton =
  | (CommonSimpleDropdownButton & {
      label: string;
    })
  | (CommonSimpleDropdownButton & {
      getContent: ({ isOpen, theme }: DropdownGetProps) => ReactNode;
    });

type DropdownProps = {
  button: ComponentProps<typeof Button> | SimpleDropdownButton;
  dropdownItems?: DropdownItemType[];
  dropdownContent?: ReactNode;
  horizontalScrollRef?: RefObject<HTMLElement | null>;
  minDropdownItemsWidth?: number;
  maxDropdownItemsWidth?: number;
  onClickDropdownItems?: () => void;
  closeOnScroll?: boolean;
  align?: "left" | "right" | "center";
  verticalPlacement?: "top" | "bottom";
  footer?: ReactNode | null;
  getCSS?: ({ isOpen, theme }: DropdownGetProps) => CSSObject;
  getDropdownItemsCSS?: ({ isOpen, theme }: DropdownGetProps) => CSSObject;
  onOpen?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
  borderRadius?: DropdownBorderRadius;
  openOnHover?: boolean;
};

export function Dropdown({
  button,
  dropdownItems,
  horizontalScrollRef,
  onClickDropdownItems,
  getCSS,
  getDropdownItemsCSS,
  isOpen: isOpenProp,
  onOpen,
  onClose,
  closeOnScroll = false,
  openOnHover = false,
  minDropdownItemsWidth = 200,
  maxDropdownItemsWidth = 300,
  align = "center" as const,
  verticalPlacement = "bottom",
  footer = null,
  dropdownContent = null,
  borderRadius = 8,
}: DropdownProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(isOpenProp || false);

  const [dropdownButtonHeight, setDropdownButtonHeight] = useState(0);
  const [dropdownButtonWidth, setDropdownButtonWidth] = useState(0);
  const [dropdownCoords, setDropdownCoords] = useState({
    top: 0,
    left: 0,
    right: 0,
  });
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownButtonRef, dropdownButtonRefCb] =
    useLiveRef<HTMLButtonElement>();
  const dropdownItemsRef = useRef<HTMLUListElement | null>(null);
  const [dropdownItemsWidth, setDropdownItemsWidth] = useState(0);
  const [dropdownItemsHeight, setDropdownItemsHeight] = useState(0);
  const nodeRef = useRef<null | HTMLDivElement>(null);
  const [nodeReady, setNodeReady] = useState(false);

  useEffect(() => {
    if (isOpenProp !== undefined) {
      setIsOpen(isOpenProp);
    }
  }, [isOpenProp]);

  useEffect(() => {
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

  const setOpen = useCallback(
    (newValue: boolean) => {
      setIsOpen(newValue);
      if (newValue && onOpen) {
        onOpen();
      } else if (!newValue && onClose) {
        onClose();
      }
    },
    [onOpen, onClose],
  );

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    } else if (["Enter", "Return"].includes(event.key)) {
      event.preventDefault();
      setOpen(!isOpen);
    }
  }

  function handleBlur(event: FocusEvent<HTMLElement>) {
    const targetOutsideDropdownItems =
      dropdownItemsRef.current &&
      !dropdownItemsRef.current.contains(event.relatedTarget) &&
      event.relatedTarget !== null;
    if (targetOutsideDropdownItems) {
      setOpen(false);
    }
  }

  // close dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      const targetOutsideDropdownItems =
        dropdownItemsRef.current &&
        !dropdownItemsRef.current.contains(event.target as Node);
      const targetOutsideDropdownButton =
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target as Node);
      if (
        isOpen &&
        event.target &&
        targetOutsideDropdownItems &&
        targetOutsideDropdownButton
      ) {
        setOpen(false);
      }
    }
    window.document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setOpen, dropdownButtonRef]);

  const reposition = useCallback(() => {
    if (dropdownButtonRef.current && dropdownItemsRef.current) {
      const dropdownButtonRect =
        dropdownButtonRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: dropdownButtonRect.top,
        left: dropdownButtonRect.left,
        right: dropdownButtonRect.right,
      });
      setDropdownButtonHeight(dropdownButtonRect.height);
      setDropdownButtonWidth(dropdownButtonRect.width);

      const dropdownItemsRect =
        dropdownItemsRef.current.getBoundingClientRect();
      setDropdownItemsWidth(dropdownItemsRect.width);
      setDropdownItemsHeight(dropdownItemsRect.height);
    }
  }, [dropdownButtonRef]);

  // handle all cases where a dropdown nav needs to be repositioned:
  useLayoutEffect(() => {
    function onWindowResize() {
      setOpen(false);
      reposition();
    }

    function handleScroll() {
      if (closeOnScroll) {
        setOpen(false);
      }
      reposition();
    }

    reposition();

    let dropdownButtonResizeObserver: ResizeObserver | null = null;
    if (dropdownButtonRef.current) {
      dropdownButtonResizeObserver = new ResizeObserver(reposition);
      dropdownButtonResizeObserver.observe(dropdownButtonRef.current);
    }

    let dropdownResizeObserver: ResizeObserver | null = null;
    if (dropdownButtonRef.current) {
      dropdownResizeObserver = new ResizeObserver(reposition);
      dropdownResizeObserver.observe(dropdownButtonRef.current);
    }

    window.addEventListener("resize", onWindowResize);

    let navItemsResizeObserver: ResizeObserver | null = null;
    window.addEventListener("scroll", handleScroll);
    if (horizontalScrollRef?.current) {
      horizontalScrollRef.current.addEventListener("scroll", handleScroll);
      navItemsResizeObserver = new ResizeObserver(reposition);
      navItemsResizeObserver.observe(horizontalScrollRef.current);
    }
    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("scroll", handleScroll);
      dropdownButtonResizeObserver?.disconnect();
      navItemsResizeObserver?.disconnect();
      dropdownResizeObserver?.disconnect();
    };
  }, [
    setOpen,
    horizontalScrollRef,
    closeOnScroll,
    reposition,
    dropdownButtonRef,
  ]);

  const handleClickDropdownItems = useCallback(() => {
    setOpen(false);
    onClickDropdownItems && onClickDropdownItems();
  }, [onClickDropdownItems, setOpen]);

  const dropdownTopMargin = 8;
  let dropdownItemOffsetTop =
    dropdownCoords.top + dropdownButtonHeight + dropdownTopMargin;

  let dropdownItemOffsetLeft = 0;

  if (align === "center") {
    dropdownItemOffsetLeft =
      dropdownCoords.left - (dropdownItemsWidth - dropdownButtonWidth) / 2;
  } else if (align === "right") {
    dropdownItemOffsetLeft = dropdownCoords.right - dropdownItemsWidth;
  }

  if (verticalPlacement === "top") {
    dropdownItemOffsetTop =
      dropdownCoords.top - dropdownItemsHeight - dropdownTopMargin;
  }

  const commonButtonProps = {
    id: button.id,
    type: "button",
    onMouseEnter: () => {
      if (openOnHover) {
        reposition();
        setOpen(true);
      }
    },
    onMouseLeave: () => {
      if (openOnHover) {
        setOpen(false);
      }
    },
    onMouseDown: () => {
      reposition();
      setOpen(!isOpen);
    },
    onKeyDown: handleKeyDown,
    onFocus: () => {
      reposition();
      setOpen(true);
    },
    onBlur: handleBlur,
    ref: dropdownButtonRefCb,
  } as const;

  const commonUnstyledButtonProps = {
    ...commonButtonProps,
    css:
      "getCSS" in button && button.getCSS
        ? button.getCSS({ isOpen, theme })
        : undefined,
  };

  let buttonNode: ReactNode = null;
  if ("label" in button) {
    buttonNode = (
      <UnstyledDropdownButton {...commonUnstyledButtonProps}>
        {button.label}
      </UnstyledDropdownButton>
    );
  } else if ("getContent" in button) {
    buttonNode = (
      <UnstyledDropdownButton {...commonUnstyledButtonProps}>
        {button.getContent({ isOpen, theme })}
      </UnstyledDropdownButton>
    );
  } else {
    buttonNode = <Button {...button} {...commonButtonProps} />;
  }

  const containerCSS = getCSS && getCSS({ isOpen, theme });
  const dropdownItemsCSS =
    getDropdownItemsCSS && getDropdownItemsCSS({ isOpen, theme });

  return (
    <div
      css={{ position: "relative", display: "inline-flex", ...containerCSS }}
      ref={dropdownRef}
    >
      {buttonNode}
      {nodeReady && nodeRef.current
        ? ReactDOM.createPortal(
            <DropdownItems
              isOpen={isOpen}
              left={dropdownItemOffsetLeft}
              top={dropdownItemOffsetTop}
              ref={dropdownItemsRef}
              minWidth={minDropdownItemsWidth}
              maxWidth={maxDropdownItemsWidth}
              hasItems={dropdownItems ? dropdownItems.length > 0 : false}
              borderRadius={borderRadius}
              css={dropdownItemsCSS}
            >
              {dropdownItems?.map((dropdownItem, i) => {
                return (
                  <li key={dropdownItem.label} onBlur={handleBlur}>
                    <DropdownItem
                      dropdownItem={dropdownItem}
                      onClick={handleClickDropdownItems}
                    />
                  </li>
                );
              })}
              {dropdownContent}
              {footer && <DropdownFooter>{footer}</DropdownFooter>}
            </DropdownItems>,
            nodeRef.current,
          )
        : null}
    </div>
  );
}

const DropdownFooter = styled.div`
  padding: 24px 16px 0;
  border-top: 1px solid ${({ theme }) => theme.c2Neutral};
  margin-top: 16px;
`;

type DropdownItemsProps = {
  isOpen: boolean;
  left: number;
  top: number;
  minWidth?: number;
  maxWidth?: number;
  hasItems: boolean;
  borderRadius: DropdownBorderRadius;
};

const DropdownItems = styled.ul<DropdownItemsProps>`
  ${overlaySurface}
  color: ${({ theme }) => themeOr(theme.c6Neutral, theme.c8Neutral)};
  ${({ borderRadius }) => standardBorderRadius(borderRadius)}
  ${({ hasItems }) => (hasItems ? "padding: 12px 0;" : "padding: 0;")}
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  position: fixed;
  ${({ minWidth }) => (minWidth ? `min-width: ${minWidth}px;` : "")}
  ${({ maxWidth }) => (maxWidth ? `max-width: ${maxWidth}px;` : "")}
  left: ${({ left }) => left}px;
  top: ${({ top }) => top}px;
  z-index: ${z.dropdown};
  list-style: none;
  margin: 0;
`;

type DropdownItemProps = {
  dropdownItem: DropdownItemType & { selected?: boolean };
  onClick?: () => void;
  getCSS?: ({ dropdownItem, theme }: DropdownItemGetProps) => CSSInterpolation;
};

function DropdownItem({ dropdownItem, onClick }: DropdownItemProps) {
  const theme = useTheme();

  const dropdownItemIcon =
    dropdownItem.getIcon && dropdownItem.getIcon({ dropdownItem, theme });
  const dropdownItemIconNode = dropdownItemIcon ? (
    <Icon
      name={dropdownItemIcon.name}
      width={dropdownItemIcon.width || 12}
      mr={10}
    />
  ) : null;

  const cssProp =
    dropdownItem.getCSS && dropdownItem.getCSS({ theme, dropdownItem });

  const onClickDropdownItem = useCallback(() => {
    dropdownItem.onClick && dropdownItem.onClick(dropdownItem);
    onClick && onClick();
  }, [dropdownItem, onClick]);

  // to may be '' for the current route so check !== undefined
  if (dropdownItem.to !== undefined || dropdownItem.externalLink) {
    // single nav item

    return (
      <DropdownItemLink
        selected={Boolean(dropdownItem.selected)}
        to={dropdownItem.to}
        externalLink={dropdownItem.externalLink}
        params={dropdownItem.params}
        onClick={onClickDropdownItem}
        css={cssProp}
        hash={dropdownItem.hash}
      >
        {dropdownItemIconNode}
        {dropdownItem.label}
      </DropdownItemLink>
    );
  }

  if (dropdownItem.toggle) {
    return (
      <DropdownItemDiv selected={false} css={cssProp} withHoverColor={false}>
        {dropdownItemIconNode}
        {dropdownItem.label}
        <div css={{ marginLeft: "auto" }}>
          {"options" in dropdownItem.toggle ? (
            <MultiToggle {...dropdownItem.toggle} />
          ) : (
            <Toggle {...dropdownItem.toggle} />
          )}
        </div>
      </DropdownItemDiv>
    );
  }

  return (
    <DropdownItemDiv
      selected={false}
      css={cssProp}
      onClick={onClickDropdownItem}
    >
      {dropdownItemIconNode}
      {dropdownItem.label}
    </DropdownItemDiv>
  );
}

const UnstyledDropdownButton = styled(UnstyledButton)`
  ${standardFocusOutline}
`;

type DropdownItemStyleProps = WithTheme<{
  selected?: boolean;
  withHoverColor?: boolean;
}>;

const dropdownItemStyle = ({
  theme,
  selected,
  withHoverColor = true,
}: DropdownItemStyleProps) => `
  background-color: ${selected ? theme.primary : "transparent"};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  outline-color: ${selected ? theme.onPrimaryText : theme.hcNeutral} !important;
  white-space: nowrap;

  padding: 8px 16px;
  ${bp.sm(`padding-left: ${smHeaderLogoMarginLeft};`)}

  ${
    withHoverColor
      ? `
      &:hover {
        color: ${theme.hcNeutral} !important;
      }
      `
      : ""
  }
`;

type StyledDropdownItemProps = {
  selected?: boolean;
  withHoverColor?: boolean;
};

const cssProp = ({
  theme,
  selected,
}: ThemeProp & StyledDropdownItemProps) => css`
  ${dropdownItemStyle({ theme, selected: Boolean(selected) })}
  ${standardFocusOutline({ theme })}
`;

function DropdownItemLink(props: StyledDropdownItemProps & LinkProps) {
  const theme = useTheme();
  return (
    <Link
      {...props}
      css={cssProp({ theme, selected: Boolean(props.selected) })}
    />
  );
}

const DropdownItemDiv = styled.div<StyledDropdownItemProps>`
  ${dropdownItemStyle}
  ${standardFocusOutline}
`;
