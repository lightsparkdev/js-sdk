import { css } from "@emotion/css";
import { useTheme, type Theme } from "@emotion/react";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Tooltip } from "react-tooltip";
import { overlaySurface } from "../styles/common.js";
import { z } from "../styles/z-index.js";

type TooltipProps = {
  id: string;
  content?: string;
  render?: () => JSX.Element;
};

/* Avoid third party lib undefined type issue with our config: */
type ExplicitTooltipProps = {
  render?: () => JSX.Element;
};

export function LightTooltip(props: TooltipProps) {
  const nodeRef = useRef<null | HTMLDivElement>(null);
  const [nodeReady, setNodeReady] = React.useState(false);

  useEffect(() => {
    if (!nodeRef.current) {
      nodeRef.current = document.createElement("div");
      document.body.appendChild(nodeRef.current);
    }
    setNodeReady(true);
    return () => {
      if (nodeRef.current) {
        document.body.removeChild(nodeRef.current);
        nodeRef.current = null;
      }
    };
  }, []);

  const theme = useTheme();
  const tooltipProps = {} as ExplicitTooltipProps;
  if (props.render) {
    tooltipProps["render"] = props.render;
  }
  return nodeReady && nodeRef.current
    ? ReactDOM.createPortal(
        <Tooltip
          id={props.id}
          content={props.content || ""}
          noArrow
          border="0.05rem solid rgba(0, 0, 0, 0.1)"
          className={styles({ theme })}
          variant="light"
          {...tooltipProps}
        />,
        nodeRef.current,
      )
    : null;
}

const styles = ({ theme }: { theme: Theme }) => css`
  font-size: "10px",
  color: ${theme.c2Neutral};
  border-radius: 8px !important;
  padding: 16px !important;
  z-index: ${z.tooltip};
  ${overlaySurface({ theme, important: true })};

  max-width: 260px;
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.10), 0px 4px 8px 0px rgba(0, 0, 0, 0.08) !important;
`;
