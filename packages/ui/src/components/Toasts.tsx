import styled from "@emotion/styled";
import { isEqual, isObject } from "lodash-es";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { colors } from "../styles/colors.js";
import { standardContentInset } from "../styles/common.js";
import { themeOr } from "../styles/themes.js";
import { extend, flexCenter, pxToRems } from "../styles/utils.js";
import { z } from "../styles/z-index.js";
import { setDefaultReactNodesTypography } from "../utils/toReactNodes/setReactNodesTypography.js";
import {
  toReactNodes,
  type ToReactNodesArg,
  type ToReactNodesArgs,
} from "../utils/toReactNodes/toReactNodes.js";
import { Icon } from "./Icon/Icon.js";
import { UnstyledButton } from "./UnstyledButton.js";
import { type PartialSimpleTypographyProps } from "./typography/types.js";

type ToastQueueArg = {
  content: ToReactNodesArgs;
  duration: number | null;
  id: string;
  expires: number;
  type?: "error" | "success" | "info";
};

type Toast = ToastQueueArg & {
  isActive: boolean;
  isHiding: boolean;
};

export type ToastsProps = {
  queue: ToastQueueArg[];
  onHide: (id: string) => void;
  fromTop?: number;
  stackDir?: "above" | "below";
  removeExpiredAndNotVisible?: boolean;
  dedupeConsecutive?: boolean;
  maxVisible?: number;
  typography?: PartialSimpleTypographyProps | undefined;
  onClickContentNode?:
    | ((node: ToReactNodesArg, toastId: string) => void)
    | undefined;
};

type TimeoutRef = ReturnType<typeof setTimeout> | null;

const firstDur = 0.3;

