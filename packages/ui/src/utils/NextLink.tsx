import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from "react";
import { renderTypography } from "../components/typography/renderTypography.js";
import { type SimpleTypographyProps } from "../components/typography/types.js";

type NextLinkModule = typeof import("next/link.js");
type NextLinkProps = ComponentProps<NextLinkModule["default"]>;

type NextLinkWrapperProps = {
  href: string;
  /* NextLink allows children for flexibility. text may alternatively passed in with a
     specified typography, useful especially for toReactNodes contexts */
  children?: ReactNode;
  text?: string | undefined;
  id?: string;
  target?: "_blank" | undefined;
  typography?: SimpleTypographyProps;
};

export function NextLink({
  href,
  text,
  children,
  id,
  target: targetProp,
  typography,
}: NextLinkWrapperProps) {
  const NextLinkRef = useRef<null | ComponentType<NextLinkProps>>(null);
  const [ready, setReady] = useState(false);
  const isExternal = href.startsWith("http");
  const target = targetProp ? targetProp : isExternal ? "_blank" : undefined;

  useEffect(() => {
    void (async () => {
      try {
        /* We need to dynamically load NextLink because it globally references process which doesn't
           exist in the browser and causes vite bundles to have a reference error */
        const nextLinkModule = await import("next/link.js");
        NextLinkRef.current =
          nextLinkModule.default as unknown as ComponentType<NextLinkProps>;
      } catch (e) {
        /* ignore, will fallback to default link */
      }
      setReady(true);
    })();
  });

  const InternalNextLink = NextLinkRef.current;

  let content = children;
  if (text) {
    content = typography
      ? renderTypography(typography.type, {
          size: typography.size,
          color: typography.color,
          children: text,
        })
      : text;
  }

  if (!ready || !InternalNextLink) {
    return (
      <a href={href} target={target} id={id}>
        {content}
      </a>
    );
  }

  return (
    <InternalNextLink href={href} target={target} id={id}>
      {content}
    </InternalNextLink>
  );
}
