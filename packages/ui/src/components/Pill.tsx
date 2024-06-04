import styled from "@emotion/styled";

import { useEffect, useRef } from "react";
import { colors } from "../styles/colors.js";
import { flexCenter } from "../styles/utils.js";
import { Icon } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";
import { Loading } from "./Loading.js";
import { UnstyledButton } from "./UnstyledButton.js";

type PillProps = {
  onDeleteMouseDown?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  onDeleteMouseUp?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  onDeleteFromKeyboard?: () => void;
  text: string;
  loading?: boolean;
  icon?: IconName;
  cursor?: "pointer" | "text";
  isEditing?: boolean;
  onChangeTextInput?: (newValue: string) => void;
  onFocusTextInput?: () => void;
  onBlurTextInput?: () => void;
  onClickPillBody?: (() => void) | undefined;
};

export function Pill({
  text,
  onDeleteMouseDown,
  onDeleteMouseUp,
  onDeleteFromKeyboard,
  icon,
  loading = false,
  cursor = "text",
  isEditing = false,
  onChangeTextInput = () => {},
  onFocusTextInput = () => {},
  onClickPillBody = () => {},
  onBlurTextInput = () => {},
}: PillProps) {
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [isEditing]);

  function handleOnDeleteMouseDown(event: React.MouseEvent<HTMLButtonElement>) {
    if (onDeleteMouseDown) {
      event.stopPropagation();
      onDeleteMouseDown(event);
    }
  }

  function handleOnDeleteKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) {
    if (onDeleteFromKeyboard) {
      event.stopPropagation();
      if (event.key === "Enter") {
        onDeleteFromKeyboard();
      }
    }
  }

  return (
    <StyledPill
      hasIcon={Boolean(icon || loading || onDeleteMouseDown)}
      cursor={cursor}
      onClick={(event) => {
        if (onClickPillBody) {
          event.stopPropagation();
          onClickPillBody();
        }
      }}
    >
      {isEditing ? (
        <PillInput
          value={text}
          onChange={(event) => onChangeTextInput(event.target.value)}
          onFocus={onFocusTextInput}
          onBlur={onBlurTextInput}
          ref={textInputRef}
        />
      ) : (
        <PillText>{text}</PillText>
      )}
      {(icon || loading || onDeleteMouseDown) && (
        <PillIconContainer
          hasIconInset={Boolean(icon && !loading && !onDeleteMouseDown)}
        >
          {/* needs slightly over 16 width to prevent weird cutoff on ios */}
          {loading && <Loading size={16.1} center={false} ml={5} />}
          {!loading && onDeleteMouseDown && (
            <UnstyledButton
              /* Use onMouseDown here instead of onClick to prevent issue where
               * mouse down triggers onBlur which triggers isEditing -> false
               * which collapses the text input for long values,
               * causing the mouse up part of the click to miss the delete
               * button */
              onMouseDown={handleOnDeleteMouseDown}
              onKeyDown={handleOnDeleteKeyDown}
              type="button"
              /* Add extra padding for larger click target: */
              css={{
                display: "flex",
                padding: "10px",
                marginRight: "-10px",
              }}
            >
              <Icon name="DeleteIcon" width={16.1} />
            </UnstyledButton>
          )}
          {!loading && icon && !onDeleteMouseDown && (
            <Icon name={icon} width={16.1} color="white" />
          )}
        </PillIconContainer>
      )}
    </StyledPill>
  );
}

const PillText = styled.div`
  /* For mobile ensure empty values don't prevent div from having height: */
  height: 1.2rem;
  min-width: 100px;
  max-width: 210px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: 600;
`;

const StyledPill = styled.div<{
  hasIcon: boolean;
  cursor: PillProps["cursor"];
}>`
  * + & {
    margin-top: 16px;
  }
  background-color: ${({ theme }) => theme.c05Neutral};
  color: ${({ theme }) => theme.text};
  padding: 12px 18px;
  ${({ hasIcon }) => hasIcon && `padding-right: 48px;`}
  border-radius: 2em;
  display: flex;
  align-items: center;
  cursor: ${({ cursor }) => cursor};
  position: relative;
`;

const PillIconContainer = styled.div<{ hasIconInset: boolean }>`
  ${flexCenter}
  ${({ hasIconInset }) =>
    hasIconInset
      ? `
    background-color: ${colors.blue43};
    padding: 8px;
    right: 4px;
    top: 3.5px;`
      : `right: 18px;`}
  border-radius: 50%;
  margin-left: 12px;
  position: absolute;
`;

const PillInput = styled.input`
  background-color: transparent;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  font-size: 1rem;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: 210px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-family: ${({ theme }) => theme.typography.fontFamilies.main};
`;
