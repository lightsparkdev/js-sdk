import { css } from "@emotion/css";
import { useTheme, type Theme } from "@emotion/react";
import React, { useEffect, useRef, type ComponentProps } from "react";
import ReactDOM from "react-dom";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { overlaySurface } from "../styles/common.js";
import { z } from "../styles/z-index.js";

type TooltipProps = Omit<ComponentProps<typeof ReactTooltip>, "id"> & {
  /* Make 3rd party types compatible with our undefined rule: */
  id?: string | undefined;
};

export function Tooltip(props: TooltipProps) {
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

  return nodeReady && nodeRef.current
    ? ReactDOM.createPortal(
        <ReactTooltip
          {...props}
          id={props.id || ""}
          content={props.content || ""}
          noArrow
          border="0.05rem solid rgba(0, 0, 0, 0.1)"
          className={styles({ theme })}
          variant="light"
        />,
        nodeRef.current,
      )
    : null;
}

const styles = ({ theme }: { theme: Theme }) => css`
  font-size: "10px";
  color: ${theme.c8Neutral} !important;
  border-radius: 8px !important;
  padding: 16px !important;
  z-index: ${z.tooltip};
  ${overlaySurface({ theme, important: true })};

  max-width: 260px;
  box-shadow:
    0px 1px 4px 0px rgba(0, 0, 0, 0.1),
    0px 4px 8px 0px rgba(0, 0, 0, 0.08) !important;
`;
