// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
/** @jsxImportSource @emotion/react */
import type { CSSObject } from "@emotion/styled";
import styled from "@emotion/styled";
import { Icon } from "@lightsparkdev/ui/components";
import { UnstyledButton } from "@lightsparkdev/ui/components/UnstyledButton";
import { StyledTooltip } from "@lightsparkdev/ui/styles/common";
import { nanoid } from "nanoid";
import React, { useState } from "react";

type Props = {
  children?: React.ReactNode;
  value: string;
  isSm?: boolean;
  tooltipContent?: string;
  buttonCSS?: CSSObject;
  ml?: number;
  place?: "top" | "bottom" | "left" | "right";
  icon?: string;
};

// This is a button that copies the specified value to the clipboard.
const CopyToClipboardButton = (props: Props) => {
  const originalTooltipContent = props.tooltipContent || "Click to copy";
  const icon = props.icon || "Copy";
  // unique id needed when there are multiple instances:
  const id = `copy-node-name-${nanoid()}`;
  const [tooltipContent, setTooltipContent] = useState(originalTooltipContent);

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          setTooltipContent("Copied!");
          navigator.clipboard.writeText(props.value);
          setTimeout(() => {
            setTooltipContent(originalTooltipContent);
          }, 2000);
        }}
        css={props.buttonCSS}
        ml={props.ml}
        data-tooltip-id={id}
      >
        {props.children ? <Children>{props.children}</Children> : null}
        <Icon name={icon} width={props.isSm ? 12 : 16} />
      </Button>
      <StyledTooltip id={id} place={props.place || "right"} variant="dark">
        {tooltipContent}
      </StyledTooltip>
    </>
  );
};

const Children = styled.span`
  margin-right: 4px;
`;

const Button = styled(UnstyledButton)<{
  ml?: number | undefined;
}>`
  background: rgba(0, 0, 0, 0);
  vertical-align: middle;
  ${({ ml }) => (ml ? `margin-left: ${ml}px` : "")};
`;

export { CopyToClipboardButton };
