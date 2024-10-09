import styled from "@emotion/styled";
import type { MouseEvent } from "react";
import { useCallback } from "react";
import { useClipboard } from "../hooks/useClipboard.js";
import { type ThemeOrColorKey } from "../styles/themes.js";
import { applyTypography } from "../styles/typography.js";
import { lineClamp as lineClampCSS } from "../styles/utils.js";
import { elide, type ElideArgs } from "../utils/strings.js";
import { Icon } from "./Icon/Icon.js";
import { type PartialSimpleTypographyProps } from "./typography/types.js";

type ClipboardTextFieldProps = {
  value: string;
  icon?: boolean;
  id?: string;
  stopPropagation?: boolean;
  /* Note maxLines forces box layout: */
  maxLines?: number | undefined;
  elide?: ElideArgs | undefined;
  wordBreakAll?: boolean;
  tag?: "span" | "pre";
  iconSide?: "left" | "right";
  iconColor?: ThemeOrColorKey;
  typography?: PartialSimpleTypographyProps | undefined;
  clipboardCallbacks?: Parameters<typeof useClipboard>[0];
};

export function ClipboardTextField({
  value,
  icon,
  id,
  stopPropagation,
  maxLines,
  elide: elideArgs,
  wordBreakAll = false,
  tag = "span",
  iconSide = "left",
  iconColor: iconColorProp,
  typography,
  clipboardCallbacks,
}: ClipboardTextFieldProps) {
  const { canWriteToClipboard, writeTextToClipboard } =
    useClipboard(clipboardCallbacks);
  const addLineClamp = Boolean(maxLines && maxLines > 1);
  const displayValue = elideArgs ? elide(value, elideArgs) : value;

  const valueNode = (
    <ClipboardTextFieldValue
      wordBreakAll={wordBreakAll}
      typography={typography}
      addLineClamp={addLineClamp}
      maxLines={maxLines}
    >
      {displayValue}
    </ClipboardTextFieldValue>
  );

  const onClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (stopPropagation) {
        event.stopPropagation();
      }
      void writeTextToClipboard(value);
    },
    [stopPropagation, value, writeTextToClipboard],
  );

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      if (stopPropagation) {
        event.stopPropagation();
      }
      void writeTextToClipboard(value);
    }
  }

  const commonProps = {
    as: tag,
    id,
    addLineClamp,
    maxLines,
  };

  const iconColor = iconColorProp || typography?.color || "inherit";
  return canWriteToClipboard && value ? (
    <StyledClipboardTextField
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={onKeyDown}
      {...commonProps}
    >
      {icon && iconSide === "left" ? (
        <Icon name="Copy" width={20} mr={8} color={iconColor} />
      ) : null}
      {valueNode}
      {icon && iconSide === "right" ? (
        <Icon name="Copy" width={20} ml={8} color={iconColor} />
      ) : null}
    </StyledClipboardTextField>
  ) : (
    <StyledClipboardTextField {...commonProps}>
      {valueNode}
    </StyledClipboardTextField>
  );
}

type StyledClipboardTextFieldProps = {
  addLineClamp: boolean;
  maxLines?: number | undefined;
};

const StyledClipboardTextField = styled.span<StyledClipboardTextFieldProps>`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: center;
  box-sizing: content-box;
  cursor: pointer;

  ${({ addLineClamp, maxLines }) =>
    /* keep the icon on the same line when addLineClamp: */
    addLineClamp || maxLines === 1 ? "display: inline-flex;" : ""}

  ${({ maxLines }) => (maxLines === 1 ? "white-space: nowrap;" : "")}
`;

type ClipboardTextFieldValueProps = {
  wordBreakAll: boolean;
  addLineClamp: boolean;
  maxLines?: number | undefined;
  typography?: PartialSimpleTypographyProps | undefined;
};

const ClipboardTextFieldValue = styled.span<ClipboardTextFieldValueProps>`
  flex: 1;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  word-break: ${({ wordBreakAll }) => (wordBreakAll ? "break-all" : "normal")};
  vertical-align: middle;

  ${({ addLineClamp, maxLines }) =>
    addLineClamp && maxLines
      ? `
        ${lineClampCSS(maxLines).styles}
        align-self: baseline;
      `
      : ""}

  ${({ theme, typography }) =>
    applyTypography(
      theme,
      typography?.type || "Body",
      typography?.size || "ExtraSmall",
      typography?.color || "inherit",
    )}
`;
