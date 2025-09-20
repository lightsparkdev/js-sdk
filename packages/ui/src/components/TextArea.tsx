import styled from "@emotion/styled";
import React, { Fragment } from "react";
import { InputSubtext, Label, textInputStyle } from "../styles/fields.js";

type TextAreaProps = {
  value: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  hint?: string;
  id?: string;
  placeholder?: string;
  minHeight?: number;
  onChange: (
    value: string,
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  readOnly?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
};

const defaultProps = {
  disabled: false,
};

export function TextArea({
  value,
  onChange,
  label,
  error,
  placeholder,
  id,
  hint,
  disabled = defaultProps.disabled,
  minHeight,
  readOnly = false,
  resize = "none",
}: TextAreaProps) {
  return (
    <Fragment>
      {label && <Label>{label}</Label>}
      <StyledTextArea
        id={id}
        value={value}
        minHeight={minHeight}
        resize={resize}
        onChange={(event) => {
          onChange(event.target.value, event);
        }}
        disabled={disabled}
        hasError={Boolean(error)}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      <InputSubtext text={error || hint} />
    </Fragment>
  );
}

const StyledTextArea = styled.textarea<{
  disabled: boolean;
  hasError: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
  minHeight?: number | undefined;
}>`
  ${textInputStyle}
  resize: ${({ resize }) => resize || "none"};
  min-height: ${({ minHeight }) =>
    typeof minHeight === "number" ? `${minHeight}px` : "initial"};
`;
