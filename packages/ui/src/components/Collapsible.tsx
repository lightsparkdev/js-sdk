import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { standardBorderRadius } from "../styles/common.js";
import { Spacing } from "../styles/tokens/spacing.js";
import { overflowAutoWithoutScrollbars } from "../styles/utils.js";
import { Icon } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";

type CollapsibleProps = {
  children: React.ReactNode;
  className?: string;
  text?: string;
  color?: string;
  open?: boolean | undefined;
  handleToggle?: (open: boolean) => void | undefined;
  openIcon?: IconName | undefined;
  closeIcon?: IconName | undefined;
  /**
   * Opens the collapsible to full screen height if true.
   */
  full?: boolean | undefined;
  /**
   * Adds padding to the content of the collapsible.
   */
  contentIndent?: boolean | undefined;
  /**
   * Replaces the default button text with the provided element.
   */
  buttonTextElement?: React.ReactNode;
};

export function Collapsible({
  children,
  className,
  text,
  color,
  open,
  handleToggle,
  openIcon,
  closeIcon,
  full,
  buttonTextElement,
  contentIndent = true,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(open);

  const handleClick = () => {
    if (handleToggle) {
      handleToggle(!isOpen);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const iconName =
    openIcon && closeIcon ? (isOpen ? closeIcon : openIcon) : "Chevron";
  // This is a one-off because the close svg is much larger in comparison to
  // the designs
  const iconWidth = iconName === "Close" ? 12 : 14;

  let textElement: React.ReactNode = <div></div>;
  if (buttonTextElement) {
    textElement = buttonTextElement;
  } else if (text) {
    textElement = <Text color={color}>{text}</Text>;
  }

  return (
    <StyledCollapsible className={className}>
      <StyledCollapsibleButton onClick={handleClick}>
        {textElement}
        <IconContainer
          isOpen={isOpen}
          useCustomIcon={openIcon !== undefined && closeIcon !== undefined}
        >
          <Icon width={iconWidth} name={iconName} />
        </IconContainer>
      </StyledCollapsibleButton>
      <CollapsingContainer isOpen={isOpen} full={full}>
        <InnerPadding contentIndent={contentIndent}>{children}</InnerPadding>
      </CollapsingContainer>
    </StyledCollapsible>
  );
}

export const StyledCollapsible = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledCollapsibleButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  cursor: pointer;
  ${standardBorderRadius(8)}
  padding: 0;
`;

const IconContainer = styled.div<{
  isOpen?: boolean | undefined;
  useCustomIcon?: boolean | undefined;
}>`
  ${(props) => {
    if (props.useCustomIcon) {
      return;
    }
    return props.isOpen
      ? `transform: rotate(0deg);`
      : `transform: rotate(-90deg);`;
  }}
  transition: transform 0.25s ease-out;
  width: 20px;
`;

export const CollapsingContainer = styled.div<{
  isOpen?: boolean | undefined;
  full?: boolean | undefined;
}>`
  overflow: scroll;
  opacity: 0;
  animation-duration: 0.4s;
  animation-fill-mode: forwards;

  ${(props) =>
    props.isOpen
      ? `height: 100%; animation-name: fadeIn;`
      : `height: 0; animation-name: fadeOut;`}
  ${(props) => (props.full ? `height: ${props.isOpen ? "100vh" : 0};` : "")}

  ${overflowAutoWithoutScrollbars}

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: none;
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
      visibility: hidden;
    }
  }
`;

const InnerPadding = styled.div<{ contentIndent?: boolean | undefined }>`
  padding: ${Spacing.px["3xs"]} 0 ${Spacing.px["3xs"]}
    ${(props) => (props.contentIndent ? Spacing.px.md : "0")};
  gap: ${Spacing.px["4xs"]};
  display: flex;
  flex-direction: column;
`;

const Text = styled.span<{ color?: string | undefined }>`
  ${(props) => (props.color ? `color: ${props.color};` : "")}
  line-height: inherit;
`;
