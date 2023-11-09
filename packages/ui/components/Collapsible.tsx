import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Icon } from ".";

type CollapsibleProps = {
  children: React.ReactNode;
  className?: string;
  text?: string;
  open?: boolean | undefined;
  handleToggle?: (open: boolean) => void | undefined;
  hamburger?: boolean | undefined;
  full?: boolean | undefined;
};

export function Collapsible({
  children,
  className,
  text,
  open,
  handleToggle,
  hamburger,
  full,
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

  const iconName = hamburger ? (isOpen ? "Close" : "StackedLines") : "Down";
  // This is a one-off because the close svg is much larger in comparison to the designs
  const iconWidth = iconName === "Close" ? 12 : 14;

  return (
    <StyledCollapsible className={className}>
      <StyledCollapsibleButton onClick={handleClick}>
        {text ? text : <div></div>}
        <IconContainer isOpen={isOpen} hamburger={hamburger}>
          <Icon width={iconWidth} name={iconName} />
        </IconContainer>
      </StyledCollapsibleButton>
      <CollapsingContainer isOpen={isOpen} full={full}>
        <InnerPadding>{children}</InnerPadding>
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
  border-radius: 8px;
  padding: 0;
`;

const IconContainer = styled.div<{
  isOpen?: boolean | undefined;
  hamburger?: boolean | undefined;
}>`
  ${(props) => {
    if (props.hamburger) {
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
  gap: 4px;
  display: flex;
  flex-direction: column;

  ${(props) =>
    props.isOpen
      ? `height: 100%; animation-name: fadeIn;`
      : `height: 0; animation-name: fadeOut;`}
  ${(props) => (props.full ? `height: 100vh;` : "")}

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

const InnerPadding = styled.div`
  padding: 4px 0 4px 16px;
`;