export function Toasts({
  queue,
  onHide,
  fromTop = 29,
  stackDir = "above",
  maxVisible = 3,
  removeExpiredAndNotVisible = true,
  dedupeConsecutive = true,
  typography: typographyProp,
  onClickContentNode,
}: ToastsProps) {
  const queuedToastIds = useRef(new Set<string>());
  const prevToastQueue = useRef<ToastQueueArg[]>([]);
  const [toastQueue, setToastQueue] = useState<Toast[]>([]);
  /* There should only ever be one autoHideTimeoutRef at a time: */
  const autoHideTimeoutRef = useRef<TimeoutRef>(null);
  /* Multiple hidingTimeoutRefs may exist if the user is manually hiding toasts: */
  const hidingTimeoutRefs = useRef<{ [id: string]: TimeoutRef }>({});
  const nodeRef = useRef<null | HTMLDivElement>(null);
  const [nodeReady, setNodeReady] = useState(false);
  const defaultTypography = {
    type: typographyProp?.type || "Body",
    size: typographyProp?.size || "ExtraSmall",
    color: typographyProp?.color || "white",
  } as const;

  const hideToast = useCallback(
    (id: string) => {
      setToastQueue((currentToastQueue) => {
        const hideToastIndex = currentToastQueue.findIndex((t) => t.id === id);
        const newToastQueue = currentToastQueue.map((toast, i) => {
          if (i === hideToastIndex) {
            return {
              ...toast,
              isActive: false,
              isHiding: true,
            };
          }
          return toast;
        });
        return newToastQueue;
      });
      const hidingTimeoutRef = hidingTimeoutRefs.current[id];
      if (hidingTimeoutRef) {
        clearTimeout(hidingTimeoutRef);
      }
      hidingTimeoutRefs.current[id] = setTimeout(() => {
        setToastQueue((currentToastQueue) => {
          /* Remove the toast that's done hiding: */
          const newToastQueue = currentToastQueue.filter((t) => t.id !== id);
          /* Ensure external state updating function is called outside of this state update: */
          setTimeout(() => onHide(id), 0);
          hidingTimeoutRefs.current[id] = null;
          return newToastQueue;
        });
      }, firstDur * 1000);

      /* If hide was triggered from manual click remove any existing timeout: */
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
        autoHideTimeoutRef.current = null;
      }
    },
    [onHide, setToastQueue],
  );

  useEffect(() => {
    const newToastQueueArgs = queue.reduce((acc, toast) => {
      if (toast.expires < Date.now()) {
        onHide(toast.id);
        return acc;
      }
      if (!queuedToastIds.current.has(toast.id)) {
        return [...acc, toast];
      }
      return acc;
    }, [] as ToastQueueArg[]);
    if (newToastQueueArgs.length) {
      const newToasts = newToastQueueArgs.reduce((acc, toast) => {
        if (dedupeConsecutive && acc.length) {
          const lastToast = acc[acc.length - 1];
          if (isEqual(toast.content, lastToast.content)) {
            return acc;
          }
        }
        queuedToastIds.current.add(toast.id);
        return [
          ...acc,
          {
            ...toast,
            isActive: true,
            isHiding: false,
          },
        ] as Toast[];
      }, [] as Toast[]);
      setToastQueue((currentToastQueue) => {
        const currentToast = currentToastQueue[currentToastQueue.length - 1];
        if (
          dedupeConsecutive &&
          currentToast &&
          isEqual(newToasts[0].content, currentToast.content)
        ) {
          return currentToastQueue;
        }
        return [...currentToastQueue, ...newToasts];
      });
    }
  }, [queue, hideToast, onHide, dedupeConsecutive]);

  /* Schedule autohide for the next toast when a toast is removed or added: */
  useEffect(() => {
    if (prevToastQueue.current.length !== toastQueue.length) {
      const currentToast = toastQueue[toastQueue.length - 1];
      if (currentToast && !currentToast.isHiding) {
        if (autoHideTimeoutRef.current) {
          clearTimeout(autoHideTimeoutRef.current);
          autoHideTimeoutRef.current = null;
        }
        if (currentToast.duration) {
          autoHideTimeoutRef.current = setTimeout(() => {
            hideToast(currentToast.id);
          }, currentToast.duration);
        }
      }
      prevToastQueue.current = toastQueue;
    }
  }, [toastQueue, hideToast, onHide]);

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

  const currentToastIndex = toastQueue.length - 1;
  /* If a toast has expired and is not currently visible due to maxVisible, remove from queue */
  useEffect(() => {
    if (removeExpiredAndNotVisible) {
      setToastQueue((currentToastQueue) => {
        const newToastQueue = currentToastQueue.filter((toast, i) => {
          const fromCurrent =
            i === currentToastIndex ? 0 : currentToastIndex - i;
          return toast.expires > Date.now() || fromCurrent < maxVisible;
        });
        return newToastQueue;
      });
    }
  }, [currentToastIndex, maxVisible, removeExpiredAndNotVisible]);

  const currentToast = toastQueue[currentToastIndex];

  return nodeReady
    ? toastQueue.map((toast, i) => {
        if (!nodeRef.current) {
          return null;
        }

        const fromCurrent = i === currentToastIndex ? 0 : currentToastIndex - i;
        const movingToCurrent =
          currentToast.isHiding && i === currentToastIndex - 1;
        const hidingFromCurrent = currentToast.isHiding
          ? fromCurrent - 1
          : fromCurrent;

        const nodes = toast.content
          ? setDefaultReactNodesTypography(toast.content, {
              default: defaultTypography,
            }).map((node) => {
              if (isObject(node) && "typography" in node && node.typography) {
                const existingOnClick = node.typography.onClick;
                /* wrap any existing onClick for the node and notify also notify parent when the
                 * node is clicked */
                if (existingOnClick || onClickContentNode) {
                  node.typography.onClick = (e) => {
                    if (existingOnClick) {
                      existingOnClick(e);
                    }
                    if (onClickContentNode) {
                      onClickContentNode(node, toast.id);
                    }
                  };
                }
              }
              return node;
            })
          : null;

        const contentNode = <span>{nodes ? toReactNodes(nodes) : null}</span>;
        return (
          <Fragment key={toast.id}>
            {ReactDOM.createPortal(
              <StyledToast
                backgroundColor={
                  toast.type === "error"
                    ? colors.red50
                    : toast.type === "success"
                    ? colors.green37
                    : undefined
                }
                isActive={toast.isActive}
                isHiding={toast.isHiding}
                isVisible={fromCurrent < maxVisible}
                duration={toast.duration}
                fromTop={Math.floor(fromTop)}
                isCurrent={i === currentToastIndex}
                fromCurrent={hidingFromCurrent}
                currentToastHiding={currentToast.isHiding}
                maxVisible={maxVisible}
                activeCount={Math.min(
                  toastQueue.length - (currentToast.isHiding ? 1 : 0),
                  maxVisible,
                )}
                stackDir={stackDir === "above" ? -1 : 1}
                movingToCurrent={movingToCurrent}
              >
                {contentNode}
                <UnstyledButton
                  css={extend(flexCenter, {
                    position: "absolute",
                    right: "5px",
                    top: "-1px",
                    height: "50px",
                    width: "50px",
                    outlineColor: `${colors.white} !important`,
                  })}
                  onClick={() => hideToast(toast.id)}
                >
                  <Icon name="Close" width={9} />
                </UnstyledButton>
              </StyledToast>,
              nodeRef.current,
            )}
          </Fragment>
        );
      })
    : null;
}

const width = 400;
const beginTopPx = -100;
const beginHeightPx = 50;
const minScale = 0.95;

