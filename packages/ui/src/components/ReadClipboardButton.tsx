import styled from "@emotion/styled";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useClipboard } from "../hooks/useClipboard.js";
import { useBreakpoints } from "../styles/breakpoints.js";
import { InputSubtext, inputBlockStyle } from "../styles/fields.js";
import { Icon } from "./Icon/Icon.js";
import { Pill } from "./Pill.js";
import { TextInput } from "./TextInput.js";
import { UnstyledButton } from "./UnstyledButton.js";

type ReadClipboardButtonProps = {
  errorMsg?: string | null;
  onChangeTextInput?: (text: string) => void;
  onPasteValue: (text: string) => void;
  onRemoveValue: () => void;
  value: string;
  valueLoading?: boolean;
  description: string;
  autoButtonText?: string | undefined;
  onClickAutoButton?: (() => void) | undefined;
  hint?: string | undefined;
  clipboardCallbacks?: Parameters<typeof useClipboard>[0] | undefined;
};

export function ReadClipboardButton({
  onChangeTextInput = () => {},
  onPasteValue,
  onRemoveValue,
  valueLoading = false,
  value,
  errorMsg,
  description,
  autoButtonText,
  onClickAutoButton,
  hint,
  clipboardCallbacks,
}: ReadClipboardButtonProps) {
  const bp = useBreakpoints();
  const { canReadFromClipboard, readTextFromClipboard } =
    useClipboard(clipboardCallbacks);
  const [isEditingTextInput, setIsEditingTextInput] = useState(false);
  const isDeleting = useRef(false);

  const getTextFromClipboard = useCallback(async () => {
    const text = await readTextFromClipboard();
    if (text !== null) {
      const value = text.trim();
      if (value === "") {
        setIsEditingTextInput(true);
      } else {
        onPasteValue(value);
      }
    }
  }, [onPasteValue, readTextFromClipboard]);

  function onClick() {
    if (!isDeleting.current) {
      void getTextFromClipboard();
    } else {
      isDeleting.current = false;
    }
  }

  function onDeleteMouseDown(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.stopPropagation();
    isDeleting.current = true;
    onRemoveValue();
  }

  function onDeleteMouseUp() {
    isDeleting.current = false;
  }

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const charCode = String.fromCharCode(event.which).toLowerCase();
      if (document.activeElement === document.body) {
        if (canReadFromClipboard) {
          if ((event.ctrlKey || event.metaKey) && charCode === "v") {
            event.preventDefault();
            void getTextFromClipboard();
            return;
          }
        }

        if (event.key === "Escape" || event.key === "Delete") {
          onRemoveValue();
        } else if (charCode.match(/^[a-z0-9]$/i)) {
          setIsEditingTextInput(true);
        }

        /*  else if (event.key === "Backspace") {
          onChangeTextInput(value.slice(0, -1));
        } else if (charCode.match(/^[a-z0-9]$/i)) {
          onChangeTextInput(value + charCode);
        } */
      }
    },
    [getTextFromClipboard, canReadFromClipboard, onRemoveValue],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  return (canReadFromClipboard || onClickAutoButton) && !bp.isSm() ? (
    <Fragment>
      <ReadClipboardButtonContainer
        onClick={onClickAutoButton ? onClickAutoButton : onClick}
        hasAddress={Boolean(value)}
        hasError={Boolean(errorMsg)}
        onMouseUp={onDeleteMouseUp}
      >
        {autoButtonText ? (
          <UnstyledButton
            onClick={onClickAutoButton}
            css={{ cursor: "pointer" }}
          >
            <Pill
              text={autoButtonText}
              icon="MagicWand"
              cursor="pointer"
              loading={valueLoading}
              onClickPillBody={onClickAutoButton}
            />
          </UnstyledButton>
        ) : (
          <Fragment>
            {!value && !isEditingTextInput ? (
              <UnstyledButton onClick={onClick}>
                <Icon name="Copy" width={19} />
                <div css={{ marginTop: "8px" }}>{description}</div>
              </UnstyledButton>
            ) : null}
            {value || isEditingTextInput ? (
              <Pill
                text={value}
                onDeleteMouseDown={onDeleteMouseDown}
                loading={valueLoading}
                isEditing={isEditingTextInput}
                onChangeTextInput={(value) => {
                  onChangeTextInput(value);
                }}
                onFocusTextInput={() => setIsEditingTextInput(true)}
                onBlurTextInput={() => setIsEditingTextInput(false)}
                onClickPillBody={
                  onClickAutoButton
                    ? onClickAutoButton
                    : () => setIsEditingTextInput(true)
                }
              />
            ) : null}
          </Fragment>
        )}
      </ReadClipboardButtonContainer>
      <InputSubtext text={errorMsg || hint} hasError={Boolean(errorMsg)} />
    </Fragment>
  ) : (
    <Fragment>
      <TextInput
        onChange={onChangeTextInput}
        value={value}
        hint={hint}
        error={errorMsg || undefined}
      />
    </Fragment>
  );
}

const ReadClipboardButtonContainer = styled.div<{
  hasAddress: boolean;
  hasError: boolean;
}>`
  ${({ theme, hasAddress, hasError }) =>
    inputBlockStyle({ theme, hasValue: hasAddress, hasError })}
`;
