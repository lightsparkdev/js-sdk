import type React from "react";
import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type UseNumberInputArgs,
  type UseNumberInputOnChangeValues,
} from "./types.js";
import {
  cleanValue,
  type CleanValueOptions,
  fixedDecimalValue,
  formatValue,
  type FormatValueOptions,
  getLocaleConfig,
  getSuffix,
  isNumber,
  padTrimValue,
  repositionCursor,
} from "./utils/index.js";

export function useNumberInput({
  allowDecimals = true,
  allowNegativeValue = false,
  decimalsLimit,
  maxLength: userMaxLength,
  value: userValue,
  onChange,
  fixedDecimalLength,
  decimalScale,
  prefix,
  suffix,
  intlConfig,
  step,
  min,
  max,
  disableGroupSeparators = false,
  disableAbbreviations = false,
  decimalSeparator: _decimalSeparator,
  groupSeparator: _groupSeparator,
  transformRawValue,
  formatValueOnBlur = true,
  ref,
}: UseNumberInputArgs) {
  if (_decimalSeparator && isNumber(_decimalSeparator)) {
    throw new Error("decimalSeparator cannot be a number");
  }

  if (_groupSeparator && isNumber(_groupSeparator)) {
    throw new Error("groupSeparator cannot be a number");
  }

  const localeConfig = useMemo(() => getLocaleConfig(intlConfig), [intlConfig]);
  const decimalSeparator =
    _decimalSeparator || localeConfig.decimalSeparator || "";
  const groupSeparator = _groupSeparator || localeConfig.groupSeparator || "";

  if (
    decimalSeparator &&
    groupSeparator &&
    decimalSeparator === groupSeparator &&
    disableGroupSeparators === false
  ) {
    throw new Error("decimalSeparator cannot be the same as groupSeparator");
  }

  const formatValueOptions: Partial<FormatValueOptions> = {
    decimalSeparator,
    groupSeparator,
    disableGroupSeparators,
    intlConfig,
    prefix: prefix || localeConfig.prefix,
    suffix: suffix,
  };

  const cleanValueOptions: Partial<CleanValueOptions> = {
    decimalSeparator,
    groupSeparator,
    allowDecimals,
    decimalsLimit: decimalsLimit || fixedDecimalLength || 2,
    allowNegativeValue,
    disableAbbreviations,
    prefix: prefix || localeConfig.prefix,
    transformRawValue,
  };

  const [stateValue, setStateValue] = useState(() =>
    userValue != null
      ? formatValue({
          ...formatValueOptions,
          decimalScale,
          value: String(userValue),
        })
      : "",
  );
  const [dirty, setDirty] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [changeCount, setChangeCount] = useState(0);
  const [lastKeyStroke, setLastKeyStroke] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  /**
   * Process change in value
   */
  const processChange = (
    value: string,
    selectionStart?: number | null,
  ): void => {
    setDirty(true);

    const { modifiedValue, cursorPosition } = repositionCursor({
      selectionStart,
      value,
      lastKeyStroke,
      stateValue,
      groupSeparator,
    });

    const stringValue = cleanValue({
      value: modifiedValue,
      ...cleanValueOptions,
    });

    if (userMaxLength && stringValue.replace(/-/g, "").length > userMaxLength) {
      return;
    }

    if (
      stringValue === "" ||
      stringValue === "-" ||
      stringValue === decimalSeparator
    ) {
      onChange &&
        onChange("", {
          float: null,
          formatted: "",
          value: "",
        });
      setStateValue(stringValue);
      // Always sets cursor after '-' or decimalSeparator input
      setCursor(1);
      return;
    }

    const stringValueWithoutSeparator = decimalSeparator
      ? stringValue.replace(decimalSeparator, ".")
      : stringValue;

    const numberValue = parseFloat(stringValueWithoutSeparator);

    const formattedValue = formatValue({
      value: stringValue,
      ...formatValueOptions,
    });

    if (cursorPosition != null) {
      // Prevent cursor jumping
      let newCursor = cursorPosition + (formattedValue.length - value.length);
      newCursor = newCursor <= 0 ? (prefix ? prefix.length : 0) : newCursor;

      setCursor(newCursor);
      setChangeCount(changeCount + 1);
    }

    setStateValue(formattedValue);

    if (onChange) {
      const values: UseNumberInputOnChangeValues = {
        float: numberValue,
        formatted: formattedValue,
        value: stringValue,
      };
      onChange(stringValue, values);
    }
  };

  /**
   * Handle change event
   */
  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const {
      target: { value, selectionStart },
    } = event;

    processChange(value, selectionStart);
  };

  /**
   * Handle focus event
   */
  const handleOnFocus = (event: React.FocusEvent<HTMLInputElement>): number => {
    return stateValue ? stateValue.length : 0;
  };

  /**
   * Handle blur event
   *
   * Format value by padding/trimming decimals if required by
   */
  const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
    const {
      target: { value },
    } = event;

    const valueOnly = cleanValue({ value, ...cleanValueOptions });

    if (valueOnly === "-" || valueOnly === decimalSeparator || !valueOnly) {
      setStateValue("");
      return;
    }

    const fixedDecimals = fixedDecimalValue(
      valueOnly,
      decimalSeparator,
      fixedDecimalLength,
    );

    const newValue = padTrimValue(
      fixedDecimals,
      decimalSeparator,
      decimalScale !== undefined ? decimalScale : fixedDecimalLength,
    );

    const numberValue = parseFloat(newValue.replace(decimalSeparator, "."));

    const formattedValue = formatValue({
      ...formatValueOptions,
      value: newValue,
    });

    if (onChange && formatValueOnBlur) {
      onChange(newValue, {
        float: numberValue,
        formatted: formattedValue,
        value: newValue,
      });
    }

    setStateValue(formattedValue);
  };

  /**
   * Handle key down event
   *
   * Increase or decrease value by step
   */
  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;

    setLastKeyStroke(key);

    if (step && (key === "ArrowUp" || key === "ArrowDown")) {
      event.preventDefault();
      setCursor(stateValue.length);

      const currentValue =
        parseFloat(
          userValue != null
            ? String(userValue).replace(decimalSeparator, ".")
            : cleanValue({ value: stateValue, ...cleanValueOptions }),
        ) || 0;
      const newValue =
        key === "ArrowUp" ? currentValue + step : currentValue - step;

      if (min !== undefined && newValue < Number(min)) {
        return;
      }

      if (max !== undefined && newValue > Number(max)) {
        return;
      }

      const fixedLength = String(step).includes(".")
        ? Number(String(step).split(".")[1].length)
        : undefined;

      processChange(
        String(fixedLength ? newValue.toFixed(fixedLength) : newValue).replace(
          ".",
          decimalSeparator,
        ),
      );
    }
  };

  /**
   * Handle key up event
   *
   * Move cursor if there is a suffix to prevent user typing past suffix
   */
  const handleOnKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const {
      key,
      currentTarget: { selectionStart },
    } = event;
    if (key !== "ArrowUp" && key !== "ArrowDown" && stateValue !== "-") {
      const suffix = getSuffix(stateValue, {
        groupSeparator,
        decimalSeparator,
      });

      if (
        suffix &&
        selectionStart &&
        selectionStart > stateValue.length - suffix.length
      ) {
        if (inputRef.current) {
          const newCursor = stateValue.length - suffix.length;
          inputRef.current.setSelectionRange(newCursor, newCursor);
        }
      }
    }
  };

  // Update state if userValue changes to undefined
  useEffect(() => {
    if (userValue == null) {
      setStateValue("");
    }
  }, [userValue]);

  useEffect(() => {
    // prevent cursor jumping if editing value
    if (
      dirty &&
      stateValue !== "-" &&
      inputRef.current &&
      document.activeElement === inputRef.current
    ) {
      inputRef.current.setSelectionRange(cursor, cursor);
    }
  }, [stateValue, cursor, inputRef, dirty, changeCount]);

  /**
   * If user has only entered "-" or decimal separator,
   * keep the char to allow them to enter next value
   */
  const getRenderValue = () => {
    if (
      userValue != null &&
      stateValue !== "-" &&
      (!decimalSeparator || stateValue !== decimalSeparator)
    ) {
      return formatValue({
        ...formatValueOptions,
        decimalScale: dirty ? undefined : decimalScale,
        value: String(userValue),
      });
    }

    return stateValue;
  };

  return {
    inputRef,
    getRenderValue,
    handleOnChange,
    handleOnBlur,
    handleOnFocus,
    handleOnKeyDown,
    handleOnKeyUp,
  };
}
