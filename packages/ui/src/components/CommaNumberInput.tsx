// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import { clamp } from "@lightsparkdev/core";
import type { ReactElement } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  addCommasToDigits,
  addCommasToVariableDecimal,
  removeChars,
  removeCommas,
  removeLeadingZeros,
  removeNonDigit,
} from "../utils/strings.js";
import { TextInput, type TextInputProps } from "./TextInput.js";

export type CommaNumberInputProps = Omit<TextInputProps, "onChange"> & {
  onChange: (newValue: string) => void;
  maxValue?: number | undefined;
  decimals?: number | undefined;
};

export function CommaNumberInput(props: CommaNumberInputProps): ReactElement {
  const { onChange, value, decimals = 0, ...rest } = props;
  const inputRef: React.MutableRefObject<HTMLInputElement | null> =
    useRef<HTMLInputElement | null>(null);
  const cursorIndex = useRef<number | null>(null);
  const [valueWithCommaDecimal, setValueWithCommaDecimal] = useState(value);

  const handleOnChange = useCallback(
    (newValue: string, event: React.ChangeEvent<HTMLInputElement> | null) => {
      event?.preventDefault();
      if (!inputRef.current) {
        return;
      }
      const cursorPosition = inputRef.current.selectionStart || 0;
      const existingCommasRemoved = removeNonDigit(newValue);
      const validInputChange = existingCommasRemoved.match(/^\d*$/);
      if (validInputChange) {
        onChange(existingCommasRemoved);
        const leadingZerosRemoved = removeLeadingZeros(existingCommasRemoved);
        const decimalIfRelevant =
          decimals > 0
            ? (Number(leadingZerosRemoved) / 10 ** decimals).toFixed(decimals)
            : leadingZerosRemoved;
        const newValueWithCommaDecimal = addCommasToDigits(decimalIfRelevant);
        const cursorDistanceFromEnd = newValue.length - cursorPosition;
        cursorIndex.current =
          newValueWithCommaDecimal.length - cursorDistanceFromEnd;
      }
    },
    [onChange, decimals],
  );

  useEffect(() => {
    const existingCommasRemoved = removeCommas(value);
    const leadingZerosRemoved = removeLeadingZeros(existingCommasRemoved);
    setValueWithCommaDecimal(
      addCommasToDigits(
        decimals > 0
          ? (Number(leadingZerosRemoved) / 10 ** decimals).toFixed(decimals)
          : leadingZerosRemoved,
      ),
    );
  }, [value, decimals]);

  useLayoutEffect(() => {
    if (cursorIndex.current !== null) {
      inputRef.current?.setSelectionRange(
        cursorIndex.current,
        cursorIndex.current,
      );
      cursorIndex.current = null;
    }
  }, [valueWithCommaDecimal]);

  const handleKeyDown = useCallback(
    (keyValue: string, event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!inputRef.current) {
        return;
      }
      const hasModifiers = event.ctrlKey || event.metaKey || event.altKey;
      const isBackspace = keyValue === "Backspace";
      if ((isBackspace || keyValue === "Delete") && !hasModifiers) {
        event.preventDefault();
        const selectionStart = inputRef.current.selectionStart || 0;
        const selectionEnd = inputRef.current.selectionEnd || 0;
        let newValue = "";
        let newCursorIndex = selectionStart;
        if (selectionStart === selectionEnd) {
          // deleting one character
          if (selectionStart === 0 && isBackspace) {
            return;
          }
          // if backspacing - the index we want to delete is 1 before current pos.
          const toDeleteIdx = selectionStart + (isBackspace ? -1 : 0);
          const isCommaDecimal = [",", "."].includes(
            valueWithCommaDecimal[toDeleteIdx],
          );
          const deleteCharIndex = isBackspace
            ? Math.max(selectionStart - (isCommaDecimal ? 2 : 1), 0)
            : selectionStart + (isCommaDecimal ? 1 : 0);
          newValue = addCommasToVariableDecimal(
            removeChars(valueWithCommaDecimal, deleteCharIndex),
            decimals,
          );
          const diff = valueWithCommaDecimal.length - newValue.length;
          if (diff > 1) {
            // comma and number removed. move cursor back.
            newCursorIndex = deleteCharIndex - 1;
          } else if (diff === 1) {
            newCursorIndex = deleteCharIndex;
          } else if (diff === 0) {
            // when decimals are present, there will be a fixed min length.
            // Cursor needs to get incremented to account.
            // given: 0.1X1 backspace at X, deleteCharIndex is 2. cursor is at 3.
            // after backspace, 0.0X1 is expected, where cursor position is still 3.
            newCursorIndex = deleteCharIndex + 1;
          }
        } else {
          // deleting a range of characters
          newValue = addCommasToVariableDecimal(
            removeChars(valueWithCommaDecimal, selectionStart, selectionEnd),
            decimals,
          );
        }
        onChange(removeNonDigit(newValue));
        cursorIndex.current = clamp(newCursorIndex, 0, newValue.length);
      }
    },
    [valueWithCommaDecimal, decimals, onChange],
  );

  const { maxValue, onRightButtonClick } = props;
  const handleRightButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      if (maxValue) {
        handleOnChange(maxValue.toString(), null);
      }
      if (onRightButtonClick) {
        onRightButtonClick(e);
      }
    },
    [handleOnChange, maxValue, onRightButtonClick],
  );
  return (
    <TextInput
      placeholder="Enter a number"
      {...rest}
      onKeyDown={handleKeyDown}
      onChange={handleOnChange}
      value={valueWithCommaDecimal}
      inputRef={inputRef}
      pattern="[0-9,.]*"
      inputMode="numeric"
      rightButtonText={props.maxValue ? "Max" : undefined}
      onRightButtonClick={handleRightButtonClick}
    />
  );
}

export default CommaNumberInput;
