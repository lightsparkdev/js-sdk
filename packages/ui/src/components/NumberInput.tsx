// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import { useCallback, useRef } from "react";
import { type UseNumberInputArgs } from "../hooks/useNumberInput/types.js";
import { useNumberInput } from "../hooks/useNumberInput/useNumberInput.js";
import { TextInput, type TextInputProps } from "./TextInput.js";

export type NumberInputProps = Omit<UseNumberInputArgs, "onChange"> &
  Omit<TextInputProps, "onChange"> & {
    onChange: UseNumberInputArgs["onChange"];
    maxValue?: number | undefined;
  };

export function NumberInput({
  maxValue,
  onRightButtonClick,
  onChange: onChangeProp,
  ...rest
}: NumberInputProps) {
  const ref = useRef<HTMLInputElement | null>(null);
  const {
    inputRef,
    getRenderValue,
    handleOnChange,
    handleOnBlur,
    handleOnFocus,
    handleOnKeyDown,
    handleOnKeyUp,
  } = useNumberInput({
    ...rest,
    onChange: onChangeProp,
    ref,
  });

  const onChange = useCallback<TextInputProps["onChange"]>(
    (value, event) => {
      handleOnChange(event);
    },
    [handleOnChange],
  );

  const handleRightButtonClick = useCallback<
    NonNullable<TextInputProps["onRightButtonClick"]>
  >(
    (event) => {
      event.preventDefault();
      if (maxValue && onChangeProp) {
        onChangeProp(maxValue.toString());
      }
      if (onRightButtonClick) {
        onRightButtonClick(event);
      }
    },
    [maxValue, onRightButtonClick, onChangeProp],
  );

  const onKeyDown = useCallback<NonNullable<TextInputProps["onKeyDown"]>>(
    (keyValue, event) => {
      handleOnKeyDown(event);
    },
    [handleOnKeyDown],
  );

  return (
    <TextInput
      placeholder="Enter a number"
      {...rest}
      onKeyDown={onKeyDown}
      onKeyUp={handleOnKeyUp}
      onChange={onChange}
      onBlur={handleOnBlur}
      onFocus={handleOnFocus}
      value={getRenderValue()}
      inputRef={inputRef}
      type="text"
      inputMode="decimal"
      pattern="[0-9,.]*"
      rightButtonText={maxValue ? "Max" : undefined}
      onRightButtonClick={handleRightButtonClick}
    />
  );
}

export default NumberInput;
