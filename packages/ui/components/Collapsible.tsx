import styled from "@emotion/styled";
import { useState } from "react";
import { Icon } from ".";

type CollapsibleProps = {
  children: React.ReactNode;
  className?: string;
  text?: string;
  open?: boolean | undefined;
};

export function Collapsible({
  children,
  className,
  text,
  open,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(open);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Container className={className}>
      <Button onClick={handleClick}>
        <Text>{text}</Text>
        <IconContainer isOpen={isOpen}>
          <Icon width={14} name="Down" />
        </IconContainer>
      </Button>
      <CollapsingContainer isOpen={isOpen}>{children}</CollapsingContainer>
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

const Text = styled.span`
  font-size: 16px;
  line-height: 24px;
  text-align: left;
`;

const IconContainer = styled.div<{ isOpen?: boolean | undefined }>`
  ${(props) =>
    props.isOpen ? `transform: rotate(0deg);` : `transform: rotate(-90deg);`}
  transition: transform 0.25s ease-in-out;
`;

const CollapsingContainer = styled.div<{ isOpen?: boolean | undefined }>`
  ${(props) =>
    props.isOpen
      ? `max-height: 100vh; animation-name: fadeIn;`
      : `max-height: 0; animation-name: fadeOut;`}
  overflow: hidden;
  transition: max-height 0.25s ease-in-out;
  padding-left: 16px;
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
