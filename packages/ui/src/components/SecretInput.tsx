import { useState } from "react";
import { TextInput, type TextInputProps } from "./TextInput.js";

export type SecretInputProps = Omit<
  TextInputProps,
  "type" | "onClickIcon" | "icon"
>;

export function SecretInput({ ...rest }: SecretInputProps) {
  const [showSecret, setShowSecret] = useState(false);
  return (
    <TextInput
      {...rest}
      type={showSecret ? undefined : "password"}
      onClickIcon={() => setShowSecret(!showSecret)}
      icon={{
        name: showSecret ? "NotEye" : "Eye",
        width: 16,
      }}
    />
  );
}
