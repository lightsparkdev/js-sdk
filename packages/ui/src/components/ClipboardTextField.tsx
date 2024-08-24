import styled from "@emotion/styled";
import type { MouseEvent } from "react";
import { useCallback } from "react";
import { useClipboard } from "../hooks/useClipboard.js";
import { type SimpleTypographyProps } from "../styles/typography.js";
import { extend, lineClamp as lineClampCSS } from "../styles/utils.js";
import { elide, type ElideArgs } from "../utils/strings.js";
import { Icon } from "./Icon/Icon.js";
import { renderTypography } from "./typography/renderTypography.js";

type ClipboardTextFieldProps = {
  value: string;
  icon?: boolean;
  stopPropagation?: boolean;
  /* Note maxLines forces box layout: */
  maxLines?: number | undefined;
  elide?: ElideArgs | undefined;
  wordBreakAll?: boolean;
  tag?: "span" | "pre";
  iconSide?: "left" | "right";
  typography?: SimpleTypographyProps | undefined;
  clipboardCallbacks?: Parameters<typeof useClipboard>[0];
};

export function ClipboardTextField({
  value,
  icon,
  stopPropagation,
  maxLines,
  elide: elideArgs,
  wordBreakAll = false,
  tag = "span",
  iconSide = "left",
  typography,
  clipboardCallbacks,
}: ClipboardTextFieldProps) {
  const { canWriteToClipboard, writeTextToClipboard } =
    useClipboard(clipboardCallbacks);
  const addLineClamp = maxLines && maxLines > 1;
  const displayValue = elideArgs ? elide(value, elideArgs) : value;

  const nodes = renderTypography(typography?.type || "Body", {
    content: displayValue,
    size: typography?.size || "ExtraSmall",
    color: typography?.color || "inherit",
  });

  const baseValueCSS = {
    flex: 1,
    overflow: "hidden",
    textAlign: "left" as const,
    textOverflow: "ellipsis",
    wordBreak: wordBreakAll ? ("break-all" as const) : ("normal" as const),
    verticalAlign: "middle",
  };
  const valueCSS = addLineClamp
    ? extend(baseValueCSS, lineClampCSS(maxLines), { alignSelf: "baseline" })
    : baseValueCSS;

  const valueNode = <span css={valueCSS}>{nodes}</span>;

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

  const baseContainerCSS = {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    alignItems: "center",
    boxSizing: "content-box" as const,
    cursor: "pointer",
  };
  const containerCSS = addLineClamp
    ? /* keep the icon on the same line when addLineClamp: */
      extend(baseContainerCSS, { display: "inline-flex" })
    : maxLines === 1
    ? extend(baseContainerCSS, { whiteSpace: "nowrap", display: "inline-flex" })
    : baseContainerCSS;

  return canWriteToClipboard && value ? (
    <StyledClipboardTextField
      as={tag}
      onClick={onClick}
      css={containerCSS}
      role="button"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {icon && iconSide === "left" ? (
        <Icon name="Copy" width={16} mr={4} />
      ) : null}
      {valueNode}
      {icon && iconSide === "right" ? (
        <Icon name="Copy" width={16} ml={4} />
      ) : null}
    </StyledClipboardTextField>
  ) : (
    <StyledClipboardTextField as={tag} css={containerCSS}>
      {valueNode}
    </StyledClipboardTextField>
  );
}

const StyledClipboardTextField = styled.span``;
