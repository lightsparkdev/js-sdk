import React, {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ElementType,
} from "react";
import { type TypographyTypeKey } from "../../styles/tokens/typography.js";
import type { typographyMap } from "./typographyMap.js";

type TypographyMapType = typeof typographyMap;

export type RenderTypographyArgs<T extends TypographyTypeKey> = {
  type: T;
  props: ComponentProps<TypographyMapType[T]>;
};

/* We need a dynamic module import here to avoid circular module dependencies between some
   toReactNodes node types and typography components. Components will load and rerender if
   necessary */
const typographyMapModulePromise = import("./typographyMap.js");

export const renderTypography = <T extends TypographyTypeKey>(
  typographyType: T,
  typographyProps: ComponentProps<TypographyMapType[T]>,
) => {
  return React.createElement(RenderTypographyLoader, {
    typographyType,
    typographyProps,
  });
};

type RenderTypographyLoaderProps = {
  typographyType: TypographyTypeKey;
  typographyProps: ComponentProps<TypographyMapType[TypographyTypeKey]>;
};

function RenderTypographyLoader({
  typographyType,
  typographyProps,
}: RenderTypographyLoaderProps) {
  const typographyMap = useRef<TypographyMapType | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void typographyMapModulePromise.then((typographyMapModule) => {
      typographyMap.current = typographyMapModule.typographyMap;
      setReady(true);
    });
  }, []);

  if (!ready || !typographyMap.current) {
    return null;
  }

  /** props type is too wide, causing issues with overlapping different props types (e.g. `tag`), so
   * we have to cast this to a generic ElementType to pass createElement types. We still have type
   * saftey for specific component prop types via renderTypography args. */
  const TypographyComponent = typographyMap.current[
    typographyType
  ] as ElementType;

  const { children } = typographyProps;

  return React.createElement(TypographyComponent, typographyProps, children);
}