const StyledToast = styled.div<{
  activeCount: number;
  currentToastHiding: boolean;
  duration: number | null;
  fromCurrent: number;
  fromTop: number;
  isActive: boolean;
  isCurrent: boolean;
  isHiding: boolean;
  isVisible: boolean;
  maxVisible: number;
  movingToCurrent: boolean;
  stackDir: 1 | -1;
  backgroundColor?: string | undefined;
}>`
  position: fixed;
  z-index: ${z.toast};
  line-height: ${pxToRems(16)};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  font-weight: 500;
  background-color: ${({ isCurrent, movingToCurrent, backgroundColor }) =>
    isCurrent || movingToCurrent
      ? backgroundColor ?? colors.blue43
      : backgroundColor ?? themeOr("#2A50B2", colors.blue43)};
  color: rgba(255, 255, 255, 0);
  padding: 16px 24px;
  ${({ duration }) => !duration && "padding-right: 50px;"}
  ${({ isVisible, isCurrent, movingToCurrent, stackDir }) => {
    if (!isVisible) {
      return "";
    }
    const sharpOverlayShadow = `0 ${1 * stackDir}px 0px 0px rgba(0, 0, 0, 0.5)`;
    return isCurrent || movingToCurrent
      ? `box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.1), 0 4px 8px 0 rgba(0, 0, 0, 0.08), ${sharpOverlayShadow};`
      : `box-shadow: ${sharpOverlayShadow};`;
  }}
  left: 50%;
  transform: translateX(-50%);
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: calc(100% - ${standardContentInset.smPx * 2}px);

  max-height: ${beginHeightPx}px;
  width: 0px;
  border-radius: 3rem;
  transition:
    width 0.25s ${firstDur}s cubic-bezier(0.41, 0.52, 0.38, 1.33),
    border-radius 0.1s ${firstDur}s linear,
    color 0.1s ${firstDur * 2.1}s linear,
    opacity 0.1s linear,
    transform 0.25s cubic-bezier(0.41, 0.52, 0.38, 1.33),
    background-color 0.3s linear,
    max-height 0.2s 0.5s linear;
  top: ${beginTopPx}px;

  a {
    text-decoration: underline;
  }

  button {
    opacity: ${({ duration }) => (duration ? "0" : "1")};
    transition: opacity 0.1s linear;
  }
  &:hover {
    ${({ duration }) => (duration ? "button { opacity: 1; }" : "")}
  }

  ${({
    isVisible,
    fromCurrent,
    movingToCurrent,
    activeCount,
    stackDir,
    maxVisible,
    currentToastHiding,
  }) => {
    if (fromCurrent && !movingToCurrent) {
      if (!isVisible) {
        fromCurrent = maxVisible - 1;
      }
      const secondToastTranslateY = 7;
      const translateY =
        stackDir * secondToastTranslateY * Math.pow(fromCurrent, 0.75);

      const scale = Math.max(
        1 - ((1 - minScale) / activeCount) * fromCurrent,
        0,
      );
      return `transform: translateX(-50%) translateY(${translateY}px) scale(${scale});`;
    }
    return "";
  }}

  ${({ fromTop }) => `
    /* Animations with different values still interfere with each other if they have the same name.
       Append the variable value to get a unique name for each animation: */
    @keyframes slideOut-${fromTop} {
      0% {
        top: ${fromTop}px;
      }
      100% {
        top: ${beginTopPx}px;
      }
    }

    @keyframes slideIn-${fromTop} {
      0% {
        top: ${beginTopPx}px;
      }
      100% {
        top: ${fromTop}px;
      }
    }
  `}

  &:before {
    ${({ duration }) => (duration ? 'content: "";' : "")}
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 0%;
    background-color: rgba(0, 0, 0, 0.1);
    z-index: -1;
    // switch back to minimal state instantly so it's ready for the next notification:
  }

  ${({ duration }) =>
    duration
      ? `
        @keyframes progressBar-${duration} {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `
      : ""}

  ${({ isActive, duration, isHiding, fromTop, isCurrent }) =>
    isActive
      ? `
      width: ${width}px;
      top: ${fromTop}px;
      border-radius: 1.3rem;
      animation: ${firstDur}s cubic-bezier(.25,.15,.59,1.28) 0s slideIn-${fromTop};
      color: rgba(255, 255, 255, 1);
      max-height: 100px;
      &:before {
        ${
          isCurrent && duration
            ? `animation: progressBar-${duration} ${duration / 1000}s linear;`
            : ""
        };
      }
      `
      : `
      ${
        isHiding
          ? `
          animation: ${firstDur}s cubic-bezier(.57,-0.43,.78,.81) 0s slideOut-${fromTop};
          &:before {
            width: 100%;
          }
          `
          : ""
      }
      top: ${beginTopPx}px;
    `}
`;
