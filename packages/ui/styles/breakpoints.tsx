import { css } from "@emotion/react";
import { debounce } from "lodash-es";
import React, { Fragment, useLayoutEffect, useState } from "react";

export enum Breakpoints {
  sm = "sm",
  md = "md",
  lg = "lg",
}

const breakpoints = {
  [Breakpoints.sm]: 640,
  [Breakpoints.md]: 834,
  [Breakpoints.lg]: 1200,
};

export enum BreakpointRanges {
  // non overlapping ranges, used to compute current breakpoint:
  sm = "sm",
  lg = "lg",
  minSmMaxMd = "minSmMaxMd",
  minMdMaxLg = "minMdMaxLg",
  // overlapping ranges:
  minSmMaxLg = "minSmMaxLg",
  maxLg = "maxLg",
  maxMd = "maxMd",
  minSm = "minSm",
  minMd = "minMd",
}

const breakpointFn = (mq: string) => (style: string) =>
  `@media ${mq} { ${style} }`;

/* bp.current accepts an optional assertion to which it returns bool,
   else just the current bp key as string */
type CurrentBreakpointReturnType<T> = T extends string
  ? boolean
  : T extends undefined
  ? string
  : never;

// https://bit.ly/3vb3jJR
type CurrentBreakpointType = <T extends string | undefined = undefined>(
  assertBp?: T,
) => CurrentBreakpointReturnType<T>;

