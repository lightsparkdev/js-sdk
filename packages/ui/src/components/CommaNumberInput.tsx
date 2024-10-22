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
  removeChars,
  removeCommas,
  removeLeadingZeros,
} from "../utils/strings.js";
import { TextInput, type TextInputProps } from "./TextInput.js";

export type CommaNumberInputProps = Omit<TextInputProps, "onChange"> & {
  onChange: (newValue: string) => void;
  maxValue?: number | undefined;
};

export function CommaNumberInput(props: CommaNumberInputProps): ReactElement {
  const { onChange, value, ...rest } = props;
  const inputRef: React.MutableRefObject<HTMLInputElement | null> =
    useRef<HTMLInputElement | null>(null);
  const cursorIndex = useRef<number | null>(null);
  const [valueWithCommas, setValueWithCommas] = useState(value);

  const handleOnChange = useCallback(
    (newValue: string, event: React.ChangeEvent<HTMLInputElement> | null) => {
      event?.preventDefault();
      if (!inputRef.current) {
        return;
      }
      const existingCommasRemoved = removeCommas(newValue);
      const validInputChange = existingCommasRemoved.match(/^\d*$/);
      if (validInputChange && validInputChange[0] !== value) {
        onChange(existingCommasRemoved);
        const leadingZerosRemoved = removeLeadingZeros(existingCommasRemoved);
        const newValueWithCommas = addCommasToDigits(leadingZerosRemoved);
        const diff = newValueWithCommas.length - valueWithCommas.length;
        if (diff) {
          cursorIndex.current =
            (inputRef.current.selectionStart || 0) + (diff > 1 ? 1 : 0);
        }
      }
    },
    [onChange, valueWithCommas, value],
  );

  useEffect(() => {
    const existingCommasRemoved = removeCommas(value);
    const leadingZerosRemoved = removeLeadingZeros(existingCommasRemoved);
    setValueWithCommas(addCommasToDigits(leadingZerosRemoved));
  }, [value]);

  useLayoutEffect(() => {
    if (cursorIndex.current !== null) {
      inputRef.current?.setSelectionRange(
        cursorIndex.current,
        cursorIndex.current,
      );
      cursorIndex.current = null;
    }
  }, [valueWithCommas]);

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
          const isComma =
            // if deleting a comma assume we want to delete the next character
            valueWithCommas[selectionStart + (isBackspace ? -1 : 0)] === ",";
          const deleteCharIndex = isBackspace
            ? Math.max(selectionStart - (isComma ? 2 : 1), 0)
            : selectionStart + (isComma ? 1 : 0);
          newValue = addCommasToDigits(
            removeChars(valueWithCommas, deleteCharIndex),
          );
          const diff = valueWithCommas.length - newValue.length;
          newCursorIndex = deleteCharIndex - (diff > 1 ? 1 : 0);
        } else {
          // deleting a range of characters
          newValue = addCommasToDigits(
            removeChars(valueWithCommas, selectionStart, selectionEnd),
          );
        }
        onChange(removeCommas(newValue));
        cursorIndex.current = clamp(newCursorIndex, 0, newValue.length);
      }
    },
    [valueWithCommas, onChange],
  );

  return (
    <TextInput
      placeholder="Enter a number"
      {...rest}
      onKeyDown={handleKeyDown}
      onChange={handleOnChange}
      value={valueWithCommas}
      inputRef={inputRef}
      pattern="[0-9,]*"
      inputMode="numeric"
      rightButtonText={props.maxValue ? "Max" : undefined}
      onRightButtonClick={() => {
        if (props.maxValue) {
          handleOnChange(props.maxValue.toString(), null);
        }
      }}
    />
  );
}

export default CommaNumberInput;
