import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Icon } from ".";

interface TextStyles {
  bold?: boolean;
}
type CollapsibleProps = {
  children: React.ReactNode;
  className?: string;
  textStyles?: TextStyles;
  text?: string;
  open?: boolean | undefined;
  handleToggle?: (open: boolean) => void | undefined;
  hamburger?: boolean | undefined;
  full?: boolean | undefined;
};

export function Collapsible({
  children,
  className,
  textStyles,
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

  return (
    <Container className={className}>
      <Button onClick={handleClick}>
        <Text textStyles={textStyles}>{text}</Text>
        <IconContainer isOpen={isOpen} hamburger={hamburger}>
          <Icon width={14} name={iconName} />
        </IconContainer>
      </Button>
      <CollapsingContainer isOpen={isOpen} full={full}>
        {children}
      </CollapsingContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Button = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 500;
  height: 32px;
  padding: 0;
`;

const Text = styled.span<{ textStyles?: TextStyles | undefined }>`
  ${(props) => (props.textStyles?.bold ? "font-weight: 700;" : "")}
  font-size: 16px;
  line-height: 24px;
  text-align: left;
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
  transition: transform 0.25s ease-in-out;
  width: 20px;
`;

const CollapsingContainer = styled.div<{
  isOpen?: boolean | undefined;
  full?: boolean | undefined;
}>`
  ${(props) =>
    props.isOpen
      ? `max-height: 100vh; animation-name: fadeIn;`
      : `max-height: 0; animation-name: fadeOut;`}
  ${(props) => (props.full ? `height: 100vh;` : "")}
  overflow: hidden;
  transition: max-height 0.25s ease-in-out;
  opacity: 0;
  animation-duration: 0.4s;
  animation-fill-mode: forwards;

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
    }
  }
`;
