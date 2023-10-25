"use client";

import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import {
  Button,
  CommandKey,
  Icon,
  Modal,
  UnstyledButton,
} from "@lightsparkdev/ui/components";
import { colors } from "@lightsparkdev/ui/styles/colors";
import { Body, Label } from "@lightsparkdev/ui/styles/fonts/typography";
import {
  App,
  TokenSize,
} from "@lightsparkdev/ui/styles/fonts/typographyTokens";
import { MendableInPlace } from "@mendable/search";
import { useEffect, useState } from "react";
import { StyledBody } from "../../styles/fonts/typography/Body";
import { StyledLabel } from "../../styles/fonts/typography/Label";

interface Navigator {
  userAgentData?: {
    platform: string;
  };
}

type Size = "sm" | "lg";

interface Props {
  mendableAnonKey: string;
  placeholder?: string;
  backgroundColor?: string;
  iconOnly?: boolean;
  isShortcutEnabled?: boolean;
  size?: Size;
  hintText?: string;
}

export const Search = ({
  mendableAnonKey,
  placeholder = "Search",
  backgroundColor,
  iconOnly,
  isShortcutEnabled = true,
  size = "sm",
  hintText = "Search...",
}: Props) => {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMacOS, setIsMacOS] = useState(false);

  useEffect(() => {
    // Not all browsers have support for user-agent client hints but will eventually
    // be preferred over the user-agent string https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData
    setIsMacOS(
      (navigator as unknown as Navigator).userAgentData?.platform === "macOS",
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        isShortcutEnabled &&
        (event.ctrlKey || event.metaKey) &&
        event.key === "k"
      ) {
        setIsModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isShortcutEnabled]);

  return (
    <Container>
      {iconOnly && (
        <SearchIconButton
          ghost
          icon="Search"
          onClick={() => setIsModalOpen(true)}
        />
      )}
      {!iconOnly && (
        <SearchButton
          backgroundColor={backgroundColor}
          size={size}
          onClick={() => setIsModalOpen(true)}
        >
          <SearchContent>
            <SearchIcon name="Search" width={14} size={size} mr={8} />
            {size === "sm" && (
              <Label
                app={App.UmaDocs}
                size={TokenSize.Large}
                color={theme.controls.text}
              >
                {placeholder}
              </Label>
            )}
            {size === "lg" && (
              <Body
                app={App.UmaDocs}
                size={TokenSize.Large}
                color={theme.controls.text}
              >
                {placeholder}
              </Body>
            )}
          </SearchContent>
          <CommandKeys>
            <CommandKey
              keyboardKey={isMacOS ? "⌘" : "Ctrl"}
              size={size}
              color={theme.controls.secondary}
              backgroundColor={theme.controls.bg}
            />
            <CommandKey
              keyboardKey="K"
              size={size}
              color={theme.controls.secondary}
              backgroundColor={theme.controls.bg}
            />
          </CommandKeys>
        </SearchButton>
      )}
      <Modal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width={800}
        ghost
      >
        <MendableInPlace
          anon_key={mendableAnonKey}
          style={{
            darkMode: false,
            accentColor: colors.uma.blue,
            backgroundColor: theme.bg,
          }}
          showSimpleSearch
          askAIText="Ask"
          hintText={hintText}
        />
      </Modal>
    </Container>
  );
};

const Container = styled.div`
  min-width: 0;
  button {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
`;

const SearchContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  opacity: 0.5;
  transition: opacity 0.2s ease-out;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${StyledLabel},${StyledBody} {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const SearchButton = styled(UnstyledButton)<{
  size: Size;
  backgroundColor?: string | undefined;
}>`
  background-color: ${({ backgroundColor, theme }) =>
    backgroundColor ? backgroundColor : theme.bg};
  display: flex;
  flex-direction: row;
  align-items: center;
  height: ${(props) => (props.size === "sm" ? "36px" : "56px")};
  padding: ${(props) => (props.size === "sm" ? "8px" : "12px 24px")};
  border: 1px solid ${colors.uma.stroke};
  border-radius: 8px;
  transition: border 0.2s ease-out;

  &:hover {
    border: 1px solid ${colors.uma.strokeProminent};
  }

  &:hover ${SearchContent} {
    opacity: 1;
  }
`;

const SearchIconButton = styled(Button)``;

const SearchIcon = styled(Icon)<{ size: Size }>`
  width: ${(props) => (props.size === "sm" ? 14 : 16)}px;
`;

const CommandKeys = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
`;
