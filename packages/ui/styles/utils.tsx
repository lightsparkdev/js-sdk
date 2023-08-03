import { CSSInterpolation } from "@emotion/css";
import { css } from "@emotion/react";
import { rootFontSizePx } from "./common";

export function pxToRems<T extends boolean>(
  rems: number,
  asNum: T = false as T
): T extends true ? number : string {
  const value = (rems / rootFontSizePx).toFixed(6);
  return (asNum ? Number(value) : `${value}rem`) as T extends true
    ? number
    : string;
}

export function remsToPx<T extends boolean>(
  rems: number,
  asNum: T = false as T
): T extends true ? number : string {
  const value = (rootFontSizePx * rems).toFixed(6);
  return (asNum ? Number(value) : `${value}px`) as T extends true
    ? number
    : string;
}

export const extend = (...args: Array<CSSInterpolation>) => css(...args);

export const size = {
  px8: pxToRems(8),
  px10: pxToRems(10),
  px12: pxToRems(12),
  px14: pxToRems(14),
  px16: pxToRems(16),
  px18: pxToRems(18),
  px20: pxToRems(20),
  px21: pxToRems(21),
  px24: pxToRems(24),
};

export const flexCenterAxis = css`
  display: flex;
  align-items: center;
`;
export const flexCenter = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const inlineFlexCenter = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const flexBetween = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const absoluteCenter = css`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
`;

export const textCenter = css`
  text-align: center;
`;

export const overflowAutoWithoutScrollbars = css`
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &::-moz-scrollbar {
    display: none;
  }
`;

export const lineClamp = (lines: number) => css`
  display: -webkit-box;
  -webkit-line-clamp: ${lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

/* See https://github.com/emotion-js/emotion/issues/1178 for detailed discussion. This should work
   even if we adapt SSR in the future. So far in testing it only works in root level styled component
   declarations and not inlined style functions. It is very sensitive to changes so be sure to test
   thoroughly that there are no console warnings in any usage: */
export const ignoreSSRWarning =
  "/* @emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason */";
export const firstChild = (style: string) =>
  `&:first-child:not(style), style:first-child + & ${ignoreSSRWarning} { ${style} }`;