export const bp = {
  key: Breakpoints,

  [BreakpointRanges.sm]: breakpointFn(`(max-width:${breakpoints.sm}px)`),
  [BreakpointRanges.lg]: breakpointFn(`(min-width:${breakpoints.lg}px)`),
  [BreakpointRanges.minSmMaxLg]: breakpointFn(
    `(min-width:${breakpoints.sm + 1}px) and (max-width:${
      breakpoints.lg - 1
    }px)`,
  ),
  [BreakpointRanges.minSmMaxMd]: breakpointFn(
    `(min-width:${breakpoints.sm + 1}px) and (max-width:${
      breakpoints.md - 1
    }px)`,
  ),
  [BreakpointRanges.minMdMaxLg]: breakpointFn(
    `(min-width:${breakpoints.md}px) and (max-width:${breakpoints.lg - 1}px)`,
  ),
  [BreakpointRanges.maxLg]: breakpointFn(`(max-width:${breakpoints.lg - 1}px)`),
  [BreakpointRanges.maxMd]: breakpointFn(`(max-width:${breakpoints.md - 1}px)`),
  [BreakpointRanges.minSm]: breakpointFn(`(min-width:${breakpoints.sm + 1}px)`),
  [BreakpointRanges.minMd]: breakpointFn(`(min-width:${breakpoints.md + 1}px)`),

  current: function <T>(assertBp?: T) {
    const currentBp = window
      .getComputedStyle(document.body, ":before")
      .content.replace(/"/g, "");

    if (assertBp) {
      return inRange(
        currentBp,
        assertBp as string,
      ) as CurrentBreakpointReturnType<T>;
    }
    return currentBp as CurrentBreakpointReturnType<T>;
  } as CurrentBreakpointType,

  switch: <Sm, MinSm, MinMd, Lg>(
    smVal: Sm,
    minSmMaxMdVal: MinSm,
    minMdMaxLgVal: MinMd,
    lgVal: Lg,
  ) => {
    const currentBp = bp.current();
    if (currentBp === BreakpointRanges.sm) {
      return smVal;
    } else if (currentBp === BreakpointRanges.minSmMaxMd) {
      return minSmMaxMdVal;
    } else if (currentBp === BreakpointRanges.minMdMaxLg) {
      return minMdMaxLgVal;
    }
    return lgVal;
  },

  isSm: () => bp.current(BreakpointRanges.sm),
  isMinSm: () => bp.current(BreakpointRanges.minSm),
  isMinSmMaxMd: () => bp.current(BreakpointRanges.minSmMaxMd),
  isMinMdMaxLg: () => bp.current(BreakpointRanges.minMdMaxLg),
  isLg: () => bp.current(BreakpointRanges.lg),
};

function inRange(currentBp: string, assertBp: string) {
  const isSm = currentBp === BreakpointRanges.sm;
  const isMinSmMaxMd = currentBp === BreakpointRanges.minSmMaxMd;
  const isMinMdMaxLg = currentBp === BreakpointRanges.minMdMaxLg;
  const isLg = currentBp === BreakpointRanges.lg;
  if (assertBp) {
    switch (assertBp) {
      case BreakpointRanges.sm:
        return isSm;
      case BreakpointRanges.minSmMaxMd:
        return isMinSmMaxMd;
      case BreakpointRanges.minMdMaxLg:
        return isMinMdMaxLg;
      case BreakpointRanges.lg:
        return isLg;
      case BreakpointRanges.minSmMaxLg:
        return isMinSmMaxMd || isMinMdMaxLg;
      case BreakpointRanges.maxLg:
        return isSm || isMinSmMaxMd || isMinMdMaxLg;
      case BreakpointRanges.maxMd:
        return isSm || isMinSmMaxMd;
      case BreakpointRanges.minSm:
        return isMinSmMaxMd || isMinMdMaxLg || isLg;
      case BreakpointRanges.minMd:
        return isMinMdMaxLg || isLg;
      default:
        return false;
    }
  }
  return false;
}

export function useBreakpoints() {
  const [currentBp, setCurrentBp] = useState(bp.current());

  useLayoutEffect(() => {
    const handleResize = () => {
      const newBp = bp.current();
      if (newBp !== currentBp) {
        setCurrentBp(newBp);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("deviceorientation", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("deviceorientation", handleResize);
    };
  });

  return bp;
}

export function useScreenWidth() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useLayoutEffect(() => {
    const handleResize = debounce(() => {
      setScreenWidth(window.innerWidth);
    }, 200);
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("deviceorientation", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("deviceorientation", handleResize);
    };
  });

  return screenWidth;
}

type DisplayBreakpointProps = {
  css?: string;
  sm?: boolean;
  minSmMaxMd?: boolean;
  minMdMaxLg?: boolean;
  lg?: boolean;
  maxLg?: boolean;
  maxMd?: boolean;
  minSm?: boolean;
  minMd?: boolean;
  children?: React.ReactNode;
  cssStr?: string;
};

export const DisplayBreakpoint = ({
  sm,
  minSmMaxMd,
  minMdMaxLg,
  lg,
  maxLg,
  maxMd,
  minSm,
  minMd,
  cssStr,
  children,
}: DisplayBreakpointProps) => {
  const breakpoint = (() => {
    switch (true) {
      case sm:
        return bp.sm;
      case minSmMaxMd:
        return bp.minSmMaxMd;
      case minMdMaxLg:
        return bp.minMdMaxLg;
      case lg:
        return bp.lg;
      case maxLg:
        return bp.maxLg;
      case maxMd:
        return bp.maxMd;
      case minSm:
        return bp.minSm;
      case minMd:
        return bp.minMd;
      default:
        return bp.sm;
    }
  })();

  return (
    <div
      css={css`
        display: none;
        ${breakpoint(`display: block; ${cssStr}`)}
      `}
    >
      {children}
    </div>
  );
};

type BreakpointProps = {
  sm?: boolean;
  minSmMaxMd?: boolean;
  minMdMaxLg?: boolean;
  lg?: boolean;
  maxLg?: boolean;
  maxMd?: boolean;
  minSm?: boolean;
  minMd?: boolean;
  children: React.ReactNode;
};

export function Breakpoint({
  sm,
  minSmMaxMd,
  minMdMaxLg,
  lg,
  maxLg,
  maxMd,
  minSm,
  minMd,
  children,
}: BreakpointProps) {
  const bp = useBreakpoints();

  const shouldRender = (() => {
    switch (true) {
      case sm:
        return bp.current(BreakpointRanges.sm);
      case minSmMaxMd:
        return bp.current(BreakpointRanges.minSmMaxMd);
      case minMdMaxLg:
        return bp.current(BreakpointRanges.minMdMaxLg);
      case lg:
        return bp.current(BreakpointRanges.lg);
      case maxLg:
        return bp.current(BreakpointRanges.maxLg);
      case maxMd:
        return bp.current(BreakpointRanges.maxMd);
      case minSm:
        return bp.current(BreakpointRanges.minSm);
      case minMd:
        return bp.current(BreakpointRanges.minMd);
      default:
        return bp.current(BreakpointRanges.sm);
    }
  })();

  return shouldRender ? <Fragment>{children}</Fragment> : null;
}
