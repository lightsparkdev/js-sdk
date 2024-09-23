import { css } from "@emotion/react";
import {
  CodeInput,
  type OnChangeCode,
  type OnSubmitCode,
} from "../CodeInput/CodeInput.js";

const inputCSS = css``;

type CardFormCodeInputProps = {
  onChange?: OnChangeCode;
  onSubmit?: OnSubmitCode;
  onBlur?: () => void;
};

export function CardFormCodeInput({
  onChange,
  onSubmit,
  onBlur,
}: CardFormCodeInputProps) {
  return (
    <CodeInput
      codeLength={6}
      onSubmit={onSubmit}
      inputCSS={inputCSS}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}
