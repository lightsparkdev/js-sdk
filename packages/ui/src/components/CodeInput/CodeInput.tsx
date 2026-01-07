import type { SerializedStyles } from "@emotion/react";
import styled from "@emotion/styled";
import { isNumber } from "lodash-es";
import { nanoid } from "nanoid";
import type {
  ClipboardEvent,
  KeyboardEvent,
  MutableRefObject,
  Ref,
} from "react";
import { createRef, useCallback, useRef, useState } from "react";
import { isChrome, isMobile, isMobileSafari } from "react-device-detect";
import { textInputBorderColor } from "../../styles/fields.js";
import { Spacing } from "../../styles/tokens/spacing.js";
import { SingleCodeInput } from "./SingleCodeInput.js";

type InputState = {
  [inputId: string]: {
    value: string;
  };
};

export type OnSubmitCode = (code: string) => void;
export type OnChangeCode = (code: string) => void;
export type CodeInputVariant = "default" | "unified";
type CodeInputProps = {
  onChange?: OnChangeCode | undefined;
  onSubmit?: OnSubmitCode | undefined;
  codeLength?: number;
  inputCSS?: SerializedStyles;
  autoFocus?: boolean;
  onBlur?: (() => void) | undefined;
  variant?: CodeInputVariant;
};

function codeFromInputState(inputState: InputState): string {
  return Object.values(inputState)
    .map((input) => input.value)
    .join("");
}

type InputRefs = Record<string, MutableRefObject<HTMLInputElement | null>>;

function getRef(key: string | undefined, refsObj: Ref<InputRefs>) {
  if (key && refsObj && typeof refsObj === "object" && refsObj.current) {
    const ref = refsObj.current[key];
    if (
      ref &&
      typeof ref === "object" &&
      ref.current &&
      ref.current instanceof HTMLInputElement
    ) {
      return ref.current;
    }
  }
  return null;
}

