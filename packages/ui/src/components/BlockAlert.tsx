import styled from "@emotion/styled";
import { hexToRGBAStr } from "../styles/colors.js";
import { TextIconAligner } from "./TextIconAligner.js";

type BlockAlertProps = {
  text: string;
  type?: "info" | "success" | "error";
};

export function BlockAlert({ text, type = "info" }: BlockAlertProps) {
  const iconName =
    type === "info"
      ? "Info"
      : type === "success"
      ? "CircleCheckOutline"
      : "ExclamationPoint";
  const iconColor =
    type === "info" ? "info" : type === "success" ? "success" : "danger";

  return (
    <StyledBlockAlert type={type}>
      <TextIconAligner
        content={text}
        typography={{ size: "ExtraSmall" }}
        leftIcon={{
          name: iconName,
          width: 16,
          mr: 12,
          color: iconColor,
        }}
      />
    </StyledBlockAlert>
  );
}

type StyledBlockAlertProps = {
  type: "info" | "success" | "error";
};

const StyledBlockAlert = styled.div<StyledBlockAlertProps>`
  padding: 16px;
  border-radius: 6px;
  font-weight: 500;

  color: ${({ type, theme }) =>
    type === "info"
      ? theme.info
      : type === "success"
      ? theme.success
      : theme.danger};

  background-color: ${({ type, theme }) =>
    type === "info"
      ? hexToRGBAStr(theme.info, 0.1)
      : type === "success"
      ? hexToRGBAStr(theme.success, 0.1)
      : hexToRGBAStr(theme.danger, 0.1)};
`;