export function CodeInput({
  codeLength = 8,
  onChange,
  onSubmit,
  inputCSS,
  autoFocus = true,
  onBlur,
  variant = "default",
}: CodeInputProps): JSX.Element {
  const componentId = useRef(nanoid(5));
  const inputRefs = useRef<InputRefs>({});
  const autofillValuesRef = useRef("");

  const getInputId = useCallback((index: number) => {
    const idPrefix = `two-factor-input-${componentId.current}-`;
    return `${idPrefix}-${index}`;
  }, []);

  function getInputIndex(id: string) {
    return Number.parseInt(id.charAt(id.length - 1), 10);
  }

  const firstFieldRefCb = useCallback(
    (ref: HTMLInputElement | null) => {
      if (ref) {
        inputRefs.current[ref.id] = createRef();
        inputRefs.current[ref.id].current = ref;
        if (ref.id === getInputId(0) && autoFocus) {
          /* In insecure contexts iOS will focus the field but does not
             automatically open the keyboard. localhost and
             deployed https environments will open the keyboard. */
          ref.focus();
        }
      }
    },
    [getInputId, autoFocus],
  );

  const [inputState, setInputState] = useState<InputState>(
    Array(codeLength)
      .fill(0)
      .reduce((acc, _, i) => {
        return {
          ...acc,
          [getInputId(i)]: {
            value: "",
          },
        } as InputState;
      }, {}) as InputState,
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>, inputId: string) => {
      const handleKeys = new Set([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "Enter",
        "Escape",
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
      ]);

      if (["e", "E", "+", "-", "."].includes(event.key)) {
        event.preventDefault();
        return;
      }

      if (!handleKeys.has(event.key)) {
        return;
      }

      let replaceEntireState: false | InputState = false;
      const currentInputIndex = getInputIndex(inputId);
      const isFirstInput = currentInputIndex === 0;
      const isLastInput = currentInputIndex === codeLength - 1;
      const nextInputIndex = isLastInput ? undefined : currentInputIndex + 1;
      const prevInputIndex = isFirstInput ? undefined : currentInputIndex - 1;

      const nextInputId = isNumber(nextInputIndex)
        ? getInputId(nextInputIndex)
        : undefined;
      const prevInputId = isNumber(prevInputIndex)
        ? getInputId(prevInputIndex)
        : undefined;
      const nextInput = nextInputId ? inputState[nextInputId] : undefined;
      const prevInput = prevInputId ? inputState[prevInputId] : undefined;

      const currentInputRef = getRef(inputId, inputRefs);
      const nextInputRef = getRef(nextInputId, inputRefs);
      const prevInputRef = getRef(prevInputId, inputRefs);
      const firstInputRef = getRef(getInputId(0), inputRefs);
      const lastInputRef = getRef(getInputId(codeLength - 1), inputRefs);

      if (event.key === "ArrowLeft") {
        if (firstInputRef && (event.metaKey || event.ctrlKey || event.altKey)) {
          firstInputRef.focus();
          return;
        }

        if (prevInput && prevInputRef) {
          prevInputRef.focus();
          prevInputRef.select();
        }
        return;
      }

      if (event.key === "ArrowRight") {
        if (lastInputRef && (event.metaKey || event.ctrlKey || event.altKey)) {
          lastInputRef.focus();
          return;
        }

        if (nextInput && nextInputRef) {
          nextInputRef.focus();
          nextInputRef.select();
        }
        return;
      }

      if (event.key === "Enter" && onSubmit) {
        const code = codeFromInputState(inputState);
        onSubmit(code);
        return;
      }

      if (event.key === "Escape" && currentInputRef) {
        currentInputRef.blur();
        return;
      }

      if (
        event.key === "Backspace" &&
        (event.metaKey || event.ctrlKey || event.altKey)
      ) {
        // clear all inputs
        replaceEntireState = { ...inputState };
        Object.keys(replaceEntireState).forEach((inputId) => {
          const newState = replaceEntireState as InputState;
          newState[inputId] = {
            ...newState[inputId],
            value: "",
          };
        });
      }

      let value = event.key;
      if (
        event.key === "Backspace" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        value = "";
        if (!isFirstInput && prevInput && prevInputRef) {
          prevInputRef.focus();
        }
      } else if (event.key === "Delete") {
        value = "";
        if (!isLastInput && nextInput && nextInputRef) {
          nextInputRef.focus();
        }
      } else if (replaceEntireState) {
        // focus the last index with a value
        const lastInputWithValue = Object.entries(replaceEntireState)
          .reverse()
          .find(([, { value }]) => value !== "");
        if (lastInputWithValue) {
          const inputId = lastInputWithValue[0];
          const inputRef = getRef(inputId, inputRefs);
          inputRef?.focus();
          inputRef?.select();
        } else if (firstInputRef) {
          firstInputRef.focus();
        }
      } else if (isLastInput) {
        /*
         * Focus gets weird here if we do this - probably more conventional to
         * just leave the last input focused.
         * Otherwise we could do something to focus the next focusable element
         * to ensure tabbing back works properly. Comment out for now:
         */
        // currentInputRef.current.blur();
      } else if (nextInput && nextInputRef) {
        nextInputRef.focus();
        nextInputRef.select();
      }

      const newState = replaceEntireState
        ? replaceEntireState
        : {
            ...inputState,
            [inputId]: { value },
          };
      const code = codeFromInputState(newState);
      if (onChange) {
        onChange(code);
      }
      setInputState(newState);
    },
    [onChange, setInputState, onSubmit, getInputId, inputState, codeLength],
  );

  const onPasteCb = useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const rawText = event.clipboardData.getData("text");
      const text = rawText?.replace(/[\s.]/g, "");
      if (!text || Number.isNaN(Number.parseInt(text))) {
        return;
      }
      const inputValues = text.split("");
      const newState = { ...inputState };
      inputValues.forEach((value, i) => {
        const inputId = getInputId(i);
        newState[inputId] = {
          ...newState[inputId],
          value,
        };
      });

      // focus the last index with a value
      const firstInputRef = getRef(getInputId(0), inputRefs);
      const lastInputWithValue = Object.entries(newState)
        .reverse()
        .find(([, { value }]) => value !== "");
      if (lastInputWithValue) {
        const inputId = lastInputWithValue[0];
        const inputRef = getRef(inputId, inputRefs);
        inputRef?.focus();
        inputRef?.select();
      } else if (firstInputRef) {
        firstInputRef.focus();
      }

      const code = codeFromInputState(newState);
      if (onChange) {
        onChange(code);
      }
      setInputState(newState);
    },
    [getInputId, inputState, onChange, setInputState],
  );

  const onBlurCb = useCallback(() => {
    /**
     * Need to move to the bottom of the stack to wait for the next focus event
     * to potentially fire on another input
     */
    setTimeout(() => {
      let hasCodeFocused = false;
      if (inputRefs.current) {
        Object.values(inputRefs.current).forEach((ref) => {
          if (ref && ref.current && ref.current === document.activeElement) {
            hasCodeFocused = true;
          }
        });
        if (!hasCodeFocused && onBlur) {
          onBlur();
        }
      }
    }, 0);
  }, [onBlur]);

  const inputsPerGroup = Math.ceil(codeLength / 2);

  /**
   * When clicking on the unified code input container, handle focus appropriately
   * Uses onMouseDown instead of onClick because mousedown fires before focus,
   * allowing us to prevent the default focus behavior and redirect to the correct input.
   */
  const onContainerMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLInputElement;
      const isClickingFilledInput =
        target.tagName === "INPUT" && inputState[target.id]?.value !== "";
      if (!isClickingFilledInput) {
        event.preventDefault();
        const firstEmptyIndex = codeFromInputState(inputState).length;
        const targetIndex =
          firstEmptyIndex < codeLength ? firstEmptyIndex : codeLength - 1;
        getRef(getInputId(targetIndex), inputRefs)?.focus();
      }
    },
    [codeLength, getInputId, inputState, inputRefs],
  );

  const inputs = [];
  for (let i = 0; i < codeLength; i += 1) {
    const inputId = getInputId(i);
    inputs.push(
      <SingleCodeInput
        value={inputState[inputId].value}
        id={inputId}
        key={inputId}
        inputRef={firstFieldRefCb}
        onPaste={onPasteCb}
        onKeyDown={(event) => onKeyDown(event, inputId)}
        onChange={(event) => {
          if (isMobileSafari && event.nativeEvent instanceof CustomEvent) {
            /*
             * Assume iOS Safari autofill event - when autosubmitting an SMS
             * code for example from iOS
             * the event type is CustomEvent whereas normal inputs are
             * InputEvent types. Mobile Safari sends each autofill digit as a
             * separate CustomEvent
             */
            autofillValuesRef.current += event.target.value;
            if (autofillValuesRef.current.length === codeLength) {
              const newState = Array(codeLength)
                .fill(0)
                .reduce((acc, _, i) => {
                  return {
                    ...acc,
                    [getInputId(i)]: {
                      value: autofillValuesRef.current[i],
                    },
                  } as InputState;
                }, {}) as InputState;
              setInputState(newState);
              if (onSubmit) {
                onSubmit(autofillValuesRef.current);
              }
              autofillValuesRef.current = "";
            }
          } else if (
            isMobile &&
            isChrome &&
            event.target.value.length === codeLength
          ) {
            /*
             * Assume mobile Chrome autofill event - for some reason the event
             * type is InputEvent vs Safari it is CustomEvent,
             * also all digits are submitted at once vs one by one for Safari.
             * This is the same both for iOS and android Pixel so far based on
             * testing
             */
            const newState = Array(codeLength)
              .fill(0)
              .reduce((acc, _, i) => {
                return {
                  ...acc,
                  [getInputId(i)]: {
                    value: event.target.value[i],
                  },
                } as InputState;
              }, {}) as InputState;
            setInputState(newState);
            if (onSubmit) {
              onSubmit(event.target.value);
            }
          }
        }}
        type="number"
        ariaLabel={`Code input ${i + 1} of ${codeLength}`}
        cssProp={inputCSS}
        onBlur={onBlurCb}
        width={
          variant === "unified"
            ? "12px"
            : `${(100 / inputsPerGroup).toFixed(2)}%`
        }
        max={9}
        variant={variant}
      />,
    );
  }

  if (variant === "unified") {
    return (
      <UnifiedCodeInputContainer onMouseDown={onContainerMouseDown}>
        {inputs}
      </UnifiedCodeInputContainer>
    );
  }

  return (
    <StyledCodeInput>
      <CodeInputGroup>{inputs.slice(0, inputsPerGroup)}</CodeInputGroup>
      <CodeInputGroupSeparator />
      <CodeInputGroup>
        {inputs.slice(inputsPerGroup, inputs.length)}
      </CodeInputGroup>
    </StyledCodeInput>
  );
}

export const StyledCodeInput = styled.div`
  display: inline-flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const separatorWidth = 12;
const separatorMargin = 8;

const CodeInputGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  width: calc(50% - ${(separatorWidth + separatorMargin * 2) / 2}px);
`;

const CodeInputGroupSeparator = styled.div`
  width: ${separatorWidth}px;
  height: 4px;
  background-color: ${textInputBorderColor};
  border-radius: 2px;
  margin: 0 ${separatorMargin}px;
`;

const UnifiedCodeInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: ${Spacing.px.xs};
  padding: 12px 24px;
  border: 0.5px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  background-color: ${({ theme }) => theme.bg};
  width: 100%;

  &:focus-within {
    border: 2px solid ${({ theme }) => theme.text};
  }
`;
